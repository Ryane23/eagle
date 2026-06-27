export enum QueueStatus {
  WAITING = 'waiting',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export enum QueuePriority {
  LOW = 'low',
  NORMAL = 'normal',
  HIGH = 'high',
  URGENT = 'urgent',
}

export interface Queue {
  id: string;
  patientId: string;
  consultationId?: string | null;
  specialtyId: string;
  status: QueueStatus;
  priority: QueuePriority;
  calculatedPriority?: number; // Numeric priority score (0-2) for sorting
  position: number;
  estimatedWaitTime?: Date | null;
  estimatedWaitMinutes?: number; // Estimated wait time in minutes
  reason?: string | null;
  calledAt?: Date | null;
  urgencyLevel?: number; // 1-5 urgency level for priority calculation
  validationStatus?: 'PENDING' | 'VALIDATED' | 'APPROVED' | 'REJECTED'; // For priority bonuses/penalties
  createdAt: Date;
  updatedAt: Date;
}

export const QueueCollection = 'queue';
