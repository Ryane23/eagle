import apiClient, { getErrorMessage } from "@/lib/api-client";
import type { Report, CreateReportDto, UpdateReportDto } from "@/types/api";

export type ReportsFilterParams = {
  status?: string;
  type?: string;
  hospitalId?: string;
};

export type AdminReportStatus = "pending" | "in_review" | "resolved" | "rejected";
export type AdminReportType = "system" | "user" | "consultation" | "hospital" | "other";

export type AdminReport = {
  id: string;
  title: string;
  description: string;
  type: AdminReportType;
  status: AdminReportStatus;
  reportedBy: string;
  reportedByName?: string;
  relatedUserId?: string | null;
  relatedHospitalId?: string | null;
  relatedConsultationId?: string | null;
  resolvedBy?: string | null;
  resolvedAt?: unknown;
  resolutionNotes?: string | null;
  createdAt: unknown;
  updatedAt: unknown;
};

/**
 * Create a new medical report
 */
export async function createReport(data: CreateReportDto): Promise<Report> {
  try {
    const response = await apiClient.post<Report>("/reports", data);
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

/**
 * Get all reports with optional filters
 */
export async function getReports(params?: ReportsFilterParams): Promise<Report[]> {
  try {
    const response = await apiClient.get<Report[]>("/reports", { params });
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

export async function getAdminReports(
  params?: ReportsFilterParams
): Promise<AdminReport[]> {
  try {
    const response = await apiClient.get<AdminReport[]>("/reports", { params });
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

export async function updateAdminReport(
  id: string,
  data: { status: AdminReportStatus; resolutionNotes?: string }
): Promise<AdminReport> {
  try {
    const response = await apiClient.patch<AdminReport>(`/reports/${id}`, data);
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

/**
 * Get my reports - Reports created by the current user
 */
export async function getMyReports(): Promise<Report[]> {
  try {
    const response = await apiClient.get<Report[]>("/reports/my");
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

/**
 * Get report by ID
 */
export async function getReportById(id: string): Promise<Report> {
  try {
    const response = await apiClient.get<Report>(`/reports/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

/**
 * Update a report
 */
export async function updateReport(id: string, data: UpdateReportDto): Promise<Report> {
  try {
    const response = await apiClient.patch<Report>(`/reports/${id}`, data);
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

/**
 * Delete a report
 */
export async function deleteReport(id: string): Promise<void> {
  try {
    await apiClient.delete(`/reports/${id}`);
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}
