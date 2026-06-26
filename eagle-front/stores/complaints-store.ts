import { create } from "zustand";
import type { Complaint, CreateComplaintDto, UpdateComplaintDto } from "@/types/api";
import {
  getComplaints,
  getComplaintById,
  createComplaint,
  updateComplaint,
  deleteComplaint,
  type ComplaintsFilterParams,
} from "@/actions/complaints";

type ComplaintsState = {
  complaints: Complaint[];
  currentComplaint: Complaint | null;
  isLoading: boolean;
  error: string | null;
  filters: ComplaintsFilterParams;
};

type ComplaintsActions = {
  fetchComplaints: (filters?: ComplaintsFilterParams) => Promise<void>;
  fetchComplaintById: (id: string) => Promise<void>;
  createComplaint: (data: CreateComplaintDto) => Promise<Complaint>;
  updateComplaint: (id: string, data: UpdateComplaintDto) => Promise<void>;
  deleteComplaint: (id: string) => Promise<void>;
  setFilters: (filters: ComplaintsFilterParams) => void;
  setCurrentComplaint: (complaint: Complaint | null) => void;
  clearError: () => void;
};

export const useComplaintsStore = create<ComplaintsState & ComplaintsActions>((set, get) => ({
  complaints: [],
  currentComplaint: null,
  isLoading: false,
  error: null,
  filters: {},

  fetchComplaints: async (filters) => {
    set({ isLoading: true, error: null });
    try {
      const appliedFilters = filters || get().filters;
      const complaints = await getComplaints(appliedFilters);
      set({ complaints, isLoading: false, filters: appliedFilters });
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : "Erreur de chargement des incidents",
      });
    }
  },

  fetchComplaintById: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const complaint = await getComplaintById(id);
      set({ currentComplaint: complaint, isLoading: false });
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : "Incident non trouvé",
      });
    }
  },

  createComplaint: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const complaint = await createComplaint(data);
      set((state) => ({
        complaints: [complaint, ...state.complaints],
        isLoading: false,
      }));
      return complaint;
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : "Erreur de création",
      });
      throw error;
    }
  },

  updateComplaint: async (id, data) => {
    set({ isLoading: true, error: null });
    try {
      const updated = await updateComplaint(id, data);
      set((state) => ({
        complaints: state.complaints.map((c) => (c.id === id ? updated : c)),
        currentComplaint: state.currentComplaint?.id === id ? updated : state.currentComplaint,
        isLoading: false,
      }));
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : "Erreur de mise à jour",
      });
      throw error;
    }
  },

  deleteComplaint: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await deleteComplaint(id);
      set((state) => ({
        complaints: state.complaints.filter((c) => c.id !== id),
        currentComplaint: state.currentComplaint?.id === id ? null : state.currentComplaint,
        isLoading: false,
      }));
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : "Erreur de suppression",
      });
      throw error;
    }
  },

  setFilters: (filters) => {
    set({ filters });
  },

  setCurrentComplaint: (complaint) => {
    set({ currentComplaint: complaint });
  },

  clearError: () => {
    set({ error: null });
  },
}));

