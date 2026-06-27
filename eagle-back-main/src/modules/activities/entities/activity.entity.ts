export enum ActivityType {
  LOGIN = 'login',
  LOGOUT = 'logout',
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  VIEW = 'view',
  DOWNLOAD = 'download',
  UPLOAD = 'upload',
  APPROVE = 'approve',
  REJECT = 'reject',
  ASSIGN = 'assign',
}

export enum ActivityResource {
  PATIENT = 'patient',
  CONSULTATION = 'consultation',
  URGENCY = 'urgency',
  PRESCRIPTION = 'prescription',
  USER = 'user',
  HOSPITAL = 'hospital',
  FILE = 'file',
  REPORT = 'report',
  QUEUE = 'queue',
  SYSTEM = 'system',
}

export interface Activity {
  id: string;
  userId: string; // Who performed the action
  userRole: string; // Role at time of action
  type: ActivityType;
  resource: ActivityResource;
  resourceId?: string; // ID of affected resource
  description: string; // Human-readable description
  metadata?: Record<string, any>; // Additional context
  ipAddress?: string;
  userAgent?: string;
  hospitalId: string | null; // For filtering by hospital
  timestamp: Date;
  createdAt: Date;
}

export const ActivityCollection = 'activities';
