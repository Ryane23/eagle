import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ConsultationsRepository } from './consultations.repository';
import { AddNoteDto, AssignDoctorDto, CompleteConsultationDto } from './dto';
import {
  Consultation,
  ConsultationStatus,
  ConsultationType,
} from './entities/consultation.entity';
import { User, UserCollection, UserRole } from '../users/entities/user.entity';
import { QueueService } from '../queue/queue.service';
import { QueueStatus } from '../queue/entities/queue.entity';
import { EncryptionService } from '../../common/services/encryption.service';
import { FirebaseService } from '../../config/firebase';
import { PatientCollection } from '../patients/entities/patient.entity';

@Injectable()
export class ConsultationsService {
  constructor(
    private readonly consultationsRepository: ConsultationsRepository,
    private readonly queueService: QueueService,
    private readonly encryptionService: EncryptionService,
    private readonly eventEmitter: EventEmitter2,
    private readonly firebaseService: FirebaseService,
  ) {}

  /**
   * Create consultation (with automatic queue integration)
   */
  async create(consultationData: Partial<Consultation>): Promise<Consultation> {
    const consultation = await this.consultationsRepository.create({
      ...consultationData,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Automatically add to queue if status is SCHEDULED
    if (consultation.status === ConsultationStatus.SCHEDULED) {
      try {
        await this.queueService.addToQueue({
          consultationId: consultation.id,
          patientId: consultation.patientId,
          specialtyId: consultation.specialtyId || null,
          urgencyLevel: consultation.urgencyLevel || null,
        });
      } catch (error) {
        // Log error but don't fail consultation creation
        console.error('Failed to add consultation to queue:', error);
      }
    }

    return consultation;
  }

  /**
   * Get consultation by ID
   */
  async findById(id: string): Promise<Consultation> {
    const consultation = await this.consultationsRepository.findById(id);
    if (!consultation) {
      throw new NotFoundException(`Consultation with ID ${id} not found`);
    }

    // Decrypt sensitive health data fields
    return this.encryptionService.decryptFields(consultation, [
      'symptoms',
      'diagnosis',
      'notes',
      'prescriptions',
      'labResults',
    ]);
  }

  private async patientHospitalId(patientId: string): Promise<string | null> {
    const patient = await this.firebaseService
      .collection(PatientCollection)
      .doc(patientId)
      .get();
    return patient.exists ? patient.data()?.hospitalId || null : null;
  }

  async findByIdScoped(id: string, user: User): Promise<Consultation> {
    const consultation = await this.findById(id);
    if (
      [UserRole.NURSE, UserRole.SECONDARY_SECRETARY].includes(user.role) &&
      (await this.patientHospitalId(consultation.patientId)) !== user.hospitalId
    ) {
      throw new ForbiddenException('Consultation is outside your hospital');
    }
    if (user.role === UserRole.DOCTOR && consultation.doctorId !== user.id) {
      throw new ForbiddenException('You are not assigned to this consultation');
    }
    return consultation;
  }

  /**
   * Get doctor's schedule (my consultations with patient populated)
   */
  async getMySchedule(doctorId: string): Promise<Consultation[]> {
    const consultations = await this.consultationsRepository.findByDoctorAndStatus(doctorId, [
      ConsultationStatus.SCHEDULED,
      ConsultationStatus.IN_PROGRESS,
    ]);

    const enriched = await Promise.all(
      consultations.map(async (consultation) => {
        const decrypted = this.encryptionService.decryptFields(consultation, [
          'symptoms',
          'diagnosis',
          'notes',
          'prescriptions',
          'labResults',
        ]);
        try {
          const patientDoc = await this.firebaseService
            .collection(PatientCollection)
            .doc(consultation.patientId)
            .get();
          if (patientDoc.exists) {
            const patientData = patientDoc.data();
            return { ...decrypted, patient: { id: patientDoc.id, ...patientData } };
          }
        } catch {
          // If patient not found, return without patient
        }
        return decrypted;
      }),
    );

    return enriched;
  }

  /**
   * Get all consultations for a doctor
   */
  async findByDoctor(doctorId: string): Promise<Consultation[]> {
    const consultations = await this.consultationsRepository.findByDoctorId(doctorId);

    // Decrypt sensitive fields
    return consultations.map((consultation) =>
      this.encryptionService.decryptFields(consultation, [
        'symptoms',
        'diagnosis',
        'notes',
        'prescriptions',
        'labResults',
      ]),
    );
  }

  /**
   * Get video consultations for nurse teleconsultation (scheduled or in_progress)
   */
  async findForNurseTeleconsultation(
    hospitalId?: string | null,
  ): Promise<Consultation[]> {
    if (!hospitalId) return [];
    const consultations = await this.consultationsRepository.findByTypeAndStatuses(
      ConsultationType.VIDEO,
      [ConsultationStatus.SCHEDULED, ConsultationStatus.IN_PROGRESS],
    );

    const enriched = await Promise.all(
      consultations.map(async (consultation) => {
        const decrypted = this.encryptionService.decryptFields(consultation, [
          'symptoms',
          'diagnosis',
          'notes',
          'prescriptions',
          'labResults',
        ]);
        try {
          const patientDoc = await this.firebaseService
            .collection(PatientCollection)
            .doc(consultation.patientId)
            .get();
          if (patientDoc.exists) {
            const patientData = patientDoc.data();
            (decrypted as unknown as Record<string, unknown>).patient = {
              id: patientDoc.id,
              ...patientData,
            };
          }
        } catch {
          // If patient not found, return without patient
        }
        if (consultation.doctorId) {
          try {
            const doctorDoc = await this.firebaseService
              .collection(UserCollection)
              .doc(consultation.doctorId)
              .get();
            if (doctorDoc.exists) {
              const doctorData = doctorDoc.data();
              (decrypted as unknown as Record<string, unknown>).doctor = {
                id: doctorDoc.id,
                ...doctorData,
                password: undefined,
              };
            }
          } catch {
            // If doctor not found, continue without
          }
        }
        return decrypted;
      }),
    );

    const scoped = await Promise.all(
      enriched.map(async (consultation) =>
        (await this.patientHospitalId(consultation.patientId)) === hospitalId
          ? consultation
          : null,
      ),
    );
    return scoped.filter((item): item is Consultation => !!item);
  }

  /**
   * Get consultations by patient
   */
  async findByPatient(patientId: string): Promise<Consultation[]> {
    const consultations = await this.consultationsRepository.findByPatientId(patientId);

    // Decrypt sensitive fields
    return consultations.map((consultation) =>
      this.encryptionService.decryptFields(consultation, [
        'symptoms',
        'diagnosis',
        'notes',
        'prescriptions',
        'labResults',
      ]),
    );
  }

  async findByPatientScoped(patientId: string, user: User) {
    if (
      [UserRole.NURSE, UserRole.SECONDARY_SECRETARY].includes(user.role) &&
      (await this.patientHospitalId(patientId)) !== user.hospitalId
    ) {
      throw new ForbiddenException('Patient is outside your hospital');
    }
    return this.findByPatient(patientId);
  }

  /**
   * Start consultation
   */
  async startConsultation(
    id: string,
    doctorId: string,
  ): Promise<Consultation> {
    const consultation = await this.findById(id);

    // Verify doctor is assigned to this consultation
    if (consultation.doctorId !== doctorId) {
      throw new ForbiddenException(
        'You are not assigned to this consultation',
      );
    }

    // State machine validation
    if (consultation.status !== ConsultationStatus.SCHEDULED) {
      throw new BadRequestException(
        `Cannot start consultation with status ${consultation.status}. Expected status: ${ConsultationStatus.SCHEDULED}`,
      );
    }

    const updated = await this.consultationsRepository.update(id, {
      status: ConsultationStatus.IN_PROGRESS,
      startedAt: new Date(),
      updatedAt: new Date(),
    });

    if (!updated) {
      throw new NotFoundException(`Consultation with ID ${id} not found`);
    }

    // Update queue status if exists
    const queue = await this.queueService.findByConsultationId(id);
    if (queue && queue.status === QueueStatus.WAITING) {
      await this.queueService.updateStatus(
        queue.id,
        QueueStatus.IN_PROGRESS,
        new Date(),
      );
    }
    await Promise.all([
      updated.visitId
        ? this.firebaseService.collection('visits').doc(updated.visitId).set(
            {
              status: 'IN_CONSULTATION',
              updatedAt: new Date(),
            },
            { merge: true },
          )
        : Promise.resolve(),
      updated.boxId
        ? this.firebaseService
            .collection('consultation_boxes')
            .doc(updated.boxId)
            .set(
              {
                status: 'IN_USE',
                activeConsultationId: updated.id,
                activeVisitId: updated.visitId || null,
                updatedAt: new Date(),
              },
              { merge: true },
            )
        : Promise.resolve(),
    ]);

    // Emit event
    this.eventEmitter.emit('consultation.started', {
      consultationId: updated.id,
      patientId: updated.patientId,
      doctorId: updated.doctorId,
      originHospitalId: updated.originHospitalId,
    });

    return updated;
  }

  /**
   * Add note to consultation
   */
  async addNote(
    id: string,
    addNoteDto: AddNoteDto,
    userId: string,
    userRole: string,
    userHospitalId?: string | null,
  ): Promise<Consultation> {
    const consultation = await this.findById(id);

    // Verify user has access (doctor assigned or nurse from same hospital)
    if (userRole === 'doctor' && consultation.doctorId !== userId) {
      throw new ForbiddenException(
        'You are not assigned to this consultation',
      );
    }
    if (
      userRole === UserRole.NURSE &&
      (await this.patientHospitalId(consultation.patientId)) !== userHospitalId
    ) {
      throw new ForbiddenException('Consultation is outside your hospital');
    }

    // Decrypt existing notes first
    const existingNotesDecrypted = consultation.notes
      ? this.encryptionService.decrypt(consultation.notes)
      : '';
    
    // Append note to existing notes
    const newNote = existingNotesDecrypted
      ? `${existingNotesDecrypted}\n\n[${new Date().toISOString()}] ${addNoteDto.note}`
      : `[${new Date().toISOString()}] ${addNoteDto.note}`;

    // Encrypt before saving
    const encryptedNote = this.encryptionService.encrypt(newNote);

    const updated = await this.consultationsRepository.update(id, {
      notes: encryptedNote,
      updatedAt: new Date(),
    });

    if (!updated) {
      throw new NotFoundException(`Consultation with ID ${id} not found`);
    }

    return updated;
  }

  /**
   * Complete consultation
   */
  async complete(
    id: string,
    completeDto: CompleteConsultationDto,
    doctorId: string,
  ): Promise<Consultation> {
    const consultation = await this.findById(id);

    // Verify doctor is assigned
    if (consultation.doctorId !== doctorId) {
      throw new ForbiddenException(
        'You are not assigned to this consultation',
      );
    }

    // State machine validation
    if (consultation.status !== ConsultationStatus.IN_PROGRESS) {
      throw new BadRequestException(
        `Cannot complete consultation with status ${consultation.status}. Expected status: ${ConsultationStatus.IN_PROGRESS}`,
      );
    }

    const updateData: Partial<Consultation> = {
      status: ConsultationStatus.COMPLETED,
      endedAt: new Date(),
      updatedAt: new Date(),
    };

    if (completeDto.diagnosis) {
      // Encrypt diagnosis before saving
      updateData.diagnosis = this.encryptionService.encrypt(completeDto.diagnosis);
    }

    if (completeDto.notes) {
      // Decrypt existing notes first
      const existingNotesDecrypted = consultation.notes
        ? this.encryptionService.decrypt(consultation.notes)
        : '';
      
      const newNotes = existingNotesDecrypted
        ? `${existingNotesDecrypted}\n\n[${new Date().toISOString()}] ${completeDto.notes}`
        : `[${new Date().toISOString()}] ${completeDto.notes}`;
      
      // Encrypt before saving
      updateData.notes = this.encryptionService.encrypt(newNotes);
    }

    const updated = await this.consultationsRepository.update(id, updateData);

    if (!updated) {
      throw new NotFoundException(`Consultation with ID ${id} not found`);
    }

    // Update queue status if exists
    const queue = await this.queueService.findByConsultationId(id);
    if (queue) {
      await this.queueService.updateStatus(
        queue.id,
        QueueStatus.COMPLETED,
        new Date(),
      );
    }
    await Promise.all([
      updated.visitId
        ? this.firebaseService.collection('visits').doc(updated.visitId).set(
            {
              status: 'COMPLETED',
              completedAt: new Date(),
              updatedAt: new Date(),
            },
            { merge: true },
          )
        : Promise.resolve(),
      updated.boxId
        ? this.firebaseService
            .collection('consultation_boxes')
            .doc(updated.boxId)
            .set(
              {
                status: 'AVAILABLE',
                activeConsultationId: null,
                activeVisitId: null,
                reservedAt: null,
                updatedAt: new Date(),
              },
              { merge: true },
            )
        : Promise.resolve(),
      updated.appointmentId
        ? this.firebaseService
            .collection('appointments')
            .doc(updated.appointmentId)
            .set(
              { status: 'COMPLETED', updatedAt: new Date() },
              { merge: true },
            )
        : Promise.resolve(),
    ]);

    // Emit event
    this.eventEmitter.emit('consultation.completed', {
      consultationId: updated.id,
      patientId: updated.patientId,
      doctorId: updated.doctorId,
      originHospitalId: updated.originHospitalId,
    });

    return updated;
  }

  /**
   * Assign doctor to consultation
   */
  async assignDoctor(id: string, assignDoctorDto: AssignDoctorDto): Promise<Consultation> {
    const consultation = await this.findById(id);

    if (consultation.status === ConsultationStatus.COMPLETED) {
      throw new BadRequestException('Cannot assign doctor to completed consultation');
    }

    if (consultation.status === ConsultationStatus.CANCELLED) {
      throw new BadRequestException('Cannot assign doctor to cancelled consultation');
    }

    return this.update(id, { doctorId: assignDoctorDto.doctorId });
  }

  /**
   * Update consultation
   */
  async update(
    id: string,
    updateData: Partial<Consultation>,
  ): Promise<Consultation> {
    const consultation = await this.findById(id);

    const updated = await this.consultationsRepository.update(id, {
      ...updateData,
      updatedAt: new Date(),
    });

    if (!updated) {
      throw new NotFoundException(`Consultation with ID ${id} not found`);
    }

    return updated;
  }

  /**
   * Cancel consultation
   */
  async cancel(id: string, doctorId?: string): Promise<Consultation> {
    const consultation = await this.findById(id);

    // If doctorId provided, verify assignment
    if (doctorId && consultation.doctorId !== doctorId) {
      throw new ForbiddenException(
        'You are not assigned to this consultation',
      );
    }

    // State machine validation
    if (consultation.status === ConsultationStatus.COMPLETED) {
      throw new BadRequestException('Cannot cancel completed consultation');
    }

    if (consultation.status === ConsultationStatus.CANCELLED) {
      throw new BadRequestException('Consultation is already cancelled');
    }

    const updated = await this.consultationsRepository.update(id, {
      status: ConsultationStatus.CANCELLED,
      updatedAt: new Date(),
    });

    if (!updated) {
      throw new NotFoundException(`Consultation with ID ${id} not found`);
    }

    // Update queue status if exists
    const queue = await this.queueService.findByConsultationId(id);
    if (queue) {
      if (queue.status === QueueStatus.WAITING) {
        await this.queueService.removeFromQueue(queue.id);
      } else {
        await this.queueService.updateStatus(
          queue.id,
          QueueStatus.CANCELLED,
          new Date(),
        );
      }
    }
    await Promise.all([
      updated.visitId
        ? this.firebaseService.collection('visits').doc(updated.visitId).set(
            { status: 'CANCELLED', updatedAt: new Date() },
            { merge: true },
          )
        : Promise.resolve(),
      updated.boxId
        ? this.firebaseService
            .collection('consultation_boxes')
            .doc(updated.boxId)
            .set(
              {
                status: 'AVAILABLE',
                activeConsultationId: null,
                activeVisitId: null,
                reservedAt: null,
                updatedAt: new Date(),
              },
              { merge: true },
            )
        : Promise.resolve(),
    ]);

    return updated;
  }
}
