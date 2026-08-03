import apiClient, { getErrorMessage } from "@/lib/api-client";

// ============ Types ============

export type ActivityType = "login" | "logout" | "create" | "update" | "delete" | "view" | "download" | "upload" | "approve" | "reject" | "assign";
export type ActivityResource = "patient" | "consultation" | "urgency" | "prescription" | "user" | "hospital" | "file" | "report" | "queue" | "system";

export type Activity = {
    id: string;
    type: ActivityType;
    resource: ActivityResource;
    resourceId?: string;
    description: string;
    userId: string;
    user?: { id: string; name: string; role: string };
    hospitalId: string | null;
    metadata?: Record<string, unknown>;
    ipAddress?: string;
    userAgent?: string;
    createdAt: unknown;
    timestamp?: unknown;
};

export type CreateActivityDto = {
    type: ActivityType;
    resource: ActivityResource;
    resourceId?: string;
    description: string;
    metadata?: Record<string, unknown>;
    ipAddress?: string;
    userAgent?: string;
};

export type ActivityStats = {
    totalActivities: number;
    byType: Record<string, number>;
    byResource: Record<string, number>;
};

// ============ API Functions ============

export async function createActivity(data: CreateActivityDto): Promise<Activity> {
    try {
        const response = await apiClient.post<Activity>("/activities", data);
        return response.data;
    } catch (error) {
        throw new Error(getErrorMessage(error));
    }
}

export async function getActivities(limit?: number): Promise<Activity[]> {
    try {
        const response = await apiClient.get<Activity[]>("/activities", {
            params: limit ? { limit: String(limit) } : undefined,
        });
        return response.data;
    } catch (error) {
        throw new Error(getErrorMessage(error));
    }
}

export async function getMyActivities(limit?: number): Promise<Activity[]> {
    try {
        const response = await apiClient.get<Activity[]>("/activities/my", {
            params: limit ? { limit: String(limit) } : undefined,
        });
        return response.data;
    } catch (error) {
        throw new Error(getErrorMessage(error));
    }
}

export async function getActivityStats(userId?: string): Promise<ActivityStats> {
    try {
        const response = await apiClient.get<ActivityStats>("/activities/stats", {
            params: userId ? { userId } : undefined,
        });
        return response.data;
    } catch (error) {
        throw new Error(getErrorMessage(error));
    }
}

export async function getActivityById(id: string): Promise<Activity> {
    try {
        const response = await apiClient.get<Activity>(`/activities/${id}`);
        return response.data;
    } catch (error) {
        throw new Error(getErrorMessage(error));
    }
}

export async function getActivitiesByUser(userId: string, limit?: number): Promise<Activity[]> {
    try {
        const response = await apiClient.get<Activity[]>(`/activities/user/${userId}`, {
            params: limit ? { limit: String(limit) } : undefined,
        });
        return response.data;
    } catch (error) {
        throw new Error(getErrorMessage(error));
    }
}

export async function getActivitiesByResource(resource: ActivityResource, resourceId: string, limit?: number): Promise<Activity[]> {
    try {
        const response = await apiClient.get<Activity[]>(`/activities/resource/${resource}/${resourceId}`, {
            params: limit ? { limit: String(limit) } : undefined,
        });
        return response.data;
    } catch (error) {
        throw new Error(getErrorMessage(error));
    }
}

export async function getActivitiesByType(type: ActivityType, limit?: number): Promise<Activity[]> {
    try {
        const response = await apiClient.get<Activity[]>(`/activities/type/${type}`, {
            params: limit ? { limit: String(limit) } : undefined,
        });
        return response.data;
    } catch (error) {
        throw new Error(getErrorMessage(error));
    }
}

export async function getActivitiesByDateRange(startDate: string, endDate: string): Promise<Activity[]> {
    try {
        const response = await apiClient.get<Activity[]>("/activities/date-range", {
            params: { startDate, endDate },
        });
        return response.data;
    } catch (error) {
        throw new Error(getErrorMessage(error));
    }
}
