import apiClient, { getErrorMessage } from "@/lib/api-client";
import type { SyncOperation } from "@/types/api";

/**
 * Sync pending operations with the server
 */
export async function syncPending(): Promise<{ synced: number; failed: number }> {
  try {
    const response = await apiClient.post<{ synced: number; failed: number }>("/sync/sync");
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

/**
 * Get pending sync operations
 */
export async function getPendingSyncOperations(): Promise<SyncOperation[]> {
  try {
    const response = await apiClient.get<SyncOperation[]>("/sync/pending");
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

/**
 * Resolve a sync conflict
 */
export async function resolveConflict(
  operationId: string,
  resolution: "server" | "client" | "merge"
): Promise<SyncOperation> {
  try {
    const response = await apiClient.patch<SyncOperation>(`/sync/conflict/${operationId}`, {
      resolution,
    });
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

