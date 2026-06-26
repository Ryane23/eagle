import { create } from "zustand";
import type { Consultation, CompleteConsultationDto, AddNoteDto } from "@/types/api";
import {
    getMyConsultations,
    getMySchedule,
    getConsultationById,
    getConsultationsByPatient,
    startConsultation,
    addConsultationNote,
    completeConsultation,
    cancelConsultation,
} from "@/actions/consultations";

type ConsultationsState = {
    consultations: Consultation[];
    schedule: Consultation[];
    currentConsultation: Consultation | null;
    isLoading: boolean;
    error: string | null;
};

type ConsultationsActions = {
    fetchMyConsultations: () => Promise<void>;
    fetchMySchedule: () => Promise<void>;
    fetchConsultationById: (id: string) => Promise<void>;
    fetchConsultationsByPatient: (patientId: string) => Promise<Consultation[]>;
    startConsultation: (id: string) => Promise<void>;
    addNote: (id: string, note: string) => Promise<void>;
    completeConsultation: (id: string, data: CompleteConsultationDto) => Promise<void>;
    cancelConsultation: (id: string) => Promise<void>;
    setCurrentConsultation: (consultation: Consultation | null) => void;
    clearError: () => void;
};

export const useConsultationsStore = create<ConsultationsState & ConsultationsActions>((set) => ({
    consultations: [],
    schedule: [],
    currentConsultation: null,
    isLoading: false,
    error: null,

    fetchMyConsultations: async () => {
        set({ isLoading: true, error: null });
        try {
            const consultations = await getMyConsultations();
            set({ consultations, isLoading: false });
        } catch (error) {
            set({
                isLoading: false,
                error: error instanceof Error ? error.message : "Erreur de chargement",
            });
        }
    },

    fetchMySchedule: async () => {
        set({ isLoading: true, error: null });
        try {
            const schedule = await getMySchedule();
            set({ schedule, isLoading: false });
        } catch (error) {
            set({
                isLoading: false,
                error: error instanceof Error ? error.message : "Erreur de chargement du planning",
            });
        }
    },

    fetchConsultationById: async (id) => {
        set({ isLoading: true, error: null });
        try {
            const consultation = await getConsultationById(id);
            set({ currentConsultation: consultation, isLoading: false });
        } catch (error) {
            set({
                isLoading: false,
                error: error instanceof Error ? error.message : "Consultation non trouvée",
            });
        }
    },

    fetchConsultationsByPatient: async (patientId) => {
        set({ isLoading: true, error: null });
        try {
            const consultations = await getConsultationsByPatient(patientId);
            set({ isLoading: false });
            return consultations;
        } catch (error) {
            set({
                isLoading: false,
                error: error instanceof Error ? error.message : "Erreur de chargement",
            });
            return [];
        }
    },

    startConsultation: async (id) => {
        set({ isLoading: true, error: null });
        try {
            const updated = await startConsultation(id);
            set((state) => ({
                consultations: state.consultations.map((c) => (c.id === id ? updated : c)),
                schedule: state.schedule.map((c) => (c.id === id ? updated : c)),
                currentConsultation: state.currentConsultation?.id === id ? updated : state.currentConsultation,
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

    addNote: async (id, note) => {
        set({ isLoading: true, error: null });
        try {
            const data: AddNoteDto = { note };
            const updated = await addConsultationNote(id, data);
            set((state) => ({
                consultations: state.consultations.map((c) => (c.id === id ? updated : c)),
                currentConsultation: state.currentConsultation?.id === id ? updated : state.currentConsultation,
                isLoading: false,
            }));
        } catch (error) {
            set({
                isLoading: false,
                error: error instanceof Error ? error.message : "Erreur d'ajout de note",
            });
            throw error;
        }
    },

    completeConsultation: async (id, data) => {
        set({ isLoading: true, error: null });
        try {
            const updated = await completeConsultation(id, data);
            set((state) => ({
                consultations: state.consultations.map((c) => (c.id === id ? updated : c)),
                schedule: state.schedule.filter((c) => c.id !== id),
                currentConsultation: state.currentConsultation?.id === id ? updated : state.currentConsultation,
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

    cancelConsultation: async (id) => {
        set({ isLoading: true, error: null });
        try {
            const updated = await cancelConsultation(id);
            set((state) => ({
                consultations: state.consultations.map((c) => (c.id === id ? updated : c)),
                schedule: state.schedule.filter((c) => c.id !== id),
                currentConsultation: state.currentConsultation?.id === id ? updated : state.currentConsultation,
                isLoading: false,
            }));
        } catch (error) {
            set({
                isLoading: false,
                error: error instanceof Error ? error.message : "Erreur d'annulation",
            });
            throw error;
        }
    },

    setCurrentConsultation: (consultation) => {
        set({ currentConsultation: consultation });
    },

    clearError: () => {
        set({ error: null });
    },
}));
