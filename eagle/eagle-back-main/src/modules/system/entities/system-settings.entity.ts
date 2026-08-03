export interface SystemSettings {
  maintenanceMode: boolean;
  maxUrgencyLevel: number;
  defaultConsultationDuration: number;
  autoDistribution: boolean;
  loadBalancing: boolean;
  assignmentStrategy: 'availability' | 'workload' | 'specialty' | 'manual';
  urgencyLevels: Array<{
    level: number;
    maxWaitMinutes: number;
    immediateNotification: boolean;
    overdueAction: 'alert' | 'escalate' | 'reassign';
  }>;
  minBandwidthMbps: number;
  consultationStartDelayMinutes: number;
  autoRecordConsultations: boolean;
  allowedFileTypes: string[];
  maxFileSize: number;
  updatedAt?: Date;
}

export interface SystemSettingsHistory {
  id: string;
  settings: SystemSettings;
  changes: string[];
  updatedBy: string;
  createdAt: Date;
}

export interface SystemHealth {
  status: 'healthy' | 'degraded' | 'unhealthy';
  database: 'healthy' | 'unhealthy';
  timestamp: Date;
  uptime: number;
}

export const SystemSettingsCollection = 'system_settings';
export const SystemSettingsDocument = 'default';
export const SystemSettingsHistoryCollection = 'system_settings_history';
