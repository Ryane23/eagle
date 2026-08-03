import apiClient, { getErrorMessage } from "@/lib/api-client";

// ============ Types ============

export type ModuleCategory = "core" | "clinical" | "administrative" | "communication" | "reporting" | "support";

export type SystemModule = {
    id: string;
    name: string;
    displayName: string;
    description: string;
    category: ModuleCategory;
    isCore: boolean;
    isEnabled: boolean;
    features?: string[];
    dependencies?: string[];
    order?: number;
    icon?: string;
    createdBy?: string;
    createdAt: string;
    updatedAt: string;
};

export type HospitalModuleConfig = {
    id: string;
    hospitalId: string;
    moduleId: string;
    isEnabled: boolean;
    customSettings?: Record<string, unknown>;
    module?: SystemModule;
    createdAt: string;
    updatedAt: string;
};

export type CreateSystemModuleDto = {
    name: string;
    displayName: string;
    description: string;
    category: ModuleCategory;
    isCore: boolean;
    features?: string[];
    dependencies?: string[];
    order?: number;
    icon?: string;
};

export type UpdateSystemModuleDto = Partial<CreateSystemModuleDto> & {
    isEnabled?: boolean;
};

export type UpdateHospitalModuleConfigDto = {
    hospitalId: string;
    moduleId: string;
    isEnabled: boolean;
    customSettings?: Record<string, unknown>;
};

// ============ API Functions ============

export async function createSystemModule(data: CreateSystemModuleDto): Promise<SystemModule> {
    try {
        const response = await apiClient.post<SystemModule>("/system-modules", data);
        return response.data;
    } catch (error) {
        throw new Error(getErrorMessage(error));
    }
}

export async function getSystemModules(): Promise<SystemModule[]> {
    try {
        const response = await apiClient.get<SystemModule[]>("/system-modules");
        return response.data;
    } catch (error) {
        throw new Error(getErrorMessage(error));
    }
}

export async function getEnabledModules(): Promise<SystemModule[]> {
    try {
        const response = await apiClient.get<SystemModule[]>("/system-modules/enabled");
        return response.data;
    } catch (error) {
        throw new Error(getErrorMessage(error));
    }
}

export async function getMyHospitalModules(): Promise<SystemModule[]> {
    try {
        const response = await apiClient.get<SystemModule[]>("/system-modules/my-hospital");
        return response.data;
    } catch (error) {
        throw new Error(getErrorMessage(error));
    }
}

export async function getCoreModules(): Promise<SystemModule[]> {
    try {
        const response = await apiClient.get<SystemModule[]>("/system-modules/core");
        return response.data;
    } catch (error) {
        throw new Error(getErrorMessage(error));
    }
}

export async function getModulesByCategory(category: ModuleCategory): Promise<SystemModule[]> {
    try {
        const response = await apiClient.get<SystemModule[]>(`/system-modules/category/${category}`);
        return response.data;
    } catch (error) {
        throw new Error(getErrorMessage(error));
    }
}

export async function getSystemModuleById(id: string): Promise<SystemModule> {
    try {
        const response = await apiClient.get<SystemModule>(`/system-modules/${id}`);
        return response.data;
    } catch (error) {
        throw new Error(getErrorMessage(error));
    }
}

export async function getHospitalModuleConfigs(hospitalId: string): Promise<HospitalModuleConfig[]> {
    try {
        const response = await apiClient.get<HospitalModuleConfig[]>(`/system-modules/hospital/${hospitalId}/configs`);
        return response.data;
    } catch (error) {
        throw new Error(getErrorMessage(error));
    }
}

export async function updateSystemModule(id: string, data: UpdateSystemModuleDto): Promise<SystemModule> {
    try {
        const response = await apiClient.patch<SystemModule>(`/system-modules/${id}`, data);
        return response.data;
    } catch (error) {
        throw new Error(getErrorMessage(error));
    }
}

export async function toggleSystemModule(id: string): Promise<SystemModule> {
    try {
        const response = await apiClient.patch<SystemModule>(`/system-modules/${id}/toggle`);
        return response.data;
    } catch (error) {
        throw new Error(getErrorMessage(error));
    }
}

export async function updateHospitalModuleConfig(data: UpdateHospitalModuleConfigDto): Promise<HospitalModuleConfig> {
    try {
        const response = await apiClient.post<HospitalModuleConfig>("/system-modules/hospital-config", data);
        return response.data;
    } catch (error) {
        throw new Error(getErrorMessage(error));
    }
}

export async function deleteHospitalModuleConfig(hospitalId: string, moduleId: string): Promise<void> {
    try {
        await apiClient.delete(`/system-modules/hospital-config/${hospitalId}/${moduleId}`);
    } catch (error) {
        throw new Error(getErrorMessage(error));
    }
}

export async function deleteSystemModule(id: string): Promise<void> {
    try {
        await apiClient.delete(`/system-modules/${id}`);
    } catch (error) {
        throw new Error(getErrorMessage(error));
    }
}
