import { useMemo } from "react";
import { useUrgenciesStore } from "@/stores/urgencies-store";

// Selectors for optimized re-renders
const selectUrgencies = (state: ReturnType<typeof useUrgenciesStore.getState>) =>
  state.urgencies;
const selectPendingUrgencies = (state: ReturnType<typeof useUrgenciesStore.getState>) =>
  state.pendingUrgencies;
const selectCurrentUrgency = (state: ReturnType<typeof useUrgenciesStore.getState>) =>
  state.currentUrgency;
const selectIsLoading = (state: ReturnType<typeof useUrgenciesStore.getState>) =>
  state.isLoading;
const selectError = (state: ReturnType<typeof useUrgenciesStore.getState>) =>
  state.error;

/**
 * Hook for accessing urgency data with optimized selectors
 */
export function useUrgencies() {
  const urgencies = useUrgenciesStore(selectUrgencies);
  const isLoading = useUrgenciesStore(selectIsLoading);
  const error = useUrgenciesStore(selectError);

  const fetchUrgencies = useUrgenciesStore((state) => state.fetchUrgencies);
  const createUrgency = useUrgenciesStore((state) => state.createUrgency);
  const clearError = useUrgenciesStore((state) => state.clearError);

  return {
    urgencies,
    isLoading,
    error,
    fetchUrgencies,
    createUrgency,
    clearError,
  };
}

/**
 * Hook for pending validation urgencies (Primary Secretary)
 */
export function usePendingValidation() {
  const pendingUrgencies = useUrgenciesStore(selectPendingUrgencies);
  const isLoading = useUrgenciesStore(selectIsLoading);

  const fetchPendingUrgencies = useUrgenciesStore(
    (state) => state.fetchPendingUrgencies
  );
  const validateUrgency = useUrgenciesStore((state) => state.validateUrgency);
  const rejectUrgency = useUrgenciesStore((state) => state.rejectUrgency);

  return {
    pendingUrgencies,
    isLoading,
    count: pendingUrgencies.length,
    fetchPendingUrgencies,
    validateUrgency,
    rejectUrgency,
  };
}

/**
 * Hook for current urgency management
 */
export function useCurrentUrgency() {
  const urgency = useUrgenciesStore(selectCurrentUrgency);
  const isLoading = useUrgenciesStore(selectIsLoading);

  const fetchUrgencyById = useUrgenciesStore((state) => state.fetchUrgencyById);
  const setCurrentUrgency = useUrgenciesStore((state) => state.setCurrentUrgency);
  const validateUrgency = useUrgenciesStore((state) => state.validateUrgency);
  const assignDoctor = useUrgenciesStore((state) => state.assignDoctor);
  const rejectUrgency = useUrgenciesStore((state) => state.rejectUrgency);
  const startUrgency = useUrgenciesStore((state) => state.startUrgency);
  const completeUrgency = useUrgenciesStore((state) => state.completeUrgency);

  return {
    urgency,
    isLoading,
    fetchUrgencyById,
    setCurrentUrgency,
    validateUrgency,
    assignDoctor,
    rejectUrgency,
    startUrgency,
    completeUrgency,
  };
}

/**
 * Hook for urgency statistics
 */
export function useUrgencyStats() {
  const urgencies = useUrgenciesStore(selectUrgencies);
  const pendingUrgencies = useUrgenciesStore(selectPendingUrgencies);

  const stats = useMemo(() => {
    const byLevel = urgencies.reduce(
      (acc, u) => {
        const level = u.urgencyLevel;
        acc[level] = (acc[level] || 0) + 1;
        return acc;
      },
      {} as Record<number, number>
    );

    const byStatus = urgencies.reduce(
      (acc, u) => {
        acc[u.status] = (acc[u.status] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    const critical = urgencies.filter((u) => u.urgencyLevel >= 4).length;

    return {
      total: urgencies.length,
      pendingCount: pendingUrgencies.length,
      critical,
      byLevel,
      byStatus,
    };
  }, [urgencies, pendingUrgencies]);

  return stats;
}

/**
 * Hook for filtering urgencies by level
 */
export function useFilteredUrgencies(
  levelFilter?: number[],
  statusFilter?: string[]
) {
  const urgencies = useUrgenciesStore(selectUrgencies);

  const filteredUrgencies = useMemo(() => {
    return urgencies.filter((urgency) => {
      // Level filter
      if (levelFilter && levelFilter.length > 0) {
        if (!levelFilter.includes(urgency.urgencyLevel)) {
          return false;
        }
      }

      // Status filter
      if (statusFilter && statusFilter.length > 0) {
        if (!statusFilter.includes(urgency.status)) {
          return false;
        }
      }

      return true;
    });
  }, [urgencies, levelFilter, statusFilter]);

  return filteredUrgencies;
}
