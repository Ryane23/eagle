export enum StaffShiftStatus {
  SCHEDULED = 'SCHEDULED',
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}
export interface StaffShift {
  id: string;
  userId: string;
  hospitalId: string;
  departmentId?: string | null;
  boxIds?: string[];
  startsAt: Date;
  endsAt: Date;
  status: StaffShiftStatus;
  createdAt: Date;
  updatedAt: Date;
}
export const StaffShiftCollection = 'staff_shifts';
