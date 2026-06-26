import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { SyncOperation } from "@/types/api";
import {
    syncPending,
    getPendingSyncOperations,
    resolveConflict,
} from "@/actions/sync";

// Query Keys
export const syncKeys = {
    all: ["sync"] as const,
    pending: () => [...syncKeys.all, "pending"] as const,
};

// ============================================================================
// Queries
// ============================================================================

/**
 * Get pending sync operations
 */
export function usePendingSyncQuery() {
    return useQuery<SyncOperation[], Error>({
        queryKey: syncKeys.pending(),
        queryFn: getPendingSyncOperations,
        staleTime: 30 * 1000, // 30 seconds - sync status can change frequently
        gcTime: 5 * 60 * 1000,
    });
}

/**
 * Get sync stats
 */
export function useSyncStats() {
    const { data: operations = [] } = usePendingSyncQuery();

    return {
        total: operations.length,
        pending: operations.filter((op) => op.status === "pending").length,
        failed: operations.filter((op) => op.status === "failed").length,
        conflict: operations.filter((op) => op.status === "conflict").length,
    };
}

// ============================================================================
// Mutations
// ============================================================================

/**
 * Sync pending operations with the server
 */
export function useSyncPending() {
    const queryClient = useQueryClient();

    return useMutation<{ synced: number; failed: number }, Error, void>({
        mutationFn: syncPending,
        onSuccess: (result) => {
            queryClient.invalidateQueries({ queryKey: syncKeys.pending() });
            if (result.synced > 0) {
                toast.success(`${result.synced} opération(s) synchronisée(s)`);
            }
            if (result.failed > 0) {
                toast.error(`${result.failed} opération(s) échouée(s)`);
            }
        },
        onError: (error) => {
            toast.error(error.message || "Erreur lors de la synchronisation");
        },
    });
}

/**
 * Resolve a sync conflict
 */
export function useResolveConflict() {
    const queryClient = useQueryClient();

    return useMutation<
        SyncOperation,
        Error,
        { operationId: string; resolution: "server" | "client" | "merge" }
    >({
        mutationFn: ({ operationId, resolution }) =>
            resolveConflict(operationId, resolution),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: syncKeys.pending() });
            toast.success("Conflit résolu");
        },
        onError: (error) => {
            toast.error(error.message || "Erreur lors de la résolution du conflit");
        },
    });
}

