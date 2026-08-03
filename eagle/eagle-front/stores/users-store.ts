import { create } from "zustand";
import type { User, UpdateUserDto, UserRole } from "@/types/api";
import {
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  activateUser,
  deactivateUser,
  type UsersFilterParams,
} from "@/actions/users";
import { register } from "@/actions/auth";

type UsersState = {
  users: User[];
  currentUser: User | null;
  isLoading: boolean;
  error: string | null;
  filters: UsersFilterParams;
};

type UsersActions = {
  fetchUsers: (filters?: UsersFilterParams) => Promise<void>;
  fetchUserById: (id: string) => Promise<void>;
  createUser: (data: {
    email: string;
    password: string;
    name: string;
    role: UserRole;
    hospitalId?: string;
    specialtyId?: string;
    phone?: string;
  }) => Promise<User>;
  updateUser: (id: string, data: UpdateUserDto) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;
  activateUser: (id: string) => Promise<void>;
  deactivateUser: (id: string) => Promise<void>;
  setFilters: (filters: UsersFilterParams) => void;
  setCurrentUser: (user: User | null) => void;
  clearError: () => void;
};

export const useUsersStore = create<UsersState & UsersActions>((set, get) => ({
  users: [],
  currentUser: null,
  isLoading: false,
  error: null,
  filters: {},

  fetchUsers: async (filters) => {
    set({ isLoading: true, error: null });
    try {
      const appliedFilters = filters || get().filters;
      const users = await getUsers(appliedFilters);
      set({ users, isLoading: false, filters: appliedFilters });
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : "Erreur de chargement des utilisateurs",
      });
    }
  },

  fetchUserById: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const user = await getUserById(id);
      set({ currentUser: user, isLoading: false });
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : "Utilisateur non trouvé",
      });
    }
  },

  createUser: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const response = await register(data);
      const newUser = response.user;
      set((state) => ({
        users: [newUser, ...state.users],
        isLoading: false,
      }));
      return newUser;
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : "Erreur de création",
      });
      throw error;
    }
  },

  updateUser: async (id, data) => {
    set({ isLoading: true, error: null });
    try {
      const updated = await updateUser(id, data);
      set((state) => ({
        users: state.users.map((u) => (u.id === id ? updated : u)),
        currentUser: state.currentUser?.id === id ? updated : state.currentUser,
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

  deleteUser: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await deleteUser(id);
      set((state) => ({
        users: state.users.filter((u) => u.id !== id),
        currentUser: state.currentUser?.id === id ? null : state.currentUser,
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

  activateUser: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const updated = await activateUser(id);
      set((state) => ({
        users: state.users.map((u) => (u.id === id ? updated : u)),
        currentUser: state.currentUser?.id === id ? updated : state.currentUser,
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

  deactivateUser: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const updated = await deactivateUser(id);
      set((state) => ({
        users: state.users.map((u) => (u.id === id ? updated : u)),
        currentUser: state.currentUser?.id === id ? updated : state.currentUser,
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

  setFilters: (filters) => {
    set({ filters });
  },

  setCurrentUser: (user) => {
    set({ currentUser: user });
  },

  clearError: () => {
    set({ error: null });
  },
}));


