import apiClient, { getErrorMessage } from "@/lib/api-client";
import type { Prescription, PrescriptionStatus, CreatePrescriptionDto, UpdatePrescriptionDto } from "@/types/api";

/** Normalize API response: backend may return isDispensed; FE uses status. */
function normalizePrescription(raw: Record<string, unknown> & { id: string }): Prescription {
  const p = raw as Prescription & { isDispensed?: boolean };
  const status: PrescriptionStatus =
    p.status ?? (p.isDispensed ? "dispensed" : "active");
  return { ...p, status } as Prescription;
}

/**
 * Create a new prescription
 */
export async function createPrescription(data: CreatePrescriptionDto): Promise<Prescription> {
  try {
    const response = await apiClient.post<Record<string, unknown> & { id: string }>("/prescriptions", data);
    return normalizePrescription(response.data);
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

/**
 * Get all prescriptions
 */
export async function getPrescriptions(): Promise<Prescription[]> {
  try {
    const response = await apiClient.get<(Record<string, unknown> & { id: string })[]>("/prescriptions");
    return response.data.map(normalizePrescription);
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

/**
 * Get prescriptions for current user's hospital
 */
export async function getMyHospitalPrescriptions(): Promise<Prescription[]> {
  try {
    const response = await apiClient.get<(Record<string, unknown> & { id: string })[]>("/prescriptions/my-hospital");
    return response.data.map(normalizePrescription);
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

/**
 * Get prescriptions by consultation ID
 */
export async function getPrescriptionsByConsultation(
  consultationId: string
): Promise<Prescription[]> {
  try {
    const response = await apiClient.get<(Record<string, unknown> & { id: string })[]>(
      `/prescriptions/consultation/${consultationId}`
    );
    return response.data.map(normalizePrescription);
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

/**
 * Get prescriptions by patient ID
 */
export async function getPrescriptionsByPatient(patientId: string): Promise<Prescription[]> {
  try {
    const response = await apiClient.get<(Record<string, unknown> & { id: string })[]>(`/prescriptions/patient/${patientId}`);
    return response.data.map(normalizePrescription);
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

/**
 * Get prescription by ID
 */
export async function getPrescriptionById(id: string): Promise<Prescription> {
  try {
    const response = await apiClient.get<Record<string, unknown> & { id: string }>(`/prescriptions/${id}`);
    return normalizePrescription(response.data);
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

/**
 * Update a prescription
 */
export async function updatePrescription(
  id: string,
  data: UpdatePrescriptionDto
): Promise<Prescription> {
  try {
    const response = await apiClient.patch<Record<string, unknown> & { id: string }>(`/prescriptions/${id}`, data);
    return normalizePrescription(response.data);
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

/**
 * Delete a prescription
 */
export async function deletePrescription(id: string): Promise<void> {
  try {
    await apiClient.delete(`/prescriptions/${id}`);
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

/**
 * Mark prescription as dispensed
 */
export async function markPrescriptionAsDispensed(id: string): Promise<Prescription> {
  try {
    const response = await apiClient.patch<Record<string, unknown> & { id: string }>(`/prescriptions/${id}/dispense`);
    return normalizePrescription(response.data);
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}
