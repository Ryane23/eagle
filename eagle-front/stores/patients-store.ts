import { create } from "zustand";
import type { Patient, CreatePatientDto, UpdatePatientDto, UpdateVitalsDto, UpdateEhrDto } from "@/types/api";
import {
  getPatients,
  searchPatients,
  getPatientById,
  createPatient,
  updatePatient,
  updatePatientVitals,
  updatePatientEhr,
  deactivatePatient,
} from "@/actions/patients";

type PatientsState = {
  patients: Patient[];
  currentPatient: Patient | null;
  searchResults: Patient[];
  isLoading: boolean;
  error: string | null;
};

type PatientsActions = {
  fetchPatients: () => Promise<void>;
  searchPatients: (query: string) => Promise<void>;
  fetchPatientById: (id: string) => Promise<void>;
  createPatient: (data: CreatePatientDto) => Promise<Patient>;
  updatePatient: (id: string, data: UpdatePatientDto) => Promise<void>;
  updateVitals: (id: string, data: UpdateVitalsDto) => Promise<void>;
  updateEhr: (id: string, data: UpdateEhrDto) => Promise<void>;
  deactivatePatient: (id: string) => Promise<void>;
  setCurrentPatient: (patient: Patient | null) => void;
  clearSearchResults: () => void;
  clearError: () => void;
};

export const usePatientsStore = create<PatientsState & PatientsActions>((set) => ({
  patients: [],
  currentPatient: null,
  searchResults: [],
  isLoading: false,
  error: null,

  fetchPatients: async () => {
    set({ isLoading: true, error: null });
    try {
      const patients = await getPatients();
      set({ patients, isLoading: false });
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : "Erreur de chargement",
      });
    }
  },

  searchPatients: async (query) => {
    if (!query.trim()) {
      set({ searchResults: [] });
      return;
    }
    set({ isLoading: true, error: null });
    try {
      const results = await searchPatients(query);
      set({ searchResults: results, isLoading: false });
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : "Erreur de recherche",
      });
    }
  },

  fetchPatientById: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const patient = await getPatientById(id);
      set({ currentPatient: patient, isLoading: false });
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : "Patient non trouvé",
      });
    }
  },

  createPatient: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const patient = await createPatient(data);
      set((state) => ({
        patients: [patient, ...state.patients],
        isLoading: false,
      }));
      return patient;
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : "Erreur de création",
      });
      throw error;
    }
  },

  updatePatient: async (id, data) => {
    set({ isLoading: true, error: null });
    try {
      const updated = await updatePatient(id, data);
      set((state) => ({
        patients: state.patients.map((p) => (p.id === id ? updated : p)),
        currentPatient: state.currentPatient?.id === id ? updated : state.currentPatient,
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

  updateVitals: async (id, data) => {
    set({ isLoading: true, error: null });
    try {
      const updated = await updatePatientVitals(id, data);
      set((state) => ({
        patients: state.patients.map((p) => (p.id === id ? updated : p)),
        currentPatient: state.currentPatient?.id === id ? updated : state.currentPatient,
        isLoading: false,
      }));
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : "Erreur de mise à jour des signes vitaux",
      });
      throw error;
    }
  },

  updateEhr: async (id, data) => {
    set({ isLoading: true, error: null });
    try {
      const updated = await updatePatientEhr(id, data);
      set((state) => ({
        patients: state.patients.map((p) => (p.id === id ? updated : p)),
        currentPatient: state.currentPatient?.id === id ? updated : state.currentPatient,
        isLoading: false,
      }));
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : "Erreur de mise à jour du DPI",
      });
      throw error;
    }
  },

  deactivatePatient: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const updated = await deactivatePatient(id);
      set((state) => ({
        patients: state.patients.map((p) => (p.id === id ? updated : p)),
        currentPatient: state.currentPatient?.id === id ? updated : state.currentPatient,
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

  setCurrentPatient: (patient) => {
    set({ currentPatient: patient });
  },

  clearSearchResults: () => {
    set({ searchResults: [] });
  },

  clearError: () => {
    set({ error: null });
  },
}));
