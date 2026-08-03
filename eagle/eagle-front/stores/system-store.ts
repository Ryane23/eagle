import { create } from "zustand";
import type { SystemSettings, SystemHealth, MaintenanceStatus, UpdateSystemSettingsDto } from "@/types/api";
import {
    getSystemSettings,
    updateSystemSettings,
    toggleMaintenanceMode,
    checkMaintenanceMode,
    getSystemHealth,
} from "@/actions/system";

type SystemState = {
    settings: SystemSettings | null;
    health: SystemHealth | null;
    maintenanceStatus: MaintenanceStatus | null;
    isLoading: boolean;
    error: string | null;
    lastUpdated: Date | null;
};

type SystemActions = {
    fetchSettings: () => Promise<void>;
    updateSettings: (data: UpdateSystemSettingsDto) => Promise<void>;
    fetchHealth: () => Promise<void>;
    fetchMaintenanceStatus: () => Promise<void>;
    toggleMaintenance: () => Promise<void>;
    refreshAll: () => Promise<void>;
    clearError: () => void;
};

export const useSystemStore = create<SystemState & SystemActions>((set) => ({
    settings: null,
    health: null,
    maintenanceStatus: null,
    isLoading: false,
    error: null,
    lastUpdated: null,

    fetchSettings: async () => {
        set({ isLoading: true, error: null });
        try {
            const settings = await getSystemSettings();
            set({ settings, isLoading: false, lastUpdated: new Date() });
        } catch (error) {
            set({
                isLoading: false,
                error: error instanceof Error ? error.message : "Erreur de chargement des paramètres",
            });
        }
    },

    updateSettings: async (data) => {
        set({ isLoading: true, error: null });
        try {
            const settings = await updateSystemSettings(data);
            set({ settings, isLoading: false, lastUpdated: new Date() });
        } catch (error) {
            set({
                isLoading: false,
                error: error instanceof Error ? error.message : "Erreur de mise à jour",
            });
            throw error;
        }
    },

    fetchHealth: async () => {
        set({ isLoading: true, error: null });
        try {
            const health = await getSystemHealth();
            set({ health, isLoading: false });
        } catch (error) {
            set({
                isLoading: false,
                error: error instanceof Error ? error.message : "Erreur de vérification",
            });
        }
    },

    fetchMaintenanceStatus: async () => {
        set({ isLoading: true, error: null });
        try {
            const maintenanceStatus = await checkMaintenanceMode();
            set({ maintenanceStatus, isLoading: false });
        } catch (error) {
            set({
                isLoading: false,
                error: error instanceof Error ? error.message : "Erreur de vérification",
            });
        }
    },

    toggleMaintenance: async () => {
        set({ isLoading: true, error: null });
        try {
            const maintenanceStatus = await toggleMaintenanceMode();
            set({ maintenanceStatus, isLoading: false });
        } catch (error) {
            set({
                isLoading: false,
                error: error instanceof Error ? error.message : "Erreur de basculement",
            });
            throw error;
        }
    },

    refreshAll: async () => {
        set({ isLoading: true, error: null });
        try {
            const [settings, health, maintenanceStatus] = await Promise.all([
                getSystemSettings(),
                getSystemHealth(),
                checkMaintenanceMode(),
            ]);
            set({
                settings,
                health,
                maintenanceStatus,
                isLoading: false,
                lastUpdated: new Date(),
            });
        } catch (error) {
            set({
                isLoading: false,
                error: error instanceof Error ? error.message : "Erreur de rafraîchissement",
            });
        }
    },

    clearError: () => {
        set({ error: null });
    },
}));

