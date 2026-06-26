import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { Specialty, CreateSpecialtyDto, UpdateSpecialtyDto } from "@/types/api";
import {
    createSpecialty,
    getSpecialties,
    searchSpecialties,
    getSpecialtyById,
    updateSpecialty,
    deleteSpecialty,
    activateSpecialty,
    deactivateSpecialty,
} from "@/actions/specialties";

// Query Keys
export const specialtyKeys = {
    all: ["specialties"] as const,
    lists: () => [...specialtyKeys.all, "list"] as const,
    list: (activeOnly?: boolean) => [...specialtyKeys.lists(), { activeOnly }] as const,
    search: (query: string) => [...specialtyKeys.all, "search", query] as const,
    details: () => [...specialtyKeys.all, "detail"] as const,
    detail: (id: string) => [...specialtyKeys.details(), id] as const,
};

// ============================================================================
// Queries
// ============================================================================

/**
 * Get all specialties with optional active filter.
 * Pass options.enabled: false to defer loading (e.g. until a modal is open).
 */
export function useSpecialtiesQuery(
    activeOnly?: boolean,
    options?: { enabled?: boolean }
) {
    return useQuery<Specialty[], Error>({
        queryKey: specialtyKeys.list(activeOnly),
        queryFn: () => getSpecialties(activeOnly),
        staleTime: 10 * 60 * 1000, // 10 minutes - specialties don't change often
        gcTime: 30 * 60 * 1000,
        enabled: options?.enabled ?? true,
    });
}

/**
 * Search specialties by query
 */
export function useSearchSpecialtiesQuery(query: string) {
    return useQuery<Specialty[], Error>({
        queryKey: specialtyKeys.search(query),
        queryFn: () => searchSpecialties(query),
        enabled: query.length >= 2,
        staleTime: 5 * 60 * 1000,
        gcTime: 10 * 60 * 1000,
    });
}

/**
 * Get single specialty by ID
 */
export function useSpecialtyQuery(id: string) {
    return useQuery<Specialty, Error>({
        queryKey: specialtyKeys.detail(id),
        queryFn: () => getSpecialtyById(id),
        enabled: !!id,
        staleTime: 10 * 60 * 1000,
        gcTime: 30 * 60 * 1000,
    });
}

// ============================================================================
// Stats
// ============================================================================

export function useSpecialtyStats() {
    const { data: specialties = [] } = useSpecialtiesQuery();

    return {
        total: specialties.length,
        active: specialties.filter((s) => s.isActive).length,
        inactive: specialties.filter((s) => !s.isActive).length,
    };
}

// ============================================================================
// Mutations
// ============================================================================

/**
 * Create a new specialty
 */
export function useCreateSpecialty() {
    const queryClient = useQueryClient();

    return useMutation<Specialty, Error, CreateSpecialtyDto>({
        mutationFn: createSpecialty,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: specialtyKeys.lists() });
            toast.success("Spécialité créée avec succès");
        },
        onError: (error) => {
            toast.error(error.message || "Erreur lors de la création");
        },
    });
}

/**
 * Update a specialty
 */
export function useUpdateSpecialty() {
    const queryClient = useQueryClient();

    return useMutation<Specialty, Error, { id: string; data: UpdateSpecialtyDto }>({
        mutationFn: ({ id, data }) => updateSpecialty(id, data),
        onSuccess: (updatedSpecialty, { id }) => {
            queryClient.setQueryData(specialtyKeys.detail(id), updatedSpecialty);
            queryClient.invalidateQueries({ queryKey: specialtyKeys.lists() });
            toast.success("Spécialité mise à jour");
        },
        onError: (error) => {
            toast.error(error.message || "Erreur lors de la mise à jour");
        },
    });
}

/**
 * Delete a specialty
 */
export function useDeleteSpecialty() {
    const queryClient = useQueryClient();

    return useMutation<void, Error, string>({
        mutationFn: deleteSpecialty,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: specialtyKeys.lists() });
            toast.success("Spécialité supprimée");
        },
        onError: (error) => {
            toast.error(error.message || "Erreur lors de la suppression");
        },
    });
}

/**
 * Activate a specialty
 */
export function useActivateSpecialty() {
    const queryClient = useQueryClient();

    return useMutation<Specialty, Error, string>({
        mutationFn: activateSpecialty,
        onSuccess: (updatedSpecialty, id) => {
            queryClient.setQueryData(specialtyKeys.detail(id), updatedSpecialty);
            queryClient.invalidateQueries({ queryKey: specialtyKeys.lists() });
            toast.success("Spécialité activée");
        },
        onError: (error) => {
            toast.error(error.message || "Erreur lors de l'activation");
        },
    });
}

/**
 * Deactivate a specialty
 */
export function useDeactivateSpecialty() {
    const queryClient = useQueryClient();

    return useMutation<Specialty, Error, string>({
        mutationFn: deactivateSpecialty,
        onSuccess: (updatedSpecialty, id) => {
            queryClient.setQueryData(specialtyKeys.detail(id), updatedSpecialty);
            queryClient.invalidateQueries({ queryKey: specialtyKeys.lists() });
            toast.success("Spécialité désactivée");
        },
        onError: (error) => {
            toast.error(error.message || "Erreur lors de la désactivation");
        },
    });
}

