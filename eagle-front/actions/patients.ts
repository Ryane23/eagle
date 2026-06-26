import apiClient, { getErrorMessage } from "@/lib/api-client";
import type {
  Patient,
  CreatePatientDto,
  UpdatePatientDto,
  UpdateVitalsDto,
  UpdateEhrDto,
} from "@/types/api";

/** Normalize phone to E.164 for backend IsPhoneNumber (e.g. +237699123456). Default country code 237 (Cameroon). */
export function normalizePhone(value: string, defaultCountryCode = "237"): string {
  const digits = value.replace(/\D/g, "");
  if (digits.length === 0) return value;
  if (value.trim().startsWith("+")) return value.replace(/\s/g, "").trim();
  const withoutLeadingZero = digits.replace(/^0+/, "");
  const withCode = withoutLeadingZero.startsWith(defaultCountryCode)
    ? withoutLeadingZero
    : defaultCountryCode + withoutLeadingZero;
  return "+" + withCode;
}

/**
 * Register a new patient - Only accessible by Secondary Secretaries.
 * Normalizes phone and emergencyContactPhone to E.164 before sending.
 */
export async function createPatient(data: CreatePatientDto): Promise<Patient> {
  try {
    const payload = {
      ...data,
      phone: normalizePhone(data.phone),
      emergencyContactPhone: data.emergencyContactPhone
        ? normalizePhone(data.emergencyContactPhone)
        : undefined,
    };
    const response = await apiClient.post<Patient>("/patients", payload);
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

/**
 * Get all patients - Retrieves patients based on user role and hospital access
 */
export async function getPatients(): Promise<Patient[]> {
  try {
    const response = await apiClient.get<Patient[]>("/patients");
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

/**
 * Search patients - Search patients by name, ID number, or phone
 */
export async function searchPatients(query: string): Promise<Patient[]> {
  try {
    const response = await apiClient.get<Patient[]>("/patients/search", {
      params: { q: query },
    });
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

/**
 * Get patient by ID - Retrieves a specific patient by their ID
 */
export async function getPatientById(id: string): Promise<Patient> {
  try {
    const response = await apiClient.get<Patient>(`/patients/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

/**
 * Update patient information - Accessible by Secondary Secretary (own hospital) or Admin
 */
export async function updatePatient(id: string, data: UpdatePatientDto): Promise<Patient> {
  try {
    const response = await apiClient.patch<Patient>(`/patients/${id}`, data);
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

/**
 * Update patient vital signs - Nurse only
 */
export async function updatePatientVitals(id: string, data: UpdateVitalsDto): Promise<Patient> {
  try {
    const response = await apiClient.patch<Patient>(`/patients/${id}/vitals`, data);
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

/**
 * Update patient EHR - Accessible by Nurse, Doctor, or Secondary Secretary
 */
export async function updatePatientEhr(id: string, data: UpdateEhrDto): Promise<Patient> {
  try {
    const response = await apiClient.patch<Patient>(`/patients/${id}/ehr`, data);
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

/**
 * Deactivate patient - Admin or Primary Secretary only
 */
export async function deactivatePatient(id: string): Promise<Patient> {
  try {
    const response = await apiClient.patch<Patient>(`/patients/${id}/deactivate`);
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}
