import { useMemo } from "react";
import { useHospitalsStore } from "@/stores/hospitals-store";
import type { HospitalType } from "@/types/api";

// Selectors for optimized re-renders
const selectHospitals = (state: ReturnType<typeof useHospitalsStore.getState>) => state.hospitals;
const selectPrimaryCenter = (state: ReturnType<typeof useHospitalsStore.getState>) => state.primaryCenter;
const selectCurrentHospital = (state: ReturnType<typeof useHospitalsStore.getState>) => state.currentHospital;
const selectIsLoading = (state: ReturnType<typeof useHospitalsStore.getState>) => state.isLoading;
const selectError = (state: ReturnType<typeof useHospitalsStore.getState>) => state.error;

/**
 * Hook for hospitals/centers management
 */
export function useHospitals() {
  const hospitals = useHospitalsStore(selectHospitals);
  const primaryCenter = useHospitalsStore(selectPrimaryCenter);
  const isLoading = useHospitalsStore(selectIsLoading);
  const error = useHospitalsStore(selectError);

  const fetchHospitals = useHospitalsStore((state) => state.fetchHospitals);
  const fetchHospitalsByType = useHospitalsStore((state) => state.fetchHospitalsByType);
  const fetchPrimaryCenter = useHospitalsStore((state) => state.fetchPrimaryCenter);
  const createHospital = useHospitalsStore((state) => state.createHospital);
  const updateHospital = useHospitalsStore((state) => state.updateHospital);
  const deleteHospital = useHospitalsStore((state) => state.deleteHospital);
  const activateHospital = useHospitalsStore((state) => state.activateHospital);
  const deactivateHospital = useHospitalsStore((state) => state.deactivateHospital);
  const clearError = useHospitalsStore((state) => state.clearError);

  return {
    hospitals,
    primaryCenter,
    isLoading,
    error,
    fetchHospitals,
    fetchHospitalsByType,
    fetchPrimaryCenter,
    createHospital,
    updateHospital,
    deleteHospital,
    activateHospital,
    deactivateHospital,
    clearError,
  };
}

/**
 * Hook for hospital details
 */
export function useHospitalDetails() {
  const currentHospital = useHospitalsStore(selectCurrentHospital);
  const isLoading = useHospitalsStore(selectIsLoading);
  const error = useHospitalsStore(selectError);

  const fetchHospitalById = useHospitalsStore((state) => state.fetchHospitalById);
  const setCurrentHospital = useHospitalsStore((state) => state.setCurrentHospital);

  return {
    hospital: currentHospital,
    isLoading,
    error,
    fetchHospitalById,
    setCurrentHospital,
  };
}

/**
 * Hook for hospital statistics
 */
export function useHospitalsStats() {
  const hospitals = useHospitalsStore(selectHospitals);

  const stats = useMemo(() => {
    const total = hospitals.length;
    const primary = hospitals.filter((h) => h.type === "PRIMARY").length;
    const secondary = hospitals.filter((h) => h.type === "SECONDARY").length;
    const active = hospitals.filter((h) => h.isActive).length;
    const inactive = hospitals.filter((h) => !h.isActive).length;

    return {
      total,
      primary,
      secondary,
      active,
      inactive,
    };
  }, [hospitals]);

  return stats;
}

/**
 * Hook for hospital search with local filtering
 */
export function useHospitalSearch(searchQuery: string) {
  const hospitals = useHospitalsStore(selectHospitals);

  const filteredHospitals = useMemo(() => {
    if (!searchQuery.trim()) return hospitals;

    const query = searchQuery.toLowerCase();
    return hospitals.filter(
      (hospital) =>
        hospital.name.toLowerCase().includes(query) ||
        hospital.address?.toLowerCase().includes(query)
    );
  }, [hospitals, searchQuery]);

  return filteredHospitals;
}

/**
 * Hook to filter hospitals by type
 */
export function useHospitalsByType(type?: HospitalType) {
  const hospitals = useHospitalsStore(selectHospitals);

  const filteredHospitals = useMemo(() => {
    if (!type) return hospitals;
    return hospitals.filter((h) => h.type === type);
  }, [hospitals, type]);

  return filteredHospitals;
}

/**
 * Hook for hospital options (for select dropdowns)
 */
export function useHospitalOptions() {
  const hospitals = useHospitalsStore(selectHospitals);

  const options = useMemo(() => {
    return hospitals.map((hospital) => ({
      value: hospital.id,
      label: hospital.name,
      type: hospital.type,
    }));
  }, [hospitals]);

  return options;
}


