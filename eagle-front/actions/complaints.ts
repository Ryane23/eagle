import apiClient, { getErrorMessage } from "@/lib/api-client";
import type { Complaint, CreateComplaintDto, UpdateComplaintDto } from "@/types/api";

export type ComplaintsFilterParams = {
  status?: string;
  type?: string;
  priority?: string;
  hospitalId?: string;
};

/**
 * Create a new complaint
 */
export async function createComplaint(data: CreateComplaintDto): Promise<Complaint> {
  try {
    const response = await apiClient.post<Complaint>("/complaints", data);
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

/**
 * Get all complaints with optional filters
 */
export async function getComplaints(params?: ComplaintsFilterParams): Promise<Complaint[]> {
  try {
    const response = await apiClient.get<Complaint[]>("/complaints", { params });
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

/**
 * Get my complaints - Complaints created by the current user
 */
export async function getMyComplaints(): Promise<Complaint[]> {
  try {
    const response = await apiClient.get<Complaint[]>("/complaints/my");
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

/**
 * Get complaint by ID
 */
export async function getComplaintById(id: string): Promise<Complaint> {
  try {
    const response = await apiClient.get<Complaint>(`/complaints/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

/**
 * Update a complaint
 */
export async function updateComplaint(id: string, data: UpdateComplaintDto): Promise<Complaint> {
  try {
    const response = await apiClient.patch<Complaint>(`/complaints/${id}`, data);
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

/**
 * Delete a complaint
 */
export async function deleteComplaint(id: string): Promise<void> {
  try {
    await apiClient.delete(`/complaints/${id}`);
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

