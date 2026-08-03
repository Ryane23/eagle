import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { QueueRepository } from './queue.repository';
import {
  Queue,
  QueueStatus,
  QueuePriority,
} from './entities/queue.entity';
import { UserRole } from '../users/entities/user.entity';
import { FirebaseService } from '../../config/firebase';
import { UrgencyLevel } from '../urgencies/entities/urgency.entity';
import { PatientCollection } from '../patients/entities/patient.entity';
import { ConsultationCollection } from '../consultations/entities/consultation.entity';
import { UserCollection } from '../users/entities/user.entity';

interface AddToQueueDto {
  consultationId?: string;
  visitId?: string;
  originHospitalId?: string;
  appointmentId?: string;
  referralId?: string;
  boxId?: string;
  patientId: string;
  specialtyId?: string | null;
  urgencyLevel?: string | null; // UrgencyLevel enum as string
  urgencyId?: string | null; // Reference to urgencies collection
}

export interface QueueWithPatientInfo extends Queue {
  patientName?: string;
  patientHospitalId?: string;
  patient?: Record<string, unknown>;
  consultation?: Record<string, unknown>;
  hospitalId?: string;
}

@Injectable()
export class QueueService {
  // Average consultation duration in minutes (configurable)
  private readonly AVERAGE_CONSULTATION_DURATION_MINUTES = 20;

  constructor(
    private readonly queueRepository: QueueRepository,
    private readonly firebaseService: FirebaseService,
    private readonly events: EventEmitter2,
  ) {}

  @OnEvent('ticket.created')
  async addTicketToQueue(ticket: {
    visitId: string;
    patientId: string;
    originHospitalId: string;
    specialtyId: string;
    appointmentId?: string | null;
    referralId?: string | null;
    urgencyId?: string | null;
    boxId?: string | null;
  }) {
    const urgency = ticket.urgencyId
      ? await this.firebaseService.collection('urgencies').doc(ticket.urgencyId).get()
      : null;
    await this.addToQueue({
      visitId: ticket.visitId,
      patientId: ticket.patientId,
      originHospitalId: ticket.originHospitalId,
      specialtyId: ticket.specialtyId,
      appointmentId: ticket.appointmentId || undefined,
      referralId: ticket.referralId || undefined,
      urgencyId: ticket.urgencyId || undefined,
      boxId: ticket.boxId || undefined,
      urgencyLevel: urgency?.data()?.level || null,
    });
  }

  @OnEvent('consultation.scheduled')
  async attachScheduledConsultation(event: {
    consultationId: string;
    visitId: string;
    boxId: string;
  }) {
    const queue = await this.queueRepository.findByVisitId(event.visitId);
    if (!queue) return;
    await this.queueRepository.update(queue.id, {
      consultationId: event.consultationId,
      boxId: event.boxId,
      updatedAt: new Date(),
    });
  }

  private schedulingTier(
    urgencyLevel?: string | null,
    appointmentId?: string,
    referralId?: string,
  ): { tier: number; reasons: string[] } {
    const level = urgencyLevel?.toUpperCase();
    if (level === UrgencyLevel.CRITICAL) return { tier: 5000, reasons: ['CRITICAL'] };
    if (level === UrgencyLevel.URGENT) return { tier: 4000, reasons: ['URGENT'] };
    if (appointmentId) return { tier: 3000, reasons: ['DUE_APPOINTMENT'] };
    if (referralId) return { tier: 2500, reasons: ['REFERRAL'] };
    if (level === UrgencyLevel.MODERATE) return { tier: 1000, reasons: ['MODERATE'] };
    return { tier: 500, reasons: ['LOW_OR_ROUTINE'] };
  }

  /**
   * Map UrgencyLevel to numeric urgency (1-5)
   */
  private mapUrgencyLevelToNumber(
    urgencyLevel: string | null | undefined,
  ): number {
    if (!urgencyLevel) return 2; // Default to moderate

    switch (urgencyLevel.toUpperCase()) {
      case UrgencyLevel.CRITICAL:
        return 5;
      case UrgencyLevel.URGENT:
        return 4;
      case UrgencyLevel.MODERATE:
        return 3;
      case UrgencyLevel.LOW:
        return 2;
      default:
        return 2;
    }
  }

  /**
   * Map UrgencyLevel to QueuePriority
   */
  private mapUrgencyLevelToPriority(
    urgencyLevel: string | null | undefined,
  ): QueuePriority {
    if (!urgencyLevel) return QueuePriority.NORMAL;

    switch (urgencyLevel.toUpperCase()) {
      case UrgencyLevel.CRITICAL:
        return QueuePriority.URGENT;
      case UrgencyLevel.URGENT:
        return QueuePriority.URGENT;
      case UrgencyLevel.MODERATE:
        return QueuePriority.HIGH;
      case UrgencyLevel.LOW:
        return QueuePriority.NORMAL;
      default:
        return QueuePriority.NORMAL;
    }
  }

  /**
   * Calculate composite priority score using EAGLE algorithm
   * Priority = (0.5 × Urgency/5) + (0.5 × Seniority/120) + Bonuses/Penalties
   * 
   * Bonuses:
   * - +0.2 if critical urgency (level 5)
   * - +0.1 if fully validated/approved
   * - +0.05 per 30-min bracket beyond 1h wait
   * 
   * Penalties:
   * - -0.05 if not yet validated (PENDING)
   * - -0.15 if rejected
   */
  private calculatePriority(
    urgencyLevel: number,
    arrivalTime: Date,
    validationStatus?: 'PENDING' | 'VALIDATED' | 'APPROVED' | 'REJECTED',
  ): number {
    const now = new Date();
    const waitingTimeMinutes = (now.getTime() - arrivalTime.getTime()) / (1000 * 60);
    
    // Normalize urgency (0-1)
    const urgenceScore = urgencyLevel / 5;
    
    // Normalize seniority (0-1) - Max 2h wait = score 1
    const ancienneteScore = Math.min(waitingTimeMinutes / 120, 1);
    
    // Base formula (50/50)
    let priorityScore = (0.5 * urgenceScore) + (0.5 * ancienneteScore);
    
    // === BONUSES & PENALTIES ===
    
    // +0.2 if critical urgency (level 5)
    if (urgencyLevel === 5) {
      priorityScore += 0.2;
    }
    
    // +0.1 if fully validated/approved
    if (validationStatus === 'APPROVED' || validationStatus === 'VALIDATED') {
      priorityScore += 0.1;
    }
    
    // -0.05 if not yet validated
    if (validationStatus === 'PENDING') {
      priorityScore -= 0.05;
    }
    
    // +0.05 per 30-min bracket beyond 1h wait (prevent forgotten patients)
    if (waitingTimeMinutes > 60) {
      const extraWaitBonus = Math.floor((waitingTimeMinutes - 60) / 30) * 0.05;
      priorityScore += extraWaitBonus;
    }
    
    // Penalty for rejected patients (they need re-evaluation)
    if (validationStatus === 'REJECTED') {
      priorityScore -= 0.15;
    }
    
    return Math.min(Math.max(priorityScore, 0), 2); // Cap between 0-2
  }

  /**
   * Estimate wait time in minutes based on queue position and average consultation duration
   */
  private estimateWaitTimeMinutes(position: number): number {
    return (position - 1) * this.AVERAGE_CONSULTATION_DURATION_MINUTES;
  }

  /**
   * Get patient hospital ID
   */
  private async getPatientHospitalId(patientId: string): Promise<string | null> {
    try {
      const patientDoc = await this.firebaseService
        .collection(PatientCollection)
        .doc(patientId)
        .get();

      if (!patientDoc.exists) {
        return null;
      }

      const patientData = patientDoc.data();
      return patientData?.hospitalId || null;
    } catch (error) {
      return null;
    }
  }

  /**
   * Get validation status from urgency
   * Maps UrgencyStatus to queue validationStatus for priority calculation
   */
  private async getValidationStatus(
    urgencyId: string | null | undefined,
  ): Promise<'PENDING' | 'VALIDATED' | 'APPROVED' | 'REJECTED' | undefined> {
    if (!urgencyId) return undefined;

    try {
      const urgencyDoc = await this.firebaseService
        .collection('urgencies')
        .doc(urgencyId)
        .get();

      if (!urgencyDoc.exists) {
        return undefined;
      }

      const urgencyData = urgencyDoc.data();
      const status = urgencyData?.status;

      // Map UrgencyStatus to queue validationStatus
      switch (status) {
        case 'PENDING':
          return 'PENDING';
        case 'VALIDATED_PRIMARY_SECRETARY':
          return 'VALIDATED';
        case 'APPROVED':
        case 'ASSIGNED':
        case 'IN_PROGRESS':
        case 'COMPLETED':
          return 'APPROVED';
        case 'REJECTED':
          return 'REJECTED';
        default:
          return undefined;
      }
    } catch (error) {
      return undefined;
    }
  }

  /**
   * Add patient to queue when consultation is scheduled
   * 
   * INTEGRATION POINT FOR PHASE 2 (Consultations):
   * This method should be called from ConsultationsService when a consultation
   * with status SCHEDULED is created. Example:
   * 
   * ```typescript
   * // In consultations.service.ts (Phase 2)
   * async create(consultation: Consultation) {
   *   const created = await this.repository.create(consultation);
   *   
   *   if (created.status === ConsultationStatus.SCHEDULED) {
   *     await this.queueService.addToQueue({
   *       consultationId: created.id,
   *       patientId: created.patientId,
   *       specialtyId: created.specialtyId,
   *       urgencyLevel: created.urgencyLevel
   *     });
   *   }
   *   
   *   return created;
   * }
   * ```
   * 
   * Can be called independently or by consultation service
   */
  async addToQueue(addToQueueDto: AddToQueueDto): Promise<Queue> {
    const {
      consultationId,
      visitId,
      patientId,
      specialtyId,
      urgencyLevel,
      urgencyId,
      originHospitalId,
      appointmentId,
      referralId,
      boxId,
    } =
      addToQueueDto;

    const existingQueue = consultationId
      ? await this.queueRepository.findByConsultationId(consultationId)
      : visitId
        ? await this.queueRepository.findByVisitId(visitId)
        : null;

    if (existingQueue) {
      throw new ConflictException(
        'Queue entry already exists for this visit or consultation',
      );
    }

    // Map urgency level to numeric and priority enum
    const urgencyNumber = this.mapUrgencyLevelToNumber(urgencyLevel);
    const priority = this.mapUrgencyLevelToPriority(urgencyLevel);

    // Get arrival time (now)
    const arrivalTime = new Date();

    // Fetch validation status from urgencies collection
    const validationStatus = await this.getValidationStatus(urgencyId);

    // Calculate priority score using EAGLE algorithm with validation status
    const { tier, reasons } = this.schedulingTier(
      urgencyLevel,
      appointmentId,
      referralId,
    );
    const calculatedPriority = tier + this.calculatePriority(
      urgencyNumber,
      arrivalTime,
      validationStatus,
    );

    // Get current waiting queues to calculate position
    const resolvedHospitalId =
      originHospitalId || (await this.getPatientHospitalId(patientId));
    const waitingQueues = (await this.queueRepository.findWaitingOrdered()).filter(
      (queue) =>
        queue.originHospitalId === resolvedHospitalId &&
        queue.specialtyId === (specialtyId || ''),
    );
    
    // Calculate position based on priority (higher priority = lower position)
    // Count how many patients have higher calculated priority
    let position = 1;
    for (const q of waitingQueues) {
      if ((q.calculatedPriority || 0) > calculatedPriority) {
        position++;
      } else if ((q.calculatedPriority || 0) === calculatedPriority) {
        // Same priority, earlier arrival gets priority
        const qArrival = q.createdAt instanceof Date ? q.createdAt : new Date(q.createdAt);
        if (qArrival.getTime() < arrivalTime.getTime()) {
          position++;
        }
      }
    }

    // Calculate estimated wait time
    const estimatedWaitMinutes = this.estimateWaitTimeMinutes(position);
    const estimatedWaitTime = new Date(
      Date.now() + estimatedWaitMinutes * 60 * 1000,
    );

    // Create queue entry
    const queueData: Partial<Queue> = {
      consultationId,
      visitId: visitId || null,
      originHospitalId: resolvedHospitalId,
      appointmentId: appointmentId || null,
      referralId: referralId || null,
      urgencyId: urgencyId || null,
      boxId: boxId || null,
      patientId,
      specialtyId: specialtyId || '',
      status: QueueStatus.WAITING,
      priority,
      calculatedPriority,
      schedulingTier: tier,
      schedulingReasons: reasons,
      urgencyLevel: urgencyNumber,
      validationStatus, // Store validation status for priority bonuses/penalties
      position,
      estimatedWaitTime,
      estimatedWaitMinutes,
      createdAt: arrivalTime,
      updatedAt: new Date(),
    };

    const queue = await this.queueRepository.create(queueData);

    // Recalculate positions for all waiting queues (with new priority algorithm)
    await this.recalculatePositions();

    return queue;
  }

  /**
   * Get queue with role-based filtering
   */
  async getQueue(
    userRole: UserRole,
    userHospitalId?: string | null,
    status?: QueueStatus,
  ): Promise<QueueWithPatientInfo[]> {
    let queues: Queue[];

    // Filter by status if provided, otherwise get all waiting queues
    if (status) {
      queues = await this.queueRepository.findByStatus(status);
    } else {
      // Default to waiting queues ordered by priority
      queues = await this.queueRepository.findWaitingOrdered();
    }

    // Apply role-based filtering
    let filteredQueues = queues;

    if (
      [UserRole.SECONDARY_SECRETARY, UserRole.NURSE].includes(userRole) &&
      userHospitalId
    ) {
      // Secondary Secretary: Only see patients from their hospital
      const queuesWithPatientInfo = await Promise.all(
        queues.map(async (queue) => {
          const patientHospitalId =
            await this.getPatientHospitalId(queue.patientId);
          return { ...queue, patientHospitalId };
        }),
      );

      filteredQueues = queuesWithPatientInfo.filter(
        (q) => q.patientHospitalId === userHospitalId,
      );
    }
    // Primary hospital staff retain network visibility; sub-hospital roles do not.

    // Enrich with full patient, consultation, and doctor info
    const queuesWithPatientInfo = await Promise.all(
      filteredQueues.map(async (queue) => {
        const result: QueueWithPatientInfo = { ...queue };
        try {
          const patientDoc = await this.firebaseService
            .collection(PatientCollection)
            .doc(queue.patientId)
            .get();

          if (patientDoc.exists) {
            const patientData = patientDoc.data();
            const patient = { id: patientDoc.id, ...patientData };
            result.patientName = patientData
              ? `${patientData.firstName || ''} ${patientData.lastName || ''}`.trim()
              : undefined;
            result.patientHospitalId = patientData?.hospitalId;
            result.patient = patient as Record<string, unknown>;
            result.hospitalId = patientData?.hospitalId || queue.patientId;
          }
        } catch {
          // If patient not found, keep queue without patient info
        }

        if (queue.consultationId) {
          try {
            const consultationDoc = await this.firebaseService
              .collection(ConsultationCollection)
              .doc(queue.consultationId)
              .get();

            if (consultationDoc.exists) {
              const consultationData = consultationDoc.data();
              const consultation = { id: consultationDoc.id, ...consultationData };
              if (consultationData?.doctorId) {
                const doctorDoc = await this.firebaseService
                  .collection(UserCollection)
                  .doc(consultationData.doctorId)
                  .get();
                if (doctorDoc.exists) {
                  const doctorData = doctorDoc.data();
                  (consultation as Record<string, unknown>).doctor = {
                    id: doctorDoc.id,
                    ...doctorData,
                    password: undefined,
                  };
                }
              }
              result.consultation = consultation as Record<string, unknown>;
            }
          } catch {
            // If consultation not found, continue without it
          }
        }

        return result;
      }),
    );

    return queuesWithPatientInfo;
  }

  /**
   * Get queue entry by ID
   */
  async findById(id: string): Promise<Queue> {
    const queue = await this.queueRepository.findById(id);
    if (!queue) {
      throw new NotFoundException(`Queue entry with ID ${id} not found`);
    }
    return queue;
  }

  /**
   * Update queue status
   * 
   * INTEGRATION POINT FOR PHASE 2 (Consultations):
   * This method should be called when consultation status changes:
   * - IN_PROGRESS: Update queue status to IN_PROGRESS
   * - COMPLETED: Update queue status to COMPLETED
   * - CANCELLED: Remove from queue or set to CANCELLED
   * 
   * Example:
   * ```typescript
   * // When consultation starts
   * async startConsultation(id: string) {
   *   const consultation = await this.update(id, {
   *     status: ConsultationStatus.IN_PROGRESS
   *   });
   *   
   *   const queue = await this.queueService.findByConsultationId(id);
   *   if (queue) {
   *     await this.queueService.updateStatus(queue.id, QueueStatus.IN_PROGRESS);
   *   }
   * }
   * ```
   */
  async updateStatus(
    id: string,
    status: QueueStatus,
    calledAt?: Date,
  ): Promise<Queue> {
    const queue = await this.findById(id);

    // Validate status transition
    if (queue.status === QueueStatus.COMPLETED && status !== QueueStatus.COMPLETED) {
      throw new BadRequestException(
        'Cannot change status of completed queue entry',
      );
    }

    if (queue.status === QueueStatus.CANCELLED && status !== QueueStatus.CANCELLED) {
      throw new BadRequestException(
        'Cannot change status of cancelled queue entry',
      );
    }

    const updateData: Partial<Queue> = {
      status,
      updatedAt: new Date(),
    };

    if (status === QueueStatus.IN_PROGRESS && !queue.calledAt) {
      updateData.calledAt = calledAt || new Date();
    }

    const updated = await this.queueRepository.update(id, updateData);

    if (!updated) {
      throw new NotFoundException(`Queue entry with ID ${id} not found`);
    }

    // Recalculate positions if status changed to COMPLETED or CANCELLED
    if (
      (status === QueueStatus.COMPLETED || status === QueueStatus.CANCELLED) &&
      queue.status === QueueStatus.WAITING
    ) {
      await this.recalculatePositions();
    }

    return updated;
  }

  /**
   * Recalculate positions for all waiting queues
   * Called when queue entries are added, completed, or cancelled
   * Uses advanced priority algorithm for sorting
   */
  async recalculatePositions(): Promise<void> {
    const waitingQueues = await this.queueRepository.findByStatus(QueueStatus.WAITING);

    // Recalculate priorities for all waiting queues (wait time may have changed)
    const queuesWithRecalculatedPriority = await Promise.all(
      waitingQueues.map(async (queue) => {
        const arrivalTime = queue.createdAt instanceof Date 
          ? queue.createdAt 
          : new Date(queue.createdAt);
        
        // Recalculate priority (wait time has increased)
        const urgencyLevel = queue.urgencyLevel || 2;
        const newCalculatedPriority = (queue.schedulingTier || 0) + this.calculatePriority(
          urgencyLevel,
          arrivalTime,
          queue.validationStatus,
        );

        return {
          ...queue,
          calculatedPriority: newCalculatedPriority,
        };
      }),
    );

    // Recalculate independently inside each hospital + specialty partition.
    const partitions = new Map<string, typeof queuesWithRecalculatedPriority>();
    for (const queue of queuesWithRecalculatedPriority) {
      const key = `${queue.originHospitalId || 'legacy'}:${queue.specialtyId}`;
      const partition = partitions.get(key) || [];
      partition.push(queue);
      partitions.set(key, partition);
    }

    const updatePromises: Promise<Queue | null>[] = [];
    for (const partition of partitions.values()) {
      partition.sort((a, b) => {
      const priorityDiff = (b.calculatedPriority || 0) - (a.calculatedPriority || 0);
      if (priorityDiff !== 0) return priorityDiff;

      const dateA = a.createdAt instanceof Date ? a.createdAt : new Date(a.createdAt);
      const dateB = b.createdAt instanceof Date ? b.createdAt : new Date(b.createdAt);
      return dateA.getTime() - dateB.getTime();
      });
      partition.forEach((queue, index) => {
        const newPosition = index + 1;
        const estimatedWaitMinutes = this.estimateWaitTimeMinutes(newPosition);
        updatePromises.push(this.queueRepository.update(queue.id, {
          position: newPosition,
          calculatedPriority: queue.calculatedPriority,
          estimatedWaitTime: new Date(Date.now() + estimatedWaitMinutes * 60 * 1000),
          estimatedWaitMinutes,
          updatedAt: new Date(),
        }));
      });
    }

    await Promise.all(updatePromises);
    this.events.emit('queue.recalculated', {
      partitions: partitions.size,
      hospitalIds: [
        ...new Set(
          [...partitions.values()]
            .map((partition) => partition[0]?.originHospitalId)
            .filter((id): id is string => !!id),
        ),
      ],
    });
  }

  /**
   * Get queue statistics
   */
  async getQueueStats(): Promise<{
    total: number;
    waiting: number;
    inProgress: number;
    completed: number;
    cancelled: number;
  }> {
    const [waiting, inProgress, completed, cancelled] = await Promise.all([
      this.queueRepository.countByStatus(QueueStatus.WAITING),
      this.queueRepository.countByStatus(QueueStatus.IN_PROGRESS),
      this.queueRepository.countByStatus(QueueStatus.COMPLETED),
      this.queueRepository.countByStatus(QueueStatus.CANCELLED),
    ]);

    return {
      total: waiting + inProgress + completed + cancelled,
      waiting,
      inProgress,
      completed,
      cancelled,
    };
  }

  /**
   * Remove queue entry (when consultation is cancelled)
   */
  async removeFromQueue(queueId: string): Promise<void> {
    const queue = await this.findById(queueId);

    if (queue.status === QueueStatus.IN_PROGRESS) {
      throw new BadRequestException(
        'Cannot remove queue entry that is in progress',
      );
    }

    await this.queueRepository.delete(queueId);
    await this.recalculatePositions();
  }

  /**
   * Get queue entry by consultation ID
   */
  async findByConsultationId(consultationId: string): Promise<Queue | null> {
    return this.queueRepository.findByConsultationId(consultationId);
  }
}
