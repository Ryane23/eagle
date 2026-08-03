export enum ConsultationBoxStatus {
  AVAILABLE = 'AVAILABLE',
  RESERVED = 'RESERVED',
  IN_USE = 'IN_USE',
  MAINTENANCE = 'MAINTENANCE',
  OFFLINE = 'OFFLINE',
}

export interface ConsultationBox {
  id: string;
  hospitalId: string;
  code: string;
  name: string;
  status: ConsultationBoxStatus;
  isActive: boolean;
  defaultSpecialtyId?: string | null;
  currentSpecialtyId?: string | null;
  assignmentStartsAt?: Date | null;
  assignmentEndsAt?: Date | null;
  assignedBy?: string | null;
  activeVisitId?: string | null;
  activeConsultationId?: string | null;
  reservedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export const ConsultationBoxCollection = 'consultation_boxes';
