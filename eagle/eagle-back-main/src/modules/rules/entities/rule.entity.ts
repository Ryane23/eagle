import { UserRole } from '../../users/entities/user.entity';

export enum RuleAction {
  CREATE = 'create',
  READ = 'read',
  UPDATE = 'update',
  DELETE = 'delete',
  EXECUTE = 'execute',
}

export enum RuleResource {
  PATIENTS = 'patients',
  CONSULTATIONS = 'consultations',
  URGENCIES = 'urgencies',
  PRESCRIPTIONS = 'prescriptions',
  USERS = 'users',
  HOSPITALS = 'hospitals',
  QUEUE = 'queue',
  NOTIFICATIONS = 'notifications',
  REPORTS = 'reports',
  SYSTEM = 'system',
}

export interface Rule {
  id: string;
  name: string;
  description?: string | null;
  role: UserRole;
  resource: RuleResource;
  action: RuleAction;
  conditions?: Record<string, any> | null; // JSON conditions (e.g., { "hospitalId": "$user.hospitalId" })
  isActive: boolean;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export const RuleCollection = 'rules';
