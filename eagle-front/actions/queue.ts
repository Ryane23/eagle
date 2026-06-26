import apiClient, { getErrorMessage } from "@/lib/api-client";
import type { QueueEntry, QueueStats, AddToQueueDto, UpdateQueueStatusDto } from "@/types/api";

/**
 * Add patient to queue
 */
export async function addToQueue(data: AddToQueueDto): Promise<QueueEntry> {
  try {
    const response = await apiClient.post<QueueEntry>("/queue", data);
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

/**
 * Get queue - Retrieves the queue with optional status filter
 */
export async function getQueue(status?: string): Promise<QueueEntry[]> {
  try {
    const response = await apiClient.get<QueueEntry[]>("/queue", {
      params: { status },
    });
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

/**
 * Get my hospital queue - Retrieves queue for current user's hospital
 */
export async function getMyHospitalQueue(status?: string): Promise<QueueEntry[]> {
  try {
    const response = await apiClient.get<QueueEntry[]>("/queue/my-hospital", {
      params: { status },
    });
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

/**
 * Get queue statistics
 */
export async function getQueueStats(): Promise<QueueStats> {
  try {
    const response = await apiClient.get<QueueStats>("/queue/stats");
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

/**
 * Get queue entry by ID
 */
export async function getQueueEntryById(id: string): Promise<QueueEntry> {
  try {
    const response = await apiClient.get<QueueEntry>(`/queue/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

/**
 * Update queue entry status
 */
export async function updateQueueStatus(
  id: string,
  data: UpdateQueueStatusDto
): Promise<QueueEntry> {
  try {
    const response = await apiClient.patch<QueueEntry>(`/queue/${id}/status`, data);
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

/**
 * Remove from queue
 */
export async function removeFromQueue(id: string): Promise<QueueEntry> {
  try {
    const response = await apiClient.patch<QueueEntry>(`/queue/${id}/remove`);
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

/**
 * Get queue entry by consultation ID
 */
export async function getQueueByConsultationId(consultationId: string): Promise<QueueEntry> {
  try {
    const response = await apiClient.get<QueueEntry>(`/queue/consultation/${consultationId}`);
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}
