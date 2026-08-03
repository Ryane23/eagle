export enum PermissionAction {
  CREATE = 'create',
  READ = 'read',
  UPDATE = 'update',
  DELETE = 'delete',
  MANAGE = 'manage',
}

export enum PermissionResource {
  USERS = 'users',
  PATIENTS = 'patients',
  CONSULTATIONS = 'consultations',
  URGENCIES = 'urgencies',
  PRESCRIPTIONS = 'prescriptions',
  HOSPITALS = 'hospitals',
  REPORTS = 'reports',
  QUEUE = 'queue',
  NOTIFICATIONS = 'notifications',
  FILES = 'files',
  SYSTEM = 'system',
  ROLES = 'roles',
  PERMISSIONS = 'permissions',
}

export interface Permission {
  id: string;
  name: string; // e.g., "manage_users", "create_patients"
  description: string;
  resource: PermissionResource;
  action: PermissionAction;
  conditions?: Record<string, any> | null; // Optional conditions (e.g., { "hospitalId": "$user.hospitalId" })
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export const PermissionCollection = 'permissions';
