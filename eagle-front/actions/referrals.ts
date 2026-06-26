import apiClient, { getErrorMessage } from "@/lib/api-client";

// ============ Types ============

export type ReferralPriority = "low" | "medium" | "high" | "urgent";
export type ReferralStatus = "pending" | "accepted" | "rejected" | "in_transit" | "completed" | "cancelled";

export type Referral = {
    id: string;
    patientId: string;
    patient?: { id: string; firstName: string; lastName: string };
    urgencyId?: string;
    fromHospitalId: string;
    fromHospital?: { id: string; name: string };
    toHospitalId: string;
    toHospital?: { id: string; name: string };
    referredById: string;
    referredBy?: { id: string; name: string };
    reason: string;
    medicalSummary: string;
    specialtyNeeded?: string;
    requiredResources?: string[];
    priority: ReferralPriority;
    status: ReferralStatus;
    attachmentUrls?: string[];
    estimatedArrivalTime?: string;
    acceptanceNotes?: string;
    rejectionReason?: string;
    createdAt: string;
    updatedAt: string;
};

export type CreateReferralDto = {
    patientId: string;
    urgencyId?: string;
    toHospitalId: string;
    reason: string;
    medicalSummary: string;
    specialtyNeeded?: string;
    requiredResources?: string[];
    priority: ReferralPriority;
    attachmentUrls?: string[];
    estimatedArrivalTime?: string;
};

export type UpdateReferralDto = Partial<CreateReferralDto> & {
    status?: ReferralStatus;
};

export type AcceptReferralDto = {
    acceptanceNotes?: string;
};

export type RejectReferralDto = {
    rejectionReason: string;
};

export type ReferralStats = {
    total: number;
    sent: number;
    received: number;
    pending: number;
    accepted: number;
    completed: number;
};

// ============ API Functions ============

export async function createReferral(data: CreateReferralDto): Promise<Referral> {
    try {
        const response = await apiClient.post<Referral>("/referrals", data);
        return response.data;
    } catch (error) {
        throw new Error(getErrorMessage(error));
    }
}

export async function getReferrals(): Promise<Referral[]> {
    try {
        const response = await apiClient.get<Referral[]>("/referrals");
        return response.data;
    } catch (error) {
        throw new Error(getErrorMessage(error));
    }
}

export async function getSentReferrals(): Promise<Referral[]> {
    try {
        const response = await apiClient.get<Referral[]>("/referrals/my-hospital/sent");
        return response.data;
    } catch (error) {
        throw new Error(getErrorMessage(error));
    }
}

export async function getReceivedReferrals(): Promise<Referral[]> {
    try {
        const response = await apiClient.get<Referral[]>("/referrals/my-hospital/received");
        return response.data;
    } catch (error) {
        throw new Error(getErrorMessage(error));
    }
}

export async function getPendingReferrals(): Promise<Referral[]> {
    try {
        const response = await apiClient.get<Referral[]>("/referrals/my-hospital/pending");
        return response.data;
    } catch (error) {
        throw new Error(getErrorMessage(error));
    }
}

export async function getReferralStats(): Promise<ReferralStats> {
    try {
        const response = await apiClient.get<ReferralStats>("/referrals/my-hospital/stats");
        return response.data;
    } catch (error) {
        throw new Error(getErrorMessage(error));
    }
}

export async function getMyReferrals(): Promise<Referral[]> {
    try {
        const response = await apiClient.get<Referral[]>("/referrals/my");
        return response.data;
    } catch (error) {
        throw new Error(getErrorMessage(error));
    }
}

export async function getReferralsByPatient(patientId: string): Promise<Referral[]> {
    try {
        const response = await apiClient.get<Referral[]>(`/referrals/patient/${patientId}`);
        return response.data;
    } catch (error) {
        throw new Error(getErrorMessage(error));
    }
}

export async function getReferralsByStatus(status: ReferralStatus): Promise<Referral[]> {
    try {
        const response = await apiClient.get<Referral[]>(`/referrals/status/${status}`);
        return response.data;
    } catch (error) {
        throw new Error(getErrorMessage(error));
    }
}

export async function getReferralById(id: string): Promise<Referral> {
    try {
        const response = await apiClient.get<Referral>(`/referrals/${id}`);
        return response.data;
    } catch (error) {
        throw new Error(getErrorMessage(error));
    }
}

export async function updateReferral(id: string, data: UpdateReferralDto): Promise<Referral> {
    try {
        const response = await apiClient.patch<Referral>(`/referrals/${id}`, data);
        return response.data;
    } catch (error) {
        throw new Error(getErrorMessage(error));
    }
}

export async function acceptReferral(id: string, data?: AcceptReferralDto): Promise<Referral> {
    try {
        const response = await apiClient.post<Referral>(`/referrals/${id}/accept`, data || {});
        return response.data;
    } catch (error) {
        throw new Error(getErrorMessage(error));
    }
}

export async function rejectReferral(id: string, data: RejectReferralDto): Promise<Referral> {
    try {
        const response = await apiClient.post<Referral>(`/referrals/${id}/reject`, data);
        return response.data;
    } catch (error) {
        throw new Error(getErrorMessage(error));
    }
}

export async function markReferralInTransit(id: string): Promise<Referral> {
    try {
        const response = await apiClient.patch<Referral>(`/referrals/${id}/in-transit`);
        return response.data;
    } catch (error) {
        throw new Error(getErrorMessage(error));
    }
}

export async function completeReferral(id: string): Promise<Referral> {
    try {
        const response = await apiClient.patch<Referral>(`/referrals/${id}/complete`);
        return response.data;
    } catch (error) {
        throw new Error(getErrorMessage(error));
    }
}

export async function cancelReferral(id: string): Promise<Referral> {
    try {
        const response = await apiClient.patch<Referral>(`/referrals/${id}/cancel`);
        return response.data;
    } catch (error) {
        throw new Error(getErrorMessage(error));
    }
}

export async function deleteReferral(id: string): Promise<void> {
    try {
        await apiClient.delete(`/referrals/${id}`);
    } catch (error) {
        throw new Error(getErrorMessage(error));
    }
}
