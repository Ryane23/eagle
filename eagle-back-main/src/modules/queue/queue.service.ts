import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { QueueRepository } from './queue.repository';
import {
  Queue,
  QueueStatus,
  QueuePriority,
} from './entities/queue.entity';
import { UserRole } from '../users/entities/user.entity';
import { FirebaseService } from 'src/config/firebase';
import { UrgencyLevel } from '../urgencies/entities/urgency.entity';
import { PatientCollection } from '../patients/entities/patient.entity';
import { ConsultationCollection } from '../consultations/entities/consultation.entity';
import { UserCollection } from '../users/entities/user.entity';

interface AddToQueueDto {
  consultationId: string;
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
  ) {}

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
    const { consultationId, patientId, specialtyId, urgencyLevel, urgencyId } =
      addToQueueDto;

    // Check if queue entry already exists for this consultation
    const existingQueue = await this.queueRepository.findByConsultationId(
      consultationId,
    );

    if (existingQueue) {
      throw new ConflictException(
        `Queue entry already exists for consultation ${consultationId}`,
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
    const calculatedPriority = this.calculatePriority(
      urgencyNumber,
      arrivalTime,
      validationStatus,
    );

    // Get current waiting queues to calculate position
    const waitingQueues = await this.queueRepository.findWaitingOrdered();
    
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
      patientId,
      specialtyId: specialtyId || '',
      status: QueueStatus.WAITING,
      priority,
      calculatedPriority,
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

    if (userRole === UserRole.SECONDARY_SECRETARY && userHospitalId) {
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
    // ADMIN, PRIMARY_SECRETARY, DOCTOR, NURSE can see all queues

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
        const newCalculatedPriority = this.calculatePriority(
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

    // Sort by calculated priority (descending), then by arrival time (ascending)
    queuesWithRecalculatedPriority.sort((a, b) => {
      const priorityDiff = (b.calculatedPriority || 0) - (a.calculatedPriority || 0);
      if (priorityDiff !== 0) return priorityDiff;

      const dateA = a.createdAt instanceof Date ? a.createdAt : new Date(a.createdAt);
      const dateB = b.createdAt instanceof Date ? b.createdAt : new Date(b.createdAt);
      return dateA.getTime() - dateB.getTime();
    });

    // Update positions and estimated wait times
    const updatePromises = queuesWithRecalculatedPriority.map((queue, index) => {
      const newPosition = index + 1;
      const estimatedWaitMinutes = this.estimateWaitTimeMinutes(newPosition);
      const estimatedWaitTime = new Date(
        Date.now() + estimatedWaitMinutes * 60 * 1000,
      );

      return this.queueRepository.update(queue.id, {
        position: newPosition,
        calculatedPriority: queue.calculatedPriority,
        estimatedWaitTime,
        estimatedWaitMinutes,
        updatedAt: new Date(),
      });
    });

    await Promise.all(updatePromises);
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
