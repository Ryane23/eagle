import apiClient, { getErrorMessage } from "@/lib/api-client";
import type { Report, CreateReportDto, UpdateReportDto } from "@/types/api";

export type ReportsFilterParams = {
  status?: string;
  type?: string;
  hospitalId?: string;
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

