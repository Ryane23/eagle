export enum ConsultationStatus {
  SCHEDULED = 'scheduled',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export enum ConsultationType {
  VIDEO = 'video',
  AUDIO = 'audio',
  CHAT = 'chat',
}

export interface Consultation {
  id: string;
  patientId: string;
  doctorId: string;
  specialtyId?: string | null;

  type: ConsultationType;
  status: ConsultationStatus;

  scheduledAt: Date;
  startedAt?: Date | null;
  endedAt?: Date | null;

  // Encrypted Health Data Fields (AES-256)
  symptoms?: string | null; // ENCRYPTED
  diagnosis?: string | null; // ENCRYPTED
  notes?: string | null; // ENCRYPTED
  prescriptions?: string | null; // ENCRYPTED
  labResults?: string | null; // ENCRYPTED

  urgencyLevel?: string | null;
  fee?: number | null;

  createdAt: Date;
  updatedAt: Date;
}

export const ConsultationCollection = 'consultations';
