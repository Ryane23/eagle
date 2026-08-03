import { useQuery } from "@tanstack/react-query";
import {
    getActivities,
    getMyActivities,
    getActivityStats,
    getActivityById,
    getActivitiesByUser,
    getActivitiesByDateRange,
    type Activity,
    type ActivityStats,
} from "@/actions/activities";

// ============ Query Keys ============

export const activityKeys = {
    all: ["activities"] as const,
    lists: () => [...activityKeys.all, "list"] as const,
    list: (limit?: number) => [...activityKeys.lists(), { limit }] as const,
    my: (limit?: number) => [...activityKeys.all, "my", { limit }] as const,
    stats: (userId?: string) => [...activityKeys.all, "stats", userId] as const,
    details: () => [...activityKeys.all, "detail"] as const,
    detail: (id: string) => [...activityKeys.details(), id] as const,
    byUser: (userId: string, limit?: number) => [...activityKeys.all, "user", userId, { limit }] as const,
    dateRange: (start: string, end: string) => [...activityKeys.all, "range", start, end] as const,
};

// ============ Queries ============

export function useActivitiesQuery(limit?: number) {
    return useQuery<Activity[], Error>({
        queryKey: activityKeys.list(limit),
        queryFn: () => getActivities(limit),
        staleTime: 30 * 1000,
    });
}

export function useMyActivitiesQuery(limit?: number) {
    return useQuery<Activity[], Error>({
        queryKey: activityKeys.my(limit),
        queryFn: () => getMyActivities(limit),
        staleTime: 30 * 1000,
    });
}

export function useActivityStatsQuery(userId?: string) {
    return useQuery<ActivityStats, Error>({
        queryKey: activityKeys.stats(userId),
        queryFn: () => getActivityStats(userId),
        staleTime: 60 * 1000,
    });
}

export function useActivityQuery(id: string) {
    return useQuery<Activity, Error>({
        queryKey: activityKeys.detail(id),
        queryFn: () => getActivityById(id),
        enabled: !!id,
    });
}

export function useUserActivitiesQuery(userId: string, limit?: number) {
    return useQuery<Activity[], Error>({
        queryKey: activityKeys.byUser(userId, limit),
        queryFn: () => getActivitiesByUser(userId, limit),
        enabled: !!userId,
        staleTime: 30 * 1000,
    });
}

export function useDateRangeActivitiesQuery(startDate: string, endDate: string) {
    return useQuery<Activity[], Error>({
        queryKey: activityKeys.dateRange(startDate, endDate),
        queryFn: () => getActivitiesByDateRange(startDate, endDate),
        enabled: !!startDate && !!endDate,
        staleTime: 60 * 1000,
    });
}
