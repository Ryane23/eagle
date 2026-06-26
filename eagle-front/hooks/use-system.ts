import { useSystemStore } from "@/stores/system-store";

// Selectors for optimized re-renders
const selectSettings = (state: ReturnType<typeof useSystemStore.getState>) => state.settings;
const selectHealth = (state: ReturnType<typeof useSystemStore.getState>) => state.health;
const selectMaintenanceStatus = (state: ReturnType<typeof useSystemStore.getState>) => state.maintenanceStatus;
const selectIsLoading = (state: ReturnType<typeof useSystemStore.getState>) => state.isLoading;
const selectError = (state: ReturnType<typeof useSystemStore.getState>) => state.error;
const selectLastUpdated = (state: ReturnType<typeof useSystemStore.getState>) => state.lastUpdated;

/**
 * Hook for system settings management
 */
export function useSystemSettings() {
  const settings = useSystemStore(selectSettings);
  const isLoading = useSystemStore(selectIsLoading);
  const error = useSystemStore(selectError);
  const lastUpdated = useSystemStore(selectLastUpdated);

  const fetchSettings = useSystemStore((state) => state.fetchSettings);
  const updateSettings = useSystemStore((state) => state.updateSettings);
  const clearError = useSystemStore((state) => state.clearError);

  return {
    settings,
    isLoading,
    error,
    lastUpdated,
    fetchSettings,
    updateSettings,
    clearError,
  };
}

/**
 * Hook for system health status
 */
export function useSystemHealthStatus() {
  const health = useSystemStore(selectHealth);
  const isLoading = useSystemStore(selectIsLoading);
  const error = useSystemStore(selectError);

  const fetchHealth = useSystemStore((state) => state.fetchHealth);

  return {
    health,
    isLoading,
    error,
    fetchHealth,
  };
}

/**
 * Hook for maintenance mode management
 */
export function useMaintenanceMode() {
  const maintenanceStatus = useSystemStore(selectMaintenanceStatus);
  const isLoading = useSystemStore(selectIsLoading);
  const error = useSystemStore(selectError);

  const fetchMaintenanceStatus = useSystemStore((state) => state.fetchMaintenanceStatus);
  const toggleMaintenance = useSystemStore((state) => state.toggleMaintenance);

  return {
    maintenanceStatus,
    isMaintenanceMode: maintenanceStatus?.isMaintenanceMode ?? false,
    isLoading,
    error,
    fetchMaintenanceStatus,
    toggleMaintenance,
  };
}

/**
 * Hook to refresh all system data
 */
export function useRefreshSystem() {
  const refreshAll = useSystemStore((state) => state.refreshAll);
  const isLoading = useSystemStore(selectIsLoading);
  const error = useSystemStore(selectError);
  const clearError = useSystemStore((state) => state.clearError);

  return {
    refresh: refreshAll,
    isLoading,
    error,
    clearError,
  };
}

