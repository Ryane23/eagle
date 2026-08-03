import { useMemo } from "react";
import { useQueueStore } from "@/stores/queue-store";

// Selectors for optimized re-renders
const selectQueue = (state: ReturnType<typeof useQueueStore.getState>) =>
  state.queue;
const selectHospitalQueue = (state: ReturnType<typeof useQueueStore.getState>) =>
  state.hospitalQueue;
const selectStats = (state: ReturnType<typeof useQueueStore.getState>) =>
  state.stats;
const selectIsLoading = (state: ReturnType<typeof useQueueStore.getState>) =>
  state.isLoading;
const selectError = (state: ReturnType<typeof useQueueStore.getState>) =>
  state.error;

/**
 * Hook for global queue management
 */
export function useQueue() {
  const queue = useQueueStore(selectQueue);
  const stats = useQueueStore(selectStats);
  const isLoading = useQueueStore(selectIsLoading);
  const error = useQueueStore(selectError);

  const fetchGlobalQueue = useQueueStore((state) => state.fetchGlobalQueue);
  const fetchQueueStats = useQueueStore((state) => state.fetchQueueStats);
  const getQueuePosition = useQueueStore((state) => state.getQueuePosition);
  const clearError = useQueueStore((state) => state.clearError);

  return {
    queue,
    stats,
    isLoading,
    error,
    fetchGlobalQueue,
    fetchQueueStats,
    getQueuePosition,
    clearError,
  };
}

/**
 * Hook for hospital-specific queue
 */
export function useHospitalQueue() {
  const hospitalQueue = useQueueStore(selectHospitalQueue);
  const isLoading = useQueueStore(selectIsLoading);
  const error = useQueueStore(selectError);

  const fetchHospitalQueue = useQueueStore((state) => state.fetchHospitalQueue);
  const updateQueueEntry = useQueueStore((state) => state.updateQueueEntry);
  const removeFromQueue = useQueueStore((state) => state.removeFromQueue);

  return {
    queue: hospitalQueue,
    isLoading,
    error,
    fetchHospitalQueue,
    updateQueueEntry,
    removeFromQueue,
  };
}

/**
 * Hook for queue statistics
 */
export function useQueueStats() {
  const queue = useQueueStore(selectQueue);
  const hospitalQueue = useQueueStore(selectHospitalQueue);
  const stats = useQueueStore(selectStats);

  const derivedStats = useMemo(() => {
    // Use hospital queue for local stats, global queue for overview
    const activeQueue = hospitalQueue.length > 0 ? hospitalQueue : queue;
    
    const waiting = activeQueue.filter((e) => e.status === "waiting");
    const inProgress = activeQueue.filter((e) => e.status === "in_progress");
    const urgent = waiting.filter((e) => e.priority >= 4);

    const avgWait =
      waiting.length > 0
        ? Math.round(
            waiting.reduce((sum, e) => sum + e.estimatedWaitTime, 0) /
              waiting.length
          )
        : 0;

    return {
      ...stats,
      waitingCount: waiting.length,
      inProgressCount: inProgress.length,
      urgentCount: urgent.length,
      averageEstimatedWait: avgWait,
    };
  }, [queue, hospitalQueue, stats]);

  return derivedStats;
}

/**
 * Hook for sorted/filtered queue
 */
export function useSortedQueue(
  sortBy: "position" | "priority" | "waitTime" = "position",
  useHospital: boolean = true
) {
  const queue = useQueueStore(selectQueue);
  const hospitalQueue = useQueueStore(selectHospitalQueue);

  const sortedQueue = useMemo(() => {
    const sourceQueue = useHospital ? hospitalQueue : queue;
    const waiting = sourceQueue.filter((e) => e.status === "waiting");

    switch (sortBy) {
      case "priority":
        return [...waiting].sort((a, b) => b.priority - a.priority);
      case "waitTime":
        return [...waiting].sort((a, b) => b.estimatedWaitTime - a.estimatedWaitTime);
      case "position":
      default:
        return [...waiting].sort((a, b) => a.position - b.position);
    }
  }, [queue, hospitalQueue, sortBy, useHospital]);

  return sortedQueue;
}
