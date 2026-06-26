import { useMemo } from "react";
import { useComplaintsStore } from "@/stores/complaints-store";
import type { ComplaintsFilterParams } from "@/actions/complaints";

// Selectors for optimized re-renders
const selectComplaints = (state: ReturnType<typeof useComplaintsStore.getState>) => state.complaints;
const selectCurrentComplaint = (state: ReturnType<typeof useComplaintsStore.getState>) => state.currentComplaint;
const selectIsLoading = (state: ReturnType<typeof useComplaintsStore.getState>) => state.isLoading;
const selectError = (state: ReturnType<typeof useComplaintsStore.getState>) => state.error;
const selectFilters = (state: ReturnType<typeof useComplaintsStore.getState>) => state.filters;

/**
 * Hook for complaints/incidents management
 */
export function useComplaints() {
  const complaints = useComplaintsStore(selectComplaints);
  const isLoading = useComplaintsStore(selectIsLoading);
  const error = useComplaintsStore(selectError);
  const filters = useComplaintsStore(selectFilters);

  const fetchComplaints = useComplaintsStore((state) => state.fetchComplaints);
  const createComplaint = useComplaintsStore((state) => state.createComplaint);
  const updateComplaint = useComplaintsStore((state) => state.updateComplaint);
  const deleteComplaint = useComplaintsStore((state) => state.deleteComplaint);
  const setFilters = useComplaintsStore((state) => state.setFilters);
  const clearError = useComplaintsStore((state) => state.clearError);

  return {
    complaints,
    isLoading,
    error,
    filters,
    fetchComplaints,
    createComplaint,
    updateComplaint,
    deleteComplaint,
    setFilters,
    clearError,
  };
}

/**
 * Hook for complaint details
 */
export function useComplaintDetails() {
  const currentComplaint = useComplaintsStore(selectCurrentComplaint);
  const isLoading = useComplaintsStore(selectIsLoading);
  const error = useComplaintsStore(selectError);

  const fetchComplaintById = useComplaintsStore((state) => state.fetchComplaintById);
  const setCurrentComplaint = useComplaintsStore((state) => state.setCurrentComplaint);

  return {
    complaint: currentComplaint,
    isLoading,
    error,
    fetchComplaintById,
    setCurrentComplaint,
  };
}

/**
 * Hook for complaint statistics
 */
export function useComplaintsStats() {
  const complaints = useComplaintsStore(selectComplaints);

  const stats = useMemo(() => {
    const total = complaints.length;
    const open = complaints.filter((c) => c.status === "open").length;
    const inProgress = complaints.filter((c) => c.status === "in_progress").length;
    const resolved = complaints.filter((c) => c.status === "resolved").length;
    const closed = complaints.filter((c) => c.status === "closed").length;

    const byPriority = {
      low: complaints.filter((c) => c.priority === "low").length,
      medium: complaints.filter((c) => c.priority === "medium").length,
      high: complaints.filter((c) => c.priority === "high").length,
      urgent: complaints.filter((c) => c.priority === "urgent").length,
    };

    const byType = {
      service: complaints.filter((c) => c.type === "service").length,
      technical: complaints.filter((c) => c.type === "technical").length,
      staff: complaints.filter((c) => c.type === "staff").length,
      billing: complaints.filter((c) => c.type === "billing").length,
      other: complaints.filter((c) => c.type === "other").length,
    };

    return {
      total,
      open,
      inProgress,
      resolved,
      closed,
      byPriority,
      byType,
    };
  }, [complaints]);

  return stats;
}

/**
 * Hook for filtered complaints
 */
export function useFilteredComplaints(filters: ComplaintsFilterParams) {
  const complaints = useComplaintsStore(selectComplaints);

  const filteredComplaints = useMemo(() => {
    return complaints.filter((complaint) => {
      if (filters.status && complaint.status !== filters.status) return false;
      if (filters.type && complaint.type !== filters.type) return false;
      if (filters.priority && complaint.priority !== filters.priority) return false;
      if (filters.hospitalId && complaint.hospitalId !== filters.hospitalId) return false;
      return true;
    });
  }, [complaints, filters]);

  return filteredComplaints;
}

/**
 * Hook for searching complaints
 */
export function useComplaintSearch(searchQuery: string) {
  const complaints = useComplaintsStore(selectComplaints);

  const filteredComplaints = useMemo(() => {
    if (!searchQuery.trim()) return complaints;

    const query = searchQuery.toLowerCase();
    return complaints.filter(
      (complaint) =>
        complaint.subject.toLowerCase().includes(query) ||
        complaint.description.toLowerCase().includes(query) ||
        complaint.id.toLowerCase().includes(query)
    );
  }, [complaints, searchQuery]);

  return filteredComplaints;
}

