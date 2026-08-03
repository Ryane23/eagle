import { Injectable } from '@nestjs/common';
import { FirebaseService } from '../../config/firebase';
import { UpdateSystemSettingsDto } from './dto/update-system-settings.dto';
import {
  SystemHealth,
  SystemSettings,
  SystemSettingsCollection,
  SystemSettingsDocument,
  SystemSettingsHistory,
  SystemSettingsHistoryCollection,
} from './entities/system-settings.entity';

const DEFAULT_SETTINGS: SystemSettings = {
  maintenanceMode: false,
  maxUrgencyLevel: 5,
  defaultConsultationDuration: 30,
  autoDistribution: true,
  loadBalancing: true,
  assignmentStrategy: 'availability',
  urgencyLevels: [
    { level: 1, maxWaitMinutes: 120, immediateNotification: false, overdueAction: 'alert' },
    { level: 2, maxWaitMinutes: 90, immediateNotification: false, overdueAction: 'alert' },
    { level: 3, maxWaitMinutes: 45, immediateNotification: true, overdueAction: 'alert' },
    { level: 4, maxWaitMinutes: 20, immediateNotification: true, overdueAction: 'escalate' },
    { level: 5, maxWaitMinutes: 5, immediateNotification: true, overdueAction: 'reassign' },
  ],
  minBandwidthMbps: 5,
  consultationStartDelayMinutes: 10,
  autoRecordConsultations: false,
  allowedFileTypes: ['application/pdf', 'image/jpeg', 'image/png'],
  maxFileSize: 10 * 1024 * 1024,
};

@Injectable()
export class SystemService {
  constructor(private readonly firebaseService: FirebaseService) {}

  async getSettings(): Promise<SystemSettings> {
    const snapshot = await this.settingsDocument.get();
    if (!snapshot.exists) {
      return { ...DEFAULT_SETTINGS };
    }

    return {
      ...DEFAULT_SETTINGS,
      ...(snapshot.data() as Partial<SystemSettings>),
    };
  }

  async updateSettings(
    updateDto: UpdateSystemSettingsDto,
    updatedBy?: string,
  ): Promise<SystemSettings> {
    const updates = Object.fromEntries(
      Object.entries(updateDto).filter(([, value]) => value !== undefined),
    ) as UpdateSystemSettingsDto;
    const settings = {
      ...(await this.getSettings()),
      ...updates,
      updatedAt: new Date(),
    };
    await this.settingsDocument.set(settings, { merge: true });
    if (updatedBy) {
      await this.firebaseService
        .collection(SystemSettingsHistoryCollection)
        .add({
          settings,
          changes: Object.keys(updates),
          updatedBy,
          createdAt: new Date(),
        });
    }
    return settings;
  }

  async getSettingsHistory(limit = 20): Promise<SystemSettingsHistory[]> {
    const snapshot = await this.firebaseService
      .collection(SystemSettingsHistoryCollection)
      .orderBy('createdAt', 'desc')
      .limit(Math.min(Math.max(limit, 1), 100))
      .get();
    return snapshot.docs.map((document) => ({
      id: document.id,
      ...document.data(),
    })) as SystemSettingsHistory[];
  }

  async getMaintenanceStatus(): Promise<{
    isMaintenanceMode: boolean;
    message?: string;
  }> {
    const settings = await this.getSettings();
    return {
      isMaintenanceMode: settings.maintenanceMode,
      ...(settings.maintenanceMode
        ? { message: 'EAGLE is currently in maintenance mode' }
        : {}),
    };
  }

  async toggleMaintenance(): Promise<{
    isMaintenanceMode: boolean;
    message?: string;
  }> {
    const settings = await this.getSettings();
    const isMaintenanceMode = !settings.maintenanceMode;
    await this.updateSettings({ maintenanceMode: isMaintenanceMode });
    return {
      isMaintenanceMode,
      ...(isMaintenanceMode
        ? { message: 'EAGLE is currently in maintenance mode' }
        : {}),
    };
  }

  async getHealth(): Promise<SystemHealth> {
    try {
      await this.firebaseService
        .collection(SystemSettingsCollection)
        .limit(1)
        .get();
      return {
        status: 'healthy',
        database: 'healthy',
        timestamp: new Date(),
        uptime: Math.floor(process.uptime()),
      };
    } catch {
      return {
        status: 'degraded',
        database: 'unhealthy',
        timestamp: new Date(),
        uptime: Math.floor(process.uptime()),
      };
    }
  }

  private get settingsDocument() {
    return this.firebaseService
      .collection(SystemSettingsCollection)
      .doc(SystemSettingsDocument);
  }
}
