import { create } from "zustand";
import type { NetworkAnalytics, BranchStatistics, SystemHealth } from "@/types/api";
import { getNetworkOverview, getBranchStatistics } from "@/actions/analytics";
import { getSystemHealth } from "@/actions/system";

type AnalyticsState = {
  networkOverview: NetworkAnalytics | null;
  branchStatistics: Record<string, BranchStatistics>;
  systemHealth: SystemHealth | null;
  isLoading: boolean;
  error: string | null;
  lastUpdated: Date | null;
};

type AnalyticsActions = {
  fetchNetworkOverview: () => Promise<void>;
  fetchBranchStatistics: (hospitalId: string) => Promise<void>;
  fetchSystemHealth: () => Promise<void>;
  refreshAll: () => Promise<void>;
  clearError: () => void;
};

export const useAnalyticsStore = create<AnalyticsState & AnalyticsActions>((set) => ({
  networkOverview: null,
  branchStatistics: {},
  systemHealth: null,
  isLoading: false,
  error: null,
  lastUpdated: null,

  fetchNetworkOverview: async () => {
    set({ isLoading: true, error: null });
    try {
      const networkOverview = await getNetworkOverview();
      set({ networkOverview, isLoading: false, lastUpdated: new Date() });
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : "Erreur de chargement des statistiques",
      });
    }
  },

  fetchBranchStatistics: async (hospitalId) => {
    set({ isLoading: true, error: null });
    try {
      const stats = await getBranchStatistics(hospitalId);
      set((state) => ({
        branchStatistics: {
          ...state.branchStatistics,
          [hospitalId]: stats,
        },
        isLoading: false,
      }));
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : "Erreur de chargement",
      });
    }
  },

  fetchSystemHealth: async () => {
    set({ isLoading: true, error: null });
    try {
      const systemHealth = await getSystemHealth();
      set({ systemHealth, isLoading: false });
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : "Erreur de vérification",
      });
    }
  },

  refreshAll: async () => {
    set({ isLoading: true, error: null });
    try {
      const [networkOverview, systemHealth] = await Promise.all([
        getNetworkOverview(),
        getSystemHealth(),
      ]);
      set({
        networkOverview,
        systemHealth,
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

