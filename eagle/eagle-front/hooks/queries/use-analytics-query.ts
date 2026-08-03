"use client";

import { useQuery } from "@tanstack/react-query";
import type { NetworkAnalytics, BranchStatistics, SystemHealth } from "@/types/api";
import { getNetworkOverview, getBranchStatistics } from "@/actions/analytics";
import { getSystemHealth } from "@/actions/system";

// Query Keys
export const analyticsKeys = {
    all: ["analytics"] as const,
    network: () => [...analyticsKeys.all, "network"] as const,
    branch: (hospitalId: string) => [...analyticsKeys.all, "branch", hospitalId] as const,
    health: () => [...analyticsKeys.all, "health"] as const,
};

// --- Queries ---

export function useNetworkAnalyticsQuery() {
    return useQuery<NetworkAnalytics, Error>({
        queryKey: analyticsKeys.network(),
        queryFn: getNetworkOverview,
        staleTime: 60 * 1000, // 1 minute
        gcTime: 5 * 60 * 1000, // 5 minutes
        refetchInterval: 60 * 1000, // Auto-refresh every minute
    });
}

export function useBranchStatisticsQuery(hospitalId: string) {
    return useQuery<BranchStatistics, Error>({
        queryKey: analyticsKeys.branch(hospitalId),
        queryFn: () => getBranchStatistics(hospitalId),
        enabled: !!hospitalId,
        staleTime: 60 * 1000,
        gcTime: 5 * 60 * 1000,
        refetchInterval: 60 * 1000,
    });
}

export function useSystemHealthQuery() {
    return useQuery<SystemHealth, Error>({
        queryKey: analyticsKeys.health(),
        queryFn: getSystemHealth,
        staleTime: 30 * 1000, // 30 seconds
        gcTime: 2 * 60 * 1000, // 2 minutes
        refetchInterval: 30 * 1000, // Auto-refresh every 30 seconds
    });
}

// --- Stats derived from query ---

export function useNetworkStats() {
    const { data: analytics } = useNetworkAnalyticsQuery();
    const { data: health } = useSystemHealthQuery();

    return {
        totalPatients: analytics?.totalPatients ?? 0,
        totalConsultations: analytics?.totalConsultations ?? 0,
        totalUrgencies: analytics?.totalUrgencies ?? 0,
        averageWaitTime: analytics?.averageWaitTime ?? 0,
        consultationsToday: analytics?.consultationsToday ?? 0,
        urgenciesToday: analytics?.urgenciesToday ?? 0,
        centerStats: analytics?.centerStats ?? [],
        systemStatus: health?.status ?? "healthy",
        uptime: health?.uptime ?? 0,
    };
}
