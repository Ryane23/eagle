import { create } from "zustand";
import type {
    Urgency,
    CreateUrgencyDto,
    ValidateUrgencyDto,
    AssignUrgencyDto,
    RejectUrgencyDto,
} from "@/types/api";
import {
    getUrgencies,
    getPendingUrgencies,
    getUrgencyById,
    createUrgency,
    validateUrgency,
    assignUrgency,
    rejectUrgency,
    startUrgencyConsultation,
    completeUrgency,
    type UrgenciesFilterParams,
} from "@/actions/urgencies";

type UrgenciesState = {
    urgencies: Urgency[];
    pendingUrgencies: Urgency[];
    currentUrgency: Urgency | null;
    isLoading: boolean;
    error: string | null;
};

type UrgenciesActions = {
    fetchUrgencies: (filters?: UrgenciesFilterParams) => Promise<void>;
    fetchPendingUrgencies: () => Promise<void>;
    fetchUrgencyById: (id: string) => Promise<void>;
    createUrgency: (data: CreateUrgencyDto) => Promise<Urgency>;
    validateUrgency: (id: string, data: ValidateUrgencyDto) => Promise<void>;
    assignDoctor: (id: string, data: AssignUrgencyDto) => Promise<void>;
    rejectUrgency: (id: string, data: RejectUrgencyDto) => Promise<void>;
    startUrgency: (id: string) => Promise<void>;
    completeUrgency: (id: string) => Promise<void>;
    setCurrentUrgency: (urgency: Urgency | null) => void;
    clearError: () => void;
};

export const useUrgenciesStore = create<UrgenciesState & UrgenciesActions>((set) => ({
    urgencies: [],
    pendingUrgencies: [],
    currentUrgency: null,
    isLoading: false,
    error: null,

    fetchUrgencies: async (filters) => {
        set({ isLoading: true, error: null });
        try {
            const urgencies = await getUrgencies(filters);
            set({ urgencies, isLoading: false });
        } catch (error) {
            set({
                isLoading: false,
                error: error instanceof Error ? error.message : "Erreur de chargement",
            });
        }
    },

    fetchPendingUrgencies: async () => {
        set({ isLoading: true, error: null });
        try {
            const urgencies = await getPendingUrgencies();
            set({ pendingUrgencies: urgencies, isLoading: false });
        } catch (error) {
            set({
                isLoading: false,
                error: error instanceof Error ? error.message : "Erreur de chargement",
            });
        }
    },

    fetchUrgencyById: async (id) => {
        set({ isLoading: true, error: null });
        try {
            const urgency = await getUrgencyById(id);
            set({ currentUrgency: urgency, isLoading: false });
        } catch (error) {
            set({
                isLoading: false,
                error: error instanceof Error ? error.message : "Urgence non trouvée",
            });
        }
    },

    createUrgency: async (data) => {
        set({ isLoading: true, error: null });
        try {
            const urgency = await createUrgency(data);
            set((state) => ({
                urgencies: [urgency, ...state.urgencies],
                isLoading: false,
            }));
            return urgency;
        } catch (error) {
            set({
                isLoading: false,
                error: error instanceof Error ? error.message : "Erreur de création",
            });
            throw error;
        }
    },

    validateUrgency: async (id, data) => {
        set({ isLoading: true, error: null });
        try {
            const updated = await validateUrgency(id, data);
            set((state) => ({
                urgencies: state.urgencies.map((u) => (u.id === id ? updated : u)),
                pendingUrgencies: state.pendingUrgencies.filter((u) => u.id !== id),
                currentUrgency: state.currentUrgency?.id === id ? updated : state.currentUrgency,
                isLoading: false,
            }));
        } catch (error) {
            set({
                isLoading: false,
                error: error instanceof Error ? error.message : "Erreur de validation",
            });
            throw error;
        }
    },

    assignDoctor: async (id, data) => {
        set({ isLoading: true, error: null });
        try {
            const updated = await assignUrgency(id, data);
            set((state) => ({
                urgencies: state.urgencies.map((u) => (u.id === id ? updated : u)),
                currentUrgency: state.currentUrgency?.id === id ? updated : state.currentUrgency,
                isLoading: false,
            }));
        } catch (error) {
            set({
                isLoading: false,
                error: error instanceof Error ? error.message : "Erreur d'assignation",
            });
            throw error;
        }
    },

    rejectUrgency: async (id, data) => {
        set({ isLoading: true, error: null });
        try {
            const updated = await rejectUrgency(id, data);
            set((state) => ({
                urgencies: state.urgencies.map((u) => (u.id === id ? updated : u)),
                pendingUrgencies: state.pendingUrgencies.filter((u) => u.id !== id),
                currentUrgency: state.currentUrgency?.id === id ? updated : state.currentUrgency,
                isLoading: false,
            }));
        } catch (error) {
            set({
                isLoading: false,
                error: error instanceof Error ? error.message : "Erreur de rejet",
            });
            throw error;
        }
    },

    startUrgency: async (id) => {
        set({ isLoading: true, error: null });
        try {
            const updated = await startUrgencyConsultation(id);
            set((state) => ({
                urgencies: state.urgencies.map((u) => (u.id === id ? updated : u)),
                currentUrgency: state.currentUrgency?.id === id ? updated : state.currentUrgency,
                isLoading: false,
            }));
        } catch (error) {
            set({
                isLoading: false,
                error: error instanceof Error ? error.message : "Erreur de démarrage",
            });
            throw error;
        }
    },

    completeUrgency: async (id) => {
        set({ isLoading: true, error: null });
        try {
            const updated = await completeUrgency(id);
            set((state) => ({
                urgencies: state.urgencies.map((u) => (u.id === id ? updated : u)),
                currentUrgency: state.currentUrgency?.id === id ? updated : state.currentUrgency,
                isLoading: false,
            }));
        } catch (error) {
            set({
                isLoading: false,
                error: error instanceof Error ? error.message : "Erreur de complétion",
            });
            throw error;
        }
    },

    setCurrentUrgency: (urgency) => {
        set({ currentUrgency: urgency });
    },

    clearError: () => {
        set({ error: null });
    },
}));
