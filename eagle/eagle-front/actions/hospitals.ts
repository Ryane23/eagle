import apiClient, { getErrorMessage } from "@/lib/api-client";
import type { Hospital, CreateHospitalDto, UpdateHospitalDto, HospitalType } from "@/types/api";

/**
 * Create a new hospital/center - Admin only
 */
export async function createHospital(data: CreateHospitalDto): Promise<Hospital> {
  try {
    const response = await apiClient.post<Hospital>("/hospitals", data);
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

/**
 * Get all hospitals/centers - Retrieves all hospitals in the network
 */
export async function getHospitals(): Promise<Hospital[]> {
  try {
    const response = await apiClient.get<Hospital[]>("/hospitals");
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

/**
 * Get the complete hospital hierarchy with PRIMARY roots and nested SUB centers.
 */
export async function getHospitalTree(): Promise<Hospital[]> {
  try {
    const response = await apiClient.get<Hospital[]>("/hospitals/tree");
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

/**
 * Get the PRIMARY center - Retrieves the main primary center (Yaoundé)
 */
export async function getPrimaryCenter(): Promise<Hospital> {
  try {
    const response = await apiClient.get<Hospital>("/hospitals/primary/center");
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

/**
 * Get hospitals by type - Retrieves hospitals filtered by type (PRIMARY or SUB)
 */
export async function getHospitalsByType(type: HospitalType): Promise<Hospital[]> {
  try {
    const response = await apiClient.get<Hospital[]>(`/hospitals/type/${type}`);
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

/**
 * Get hospital by ID - Retrieves a specific hospital by its ID
 */
export async function getHospitalById(id: string): Promise<Hospital> {
  try {
    const response = await apiClient.get<Hospital>(`/hospitals/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

/**
 * Update hospital - Updates hospital information (Admin only)
 */
export async function updateHospital(id: string, data: UpdateHospitalDto): Promise<Hospital> {
  try {
    const response = await apiClient.patch<Hospital>(`/hospitals/${id}`, data);
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

/**
 * Delete hospital - Deletes a hospital (Admin only)
 */
export async function deleteHospital(id: string): Promise<void> {
  try {
    await apiClient.delete(`/hospitals/${id}`);
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

/**
 * Activate hospital - Activates a deactivated hospital (Admin only)
 */
export async function activateHospital(id: string): Promise<Hospital> {
  try {
    const response = await apiClient.patch<Hospital>(`/hospitals/${id}/activate`);
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

/**
 * Deactivate hospital - Deactivates an active hospital (Admin only)
 */
export async function deactivateHospital(id: string): Promise<Hospital> {
  try {
    const response = await apiClient.patch<Hospital>(`/hospitals/${id}/deactivate`);
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}
