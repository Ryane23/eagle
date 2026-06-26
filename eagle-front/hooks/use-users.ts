import { useCallback, useMemo } from "react";
import { useUsersStore } from "@/stores/users-store";
import type { UsersFilterParams } from "@/actions/users";

// Selectors for optimized re-renders
const selectUsers = (state: ReturnType<typeof useUsersStore.getState>) => state.users;
const selectCurrentUser = (state: ReturnType<typeof useUsersStore.getState>) => state.currentUser;
const selectIsLoading = (state: ReturnType<typeof useUsersStore.getState>) => state.isLoading;
const selectError = (state: ReturnType<typeof useUsersStore.getState>) => state.error;
const selectFilters = (state: ReturnType<typeof useUsersStore.getState>) => state.filters;

/**
 * Hook for admin users management
 */
export function useUsers() {
  const users = useUsersStore(selectUsers);
  const isLoading = useUsersStore(selectIsLoading);
  const error = useUsersStore(selectError);
  const filters = useUsersStore(selectFilters);

  const fetchUsers = useUsersStore((state) => state.fetchUsers);
  const createUser = useUsersStore((state) => state.createUser);
  const updateUser = useUsersStore((state) => state.updateUser);
  const deleteUser = useUsersStore((state) => state.deleteUser);
  const activateUser = useUsersStore((state) => state.activateUser);
  const deactivateUser = useUsersStore((state) => state.deactivateUser);
  const setFilters = useUsersStore((state) => state.setFilters);
  const clearError = useUsersStore((state) => state.clearError);

  return {
    users,
    isLoading,
    error,
    filters,
    fetchUsers,
    createUser,
    updateUser,
    deleteUser,
    activateUser,
    deactivateUser,
    setFilters,
    clearError,
  };
}

/**
 * Hook for user details
 */
export function useUserDetails() {
  const currentUser = useUsersStore(selectCurrentUser);
  const isLoading = useUsersStore(selectIsLoading);
  const error = useUsersStore(selectError);

  const fetchUserById = useUsersStore((state) => state.fetchUserById);
  const setCurrentUser = useUsersStore((state) => state.setCurrentUser);

  return {
    user: currentUser,
    isLoading,
    error,
    fetchUserById,
    setCurrentUser,
  };
}

/**
 * Hook for user statistics
 */
export function useUsersStats() {
  const users = useUsersStore(selectUsers);

  const stats = useMemo(() => {
    const total = users.length;
    const active = users.filter((u) => u.isActive).length;
    const inactive = users.filter((u) => !u.isActive).length;
    
    const byRole = users.reduce((acc, user) => {
      acc[user.role] = (acc[user.role] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      total,
      active,
      inactive,
      byRole,
    };
  }, [users]);

  return stats;
}

/**
 * Hook for user search with local filtering
 */
export function useUserSearch(searchQuery: string) {
  const users = useUsersStore(selectUsers);

  const filteredUsers = useMemo(() => {
    if (!searchQuery.trim()) return users;
    
    const query = searchQuery.toLowerCase();
    return users.filter(
      (user) =>
        user.name.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query)
    );
  }, [users, searchQuery]);

  return filteredUsers;
}

/**
 * Hook to filter users with API
 */
export function useUsersFilter() {
  const fetchUsers = useUsersStore((state) => state.fetchUsers);
  const setFilters = useUsersStore((state) => state.setFilters);
  const filters = useUsersStore(selectFilters);

  const applyFilters = useCallback(
    async (newFilters: UsersFilterParams) => {
      setFilters(newFilters);
      await fetchUsers(newFilters);
    },
    [fetchUsers, setFilters]
  );

  const clearFilters = useCallback(async () => {
    setFilters({});
    await fetchUsers({});
  }, [fetchUsers, setFilters]);

  return {
    filters,
    applyFilters,
    clearFilters,
  };
}


