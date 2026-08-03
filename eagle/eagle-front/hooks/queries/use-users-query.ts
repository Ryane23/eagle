import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { User, UpdateUserDto, UserRole, RegisterData } from "@/types/api";
import {
    getUsers,
    getDoctors,
    getUserById,
    updateUser,
    deleteUser,
    activateUser,
    deactivateUser,
} from "@/actions/users";
import { register } from "@/actions/auth";

// Query Keys
export const userKeys = {
    all: ["users"] as const,
    lists: () => [...userKeys.all, "list"] as const,
    list: (filters: string) => [...userKeys.lists(), { filters }] as const,
    details: () => [...userKeys.all, "detail"] as const,
    detail: (id: string) => [...userKeys.details(), id] as const,
};

// Filter type
export type UsersQueryFilters = {
    role?: UserRole;
    hospitalId?: string;
    status?: "all" | "active" | "inactive";
    search?: string;
};

// --- Queries ---

export function useUsersQuery(filters?: UsersQueryFilters) {
    return useQuery<User[], Error>({
        queryKey: userKeys.list(JSON.stringify(filters)),
        queryFn: async () => {
            const users = await getUsers({
                role: filters?.role,
                hospitalId: filters?.hospitalId,
                isActive: filters?.status === "all" ? undefined : filters?.status === "active" ? "true" : "false",
            });

            // Client-side search filter
            if (filters?.search) {
                const search = filters.search.toLowerCase();
                return users.filter(
                    (u) =>
                        u.name.toLowerCase().includes(search) ||
                        u.email.toLowerCase().includes(search)
                );
            }
            return users;
        },
        staleTime: 2 * 60 * 1000, // 2 minutes
        gcTime: 5 * 60 * 1000, // 5 minutes
    });
}

export function useUserQuery(id: string) {
    return useQuery<User, Error>({
        queryKey: userKeys.detail(id),
        queryFn: () => getUserById(id),
        enabled: !!id,
        staleTime: 5 * 60 * 1000,
        gcTime: 10 * 60 * 1000,
    });
}

/** Get active doctors for assignment dropdowns (Admin, Primary Secretary, Doctor) */
export function useDoctorsQuery() {
    return useQuery<User[], Error>({
        queryKey: [...userKeys.all, "doctors"] as const,
        queryFn: getDoctors,
        staleTime: 2 * 60 * 1000,
        gcTime: 5 * 60 * 1000,
    });
}

// --- Stats derived from query ---

export function useUserStats() {
    const { data: users = [] } = useUsersQuery();

    return {
        total: users.length,
        active: users.filter((u) => u.isActive).length,
        inactive: users.filter((u) => !u.isActive).length,
        doctors: users.filter((u) => u.role === "doctor").length,
        nurses: users.filter((u) => u.role === "nurse").length,
        admins: users.filter((u) => u.role === "admin").length,
    };
}

// --- Mutations ---

export function useCreateUser() {
    const queryClient = useQueryClient();
    return useMutation<{ user: User }, Error, RegisterData>({
        mutationFn: async (data) => {
            const response = await register(data);
            return { user: response.user };
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: userKeys.lists() });
            toast.success("Utilisateur créé avec succès!");
        },
        onError: (error) => {
            toast.error(error.message || "Erreur lors de la création");
        },
    });
}

export function useUpdateUser() {
    const queryClient = useQueryClient();
    return useMutation<User, Error, { id: string; data: UpdateUserDto }>({
        mutationFn: ({ id, data }) => updateUser(id, data),
        onSuccess: (updatedUser, { id }) => {
            queryClient.invalidateQueries({ queryKey: userKeys.lists() });
            queryClient.setQueryData(userKeys.detail(id), updatedUser);
            toast.success("Utilisateur mis à jour!");
        },
        onError: (error) => {
            toast.error(error.message || "Erreur lors de la mise à jour");
        },
    });
}

export function useDeleteUser() {
    const queryClient = useQueryClient();
    return useMutation<void, Error, string>({
        mutationFn: deleteUser,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: userKeys.lists() });
            toast.success("Utilisateur supprimé!");
        },
        onError: (error) => {
            toast.error(error.message || "Erreur lors de la suppression");
        },
    });
}

export function useActivateUser() {
    const queryClient = useQueryClient();
    return useMutation<User, Error, string>({
        mutationFn: activateUser,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: userKeys.lists() });
            toast.success("Utilisateur activé!");
        },
        onError: (error) => {
            toast.error(error.message || "Erreur lors de l'activation");
        },
    });
}

export function useDeactivateUser() {
    const queryClient = useQueryClient();
    return useMutation<User, Error, string>({
        mutationFn: deactivateUser,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: userKeys.lists() });
            toast.success("Utilisateur désactivé!");
        },
        onError: (error) => {
            toast.error(error.message || "Erreur lors de la désactivation");
        },
    });
}
