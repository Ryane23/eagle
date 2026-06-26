import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
    getSystemModules,
    getEnabledModules,
    getMyHospitalModules,
    getCoreModules,
    getModulesByCategory,
    getSystemModuleById,
    getHospitalModuleConfigs,
    createSystemModule,
    updateSystemModule,
    toggleSystemModule,
    updateHospitalModuleConfig,
    deleteSystemModule,
    type SystemModule,
    type HospitalModuleConfig,
    type CreateSystemModuleDto,
    type UpdateSystemModuleDto,
    type UpdateHospitalModuleConfigDto,
    type ModuleCategory,
} from "@/actions/system-modules";

// ============ Query Keys ============

export const systemModuleKeys = {
    all: ["system-modules"] as const,
    lists: () => [...systemModuleKeys.all, "list"] as const,
    enabled: () => [...systemModuleKeys.all, "enabled"] as const,
    myHospital: () => [...systemModuleKeys.all, "my-hospital"] as const,
    core: () => [...systemModuleKeys.all, "core"] as const,
    byCategory: (cat: ModuleCategory) => [...systemModuleKeys.all, "category", cat] as const,
    details: () => [...systemModuleKeys.all, "detail"] as const,
    detail: (id: string) => [...systemModuleKeys.details(), id] as const,
    hospitalConfigs: (hospitalId: string) => [...systemModuleKeys.all, "hospital", hospitalId, "configs"] as const,
};

// ============ Queries ============

export function useSystemModulesQuery() {
    return useQuery<SystemModule[], Error>({
        queryKey: systemModuleKeys.lists(),
        queryFn: getSystemModules,
        staleTime: 5 * 60 * 1000,
    });
}

export function useEnabledModulesQuery() {
    return useQuery<SystemModule[], Error>({
        queryKey: systemModuleKeys.enabled(),
        queryFn: getEnabledModules,
        staleTime: 5 * 60 * 1000,
    });
}

export function useMyHospitalModulesQuery() {
    return useQuery<SystemModule[], Error>({
        queryKey: systemModuleKeys.myHospital(),
        queryFn: getMyHospitalModules,
        staleTime: 5 * 60 * 1000,
    });
}

export function useCoreModulesQuery() {
    return useQuery<SystemModule[], Error>({
        queryKey: systemModuleKeys.core(),
        queryFn: getCoreModules,
        staleTime: 5 * 60 * 1000,
    });
}

export function useModulesByCategoryQuery(category: ModuleCategory) {
    return useQuery<SystemModule[], Error>({
        queryKey: systemModuleKeys.byCategory(category),
        queryFn: () => getModulesByCategory(category),
        enabled: !!category,
    });
}

export function useSystemModuleQuery(id: string) {
    return useQuery<SystemModule, Error>({
        queryKey: systemModuleKeys.detail(id),
        queryFn: () => getSystemModuleById(id),
        enabled: !!id,
    });
}

export function useHospitalModuleConfigsQuery(hospitalId: string) {
    return useQuery<HospitalModuleConfig[], Error>({
        queryKey: systemModuleKeys.hospitalConfigs(hospitalId),
        queryFn: () => getHospitalModuleConfigs(hospitalId),
        enabled: !!hospitalId,
        staleTime: 5 * 60 * 1000,
    });
}

// ============ Mutations ============

export function useCreateSystemModule() {
    const queryClient = useQueryClient();
    return useMutation<SystemModule, Error, CreateSystemModuleDto>({
        mutationFn: createSystemModule,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: systemModuleKeys.all });
            toast.success("Module créé avec succès!");
        },
        onError: (error) => {
            toast.error(error.message || "Erreur lors de la création");
        },
    });
}

export function useUpdateSystemModule() {
    const queryClient = useQueryClient();
    return useMutation<SystemModule, Error, { id: string; data: UpdateSystemModuleDto }>({
        mutationFn: ({ id, data }) => updateSystemModule(id, data),
        onSuccess: (_, { id }) => {
            queryClient.invalidateQueries({ queryKey: systemModuleKeys.all });
            queryClient.invalidateQueries({ queryKey: systemModuleKeys.detail(id) });
            toast.success("Module mis à jour!");
        },
        onError: (error) => {
            toast.error(error.message || "Erreur lors de la mise à jour");
        },
    });
}

export function useToggleSystemModule() {
    const queryClient = useQueryClient();
    return useMutation<SystemModule, Error, string>({
        mutationFn: toggleSystemModule,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: systemModuleKeys.all });
            toast.success("Module basculé!");
        },
        onError: (error) => {
            toast.error(error.message || "Erreur lors du basculement");
        },
    });
}

export function useUpdateHospitalModuleConfig() {
    const queryClient = useQueryClient();
    return useMutation<HospitalModuleConfig, Error, UpdateHospitalModuleConfigDto>({
        mutationFn: updateHospitalModuleConfig,
        onSuccess: (_, { hospitalId }) => {
            queryClient.invalidateQueries({ queryKey: systemModuleKeys.hospitalConfigs(hospitalId) });
            toast.success("Configuration mise à jour!");
        },
        onError: (error) => {
            toast.error(error.message || "Erreur lors de la mise à jour");
        },
    });
}

export function useDeleteSystemModule() {
    const queryClient = useQueryClient();
    return useMutation<void, Error, string>({
        mutationFn: deleteSystemModule,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: systemModuleKeys.all });
            toast.success("Module supprimé!");
        },
        onError: (error) => {
            toast.error(error.message || "Erreur lors de la suppression");
        },
    });
}
