import apiClient, { getErrorMessage } from "@/lib/api-client";

// ============ Types ============

export type RuleResource = "patients" | "consultations" | "urgencies" | "prescriptions" | "reports" | "queue" | "system";
export type RuleAction = "create" | "read" | "update" | "delete" | "manage" | "approve" | "reject" | "assign";
export type UserRole = "admin" | "primary_secretary" | "secondary_secretary" | "nurse" | "doctor";

export type Rule = {
    id: string;
    name: string;
    description?: string;
    role: UserRole;
    resource: RuleResource;
    action: RuleAction;
    conditions?: Record<string, unknown>;
    isActive: boolean;
    createdBy?: string;
    createdAt: string;
    updatedAt: string;
};

export type CreateRuleDto = {
    name: string;
    description?: string;
    role: UserRole;
    resource: RuleResource;
    action: RuleAction;
    conditions?: Record<string, unknown>;
};

export type UpdateRuleDto = Partial<CreateRuleDto> & {
    isActive?: boolean;
};

// ============ API Functions ============

export async function createRule(data: CreateRuleDto): Promise<Rule> {
    try {
        const response = await apiClient.post<Rule>("/rules", data);
        return response.data;
    } catch (error) {
        throw new Error(getErrorMessage(error));
    }
}

export async function getRules(role?: UserRole, activeOnly?: boolean): Promise<Rule[]> {
    try {
        const params: Record<string, string> = {};
        if (role) params.role = role;
        if (activeOnly !== undefined) params.activeOnly = String(activeOnly);
        const response = await apiClient.get<Rule[]>("/rules", {
            params: Object.keys(params).length > 0 ? params : undefined,
        });
        return response.data;
    } catch (error) {
        throw new Error(getErrorMessage(error));
    }
}

export async function getRuleById(id: string): Promise<Rule> {
    try {
        const response = await apiClient.get<Rule>(`/rules/${id}`);
        return response.data;
    } catch (error) {
        throw new Error(getErrorMessage(error));
    }
}

export async function updateRule(id: string, data: UpdateRuleDto): Promise<Rule> {
    try {
        const response = await apiClient.patch<Rule>(`/rules/${id}`, data);
        return response.data;
    } catch (error) {
        throw new Error(getErrorMessage(error));
    }
}

export async function activateRule(id: string): Promise<Rule> {
    try {
        const response = await apiClient.patch<Rule>(`/rules/${id}/activate`);
        return response.data;
    } catch (error) {
        throw new Error(getErrorMessage(error));
    }
}

export async function deactivateRule(id: string): Promise<Rule> {
    try {
        const response = await apiClient.patch<Rule>(`/rules/${id}/deactivate`);
        return response.data;
    } catch (error) {
        throw new Error(getErrorMessage(error));
    }
}

export async function deleteRule(id: string): Promise<void> {
    try {
        await apiClient.delete(`/rules/${id}`);
    } catch (error) {
        throw new Error(getErrorMessage(error));
    }
}
