import { create } from "zustand";
import type { User } from "@/types/api";
import { getDoctors } from "@/actions/users";

type DoctorsState = {
  doctors: User[];
  isLoading: boolean;
  error: string | null;
  lastFetchedAt: number | null;
};

type DoctorsActions = {
  fetchDoctors: (force?: boolean) => Promise<void>;
  getDoctors: () => User[];
  clearDoctors: () => void;
};

const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes

export const useDoctorsStore = create<DoctorsState & DoctorsActions>((set, get) => ({
  doctors: [],
  isLoading: false,
  error: null,
  lastFetchedAt: null,

  fetchDoctors: async (force = false) => {
    const { doctors, lastFetchedAt } = get();
    const isStale = lastFetchedAt == null || Date.now() - lastFetchedAt > CACHE_TTL_MS;

    if (!force && doctors.length > 0 && !isStale) {
      return;
    }

    set({ isLoading: true, error: null });
    try {
      const data = await getDoctors();
      set({
        doctors: data,
        isLoading: false,
        lastFetchedAt: Date.now(),
        error: null,
      });
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : "Erreur de chargement des médecins",
      });
    }
  },

  getDoctors: () => get().doctors,

  clearDoctors: () => set({ doctors: [], lastFetchedAt: null }),
}));
