export enum FollowupStatus {
  SCHEDULED = 'scheduled',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  MISSED = 'missed',
}

export interface Followup {
  id: string;
  consultationId: string;
  patientId: string;
  doctorId: string;
  scheduledAt: Date;
  status: FollowupStatus;

  // Encrypted Health Data Fields (AES-256)
  notes?: string | null; // ENCRYPTED
  instructions?: string | null; // ENCRYPTED
  progressNotes?: string | null; // ENCRYPTED

  reminderSent?: boolean | null;
  completedAt?: Date | null;

  createdAt: Date;
  updatedAt: Date;
}

export const FollowupCollection = 'followups';
