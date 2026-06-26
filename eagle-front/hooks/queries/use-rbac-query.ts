import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
    getRbacPermissions,
    getRbacPermissionById,
    getRbacPermissionsByResource,
    createRbacPermission,
    deleteRbacPermission,
    assignRbacPermission,
    removeRolePermission,
    getRoleRbacPermissions,
    getPermissionRoles,
    type RbacPermission,
    type CreateRbacPermissionDto,
    type AssignRbacPermissionDto,
    type RolePermissionMapping,
} from "@/actions/rbac";

// ============ Query Keys ============

export const rbacKeys = {
    all: ["rbac"] as const,
    permissions: () => [...rbacKeys.all, "permissions"] as const,
    permissionDetail: (id: string) => [...rbacKeys.permissions(), id] as const,
    permissionsByResource: (resource: string) => [...rbacKeys.permissions(), "resource", resource] as const,
    rolePermissions: (roleId: string) => [...rbacKeys.all, "role", roleId, "permissions"] as const,
    permissionRoles: (permissionId: string) => [...rbacKeys.permissions(), permissionId, "roles"] as const,
};

// ============ Queries ============

export function useRbacPermissionsQuery() {
    return useQuery<RbacPermission[], Error>({
        queryKey: rbacKeys.permissions(),
        queryFn: getRbacPermissions,
        staleTime: 5 * 60 * 1000,
    });
}

export function useRbacPermissionQuery(id: string) {
    return useQuery<RbacPermission, Error>({
        queryKey: rbacKeys.permissionDetail(id),
        queryFn: () => getRbacPermissionById(id),
        enabled: !!id,
    });
}

export function useRbacPermissionsByResourceQuery(resource: string) {
    return useQuery<RbacPermission[], Error>({
        queryKey: rbacKeys.permissionsByResource(resource),
        queryFn: () => getRbacPermissionsByResource(resource),
        enabled: !!resource,
    });
}

export function useRoleRbacPermissionsQuery(roleId: string) {
    return useQuery<RolePermissionMapping[], Error>({
        queryKey: rbacKeys.rolePermissions(roleId),
        queryFn: () => getRoleRbacPermissions(roleId),
        enabled: !!roleId,
        staleTime: 5 * 60 * 1000,
    });
}

export function usePermissionRolesQuery(permissionId: string) {
    return useQuery<RolePermissionMapping[], Error>({
        queryKey: rbacKeys.permissionRoles(permissionId),
        queryFn: () => getPermissionRoles(permissionId),
        enabled: !!permissionId,
    });
}

// ============ Mutations ============

export function useCreateRbacPermission() {
    const queryClient = useQueryClient();
    return useMutation<RbacPermission, Error, CreateRbacPermissionDto>({
        mutationFn: createRbacPermission,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: rbacKeys.permissions() });
            toast.success("Permission RBAC créée!");
        },
        onError: (error) => {
            toast.error(error.message || "Erreur lors de la création");
        },
    });
}

export function useDeleteRbacPermission() {
    const queryClient = useQueryClient();
    return useMutation<void, Error, string>({
        mutationFn: deleteRbacPermission,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: rbacKeys.all });
            toast.success("Permission RBAC supprimée!");
        },
        onError: (error) => {
            toast.error(error.message || "Erreur lors de la suppression");
        },
    });
}

export function useAssignRbacPermission() {
    const queryClient = useQueryClient();
    return useMutation<RolePermissionMapping, Error, AssignRbacPermissionDto>({
        mutationFn: assignRbacPermission,
        onSuccess: (_, { roleId }) => {
            queryClient.invalidateQueries({ queryKey: rbacKeys.rolePermissions(roleId) });
            toast.success("Permission assignée au rôle!");
        },
        onError: (error) => {
            toast.error(error.message || "Erreur lors de l'assignation");
        },
    });
}

export function useRemoveRolePermission() {
    const queryClient = useQueryClient();
    return useMutation<void, Error, { roleId: string; permissionId: string }>({
        mutationFn: ({ roleId, permissionId }) => removeRolePermission(roleId, permissionId),
        onSuccess: (_, { roleId }) => {
            queryClient.invalidateQueries({ queryKey: rbacKeys.rolePermissions(roleId) });
            toast.success("Permission retirée du rôle!");
        },
        onError: (error) => {
            toast.error(error.message || "Erreur lors du retrait");
        },
    });
}
