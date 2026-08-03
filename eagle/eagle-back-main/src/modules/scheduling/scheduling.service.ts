import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { FirebaseService } from '../../config/firebase';
import { AppointmentStatus } from '../appointments/entities/appointment.entity';
import { ConsultationStatus, ConsultationType } from '../consultations/entities/consultation.entity';
import { ConsultationBoxStatus } from '../consultation-boxes/entities/consultation-box.entity';
import type { Ticket } from '../tickets/entities/ticket.entity';
import { UrgencyLevel } from '../urgencies/entities/urgency.entity';
import { UserRole } from '../users/entities/user.entity';
import { VisitStatus } from '../visits/entities/visit.entity';

@Injectable()
export class SchedulingService {
  private readonly logger = new Logger(SchedulingService.name);
  private readonly appointmentGraceMinutes = 10;

  constructor(
    private readonly firebase: FirebaseService,
    private readonly events: EventEmitter2,
  ) {}

  @OnEvent('ticket.created')
  async schedule(ticket: Ticket) {
    try {
      const visitDoc = await this.firebase.collection('visits').doc(ticket.visitId).get();
      if (!visitDoc.exists) return;
      const visit = { id: visitDoc.id, ...visitDoc.data() } as any;
      const hospitalDoc = await this.firebase
        .collection('hospitals')
        .doc(ticket.originHospitalId)
        .get();
      if (!hospitalDoc.exists) return;
      const hospital = hospitalDoc.data()!;

      const [urgencyDoc, appointmentDoc, doctorsSnapshot, consultationsSnapshot] =
        await Promise.all([
          ticket.urgencyId
            ? this.firebase.collection('urgencies').doc(ticket.urgencyId).get()
            : Promise.resolve(null),
          ticket.appointmentId
            ? this.firebase.collection('appointments').doc(ticket.appointmentId).get()
            : Promise.resolve(null),
          this.firebase
            .collection('users')
            .where('role', '==', UserRole.DOCTOR)
            .where('isActive', '==', true)
            .get(),
          this.firebase
            .collection('consultations')
            .where('status', 'in', [
              ConsultationStatus.SCHEDULED,
              ConsultationStatus.IN_PROGRESS,
            ])
            .get(),
        ]);

      const urgencyLevel = urgencyDoc?.data()?.level as UrgencyLevel | undefined;
      const appointment = appointmentDoc?.data();
      const workloads = new Map<string, number>();
      consultationsSnapshot.docs.forEach((doc) => {
        const doctorId = doc.data().doctorId;
        workloads.set(doctorId, (workloads.get(doctorId) || 0) + 1);
      });

      const eligibleDoctors = doctorsSnapshot.docs
        .map((doc) => ({ id: doc.id, ...doc.data() } as any))
        .filter(
          (doctor) =>
            doctor.availabilityStatus !== 'UNAVAILABLE' &&
            doctor.specialtyId === ticket.specialtyId &&
            [ticket.originHospitalId, hospital.parentHospitalId].includes(
              doctor.hospitalId,
            ),
        )
        .sort(
          (a, b) =>
            (workloads.get(a.id) || 0) - (workloads.get(b.id) || 0) ||
            a.name.localeCompare(b.name),
        );

      let doctor = eligibleDoctors[0];
      const selectedDoctor = appointment?.selectedDoctorId
        ? eligibleDoctors.find((item) => item.id === appointment.selectedDoctorId)
        : null;
      if (selectedDoctor) {
        doctor = selectedDoctor;
      } else if (
        appointment?.selectedDoctorId &&
        ![UrgencyLevel.CRITICAL, UrgencyLevel.URGENT].includes(urgencyLevel as UrgencyLevel)
      ) {
        const scheduledAt = new Date(appointment.scheduledAt).getTime();
        const graceEnds = scheduledAt + this.appointmentGraceMinutes * 60_000;
        if (Date.now() < graceEnds) {
          this.events.emit('appointment.doctor-grace-period', {
            appointmentId: appointmentDoc?.id,
            graceEndsAt: new Date(graceEnds),
          });
          return;
        }
      }
      if (!doctor) {
        this.events.emit('scheduling.waiting-for-doctor', ticket);
        return;
      }

      const boxesSnapshot = await this.firebase
        .collection('consultation_boxes')
        .where('hospitalId', '==', ticket.originHospitalId)
        .where('isActive', '==', true)
        .get();
      const compatibleBoxes = boxesSnapshot.docs
        .map((doc) => ({ id: doc.id, ...doc.data() } as any))
        .filter(
          (box) =>
            box.status === ConsultationBoxStatus.AVAILABLE &&
            (box.currentSpecialtyId || box.defaultSpecialtyId) === ticket.specialtyId,
        )
        .sort((a, b) => a.code.localeCompare(b.code));
      const box = ticket.boxId
        ? compatibleBoxes.find((item) => item.id === ticket.boxId)
        : compatibleBoxes[0];
      if (!box) {
        this.events.emit('scheduling.waiting-for-box', ticket);
        return;
      }

      const consultationRef = this.firebase.collection('consultations').doc();
      const boxRef = this.firebase.collection('consultation_boxes').doc(box.id);
      const now = new Date();
      await this.firebase.getFirestore().runTransaction(async (tx) => {
        const currentBox = await tx.get(boxRef);
        if (currentBox.data()?.status !== ConsultationBoxStatus.AVAILABLE) {
          throw new Error('Box was reserved by another scheduler');
        }
        tx.set(consultationRef, {
          id: consultationRef.id,
          patientId: ticket.patientId,
          doctorId: doctor.id,
          specialtyId: ticket.specialtyId,
          visitId: ticket.visitId,
          originHospitalId: ticket.originHospitalId,
          appointmentId: ticket.appointmentId || null,
          referralId: ticket.referralId || null,
          boxId: box.id,
          type: ConsultationType.VIDEO,
          status: ConsultationStatus.SCHEDULED,
          scheduledAt: appointment?.scheduledAt || now,
          urgencyLevel: urgencyLevel || null,
          createdAt: now,
          updatedAt: now,
        });
        tx.update(boxRef, {
          status: ConsultationBoxStatus.RESERVED,
          activeVisitId: ticket.visitId,
          activeConsultationId: consultationRef.id,
          reservedAt: now,
          updatedAt: now,
        });
      });

      await Promise.all([
        this.firebase.collection('visits').doc(ticket.visitId).set({
          status: VisitStatus.WAITING_FOR_CONSULTATION,
          consultationId: consultationRef.id,
          boxId: box.id,
          updatedAt: now,
        }, { merge: true }),
        this.firebase.collection('tickets').doc(ticket.id).set({
          consultationId: consultationRef.id,
          boxId: box.id,
          updatedAt: now,
        }, { merge: true }),
        ticket.appointmentId
          ? this.firebase.collection('appointments').doc(ticket.appointmentId).set({
              visitId: ticket.visitId,
              status: AppointmentStatus.CHECKED_IN,
              updatedAt: now,
            }, { merge: true })
          : Promise.resolve(),
      ]);

      const queueSnapshot = await this.firebase
        .collection('queue')
        .where('visitId', '==', ticket.visitId)
        .limit(1)
        .get();
      if (!queueSnapshot.empty) {
        await queueSnapshot.docs[0].ref.update({
          consultationId: consultationRef.id,
          boxId: box.id,
          updatedAt: now,
        });
      }
      this.events.emit('consultation.scheduled', {
        consultationId: consultationRef.id,
        visitId: ticket.visitId,
        boxId: box.id,
        originHospitalId: ticket.originHospitalId,
        patientId: ticket.patientId,
        doctorId: doctor.id,
      });
    } catch (error) {
      this.logger.error(`Scheduling failed for ticket ${ticket.id}`, error);
    }
  }
}
