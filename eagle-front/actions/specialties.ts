import apiClient, { getErrorMessage } from "@/lib/api-client";
import type { Specialty, CreateSpecialtyDto, UpdateSpecialtyDto } from "@/types/api";

/**
 * Create a new specialty
 */
export async function createSpecialty(data: CreateSpecialtyDto): Promise<Specialty> {
  try {
    const response = await apiClient.post<Specialty>("/specialties", data);
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

/**
 * Get all specialties with optional active filter
 */
export async function getSpecialties(activeOnly?: boolean): Promise<Specialty[]> {
  try {
    const response = await apiClient.get<Specialty[]>("/specialties", {
      params: { activeOnly: activeOnly?.toString() },
    });
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

/**
 * Search specialties by query
 */
export async function searchSpecialties(query: string): Promise<Specialty[]> {
  try {
    const response = await apiClient.get<Specialty[]>("/specialties/search", {
      params: { q: query },
    });
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

/**
 * Get specialty by ID
 */
export async function getSpecialtyById(id: string): Promise<Specialty> {
  try {
    const response = await apiClient.get<Specialty>(`/specialties/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

/**
 * Update a specialty
 */
export async function updateSpecialty(id: string, data: UpdateSpecialtyDto): Promise<Specialty> {
  try {
    const response = await apiClient.patch<Specialty>(`/specialties/${id}`, data);
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

/**
 * Delete a specialty
 */
export async function deleteSpecialty(id: string): Promise<void> {
  try {
    await apiClient.delete(`/specialties/${id}`);
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

/**
 * Activate a specialty
 */
export async function activateSpecialty(id: string): Promise<Specialty> {
  try {
    const response = await apiClient.patch<Specialty>(`/specialties/${id}/activate`);
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

/**
 * Deactivate a specialty
 */
export async function deactivateSpecialty(id: string): Promise<Specialty> {
  try {
    const response = await apiClient.patch<Specialty>(`/specialties/${id}/deactivate`);
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}
