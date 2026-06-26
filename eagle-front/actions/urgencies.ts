import apiClient, { getErrorMessage } from "@/lib/api-client";
import type {
  Urgency,
  CreateUrgencyDto,
  ValidateUrgencyDto,
  AssignUrgencyDto,
  RejectUrgencyDto,
  UpdateUrgencyVitalsDto,
  UrgencyLevelEnum,
} from "@/types/api";

export type UrgenciesFilterParams = {
  status?: string;
  hospitalId?: string;
};

/** Map numeric urgency level (1-5) to backend enum */
export function numberToLevel(n: number): UrgencyLevelEnum {
  if (n <= 2) return "LOW";
  if (n === 3) return "MODERATE";
  if (n === 4) return "URGENT";
  return "CRITICAL";
}

/** Map backend level enum to number 1-5 for FE display */
export function levelToNumber(level: string | undefined): number {
  if (!level) return 3;
  const u = String(level).toUpperCase();
  if (u === "LOW") return 2;
  if (u === "MODERATE") return 3;
  if (u === "URGENT") return 4;
  if (u === "CRITICAL") return 5;
  return 3;
}

/** Normalize backend status (e.g. ASSIGNED, VALIDATED_PRIMARY_SECRETARY) to FE UrgencyStatus */
function normalizeStatus(status: string | undefined): Urgency["status"] {
  if (!status) return "pending";
  const s = String(status).toLowerCase();
  if (s === "validated_primary_secretary" || s === "approved") return "validated";
  if (s === "assigned") return "assigned";
  if (s === "in_progress") return "in_progress";
  if (s === "completed") return "completed";
  if (s === "rejected") return "rejected";
  if (s === "pending") return "pending";
  return "pending";
}

function normalizeUrgency(raw: Record<string, unknown>): Urgency {
  const level = raw.level as string | undefined;
  const urgencyLevel = typeof raw.urgencyLevel === "number" ? raw.urgencyLevel : levelToNumber(level);
  return {
    ...raw,
    status: normalizeStatus(raw.status as string | undefined),
    urgencyLevel,
    validatedUrgencyLevel: typeof raw.validatedUrgencyLevel === "number" ? raw.validatedUrgencyLevel : urgencyLevel,
    reason: (raw.reason as string) ?? (raw.reasonForConsultation as string) ?? "",
    doctorId: (raw.doctorId as string) ?? (raw.assignedDoctorId as string),
  } as Urgency;
}

/**
 * Create a new urgency request (maps FE DTO to backend shape)
 * Backend requires: patientId, level (enum), reasonForConsultation (min 5 chars), requestedSpecialty (min 2 chars)
 */
export async function createUrgency(data: CreateUrgencyDto): Promise<Urgency> {
  try {
    const reason = (data.reason || "").trim();
    if (reason.length < 5) {
      throw new Error("Le motif doit contenir au moins 5 caractères");
    }
    const requestedSpecialty = (data.requestedSpecialty ?? "Médecine générale").trim();
    if (requestedSpecialty.length < 2) {
      throw new Error("La spécialité doit contenir au moins 2 caractères");
    }

    const body: Record<string, unknown> = {
      patientId: data.patientId,
      reasonForConsultation: reason,
      requestedSpecialty,
      level: numberToLevel(data.urgencyLevel),
    };
    if (data.description != null && data.description !== "") {
      body.symptoms = data.description;
    }
    if (data.vitalSigns != null && typeof data.vitalSigns === "object" && Object.keys(data.vitalSigns).length > 0) {
      body.vitalSigns = data.vitalSigns;
    }

    const response = await apiClient.post<Urgency>("/urgencies", body);
    return normalizeUrgency(response.data as Record<string, unknown>);
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

/**
 * Get all urgencies with optional filters
 */
export async function getUrgencies(params?: UrgenciesFilterParams): Promise<Urgency[]> {
  try {
    const response = await apiClient.get<Urgency[]>("/urgencies", { params });
    const list = Array.isArray(response.data) ? response.data : [];
    return list.map((u) => normalizeUrgency(u as Record<string, unknown>));
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

/**
 * Get pending urgencies awaiting validation
 */
export async function getPendingUrgencies(): Promise<Urgency[]> {
  try {
    const response = await apiClient.get<Urgency[]>("/urgencies/pending");
    const list = Array.isArray(response.data) ? response.data : [];
    return list.map((u) => normalizeUrgency(u as Record<string, unknown>));
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

/**
 * Get urgency by ID
 */
export async function getUrgencyById(id: string): Promise<Urgency> {
  try {
    const response = await apiClient.get<Urgency>(`/urgencies/${id}`);
    return normalizeUrgency(response.data as Record<string, unknown>);
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

/**
 * Validate an urgency request (Primary Secretary). Backend expects newLevel (enum) and justification.
 */
export async function validateUrgency(id: string, data: ValidateUrgencyDto): Promise<Urgency> {
  try {
    const response = await apiClient.patch<Urgency>(`/urgencies/${id}/validate`, data);
    return normalizeUrgency(response.data as Record<string, unknown>);
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

/**
 * Assign urgency to a doctor (Primary Secretary). Backend expects assignedDoctorId and scheduledAt.
 */
export async function assignUrgency(id: string, data: AssignUrgencyDto): Promise<Urgency> {
  try {
    const response = await apiClient.patch<Urgency>(`/urgencies/${id}/assign`, data);
    return normalizeUrgency(response.data as Record<string, unknown>);
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

/**
 * Reject an urgency request (Primary Secretary)
 */
export async function rejectUrgency(id: string, data: RejectUrgencyDto): Promise<Urgency> {
  try {
    const response = await apiClient.patch<Urgency>(`/urgencies/${id}/reject`, data);
    return normalizeUrgency(response.data as Record<string, unknown>);
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

/**
 * Start consultation for an urgency (Doctor)
 */
export async function startUrgencyConsultation(id: string): Promise<Urgency> {
  try {
    const response = await apiClient.patch<Urgency>(`/urgencies/${id}/start`);
    return normalizeUrgency(response.data as Record<string, unknown>);
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

/**
 * Update vital signs for an urgency (Nurse)
 */
export async function updateUrgencyVitals(
  id: string,
  data: UpdateUrgencyVitalsDto
): Promise<Urgency> {
  try {
    const response = await apiClient.patch<Urgency>(`/urgencies/${id}/vitals`, data);
    return normalizeUrgency(response.data as Record<string, unknown>);
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

/**
 * Complete an urgency (Doctor)
 */
export async function completeUrgency(id: string): Promise<Urgency> {
  try {
    const response = await apiClient.patch<Urgency>(`/urgencies/${id}/complete`);
    return normalizeUrgency(response.data as Record<string, unknown>);
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}
