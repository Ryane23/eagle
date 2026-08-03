import { useCallback, useMemo } from "react";
import { usePatientsStore } from "@/stores/patients-store";
import { useDebounce } from "./use-debounce";

// Selectors for optimized re-renders
const selectPatients = (state: ReturnType<typeof usePatientsStore.getState>) =>
  state.patients;
const selectCurrentPatient = (state: ReturnType<typeof usePatientsStore.getState>) =>
  state.currentPatient;
const selectSearchResults = (state: ReturnType<typeof usePatientsStore.getState>) =>
  state.searchResults;
const selectIsLoading = (state: ReturnType<typeof usePatientsStore.getState>) =>
  state.isLoading;
const selectError = (state: ReturnType<typeof usePatientsStore.getState>) =>
  state.error;

/**
 * Hook for accessing patient data with optimized selectors
 * Prevents unnecessary re-renders by only subscribing to needed state
 */
export function usePatients() {
  const patients = usePatientsStore(selectPatients);
  const isLoading = usePatientsStore(selectIsLoading);
  const error = usePatientsStore(selectError);

  const fetchPatients = usePatientsStore((state) => state.fetchPatients);
  const createPatient = usePatientsStore((state) => state.createPatient);
  const updatePatient = usePatientsStore((state) => state.updatePatient);
  const deactivatePatient = usePatientsStore((state) => state.deactivatePatient);
  const clearError = usePatientsStore((state) => state.clearError);

  return {
    patients,
    isLoading,
    error,
    fetchPatients,
    createPatient,
    updatePatient,
    deactivatePatient,
    clearError,
  };
}

/**
 * Hook for current patient selection
 */
export function useCurrentPatient() {
  const currentPatient = usePatientsStore(selectCurrentPatient);
  const setCurrentPatient = usePatientsStore((state) => state.setCurrentPatient);
  const fetchPatientById = usePatientsStore((state) => state.fetchPatientById);
  const updateVitals = usePatientsStore((state) => state.updateVitals);
  const updateEhr = usePatientsStore((state) => state.updateEhr);
  const isLoading = usePatientsStore(selectIsLoading);

  return {
    patient: currentPatient,
    isLoading,
    setCurrentPatient,
    fetchPatientById,
    updateVitals,
    updateEhr,
  };
}

/**
 * Hook for patient search with debouncing
 */
export function usePatientSearch() {
  const searchResults = usePatientsStore(selectSearchResults);
  const isLoading = usePatientsStore(selectIsLoading);
  const searchPatients = usePatientsStore((state) => state.searchPatients);
  const clearSearchResults = usePatientsStore((state) => state.clearSearchResults);

  // Create search function
  const search = useCallback(
    (query: string) => {
      if (query.trim()) {
        searchPatients(query);
      } else {
        clearSearchResults();
      }
    },
    [searchPatients, clearSearchResults]
  );

  return {
    searchResults,
    isLoading,
    search,
    clearSearchResults,
  };
}

/**
 * Hook for filtering patients locally (client-side)
 */
export function useFilteredPatients<T extends { name?: string; status?: string }>(
  patients: T[],
  searchQuery: string,
  statusFilter: string = "all"
) {
  const debouncedQuery = useDebounce(searchQuery, 300);

  const filteredPatients = useMemo(() => {
    return patients.filter((patient) => {
      const matchesSearch =
        !debouncedQuery ||
        patient.name?.toLowerCase().includes(debouncedQuery.toLowerCase());
      const matchesStatus =
        statusFilter === "all" || patient.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [patients, debouncedQuery, statusFilter]);

  return filteredPatients;
}
