import apiClient, { getErrorMessage } from "@/lib/api-client";
import type { SystemSettings, SystemHealth, MaintenanceStatus, SystemSettingsHistory, UpdateSystemSettingsDto } from "@/types/api";

/**
 * Get system settings
 */
export async function getSystemSettings(): Promise<SystemSettings> {
  try {
    const response = await apiClient.get<SystemSettings>("/system/settings");
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

/**
 * Update system settings (Admin only)
 */
export async function updateSystemSettings(data: UpdateSystemSettingsDto): Promise<SystemSettings> {
  try {
    const response = await apiClient.patch<SystemSettings>("/system/settings", data);
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

export async function getSystemSettingsHistory(): Promise<SystemSettingsHistory[]> {
  try {
    const response = await apiClient.get<SystemSettingsHistory[]>("/system/settings/history");
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

/**
 * Toggle maintenance mode (Admin only)
 */
export async function toggleMaintenanceMode(): Promise<MaintenanceStatus> {
  try {
    const response = await apiClient.patch<MaintenanceStatus>("/system/maintenance");
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

/**
 * Check maintenance mode status
 */
export async function checkMaintenanceMode(): Promise<MaintenanceStatus> {
  try {
    const response = await apiClient.get<MaintenanceStatus>("/system/maintenance");
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

/**
 * Get system health status
 */
export async function getSystemHealth(): Promise<SystemHealth> {
  try {
    const response = await apiClient.get<SystemHealth>("/system/health");
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}
