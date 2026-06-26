import { useMemo } from "react";
import { useConsultationsStore } from "@/stores/consultations-store";

// Selectors for optimized re-renders
const selectConsultations = (state: ReturnType<typeof useConsultationsStore.getState>) =>
  state.consultations;
const selectSchedule = (state: ReturnType<typeof useConsultationsStore.getState>) =>
  state.schedule;
const selectCurrentConsultation = (state: ReturnType<typeof useConsultationsStore.getState>) =>
  state.currentConsultation;
const selectIsLoading = (state: ReturnType<typeof useConsultationsStore.getState>) =>
  state.isLoading;
const selectError = (state: ReturnType<typeof useConsultationsStore.getState>) =>
  state.error;

/**
 * Hook for accessing consultation data with optimized selectors
 */
export function useConsultations() {
  const consultations = useConsultationsStore(selectConsultations);
  const schedule = useConsultationsStore(selectSchedule);
  const isLoading = useConsultationsStore(selectIsLoading);
  const error = useConsultationsStore(selectError);

  const fetchMyConsultations = useConsultationsStore((state) => state.fetchMyConsultations);
  const fetchMySchedule = useConsultationsStore((state) => state.fetchMySchedule);
  const fetchConsultationsByPatient = useConsultationsStore((state) => state.fetchConsultationsByPatient);
  const clearError = useConsultationsStore((state) => state.clearError);

  return {
    consultations,
    schedule,
    isLoading,
    error,
    fetchMyConsultations,
    fetchMySchedule,
    fetchConsultationsByPatient,
    clearError,
  };
}

/**
 * Hook for current consultation management
 */
export function useCurrentConsultation() {
  const consultation = useConsultationsStore(selectCurrentConsultation);
  const isLoading = useConsultationsStore(selectIsLoading);

  const fetchConsultationById = useConsultationsStore((state) => state.fetchConsultationById);
  const setCurrentConsultation = useConsultationsStore((state) => state.setCurrentConsultation);
  const startConsultation = useConsultationsStore((state) => state.startConsultation);
  const completeConsultation = useConsultationsStore((state) => state.completeConsultation);
  const cancelConsultation = useConsultationsStore((state) => state.cancelConsultation);
  const addNote = useConsultationsStore((state) => state.addNote);

  return {
    consultation,
    isLoading,
    fetchConsultationById,
    setCurrentConsultation,
    startConsultation,
    completeConsultation,
    cancelConsultation,
    addNote,
  };
}

/**
 * Hook for consultation statistics
 */
export function useConsultationStats() {
  const consultations = useConsultationsStore(selectConsultations);
  const schedule = useConsultationsStore(selectSchedule);

  const stats = useMemo(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const todayConsultations = consultations.filter((c) => {
      const consultDate = new Date(c.createdAt);
      return consultDate >= today;
    });

    const completed = todayConsultations.filter((c) => c.status === "completed");
    const inProgress = todayConsultations.filter((c) => c.status === "in_progress");
    const scheduled = schedule.filter((c) => c.status === "scheduled");

    return {
      total: consultations.length,
      today: todayConsultations.length,
      completedToday: completed.length,
      inProgressToday: inProgress.length,
      scheduledToday: scheduled.length,
      upcomingSchedule: schedule.length,
    };
  }, [consultations, schedule]);

  return stats;
}

/**
 * Hook for filtering consultations
 */
export function useFilteredConsultations(
  statusFilter: string = "all",
  dateFilter?: { start: Date; end: Date }
) {
  const consultations = useConsultationsStore(selectConsultations);

  const filteredConsultations = useMemo(() => {
    return consultations.filter((consultation) => {
      // Status filter
      if (statusFilter !== "all" && consultation.status !== statusFilter) {
        return false;
      }

      // Date filter
      if (dateFilter) {
        const consultDate = new Date(consultation.createdAt);
        if (consultDate < dateFilter.start || consultDate > dateFilter.end) {
          return false;
        }
      }

      return true;
    });
  }, [consultations, statusFilter, dateFilter]);

  return filteredConsultations;
}
