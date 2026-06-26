import { useEffect } from "react";
import { useDoctorsStore } from "@/stores/doctors-store";

/**
 * Hook to get doctors from the store. Fetches on mount if cache is empty or stale.
 * Returns doctors list, loading state, and refresh function.
 */
export function useDoctors() {
  const doctors = useDoctorsStore((s) => s.doctors);
  const isLoading = useDoctorsStore((s) => s.isLoading);
  const error = useDoctorsStore((s) => s.error);
  const fetchDoctors = useDoctorsStore((s) => s.fetchDoctors);

  useEffect(() => {
    fetchDoctors();
  }, [fetchDoctors]);

  return {
    doctors,
    isLoading,
    error,
    refetch: () => fetchDoctors(true),
  };
}
