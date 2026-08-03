import apiClient, { getErrorMessage } from "@/lib/api-client";
import type { Notification, CreateNotificationDto } from "@/types/api";

/**
 * Send notification to user
 */
export async function sendNotification(
  userId: string,
  data: CreateNotificationDto
): Promise<Notification> {
  try {
    const response = await apiClient.post<Notification>(`/notifications/send/${userId}`, data);
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

/**
 * Get my notifications - Retrieves all notifications for the current user
 */
export async function getMyNotifications(): Promise<Notification[]> {
  try {
    const response = await apiClient.get<Notification[]>("/notifications/my");
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

/**
 * Get unread notifications - Retrieves unread notifications for the current user
 */
export async function getUnreadNotifications(): Promise<Notification[]> {
  try {
    const response = await apiClient.get<Notification[]>("/notifications/my/unread");
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

/**
 * Get unread count - Retrieves count of unread notifications
 */
export async function getUnreadNotificationsCount(): Promise<{ count: number }> {
  try {
    const response = await apiClient.get<{ count: number }>("/notifications/my/unread-count");
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

/**
 * Get notification by ID - Retrieves a specific notification
 */
export async function getNotificationById(id: string): Promise<Notification> {
  try {
    const response = await apiClient.get<Notification>(`/notifications/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

/**
 * Mark notification as read
 */
export async function markNotificationAsRead(id: string): Promise<Notification> {
  try {
    const response = await apiClient.patch<Notification>(`/notifications/${id}/read`);
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

/**
 * Mark all notifications as read
 */
export async function markAllNotificationsAsRead(): Promise<void> {
  try {
    await apiClient.patch("/notifications/read-all");
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

/**
 * Delete notification
 */
export async function deleteNotification(id: string): Promise<void> {
  try {
    await apiClient.delete(`/notifications/${id}`);
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}
