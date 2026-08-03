import { create } from "zustand";
import type { Hospital, CreateHospitalDto, UpdateHospitalDto, HospitalType } from "@/types/api";
import {
  getHospitals,
  getHospitalById,
  getHospitalsByType,
  getPrimaryCenter,
  createHospital,
  updateHospital,
  deleteHospital,
  activateHospital,
  deactivateHospital,
} from "@/actions/hospitals";

type HospitalsState = {
  hospitals: Hospital[];
  primaryCenter: Hospital | null;
  currentHospital: Hospital | null;
  isLoading: boolean;
  error: string | null;
};

type HospitalsActions = {
  fetchHospitals: () => Promise<void>;
  fetchHospitalsByType: (type: HospitalType) => Promise<void>;
  fetchPrimaryCenter: () => Promise<void>;
  fetchHospitalById: (id: string) => Promise<void>;
  createHospital: (data: CreateHospitalDto) => Promise<Hospital>;
  updateHospital: (id: string, data: UpdateHospitalDto) => Promise<void>;
  deleteHospital: (id: string) => Promise<void>;
  activateHospital: (id: string) => Promise<void>;
  deactivateHospital: (id: string) => Promise<void>;
  setCurrentHospital: (hospital: Hospital | null) => void;
  clearError: () => void;
};

export const useHospitalsStore = create<HospitalsState & HospitalsActions>((set) => ({
  hospitals: [],
  primaryCenter: null,
  currentHospital: null,
  isLoading: false,
  error: null,

  fetchHospitals: async () => {
    set({ isLoading: true, error: null });
    try {
      const hospitals = await getHospitals();
      set({ hospitals, isLoading: false });
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : "Erreur de chargement des centres",
      });
    }
  },

  fetchHospitalsByType: async (type) => {
    set({ isLoading: true, error: null });
    try {
      const hospitals = await getHospitalsByType(type);
      set({ hospitals, isLoading: false });
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : "Erreur de chargement",
      });
    }
  },

  fetchPrimaryCenter: async () => {
    set({ isLoading: true, error: null });
    try {
      const primaryCenter = await getPrimaryCenter();
      set({ primaryCenter, isLoading: false });
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : "Centre principal non trouvé",
      });
    }
  },

  fetchHospitalById: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const hospital = await getHospitalById(id);
      set({ currentHospital: hospital, isLoading: false });
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : "Centre non trouvé",
      });
    }
  },

  createHospital: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const hospital = await createHospital(data);
      set((state) => ({
        hospitals: [hospital, ...state.hospitals],
        isLoading: false,
      }));
      return hospital;
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : "Erreur de création",
      });
      throw error;
    }
  },

  updateHospital: async (id, data) => {
    set({ isLoading: true, error: null });
    try {
      const updated = await updateHospital(id, data);
      set((state) => ({
        hospitals: state.hospitals.map((h) => (h.id === id ? updated : h)),
        currentHospital: state.currentHospital?.id === id ? updated : state.currentHospital,
        primaryCenter: state.primaryCenter?.id === id ? updated : state.primaryCenter,
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

  deleteHospital: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await deleteHospital(id);
      set((state) => ({
        hospitals: state.hospitals.filter((h) => h.id !== id),
        currentHospital: state.currentHospital?.id === id ? null : state.currentHospital,
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

  activateHospital: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const updated = await activateHospital(id);
      set((state) => ({
        hospitals: state.hospitals.map((h) => (h.id === id ? updated : h)),
        currentHospital: state.currentHospital?.id === id ? updated : state.currentHospital,
        isLoading: false,
      }));
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : "Erreur d'activation",
      });
      throw error;
    }
  },

  deactivateHospital: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const updated = await deactivateHospital(id);
      set((state) => ({
        hospitals: state.hospitals.map((h) => (h.id === id ? updated : h)),
        currentHospital: state.currentHospital?.id === id ? updated : state.currentHospital,
        isLoading: false,
      }));
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : "Erreur de désactivation",
      });
      throw error;
    }
  },

  setCurrentHospital: (hospital) => {
    set({ currentHospital: hospital });
  },

  clearError: () => {
    set({ error: null });
  },
}));


