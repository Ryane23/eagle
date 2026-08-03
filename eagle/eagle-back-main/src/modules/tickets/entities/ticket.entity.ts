export interface Ticket {
  id: string;
  ticketNumber: string;
  visitId: string;
  patientId: string;
  originHospitalId: string;
  specialtyId: string;
  consultationId?: string | null;
  appointmentId?: string | null;
  referralId?: string | null;
  urgencyId?: string | null;
  boxId?: string | null;
  queueNumber: number;
  estimatedWaitMinutes: number;
  createdAt: Date;
  updatedAt: Date;
}
export const TicketCollection = 'tickets';
