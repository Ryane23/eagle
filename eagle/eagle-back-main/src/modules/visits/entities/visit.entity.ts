export enum VisitType {
  WALK_IN = 'WALK_IN',
  APPOINTMENT = 'APPOINTMENT',
  FOLLOW_UP = 'FOLLOW_UP',
  REFERRAL = 'REFERRAL',
  EMERGENCY = 'EMERGENCY',
}

export enum VisitStatus {
  REGISTERED = 'REGISTERED',
  ARRIVED = 'ARRIVED',
  WAITING = 'WAITING',
  IN_PREPARATION = 'IN_PREPARATION',
  READY = 'READY',
  WAITING_FOR_CONSULTATION = 'WAITING_FOR_CONSULTATION',
  WAITING_FOR_VITALS = 'WAITING_FOR_VITALS',
  VITALS_COMPLETED = 'VITALS_COMPLETED',
  READY_FOR_SCHEDULING = 'READY_FOR_SCHEDULING',
  QUEUED = 'QUEUED',
  IN_CONSULTATION = 'IN_CONSULTATION',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  MISSED = 'MISSED',
}

export interface Visit {
  id: string;
  patientId: string;
  originHospitalId: string;
  registeredBy: string;
  registeredByRole: string;
  consultationNumber: string;
  passingNumber: string;
  type: VisitType;
  status: VisitStatus;
  complaint: string;
  departmentId?: string | null;
  specialtyId?: string | null;
  appointmentId?: string | null;
  referralId?: string | null;
  urgencyId?: string | null;
  consultationId?: string | null;
  ticketId?: string | null;
  boxId?: string | null;
  arrivedAt?: Date | null;
  arrivedBy?: string | null;
  preparationStartedAt?: Date | null;
  preparationStartedBy?: string | null;
  checkedInAt?: Date | null;
  vitalsCompletedAt?: Date | null;
  completedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export const VisitCollection = 'visits';
