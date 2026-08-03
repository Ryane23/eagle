import apiClient, { getErrorMessage } from "@/lib/api-client";
import type { Consultation, AddNoteDto, CompleteConsultationDto } from "@/types/api";

/**
 * Get my schedule - Retrieves scheduled consultations for the current doctor
 */
export async function getMySchedule(): Promise<Consultation[]> {
  try {
    const response = await apiClient.get<Consultation[]>("/consultations/my-schedule");
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

/**
 * Get all my consultations - Retrieves all consultations for the current doctor
 */
export async function getMyConsultations(): Promise<Consultation[]> {
  try {
    const response = await apiClient.get<Consultation[]>("/consultations/my");
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

/**
 * Get consultations for nurse teleconsultation - Video consultations (scheduled or in progress)
 */
export async function getNurseTeleconsultationConsultations(): Promise<Consultation[]> {
  try {
    const response = await apiClient.get<Consultation[]>(
      "/consultations/nurse-teleconsultation"
    );
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

/**
 * Get consultations by patient - Retrieves all consultations for a specific patient
 */
export async function getConsultationsByPatient(patientId: string): Promise<Consultation[]> {
  try {
    const response = await apiClient.get<Consultation[]>(`/consultations/patient/${patientId}`);
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

/**
 * Get consultation by ID - Retrieves a specific consultation by its ID
 */
export async function getConsultationById(id: string): Promise<Consultation> {
  try {
    const response = await apiClient.get<Consultation>(`/consultations/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

/**
 * Start consultation - Marks a consultation as started (Doctor only)
 */
export async function startConsultation(id: string): Promise<Consultation> {
  try {
    const response = await apiClient.patch<Consultation>(`/consultations/${id}/start`);
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

/**
 * Add note to consultation - Adds a note to an existing consultation (Doctor or Nurse)
 */
export async function addConsultationNote(id: string, data: AddNoteDto): Promise<Consultation> {
  try {
    const response = await apiClient.patch<Consultation>(`/consultations/${id}/note`, data);
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

/**
 * Complete consultation - Marks a consultation as completed with diagnosis (Doctor only)
 */
export async function completeConsultation(
  id: string,
  data: CompleteConsultationDto
): Promise<Consultation> {
  try {
    const response = await apiClient.patch<Consultation>(`/consultations/${id}/complete`, data);
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

/**
 * Cancel consultation - Cancels a scheduled consultation (Doctor, Primary Secretary, or Admin)
 */
export async function cancelConsultation(id: string): Promise<Consultation> {
  try {
    const response = await apiClient.patch<Consultation>(`/consultations/${id}/cancel`);
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

/**
 * Assign doctor to consultation - Assigns a doctor to a consultation (Doctor, Primary Secretary, or Admin)
 */
export async function assignConsultationDoctor(
  consultationId: string,
  doctorId: string
): Promise<Consultation> {
  try {
    const response = await apiClient.patch<Consultation>(`/consultations/${consultationId}/assign`, {
      doctorId,
    });
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}
