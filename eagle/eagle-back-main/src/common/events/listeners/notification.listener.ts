import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { NotificationsService } from '../../../modules/notifications/notifications.service';
import { FirebaseService } from '../../../config/firebase';
import { UsersRepository } from '../../../modules/users/users.repository';
import { HospitalsService } from '../../../modules/hospitals/hospitals.service';
import { UserRole } from '../../../modules/users/entities/user.entity';
import { UserCollection } from '../../../modules/users/entities/user.entity';
import { UrgencyCollection } from '../../../modules/urgencies/entities/urgency.entity';
import { ConsultationCollection } from '../../../modules/consultations/entities/consultation.entity';
import { NotificationType } from '../../../modules/notifications/entities/notification.entity';
import {
  UrgencyCreatedEvent,
  UrgencyValidatedEvent,
  UrgencyAssignedEvent,
  ConsultationStartedEvent,
  ConsultationCompletedEvent,
  PrescriptionCreatedEvent,
  FollowupScheduledEvent,
} from '../events';

@Injectable()
export class NotificationListener {
  private readonly logger = new Logger(NotificationListener.name);

  constructor(
    private readonly notificationsService: NotificationsService,
    private readonly firebaseService: FirebaseService,
    private readonly usersRepository: UsersRepository,
    private readonly hospitalsService: HospitalsService,
  ) {}

  @OnEvent('urgency.created')
  async handleUrgencyCreated(event: UrgencyCreatedEvent) {
    try {
      // Find primary center and get all PRIMARY_SECRETARY users
      const primaryCenter = await this.hospitalsService.findPrimaryCenter();
      const primarySecretaries = await this.usersRepository.findByRoleAndHospital(
        UserRole.PRIMARY_SECRETARY,
        primaryCenter.id,
      );

      if (primarySecretaries.length === 0) {
        this.logger.warn(
          `No PRIMARY_SECRETARY users found for primary center ${primaryCenter.id}`,
        );
        return;
      }

      // Get hospital name for better message
      const hospitalDoc = await this.firebaseService
        .collection('hospitals')
        .doc(event.hospitalId)
        .get();
      const hospitalName = hospitalDoc.exists
        ? hospitalDoc.data()?.name || 'Unknown Hospital'
        : 'Unknown Hospital';

      // Send notification to all primary secretaries
      // NotificationsService.send() automatically pushes via WebSocket if user is connected
      for (const secretary of primarySecretaries) {
        await this.notificationsService.send(secretary.id, {
          title: 'New Urgency Request',
          message: `New urgency request (Level ${event.level}) from ${hospitalName}`,
          type: NotificationType.ALERT,
          relatedEntityId: event.urgencyId,
          relatedEntityType: 'urgency',
        });
      }
    } catch (error) {
      this.logger.error('Error handling urgency.created event', error);
    }
  }

  @OnEvent('urgency.validated')
  async handleUrgencyValidated(event: UrgencyValidatedEvent) {
    try {
      // Fetch urgency to get createdBy (secondary secretary who created it)
      const urgencyDoc = await this.firebaseService
        .collection(UrgencyCollection)
        .doc(event.urgencyId)
        .get();

      if (!urgencyDoc.exists) {
        this.logger.warn(`Urgency ${event.urgencyId} not found`);
        return;
      }

      const urgency = urgencyDoc.data();
      const createdBy = urgency?.createdBy;

      if (!createdBy) {
        this.logger.warn(
          `Urgency ${event.urgencyId} has no createdBy field`,
        );
        return;
      }

      // Verify user exists
      const userDoc = await this.firebaseService
        .collection(UserCollection)
        .doc(createdBy)
        .get();

      if (!userDoc.exists) {
        this.logger.warn(`User ${createdBy} not found`);
        return;
      }

      // NotificationsService.send() automatically pushes via WebSocket if user is connected
      await this.notificationsService.send(createdBy, {
        title: 'Urgency Validated',
        message: `Your urgency request has been validated with level ${event.newLevel}`,
        type: NotificationType.ALERT,
        relatedEntityId: event.urgencyId,
        relatedEntityType: 'urgency',
      });
    } catch (error) {
      this.logger.error('Error handling urgency.validated event', error);
    }
  }

  @OnEvent('urgency.assigned')
  async handleUrgencyAssigned(event: UrgencyAssignedEvent) {
    try {
      // NotificationsService.send() automatically pushes via WebSocket if user is connected
      await this.notificationsService.send(event.doctorId, {
        title: 'Consultation Assigned',
        message: `You have been assigned a consultation scheduled for ${new Date(event.scheduledAt).toLocaleString()}`,
        type: NotificationType.APPOINTMENT,
        relatedEntityId: event.urgencyId,
        relatedEntityType: 'urgency',
      });
    } catch (error) {
      this.logger.error('Error handling urgency.assigned event', error);
    }
  }

  @OnEvent('consultation.started')
  async handleConsultationStarted(event: ConsultationStartedEvent) {
    try {
      // Fetch consultation to get hospital context
      const consultationDoc = await this.firebaseService
        .collection(ConsultationCollection)
        .doc(event.consultationId)
        .get();

      if (!consultationDoc.exists) {
        this.logger.warn(`Consultation ${event.consultationId} not found`);
        return;
      }

      // Fetch patient to get hospitalId
      const patientDoc = await this.firebaseService
        .collection('patients')
        .doc(event.patientId)
        .get();

      if (!patientDoc.exists) {
        this.logger.warn(`Patient ${event.patientId} not found`);
        return;
      }

      const patient = patientDoc.data();
      const hospitalId = patient?.hospitalId;

      if (!hospitalId) {
        this.logger.warn(`Patient ${event.patientId} has no hospitalId`);
        return;
      }

      // Find all nurses in the patient's hospital
      const nurses = await this.usersRepository.findByRoleAndHospital(
        UserRole.NURSE,
        hospitalId,
      );

      if (nurses.length === 0) {
        this.logger.warn(
          `No NURSE users found for hospital ${hospitalId}`,
        );
        return;
      }

      // Send notification to all nurses in the hospital
      // NotificationsService.send() automatically pushes via WebSocket if user is connected
      for (const nurse of nurses) {
        await this.notificationsService.send(nurse.id, {
          title: 'Consultation Started',
          message: `Consultation ${event.consultationId} has started`,
          type: NotificationType.ALERT,
          relatedEntityId: event.consultationId,
          relatedEntityType: 'consultation',
        });
      }
    } catch (error) {
      this.logger.error('Error handling consultation.started event', error);
    }
  }

  @OnEvent('consultation.completed')
  async handleConsultationCompleted(event: ConsultationCompletedEvent) {
    try {
      // Fetch consultation to get hospital context
      const consultationDoc = await this.firebaseService
        .collection(ConsultationCollection)
        .doc(event.consultationId)
        .get();

      if (!consultationDoc.exists) {
        this.logger.warn(`Consultation ${event.consultationId} not found`);
        return;
      }

      // Fetch patient to get hospitalId
      const patientDoc = await this.firebaseService
        .collection('patients')
        .doc(event.patientId)
        .get();

      if (!patientDoc.exists) {
        this.logger.warn(`Patient ${event.patientId} not found`);
        return;
      }

      const patient = patientDoc.data();
      const hospitalId = patient?.hospitalId;

      // Note: Patients don't have user accounts, so we can't send them WebSocket notifications
      // In a real system, you might send SMS/email to patients instead
      // For now, we'll only notify nurses

      if (hospitalId) {
        // Find all nurses in the patient's hospital
        const nurses = await this.usersRepository.findByRoleAndHospital(
          UserRole.NURSE,
          hospitalId,
        );

        // Send notification to all nurses in the hospital
        // NotificationsService.send() automatically pushes via WebSocket if user is connected
        for (const nurse of nurses) {
          await this.notificationsService.send(nurse.id, {
            title: 'Consultation Completed',
            message: `Consultation ${event.consultationId} has been completed. Report available.`,
            type: NotificationType.MESSAGE,
            relatedEntityId: event.consultationId,
            relatedEntityType: 'consultation',
          });
        }
      }
    } catch (error) {
      this.logger.error('Error handling consultation.completed event', error);
    }
  }

  @OnEvent('prescription.created')
  async handlePrescriptionCreated(event: PrescriptionCreatedEvent) {
    try {
      // Note: Patients don't have user accounts, so we can't send them WebSocket notifications
      // In a real system, you might send SMS/email to patients instead
      // For now, we'll notify the nurse who can then inform the patient

      // Fetch consultation to get hospital context
      const consultationDoc = await this.firebaseService
        .collection(ConsultationCollection)
        .doc(event.consultationId)
        .get();

      if (!consultationDoc.exists) {
        this.logger.warn(`Consultation ${event.consultationId} not found`);
        return;
      }

      // Fetch patient to get hospitalId
      const patientDoc = await this.firebaseService
        .collection('patients')
        .doc(event.patientId)
        .get();

      if (!patientDoc.exists) {
        this.logger.warn(`Patient ${event.patientId} not found`);
        return;
      }

      const patient = patientDoc.data();
      const hospitalId = patient?.hospitalId;

      if (hospitalId) {
        // Find all nurses in the patient's hospital
        const nurses = await this.usersRepository.findByRoleAndHospital(
          UserRole.NURSE,
          hospitalId,
        );

        // Send notification to all nurses in the hospital
        // NotificationsService.send() automatically pushes via WebSocket if user is connected
        for (const nurse of nurses) {
          await this.notificationsService.send(nurse.id, {
            title: 'Prescription Ready',
            message: `Prescription for patient ${event.patientId} is ready for download`,
            type: NotificationType.MESSAGE,
            relatedEntityId: event.prescriptionId,
            relatedEntityType: 'prescription',
          });
        }
      }
    } catch (error) {
      this.logger.error('Error handling prescription.created event', error);
    }
  }

  @OnEvent('followup.scheduled')
  async handleFollowupScheduled(event: FollowupScheduledEvent) {
    try {
      // Note: Patients don't have user accounts, so we can't send them WebSocket notifications
      // In a real system, you might send SMS/email to patients instead
      // For now, we'll notify the nurse who can then inform the patient

      // Fetch patient to get hospitalId
      const patientDoc = await this.firebaseService
        .collection('patients')
        .doc(event.patientId)
        .get();

      if (!patientDoc.exists) {
        this.logger.warn(`Patient ${event.patientId} not found`);
        return;
      }

      const patient = patientDoc.data();
      const hospitalId = patient?.hospitalId;

      if (hospitalId) {
        // Find all nurses in the patient's hospital
        const nurses = await this.usersRepository.findByRoleAndHospital(
          UserRole.NURSE,
          hospitalId,
        );

        // Send notification to all nurses in the hospital
        // NotificationsService.send() automatically pushes via WebSocket if user is connected
        for (const nurse of nurses) {
          await this.notificationsService.send(nurse.id, {
            title: 'Follow-up Scheduled',
            message: `Follow-up appointment for patient ${event.patientId} scheduled for ${new Date(event.scheduledAt).toLocaleString()}`,
            type: NotificationType.APPOINTMENT,
            relatedEntityId: event.followupId,
            relatedEntityType: 'followup',
          });
        }
      }
    } catch (error) {
      this.logger.error('Error handling followup.scheduled event', error);
    }
  }
}

