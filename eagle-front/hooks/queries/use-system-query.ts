import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { SystemSettings, MaintenanceStatus, UpdateSystemSettingsDto } from "@/types/api";
import {
    getSystemSettings,
    updateSystemSettings,
    checkMaintenanceMode,
    toggleMaintenanceMode,
} from "@/actions/system";

// Query Keys
export const systemKeys = {
    all: ["system"] as const,
    settings: () => [...systemKeys.all, "settings"] as const,
    maintenance: () => [...systemKeys.all, "maintenance"] as const,
};

// --- Queries ---

export function useSystemSettingsQuery() {
    return useQuery<SystemSettings, Error>({
        queryKey: systemKeys.settings(),
        queryFn: getSystemSettings,
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 10 * 60 * 1000, // 10 minutes
    });
}

export function useMaintenanceModeQuery() {
    return useQuery<MaintenanceStatus, Error>({
        queryKey: systemKeys.maintenance(),
        queryFn: checkMaintenanceMode,
        staleTime: 30 * 1000, // 30 seconds
        gcTime: 2 * 60 * 1000, // 2 minutes
    });
}

// --- Mutations ---

export function useUpdateSystemSettings() {
    const queryClient = useQueryClient();
    return useMutation<SystemSettings, Error, UpdateSystemSettingsDto>({
        mutationFn: updateSystemSettings,
        onSuccess: (updatedSettings) => {
            queryClient.setQueryData(systemKeys.settings(), updatedSettings);
            toast.success("Paramètres mis à jour!");
        },
        onError: (error) => {
            toast.error(error.message || "Erreur lors de la mise à jour");
        },
    });
}

export function useToggleMaintenanceMode() {
    const queryClient = useQueryClient();
    return useMutation<MaintenanceStatus, Error, void>({
        mutationFn: toggleMaintenanceMode,
        onSuccess: (newStatus) => {
            queryClient.setQueryData(systemKeys.maintenance(), newStatus);
            toast.success(
                newStatus.isMaintenanceMode
                    ? "Mode maintenance activé!"
                    : "Mode maintenance désactivé!"
            );
        },
        onError: (error) => {
            queryClient.invalidateQueries({ queryKey: systemKeys.maintenance() });
            toast.error(error.message || "Erreur lors du changement");
        },
    });
}
