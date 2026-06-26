import { useMemo } from "react";
import { useAnalyticsStore } from "@/stores/analytics-store";

// Selectors for optimized re-renders
const selectNetworkOverview = (state: ReturnType<typeof useAnalyticsStore.getState>) => 
  state.networkOverview;
const selectSystemHealth = (state: ReturnType<typeof useAnalyticsStore.getState>) => 
  state.systemHealth;
const selectBranchStatistics = (state: ReturnType<typeof useAnalyticsStore.getState>) => 
  state.branchStatistics;
const selectIsLoading = (state: ReturnType<typeof useAnalyticsStore.getState>) => 
  state.isLoading;
const selectError = (state: ReturnType<typeof useAnalyticsStore.getState>) => 
  state.error;
const selectLastUpdated = (state: ReturnType<typeof useAnalyticsStore.getState>) => 
  state.lastUpdated;

/**
 * Hook for network analytics overview
 */
export function useNetworkAnalytics() {
  const networkOverview = useAnalyticsStore(selectNetworkOverview);
  const isLoading = useAnalyticsStore(selectIsLoading);
  const error = useAnalyticsStore(selectError);
  const lastUpdated = useAnalyticsStore(selectLastUpdated);

  const fetchNetworkOverview = useAnalyticsStore((state) => state.fetchNetworkOverview);
  const clearError = useAnalyticsStore((state) => state.clearError);

  return {
    data: networkOverview,
    isLoading,
    error,
    lastUpdated,
    refresh: fetchNetworkOverview,
    clearError,
  };
}

/**
 * Hook for system health status
 */
export function useSystemHealth() {
  const systemHealth = useAnalyticsStore(selectSystemHealth);
  const isLoading = useAnalyticsStore(selectIsLoading);
  const error = useAnalyticsStore(selectError);

  const fetchSystemHealth = useAnalyticsStore((state) => state.fetchSystemHealth);

  const statusColor = useMemo(() => {
    if (!systemHealth) return "text-gray-500";
    switch (systemHealth.status) {
      case "healthy":
        return "text-green-500";
      case "degraded":
        return "text-yellow-500";
      case "unhealthy":
        return "text-red-500";
      default:
        return "text-gray-500";
    }
  }, [systemHealth]);

  return {
    health: systemHealth,
    isLoading,
    error,
    statusColor,
    refresh: fetchSystemHealth,
  };
}

/**
 * Hook for branch-specific statistics
 */
export function useBranchStatistics(hospitalId?: string) {
  const branchStatistics = useAnalyticsStore(selectBranchStatistics);
  const isLoading = useAnalyticsStore(selectIsLoading);
  const error = useAnalyticsStore(selectError);

  const fetchBranchStatistics = useAnalyticsStore((state) => state.fetchBranchStatistics);

  const stats = useMemo(() => {
    if (!hospitalId) return null;
    return branchStatistics[hospitalId] || null;
  }, [branchStatistics, hospitalId]);

  return {
    stats,
    isLoading,
    error,
    fetch: (id: string) => fetchBranchStatistics(id),
  };
}

/**
 * Hook to refresh all analytics data
 */
export function useRefreshAnalytics() {
  const refreshAll = useAnalyticsStore((state) => state.refreshAll);
  const isLoading = useAnalyticsStore(selectIsLoading);
  const error = useAnalyticsStore(selectError);
  const clearError = useAnalyticsStore((state) => state.clearError);

  return {
    refresh: refreshAll,
    isLoading,
    error,
    clearError,
  };
}

/**
 * Hook for admin dashboard stats summary
 */
export function useAdminDashboardStats() {
  const networkOverview = useAnalyticsStore(selectNetworkOverview);
  const systemHealth = useAnalyticsStore(selectSystemHealth);

  const stats = useMemo(() => {
    if (!networkOverview) {
      return {
        activeUsers: 0,
        openIncidents: 0,
        systemHealthPercent: 0,
        activeServers: "0/0",
      };
    }

    // Calculate active users from center stats
    const activeUsers = networkOverview.centerStats?.reduce(
      (acc, center) => acc + center.activeUsers,
      0
    ) || 0;

    // System health as percentage
    let systemHealthPercent = 0;
    if (systemHealth) {
      systemHealthPercent = systemHealth.status === "healthy" ? 100 : 
                           systemHealth.status === "degraded" ? 75 : 50;
    }

    // Active servers (derived from center stats)
    const totalCenters = networkOverview.centerStats?.length || 0;
    const activeCenters = networkOverview.centerStats?.filter(
      (c) => c.activeUsers > 0
    ).length || 0;

    return {
      activeUsers,
      openIncidents: networkOverview.urgenciesToday || 0,
      systemHealthPercent,
      activeServers: `${activeCenters}/${totalCenters}`,
    };
  }, [networkOverview, systemHealth]);

  return stats;
}


