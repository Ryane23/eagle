import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { Hospital, HospitalType, CreateHospitalDto, UpdateHospitalDto } from "@/types/api";
import {
    getHospitals,
    getHospitalById,
    getHospitalsByType,
    getPrimaryCenter,
    createHospital,
    updateHospital,
    deleteHospital,
    activateHospital,
    deactivateHospital,
} from "@/actions/hospitals";

// Query Keys
export const hospitalKeys = {
    all: ["hospitals"] as const,
    lists: () => [...hospitalKeys.all, "list"] as const,
    list: (filters: string) => [...hospitalKeys.lists(), { filters }] as const,
    details: () => [...hospitalKeys.all, "detail"] as const,
    detail: (id: string) => [...hospitalKeys.details(), id] as const,
    byType: (type: HospitalType) => [...hospitalKeys.all, "type", type] as const,
};

// Filter type
export type HospitalsQueryFilters = {
    type?: HospitalType;
    status?: "all" | "active" | "inactive";
    search?: string;
};

// --- Queries ---

export function useHospitalsQuery(filters?: HospitalsQueryFilters) {
    return useQuery<Hospital[], Error>({
        queryKey: hospitalKeys.list(JSON.stringify(filters)),
        queryFn: async () => {
            let hospitals: Hospital[];

            if (filters?.type) {
                hospitals = await getHospitalsByType(filters.type);
            } else {
                hospitals = await getHospitals();
            }

            // Client-side filters
            if (filters?.status && filters.status !== "all") {
                const isActive = filters.status === "active";
                hospitals = hospitals.filter((h) => h.isActive === isActive);
            }

            if (filters?.search) {
                const search = filters.search.toLowerCase();
                hospitals = hospitals.filter(
                    (h) =>
                        h.name.toLowerCase().includes(search) ||
                        h.city?.toLowerCase().includes(search)
                );
            }

            return hospitals;
        },
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 10 * 60 * 1000, // 10 minutes
    });
}

export function useHospitalQuery(id: string) {
    return useQuery<Hospital, Error>({
        queryKey: hospitalKeys.detail(id),
        queryFn: () => getHospitalById(id),
        enabled: !!id,
        staleTime: 5 * 60 * 1000,
        gcTime: 10 * 60 * 1000,
    });
}

export function useHospitalsByTypeQuery(type: HospitalType) {
    return useQuery<Hospital[], Error>({
        queryKey: hospitalKeys.byType(type),
        queryFn: () => getHospitalsByType(type),
        staleTime: 5 * 60 * 1000,
        gcTime: 10 * 60 * 1000,
    });
}

export function usePrimaryCenterQuery() {
    return useQuery<Hospital, Error>({
        queryKey: [...hospitalKeys.all, "primary-center"] as const,
        queryFn: () => getPrimaryCenter(),
        staleTime: 10 * 60 * 1000,
        gcTime: 30 * 60 * 1000,
    });
}

// --- Stats derived from query ---

export function useHospitalStats() {
    const { data: hospitals = [] } = useHospitalsQuery();

    return {
        total: hospitals.length,
        active: hospitals.filter((h) => h.isActive).length,
        inactive: hospitals.filter((h) => !h.isActive).length,
        primary: hospitals.filter((h) => h.type === "PRIMARY").length,
        secondary: hospitals.filter((h) => h.type === "SECONDARY").length,
    };
}

// --- Mutations ---

export function useCreateHospital() {
    const queryClient = useQueryClient();
    return useMutation<Hospital, Error, CreateHospitalDto>({
        mutationFn: createHospital,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: hospitalKeys.lists() });
            toast.success("Centre créé avec succès!");
        },
        onError: (error) => {
            toast.error(error.message || "Erreur lors de la création");
        },
    });
}

export function useUpdateHospital() {
    const queryClient = useQueryClient();
    return useMutation<Hospital, Error, { id: string; data: UpdateHospitalDto }>({
        mutationFn: ({ id, data }) => updateHospital(id, data),
        onSuccess: (updatedHospital, { id }) => {
            queryClient.invalidateQueries({ queryKey: hospitalKeys.lists() });
            queryClient.setQueryData(hospitalKeys.detail(id), updatedHospital);
            toast.success("Centre mis à jour!");
        },
        onError: (error) => {
            toast.error(error.message || "Erreur lors de la mise à jour");
        },
    });
}

export function useDeleteHospital() {
    const queryClient = useQueryClient();
    return useMutation<void, Error, string>({
        mutationFn: deleteHospital,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: hospitalKeys.lists() });
            toast.success("Centre supprimé!");
        },
        onError: (error) => {
            toast.error(error.message || "Erreur lors de la suppression");
        },
    });
}

export function useActivateHospital() {
    const queryClient = useQueryClient();
    return useMutation<Hospital, Error, string>({
        mutationFn: activateHospital,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: hospitalKeys.lists() });
            toast.success("Centre activé!");
        },
        onError: (error) => {
            toast.error(error.message || "Erreur lors de l'activation");
        },
    });
}

export function useDeactivateHospital() {
    const queryClient = useQueryClient();
    return useMutation<Hospital, Error, string>({
        mutationFn: deactivateHospital,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: hospitalKeys.lists() });
            toast.success("Centre désactivé!");
        },
        onError: (error) => {
            toast.error(error.message || "Erreur lors de la désactivation");
        },
    });
}
