import { Injectable } from '@nestjs/common';
import { FirebaseService } from 'src/config/firebase';
import { BaseRepository } from 'src/common/repositories/base.repository';
import {
  Queue,
  QueueCollection,
  QueueStatus,
  QueuePriority,
} from './entities/queue.entity';

@Injectable()
export class QueueRepository extends BaseRepository<Queue> {
  constructor(firebaseService: FirebaseService) {
    super(firebaseService, QueueCollection);
  }

  /**
   * Find queue entries by status
   */
  async findByStatus(status: QueueStatus): Promise<Queue[]> {
    return this.findWhere('status', '==', status);
  }

  /**
   * Find queue entry by consultation ID
   */
  async findByConsultationId(
    consultationId: string,
  ): Promise<Queue | null> {
    return this.findOne('consultationId', '==', consultationId);
  }

  /**
   * Find queue entries by priority
   */
  async findByPriority(priority: QueuePriority): Promise<Queue[]> {
    return this.findWhere('priority', '==', priority);
  }

  /**
   * Find waiting queue entries ordered by calculated priority and creation time
   * Uses advanced EAGLE priority algorithm for sorting
   */
  async findWaitingOrdered(): Promise<Queue[]> {
    const waitingQueues = await this.findByStatus(QueueStatus.WAITING);

    // Sort by calculatedPriority (descending - higher priority first)
    // Then by createdAt (ascending - earlier arrival first)
    return waitingQueues.sort((a, b) => {
      const calculatedPriorityA = a.calculatedPriority || 0;
      const calculatedPriorityB = b.calculatedPriority || 0;
      
      const priorityDiff = calculatedPriorityB - calculatedPriorityA;
      if (priorityDiff !== 0) return priorityDiff;

      // If priorities are equal, earlier arrival gets priority
      const dateA = a.createdAt instanceof Date ? a.createdAt : new Date(a.createdAt);
      const dateB = b.createdAt instanceof Date ? b.createdAt : new Date(b.createdAt);
      return dateA.getTime() - dateB.getTime();
    });
  }

  /**
   * Count queue entries by status
   */
  async countByStatus(status: QueueStatus): Promise<number> {
    const queues = await this.findByStatus(status);
    return queues.length;
  }

  /**
   * Find queue entries for a specific patient
   */
  async findByPatientId(patientId: string): Promise<Queue[]> {
    return this.findWhere('patientId', '==', patientId);
  }
}
