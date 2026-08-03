export enum UrgencyLevel {
  LOW = 'LOW',
  MODERATE = 'MODERATE',
  URGENT = 'URGENT',
  CRITICAL = 'CRITICAL',
}

export enum UrgencyStatus {
  PENDING = 'PENDING',
  VALIDATED_PRIMARY_SECRETARY = 'VALIDATED_PRIMARY_SECRETARY',
  APPROVED = 'APPROVED',
  ASSIGNED = 'ASSIGNED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  REJECTED = 'REJECTED',
}

export interface Urgency {
  id: string;
  patientId: string;
  hospitalId: string;
  createdBy: string;
  level: UrgencyLevel;
  status: UrgencyStatus;
  assignedDoctorId?: string | null;
  visitId: string;
  reasonForConsultation: string;
  requestedSpecialty: string;
  symptoms?: string | null;
  vitalSigns?: Record<string, unknown> | null;
  validationHistory?: Array<{
    level: UrgencyLevel;
    justification: string;
    validatedBy: string;
    validatedAt: Date;
  }>;
  scheduledAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export const UrgencyCollection = 'urgencies';
