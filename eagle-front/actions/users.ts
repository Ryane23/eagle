import apiClient, { getErrorMessage } from "@/lib/api-client";
import type { User, UpdateUserDto, UserRole } from "@/types/api";

export type UsersFilterParams = {
  role?: UserRole;
  hospitalId?: string;
  isActive?: string;
};

/**
 * Get all users - Retrieves a list of all users (Admin only)
 */
export async function getUsers(params?: UsersFilterParams): Promise<User[]> {
  try {
    const response = await apiClient.get<User[]>("/users", { params });
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

/**
 * Get active doctors - For assignment dropdowns (Admin, Primary Secretary, Doctor)
 */
export async function getDoctors(): Promise<User[]> {
  try {
    const response = await apiClient.get<User[]>("/users/doctors");
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

/**
 * Get user by ID - Retrieves a specific user by their ID (Admin only)
 */
export async function getUserById(id: string): Promise<User> {
  try {
    const response = await apiClient.get<User>(`/users/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

/**
 * Update user - Updates a user's information (Admin only)
 */
export async function updateUser(id: string, data: UpdateUserDto): Promise<User> {
  try {
    const response = await apiClient.patch<User>(`/users/${id}`, data);
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

/**
 * Delete user - Soft deletes a user account (Admin only)
 */
export async function deleteUser(id: string): Promise<void> {
  try {
    await apiClient.delete(`/users/${id}`);
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

/**
 * Activate user - Activates a deactivated user account (Admin only)
 */
export async function activateUser(id: string): Promise<User> {
  try {
    const response = await apiClient.patch<User>(`/users/${id}/activate`);
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

/**
 * Deactivate user - Deactivates an active user account (Admin only)
 */
export async function deactivateUser(id: string): Promise<User> {
  try {
    const response = await apiClient.patch<User>(`/users/${id}/deactivate`);
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}
