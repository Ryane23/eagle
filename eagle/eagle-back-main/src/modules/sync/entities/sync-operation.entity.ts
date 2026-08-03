export enum SyncOperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
}

export enum SyncStatus {
  PENDING = 'pending',
  SYNCED = 'synced',
  FAILED = 'failed',
  CONFLICT = 'conflict',
}

export interface SyncOperation {
  id: string;
  userId: string;
  entityType: string; // e.g., 'patient', 'consultation', 'prescription'
  entityId: string;
  operationType: SyncOperationType;
  data: Record<string, any>;
  status: SyncStatus;
  conflictResolution?: 'server' | 'client' | 'merge';
  serverVersion?: Record<string, any>;
  clientVersion?: Record<string, any>;
  errorMessage?: string;
  createdAt: Date;
  syncedAt?: Date;
  retryCount: number;
}

export const SyncOperationCollection = 'sync_operations';

