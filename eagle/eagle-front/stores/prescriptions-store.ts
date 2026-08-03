"use client";

import { create } from "zustand";
import type { Prescription, CreatePrescriptionDto, UpdatePrescriptionDto } from "@/types/api";
import {
    getPrescriptions,
    getMyHospitalPrescriptions,
    getPrescriptionsByPatient,
    getPrescriptionById,
    createPrescription,
    updatePrescription,
    deletePrescription,
    markPrescriptionAsDispensed,
} from "@/actions/prescriptions";

type PrescriptionsState = {
    prescriptions: Prescription[];
    currentPrescription: Prescription | null;
    isLoading: boolean;
    error: string | null;
    filters: {
        status: string;
        search: string;
    };
};

type PrescriptionsActions = {
    fetchPrescriptions: () => Promise<void>;
    fetchMyHospitalPrescriptions: () => Promise<void>;
    fetchPatientPrescriptions: (patientId: string) => Promise<void>;
    fetchPrescriptionById: (id: string) => Promise<void>;
    createPrescription: (data: CreatePrescriptionDto) => Promise<Prescription>;
    updatePrescription: (id: string, data: UpdatePrescriptionDto) => Promise<void>;
    deletePrescription: (id: string) => Promise<void>;
    markAsDispensed: (id: string) => Promise<void>;
    setFilters: (filters: Partial<PrescriptionsState["filters"]>) => void;
    clearError: () => void;
};

export const usePrescriptionsStore = create<PrescriptionsState & PrescriptionsActions>((set, get) => ({
    prescriptions: [],
    currentPrescription: null,
    isLoading: false,
    error: null,
    filters: {
        status: "all",
        search: "",
    },

    fetchPrescriptions: async () => {
        set({ isLoading: true, error: null });
        try {
            const prescriptions = await getPrescriptions();
            set({ prescriptions, isLoading: false });
        } catch (error) {
            set({
                isLoading: false,
                error: error instanceof Error ? error.message : "Erreur de chargement",
            });
        }
    },

    fetchMyHospitalPrescriptions: async () => {
        set({ isLoading: true, error: null });
        try {
            // Try my-hospital endpoint first, fall back to general prescriptions
            let prescriptions: Prescription[];
            try {
                prescriptions = await getMyHospitalPrescriptions();
            } catch {
                // Fallback to general prescriptions endpoint
                prescriptions = await getPrescriptions();
            }
            set({ prescriptions, isLoading: false });
        } catch (error) {
            set({
                isLoading: false,
                error: error instanceof Error ? error.message : "Erreur de chargement",
            });
        }
    },

    fetchPatientPrescriptions: async (patientId) => {
        set({ isLoading: true, error: null });
        try {
            const prescriptions = await getPrescriptionsByPatient(patientId);
            set({ prescriptions, isLoading: false });
        } catch (error) {
            set({
                isLoading: false,
                error: error instanceof Error ? error.message : "Erreur de chargement",
            });
        }
    },

    fetchPrescriptionById: async (id) => {
        set({ isLoading: true, error: null });
        try {
            const prescription = await getPrescriptionById(id);
            set({ currentPrescription: prescription, isLoading: false });
        } catch (error) {
            set({
                isLoading: false,
                error: error instanceof Error ? error.message : "Erreur de chargement",
            });
        }
    },

    createPrescription: async (data) => {
        set({ isLoading: true, error: null });
        try {
            const prescription = await createPrescription(data);
            set((state) => ({
                prescriptions: [prescription, ...state.prescriptions],
                isLoading: false,
            }));
            return prescription;
        } catch (error) {
            set({
                isLoading: false,
                error: error instanceof Error ? error.message : "Erreur de création",
            });
            throw error;
        }
    },

    updatePrescription: async (id, data) => {
        set({ isLoading: true, error: null });
        try {
            const updated = await updatePrescription(id, data);
            set((state) => ({
                prescriptions: state.prescriptions.map((p) =>
                    p.id === id ? updated : p
                ),
                currentPrescription:
                    state.currentPrescription?.id === id ? updated : state.currentPrescription,
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

    deletePrescription: async (id) => {
        set({ isLoading: true, error: null });
        try {
            await deletePrescription(id);
            set((state) => ({
                prescriptions: state.prescriptions.filter((p) => p.id !== id),
                currentPrescription:
                    state.currentPrescription?.id === id ? null : state.currentPrescription,
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

    markAsDispensed: async (id) => {
        set({ isLoading: true, error: null });
        try {
            const updated = await markPrescriptionAsDispensed(id);
            set((state) => ({
                prescriptions: state.prescriptions.map((p) =>
                    p.id === id ? updated : p
                ),
                currentPrescription:
                    state.currentPrescription?.id === id ? updated : state.currentPrescription,
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

    setFilters: (filters) => {
        set((state) => ({
            filters: { ...state.filters, ...filters },
        }));
    },

    clearError: () => {
        set({ error: null });
    },
}));

