import apiClient, { getErrorMessage } from "@/lib/api-client";

// ============ Types ============

export type PermissionResource = "patients" | "consultations" | "urgencies" | "prescriptions" | "reports" | "users" | "hospitals" | "files" | "queue" | "system" | "analytics";
export type PermissionAction = "create" | "read" | "update" | "delete" | "manage" | "assign" | "approve" | "reject";

export type Permission = {
    id: string;
    name: string;
    description: string;
    resource: PermissionResource;
    action: PermissionAction;
    conditions?: Record<string, unknown>;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
};

export type CreatePermissionDto = {
    name: string;
    description: string;
    resource: PermissionResource;
    action: PermissionAction;
    conditions?: Record<string, unknown>;
};

export type UpdatePermissionDto = Partial<CreatePermissionDto> & {
    isActive?: boolean;
};

export type AssignPermissionsDto = {
    role: string;
    permissionIds: string[];
};

export type RolePermissions = {
    role: string;
    permissions: Permission[];
};

// ============ API Functions ============

export async function createPermission(data: CreatePermissionDto): Promise<Permission> {
    try {
        const response = await apiClient.post<Permission>("/permissions", data);
        return response.data;
    } catch (error) {
        throw new Error(getErrorMessage(error));
    }
}

export async function getPermissions(active?: boolean): Promise<Permission[]> {
    try {
        const response = await apiClient.get<Permission[]>("/permissions", {
            params: active !== undefined ? { active: String(active) } : undefined,
        });
        return response.data;
    } catch (error) {
        throw new Error(getErrorMessage(error));
    }
}

export async function getPermissionsByResource(resource: string): Promise<Permission[]> {
    try {
        const response = await apiClient.get<Permission[]>(`/permissions/resource/${resource}`);
        return response.data;
    } catch (error) {
        throw new Error(getErrorMessage(error));
    }
}

export async function getRoles(): Promise<RolePermissions[]> {
    try {
        const response = await apiClient.get<RolePermissions[]>("/permissions/roles");
        return response.data;
    } catch (error) {
        throw new Error(getErrorMessage(error));
    }
}

export async function getRolePermissions(role: string): Promise<RolePermissions> {
    try {
        const response = await apiClient.get<RolePermissions>(`/permissions/roles/${role}`);
        return response.data;
    } catch (error) {
        throw new Error(getErrorMessage(error));
    }
}

export async function assignPermissionsToRole(data: AssignPermissionsDto): Promise<void> {
    try {
        await apiClient.post("/permissions/roles/assign", data);
    } catch (error) {
        throw new Error(getErrorMessage(error));
    }
}

export async function getPermissionById(id: string): Promise<Permission> {
    try {
        const response = await apiClient.get<Permission>(`/permissions/${id}`);
        return response.data;
    } catch (error) {
        throw new Error(getErrorMessage(error));
    }
}

export async function updatePermission(id: string, data: UpdatePermissionDto): Promise<Permission> {
    try {
        const response = await apiClient.patch<Permission>(`/permissions/${id}`, data);
        return response.data;
    } catch (error) {
        throw new Error(getErrorMessage(error));
    }
}

export async function togglePermission(id: string): Promise<Permission> {
    try {
        const response = await apiClient.patch<Permission>(`/permissions/${id}/toggle`);
        return response.data;
    } catch (error) {
        throw new Error(getErrorMessage(error));
    }
}

export async function deletePermission(id: string): Promise<void> {
    try {
        await apiClient.delete(`/permissions/${id}`);
    } catch (error) {
        throw new Error(getErrorMessage(error));
    }
}
