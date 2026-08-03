import apiClient, { getErrorMessage } from "@/lib/api-client";
import type { NetworkAnalytics, BranchStatistics } from "@/types/api";

/**
 * Get network overview - Overall analytics for the entire network
 */
export async function getNetworkOverview(): Promise<NetworkAnalytics> {
  try {
    const response = await apiClient.get<NetworkAnalytics>("/analytics/network");
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

/**
 * Get branch statistics - Analytics for a specific hospital/center
 */
export async function getBranchStatistics(hospitalId: string): Promise<BranchStatistics> {
  try {
    const response = await apiClient.get<BranchStatistics>(`/analytics/branch/${hospitalId}`);
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

