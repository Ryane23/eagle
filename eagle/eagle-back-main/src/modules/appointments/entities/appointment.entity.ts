export enum AppointmentStatus {
  BOOKED = 'BOOKED',
  CONFIRMED = 'CONFIRMED',
  CHECKED_IN = 'CHECKED_IN',
  MISSED = 'MISSED',
  CANCELLED = 'CANCELLED',
  COMPLETED = 'COMPLETED',
}

export interface Appointment {
  id: string;
  patientId: string;
  originHospitalId: string;
  specialtyId: string;
  selectedDoctorId?: string | null;
  scheduledAt: Date;
  status: AppointmentStatus;
  reason?: string | null;
  checkedInAt?: Date | null;
  visitId?: string | null;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export const AppointmentCollection = 'appointments';
