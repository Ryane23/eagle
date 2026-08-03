import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
    getPermissions,
    getPermissionsByResource,
    getRoles,
    getRolePermissions,
    getPermissionById,
    createPermission,
    updatePermission,
    togglePermission,
    deletePermission,
    assignPermissionsToRole,
    type Permission,
    type RolePermissions,
    type CreatePermissionDto,
    type UpdatePermissionDto,
    type AssignPermissionsDto,
} from "@/actions/permissions";

// ============ Query Keys ============

export const permissionKeys = {
    all: ["permissions"] as const,
    lists: () => [...permissionKeys.all, "list"] as const,
    list: (active?: boolean) => [...permissionKeys.lists(), { active }] as const,
    byResource: (resource: string) => [...permissionKeys.all, "resource", resource] as const,
    roles: () => [...permissionKeys.all, "roles"] as const,
    role: (role: string) => [...permissionKeys.roles(), role] as const,
    details: () => [...permissionKeys.all, "detail"] as const,
    detail: (id: string) => [...permissionKeys.details(), id] as const,
};

// ============ Queries ============

export function usePermissionsQuery(active?: boolean) {
    return useQuery<Permission[], Error>({
        queryKey: permissionKeys.list(active),
        queryFn: () => getPermissions(active),
        staleTime: 5 * 60 * 1000,
    });
}

export function usePermissionsByResourceQuery(resource: string) {
    return useQuery<Permission[], Error>({
        queryKey: permissionKeys.byResource(resource),
        queryFn: () => getPermissionsByResource(resource),
        enabled: !!resource,
        staleTime: 5 * 60 * 1000,
    });
}

export function useRolesQuery() {
    return useQuery<RolePermissions[], Error>({
        queryKey: permissionKeys.roles(),
        queryFn: getRoles,
        staleTime: 5 * 60 * 1000,
    });
}

export function useRolePermissionsQuery(role: string) {
    return useQuery<RolePermissions, Error>({
        queryKey: permissionKeys.role(role),
        queryFn: () => getRolePermissions(role),
        enabled: !!role,
        staleTime: 5 * 60 * 1000,
    });
}

export function usePermissionQuery(id: string) {
    return useQuery<Permission, Error>({
        queryKey: permissionKeys.detail(id),
        queryFn: () => getPermissionById(id),
        enabled: !!id,
    });
}

// ============ Mutations ============

export function useCreatePermission() {
    const queryClient = useQueryClient();
    return useMutation<Permission, Error, CreatePermissionDto>({
        mutationFn: createPermission,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: permissionKeys.all });
            toast.success("Permission créée avec succès!");
        },
        onError: (error) => {
            toast.error(error.message || "Erreur lors de la création");
        },
    });
}

export function useUpdatePermission() {
    const queryClient = useQueryClient();
    return useMutation<Permission, Error, { id: string; data: UpdatePermissionDto }>({
        mutationFn: ({ id, data }) => updatePermission(id, data),
        onSuccess: (_, { id }) => {
            queryClient.invalidateQueries({ queryKey: permissionKeys.all });
            queryClient.invalidateQueries({ queryKey: permissionKeys.detail(id) });
            toast.success("Permission mise à jour!");
        },
        onError: (error) => {
            toast.error(error.message || "Erreur lors de la mise à jour");
        },
    });
}

export function useTogglePermission() {
    const queryClient = useQueryClient();
    return useMutation<Permission, Error, string>({
        mutationFn: togglePermission,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: permissionKeys.all });
            toast.success("Permission basculée!");
        },
        onError: (error) => {
            toast.error(error.message || "Erreur lors du basculement");
        },
    });
}

export function useDeletePermission() {
    const queryClient = useQueryClient();
    return useMutation<void, Error, string>({
        mutationFn: deletePermission,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: permissionKeys.all });
            toast.success("Permission supprimée!");
        },
        onError: (error) => {
            toast.error(error.message || "Erreur lors de la suppression");
        },
    });
}

export function useAssignPermissionsToRole() {
    const queryClient = useQueryClient();
    return useMutation<void, Error, AssignPermissionsDto>({
        mutationFn: assignPermissionsToRole,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: permissionKeys.roles() });
            toast.success("Permissions assignées!");
        },
        onError: (error) => {
            toast.error(error.message || "Erreur lors de l'assignation");
        },
    });
}
