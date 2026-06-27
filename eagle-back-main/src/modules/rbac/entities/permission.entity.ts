export enum ResourceType {
  PATIENT = 'patient',
  CONSULTATION = 'consultation',
  URGENCY = 'urgency',
  PRESCRIPTION = 'prescription',
  USER = 'user',
  HOSPITAL = 'hospital',
  QUEUE = 'queue',
  REPORT = 'report',
  FILE = 'file',
  NOTIFICATION = 'notification',
  SYSTEM = 'system',
}

export enum ActionType {
  CREATE = 'create',
  READ = 'read',
  UPDATE = 'update',
  DELETE = 'delete',
  MANAGE = 'manage', // Full access
}

export interface Permission {
  id: string;
  resource: ResourceType;
  action: ActionType;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface RolePermission {
  id: string;
  roleId: string; // User role (ADMIN, DOCTOR, NURSE, etc.)
  permissionId: string;
  conditions?: Record<string, any>; // Additional constraints (e.g., hospitalId)
  createdAt: Date;
}

export const PermissionCollection = 'permissions';
export const RolePermissionCollection = 'role_permissions';
