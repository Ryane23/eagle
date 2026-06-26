import { create } from "zustand";
import type { QueueEntry, QueueStats } from "@/types/api";
import {
    getQueue,
    getMyHospitalQueue,
    getQueueStats,
    getQueueByConsultationId,
} from "@/actions/queue";

type QueueState = {
    queue: QueueEntry[];
    hospitalQueue: QueueEntry[];
    stats: QueueStats | null;
    isLoading: boolean;
    error: string | null;
};

type QueueActions = {
    fetchGlobalQueue: (status?: string) => Promise<void>;
    fetchHospitalQueue: (status?: string) => Promise<void>;
    fetchQueueStats: () => Promise<void>;
    getQueuePosition: (consultationId: string) => Promise<{ position: number; estimatedWaitTime: number }>;
    updateQueueEntry: (entry: QueueEntry) => void;
    removeFromQueue: (id: string) => void;
    clearError: () => void;
};

export const useQueueStore = create<QueueState & QueueActions>((set) => ({
    queue: [],
    hospitalQueue: [],
    stats: null,
    isLoading: false,
    error: null,

    fetchGlobalQueue: async (status) => {
        set({ isLoading: true, error: null });
        try {
            const queue = await getQueue(status);
            set({ queue, isLoading: false });
        } catch (error) {
            set({
                isLoading: false,
                error: error instanceof Error ? error.message : "Erreur de chargement",
            });
        }
    },

    fetchHospitalQueue: async (status) => {
        set({ isLoading: true, error: null });
        try {
            const hospitalQueue = await getMyHospitalQueue(status);
            set({ hospitalQueue, isLoading: false });
        } catch (error) {
            set({
                isLoading: false,
                error: error instanceof Error ? error.message : "Erreur de chargement",
            });
        }
    },

    fetchQueueStats: async () => {
        set({ isLoading: true, error: null });
        try {
            const stats = await getQueueStats();
            set({ stats, isLoading: false });
        } catch (error) {
            set({
                isLoading: false,
                error: error instanceof Error ? error.message : "Erreur de chargement des statistiques",
            });
        }
    },

    getQueuePosition: async (consultationId) => {
        try {
            const entry = await getQueueByConsultationId(consultationId);
            return {
                position: entry.position,
                estimatedWaitTime: entry.estimatedWaitTime,
            };
        } catch (error) {
            throw error;
        }
    },

    updateQueueEntry: (entry) => {
        set((state) => ({
            queue: state.queue.map((e) => (e.id === entry.id ? entry : e)),
            hospitalQueue: state.hospitalQueue.map((e) => (e.id === entry.id ? entry : e)),
        }));
    },

    removeFromQueue: (id) => {
        set((state) => ({
            queue: state.queue.filter((e) => e.id !== id),
            hospitalQueue: state.hospitalQueue.filter((e) => e.id !== id),
        }));
    },

    clearError: () => {
        set({ error: null });
    },
}));
