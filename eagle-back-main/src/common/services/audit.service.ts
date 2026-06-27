import { Injectable, Logger } from '@nestjs/common';
import { FirebaseService } from 'src/config/firebase';
import * as admin from 'firebase-admin';

export enum AuditAction {
  // Patient actions
  PATIENT_ACCESSED = 'patient.accessed',
  PATIENT_CREATED = 'patient.created',
  PATIENT_UPDATED = 'patient.updated',
  PATIENT_DELETED = 'patient.deleted',
  
  // Prescription actions
  PRESCRIPTION_CREATED = 'prescription.created',
  PRESCRIPTION_MODIFIED = 'prescription.modified',
  PRESCRIPTION_ACCESSED = 'prescription.accessed',
  
  // Consultation actions
  CONSULTATION_ACCESSED = 'consultation.accessed',
  CONSULTATION_CREATED = 'consultation.created',
  CONSULTATION_COMPLETED = 'consultation.completed',
  
  // User actions
  USER_AUTHENTICATED = 'user.authenticated',
  USER_CREATED = 'user.created',
  USER_UPDATED = 'user.updated',
  ROLE_CHANGED = 'user.role_changed',
  
  // System actions
  SYSTEM_SETTINGS_CHANGED = 'system.settings_changed',
  DATA_DELETED = 'data.deleted',
}

export interface AuditLog {
  id: string;
  userId: string;
  action: AuditAction;
  entityType: string;
  entityId?: string;
  details?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  timestamp: Date;
}

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);
  private readonly collection = 'audit_logs';

  constructor(private readonly firebaseService: FirebaseService) {}

  /**
   * Log an action
   */
  async logAction(
    userId: string,
    action: AuditAction,
    entityType: string,
    entityId?: string,
    details?: Record<string, any>,
    request?: { ip?: string; userAgent?: string },
  ): Promise<void> {
    try {
      const auditLog: Omit<AuditLog, 'id'> = {
        userId,
        action,
        entityType,
        entityId,
        details,
        ipAddress: request?.ip,
        userAgent: request?.userAgent,
        timestamp: new Date(),
      };

      await this.firebaseService.collection(this.collection).add(auditLog);
      
      this.logger.debug(`Audit log created: ${action} by ${userId}`);
    } catch (error) {
      this.logger.error(`Failed to create audit log: ${error.message}`, error.stack);
      // Don't throw - audit logging should not break the application
    }
  }

  /**
   * Get audit logs with filters
   */
  async getAuditLogs(filters: {
    userId?: string;
    action?: AuditAction;
    entityType?: string;
    entityId?: string;
    startDate?: Date;
    endDate?: Date;
    limit?: number;
  }): Promise<AuditLog[]> {
    let query: admin.firestore.Query | admin.firestore.CollectionReference = this.firebaseService.collection(this.collection);

    if (filters.userId) {
      query = query.where('userId', '==', filters.userId);
    }
    if (filters.action) {
      query = query.where('action', '==', filters.action);
    }
    if (filters.entityType) {
      query = query.where('entityType', '==', filters.entityType);
    }
    if (filters.entityId) {
      query = query.where('entityId', '==', filters.entityId);
    }
    if (filters.startDate) {
      query = query.where('timestamp', '>=', filters.startDate);
    }
    if (filters.endDate) {
      query = query.where('timestamp', '<=', filters.endDate);
    }

    query = query.orderBy('timestamp', 'desc');
    
    if (filters.limit) {
      query = query.limit(filters.limit);
    }

    const snapshot = await query.get();
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data() as Omit<AuditLog, 'id'>,
    }));
  }
}

