export enum UserRole {
  ADMIN = 'admin',
  PRIMARY_SECRETARY = 'primary_secretary',
  SECONDARY_SECRETARY = 'secondary_secretary',
  DOCTOR = 'doctor',
  NURSE = 'nurse',
}

export interface User {
  id: string;
  email: string;
  password: string;
  name: string;
  phone?: string | null;
  role: UserRole;
  hospitalId?: string | null;
  specialtyId?: string | null;
  departmentId?: string | null;
  availabilityStatus?: 'AVAILABLE' | 'BUSY' | 'UNAVAILABLE' | null;
  isActive: boolean;
  lastLogin?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export const UserCollection = 'users';
