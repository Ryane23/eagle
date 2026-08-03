import apiClient, { getErrorMessage } from "@/lib/api-client";

// ============ Types ============

export type TechnicalChecklist = {
    videoTested: boolean;
    audioTested: boolean;
    patientPositioned: boolean;
    lightingAdjusted: boolean;
};

export type PsychologicalState = {
    anxietyLevel: number;
    cooperation: string;
    understanding: string;
    notes?: string;
};

export type SymptomHistory = {
    chiefComplaint: string;
    duration: string;
    severity: number;
    characteristics: string;
};

export type Preparation = {
    id: string;
    patientId: string;
    visitId?: string;
    consultationId?: string;
    urgencyId?: string;
    nurseId: string;
    hospitalId: string;
    progress: number;
    status: "pending" | "in_progress" | "completed";
    technicalChecklist?: TechnicalChecklist;
    questionsForDoctor?: string[];
    suggestedExams?: string[];
    psychologicalState?: PsychologicalState;
    observations?: string;
    symptomHistory?: SymptomHistory;
    patient?: { id: string; firstName: string; lastName: string };
    nurse?: { id: string; name: string };
    createdAt: string;
    updatedAt: string;
};

export type CreatePreparationDto = {
    patientId: string;
    visitId?: string;
    consultationId?: string;
    urgencyId?: string;
};

export type UpdatePreparationProgressDto = {
    progress: number;
};

export type UpdateChecklistDto = {
    technicalChecklist?: TechnicalChecklist;
    questionsForDoctor?: string[];
    suggestedExams?: string[];
    psychologicalState?: PsychologicalState;
};

export type AddObservationsDto = {
    observations: string;
    symptomHistory?: SymptomHistory;
};

// ============ API Functions ============

export async function createPreparation(data: CreatePreparationDto): Promise<Preparation> {
    try {
        const response = await apiClient.post<Preparation>("/preparations", data);
        return response.data;
    } catch (error) {
        throw new Error(getErrorMessage(error));
    }
}

export async function getActivePreparations(): Promise<Preparation[]> {
    try {
        const response = await apiClient.get<Preparation[]>("/preparations/active");
        return response.data;
    } catch (error) {
        throw new Error(getErrorMessage(error));
    }
}

export async function getMyPreparations(): Promise<Preparation[]> {
    try {
        const response = await apiClient.get<Preparation[]>("/preparations/my");
        return response.data;
    } catch (error) {
        throw new Error(getErrorMessage(error));
    }
}

export async function getPreparationById(id: string): Promise<Preparation> {
    try {
        const response = await apiClient.get<Preparation>(`/preparations/${id}`);
        return response.data;
    } catch (error) {
        throw new Error(getErrorMessage(error));
    }
}

export async function getPreparationsByPatient(patientId: string): Promise<Preparation[]> {
    try {
        const response = await apiClient.get<Preparation[]>(`/preparations/patient/${patientId}`);
        return response.data;
    } catch (error) {
        throw new Error(getErrorMessage(error));
    }
}

export async function getPreparationByConsultation(consultationId: string): Promise<Preparation> {
    try {
        const response = await apiClient.get<Preparation>(`/preparations/consultation/${consultationId}`);
        return response.data;
    } catch (error) {
        throw new Error(getErrorMessage(error));
    }
}

export async function updatePreparationProgress(id: string, data: UpdatePreparationProgressDto): Promise<Preparation> {
    try {
        const response = await apiClient.patch<Preparation>(`/preparations/${id}/progress`, data);
        return response.data;
    } catch (error) {
        throw new Error(getErrorMessage(error));
    }
}

export async function updatePreparationChecklist(id: string, data: UpdateChecklistDto): Promise<Preparation> {
    try {
        const response = await apiClient.patch<Preparation>(`/preparations/${id}/checklist`, data);
        return response.data;
    } catch (error) {
        throw new Error(getErrorMessage(error));
    }
}

export async function addPreparationObservations(id: string, data: AddObservationsDto): Promise<Preparation> {
    try {
        const response = await apiClient.patch<Preparation>(`/preparations/${id}/observations`, data);
        return response.data;
    } catch (error) {
        throw new Error(getErrorMessage(error));
    }
}

export async function completePreparation(id: string): Promise<Preparation> {
    try {
        const response = await apiClient.patch<Preparation>(`/preparations/${id}/complete`);
        return response.data;
    } catch (error) {
        throw new Error(getErrorMessage(error));
    }
}
