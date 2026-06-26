import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { QueueEntry, QueueStats, AddToQueueDto, UpdateQueueStatusDto, QueueStatus } from "@/types/api";
import {
    getQueue,
    getMyHospitalQueue,
    getQueueStats,
    getQueueEntryById,
    addToQueue,
    updateQueueStatus,
    removeFromQueue,
} from "@/actions/queue";

// Query Keys
export const queueKeys = {
    all: ["queue"] as const,
    lists: () => [...queueKeys.all, "list"] as const,
    list: (filters: string) => [...queueKeys.lists(), { filters }] as const,
    details: () => [...queueKeys.all, "detail"] as const,
    detail: (id: string) => [...queueKeys.details(), id] as const,
    stats: () => [...queueKeys.all, "stats"] as const,
    hospital: (status?: string) => [...queueKeys.all, "hospital", status] as const,
};

// --- Queries ---

export function useGlobalQueueQuery(status?: QueueStatus) {
    return useQuery<QueueEntry[], Error>({
        queryKey: queueKeys.list(status || "all"),
        queryFn: () => getQueue(status),
        staleTime: 30 * 1000, // 30 seconds - queue changes frequently
        gcTime: 2 * 60 * 1000, // 2 minutes
        refetchInterval: 30 * 1000, // Auto-refresh every 30 seconds
    });
}

export function useHospitalQueueQuery(status?: QueueStatus) {
    return useQuery<QueueEntry[], Error>({
        queryKey: queueKeys.hospital(status),
        queryFn: () => getMyHospitalQueue(status),
        staleTime: 30 * 1000,
        gcTime: 2 * 60 * 1000,
        refetchInterval: 30 * 1000,
    });
}

export function useQueueEntryQuery(id: string) {
    return useQuery<QueueEntry, Error>({
        queryKey: queueKeys.detail(id),
        queryFn: () => getQueueEntryById(id),
        enabled: !!id,
        staleTime: 30 * 1000,
        gcTime: 2 * 60 * 1000,
    });
}

export function useQueueStatsQuery() {
    return useQuery<QueueStats, Error>({
        queryKey: queueKeys.stats(),
        queryFn: getQueueStats,
        staleTime: 30 * 1000,
        gcTime: 2 * 60 * 1000,
        refetchInterval: 30 * 1000,
    });
}

// --- Stats derived from query ---

export function useQueueStats() {
    const { data: stats } = useQueueStatsQuery();
    const { data: queue = [] } = useHospitalQueueQuery();

    return {
        totalWaiting: stats?.totalWaiting ?? queue.filter((e) => e.status === "waiting").length,
        averageWaitTime: stats?.averageWaitTime ?? 0,
        completedToday: stats?.completedToday ?? 0,
        inProgress: stats?.inProgress ?? queue.filter((e) => e.status === "in_progress").length,
    };
}

// --- Mutations ---

export function useAddToQueue() {
    const queryClient = useQueryClient();
    return useMutation<QueueEntry, Error, AddToQueueDto>({
        mutationFn: addToQueue,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queueKeys.lists() });
            queryClient.invalidateQueries({ queryKey: queueKeys.stats() });
            toast.success("Patient ajouté à la file d'attente!");
        },
        onError: (error) => {
            toast.error(error.message || "Erreur lors de l'ajout");
        },
    });
}

export function useUpdateQueueStatus() {
    const queryClient = useQueryClient();
    return useMutation<QueueEntry, Error, { id: string; data: UpdateQueueStatusDto }>({
        mutationFn: ({ id, data }) => updateQueueStatus(id, data),
        onSuccess: (_, { id }) => {
            queryClient.invalidateQueries({ queryKey: queueKeys.lists() });
            queryClient.invalidateQueries({ queryKey: queueKeys.detail(id) });
            queryClient.invalidateQueries({ queryKey: queueKeys.stats() });
            toast.success("Statut mis à jour!");
        },
        onError: (error) => {
            toast.error(error.message || "Erreur lors de la mise à jour");
        },
    });
}

export function useRemoveFromQueue() {
    const queryClient = useQueryClient();
    return useMutation<QueueEntry, Error, string>({
        mutationFn: removeFromQueue,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queueKeys.lists() });
            queryClient.invalidateQueries({ queryKey: queueKeys.stats() });
            toast.success("Patient retiré de la file!");
        },
        onError: (error) => {
            toast.error(error.message || "Erreur lors de la suppression");
        },
    });
}
