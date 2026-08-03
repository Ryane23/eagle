import apiClient, { getErrorMessage } from "@/lib/api-client";

// ============ Types ============

export type ResourceType = "patients" | "consultations" | "urgencies" | "prescriptions" | "reports" | "users" | "hospitals" | "files" | "queue" | "system" | "analytics";
export type ActionType = "create" | "read" | "update" | "delete" | "manage" | "assign" | "approve" | "reject";

export type RbacPermission = {
    id: string;
    resource: ResourceType;
    action: ActionType;
    description?: string;
    createdAt: string;
    updatedAt: string;
};

export type CreateRbacPermissionDto = {
    resource: ResourceType;
    action: ActionType;
    description?: string;
};

export type AssignRbacPermissionDto = {
    roleId: string;
    permissionId: string;
    conditions?: Record<string, unknown>;
};

export type RolePermissionMapping = {
    roleId: string;
    permissionId: string;
    conditions?: Record<string, unknown>;
    permission?: RbacPermission;
};

// ============ API Functions ============

export async function createRbacPermission(data: CreateRbacPermissionDto): Promise<RbacPermission> {
    try {
        const response = await apiClient.post<RbacPermission>("/rbac/permissions", data);
        return response.data;
    } catch (error) {
        throw new Error(getErrorMessage(error));
    }
}

export async function getRbacPermissions(): Promise<RbacPermission[]> {
    try {
        const response = await apiClient.get<RbacPermission[]>("/rbac/permissions");
        return response.data;
    } catch (error) {
        throw new Error(getErrorMessage(error));
    }
}

export async function getRbacPermissionById(id: string): Promise<RbacPermission> {
    try {
        const response = await apiClient.get<RbacPermission>(`/rbac/permissions/${id}`);
        return response.data;
    } catch (error) {
        throw new Error(getErrorMessage(error));
    }
}

export async function getRbacPermissionsByResource(resource: string): Promise<RbacPermission[]> {
    try {
        const response = await apiClient.get<RbacPermission[]>(`/rbac/permissions/resource/${resource}`);
        return response.data;
    } catch (error) {
        throw new Error(getErrorMessage(error));
    }
}

export async function deleteRbacPermission(id: string): Promise<void> {
    try {
        await apiClient.delete(`/rbac/permissions/${id}`);
    } catch (error) {
        throw new Error(getErrorMessage(error));
    }
}

export async function assignRbacPermission(data: AssignRbacPermissionDto): Promise<RolePermissionMapping> {
    try {
        const response = await apiClient.post<RolePermissionMapping>("/rbac/roles/permissions", data);
        return response.data;
    } catch (error) {
        throw new Error(getErrorMessage(error));
    }
}

export async function removeRolePermission(roleId: string, permissionId: string): Promise<void> {
    try {
        await apiClient.delete(`/rbac/roles/${roleId}/permissions/${permissionId}`);
    } catch (error) {
        throw new Error(getErrorMessage(error));
    }
}

export async function getRoleRbacPermissions(roleId: string): Promise<RolePermissionMapping[]> {
    try {
        const response = await apiClient.get<RolePermissionMapping[]>(`/rbac/roles/${roleId}/permissions`);
        return response.data;
    } catch (error) {
        throw new Error(getErrorMessage(error));
    }
}

export async function checkRoleHasPermission(roleId: string, resource: string, action: string): Promise<boolean> {
    try {
        const response = await apiClient.get<{ hasPermission: boolean }>(`/rbac/roles/${roleId}/has-permission`, {
            params: { resource, action },
        });
        return response.data.hasPermission;
    } catch (error) {
        throw new Error(getErrorMessage(error));
    }
}

export async function getPermissionRoles(permissionId: string): Promise<RolePermissionMapping[]> {
    try {
        const response = await apiClient.get<RolePermissionMapping[]>(`/rbac/permissions/${permissionId}/roles`);
        return response.data;
    } catch (error) {
        throw new Error(getErrorMessage(error));
    }
}
