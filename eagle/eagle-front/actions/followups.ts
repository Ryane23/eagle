import apiClient, { getErrorMessage } from "@/lib/api-client";
import type { Followup, CreateFollowupDto, UpdateFollowupDto } from "@/types/api";

/**
 * Create a new follow-up appointment
 */
export async function createFollowup(data: CreateFollowupDto): Promise<Followup> {
  try {
    const response = await apiClient.post<Followup>("/followups", data);
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

/**
 * Get all follow-ups
 */
export async function getFollowups(): Promise<Followup[]> {
  try {
    const response = await apiClient.get<Followup[]>("/followups");
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

/**
 * Get upcoming follow-ups with optional limit
 */
export async function getUpcomingFollowups(limit?: number): Promise<Followup[]> {
  try {
    const response = await apiClient.get<Followup[]>("/followups/upcoming", {
      params: { limit: limit?.toString() },
    });
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

/**
 * Get follow-ups for a specific patient
 */
export async function getFollowupsByPatient(patientId: string): Promise<Followup[]> {
  try {
    const response = await apiClient.get<Followup[]>(`/followups/patient/${patientId}`);
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

/**
 * Get follow-ups for a specific doctor
 */
export async function getFollowupsByDoctor(doctorId: string): Promise<Followup[]> {
  try {
    const response = await apiClient.get<Followup[]>(`/followups/doctor/${doctorId}`);
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

/**
 * Get follow-up by ID
 */
export async function getFollowupById(id: string): Promise<Followup> {
  try {
    const response = await apiClient.get<Followup>(`/followups/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

/**
 * Update a follow-up
 */
export async function updateFollowup(id: string, data: UpdateFollowupDto): Promise<Followup> {
  try {
    const response = await apiClient.patch<Followup>(`/followups/${id}`, data);
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

/**
 * Mark follow-up as completed
 */
export async function completeFollowup(id: string): Promise<Followup> {
  try {
    const response = await apiClient.patch<Followup>(`/followups/${id}/complete`);
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

/**
 * Cancel a follow-up
 */
export async function cancelFollowup(id: string): Promise<Followup> {
  try {
    const response = await apiClient.patch<Followup>(`/followups/${id}/cancel`);
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

/**
 * Mark follow-up as missed
 */
export async function markFollowupAsMissed(id: string): Promise<Followup> {
  try {
    const response = await apiClient.patch<Followup>(`/followups/${id}/missed`);
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

