import apiClient, { getErrorMessage } from "@/lib/api-client";
import type { Message, CreateMessageDto } from "@/types/api";

/**
 * Create a new message in a consultation chat
 */
export async function createMessage(data: CreateMessageDto): Promise<Message> {
  try {
    const response = await apiClient.post<Message>("/messages", data);
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

/**
 * Get all messages for a consultation
 */
export async function getConsultationMessages(consultationId: string): Promise<Message[]> {
  try {
    const response = await apiClient.get<Message[]>(`/messages/consultation/${consultationId}`);
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

export async function getDirectMessages(userId: string): Promise<Message[]> {
  try {
    const response = await apiClient.get<Message[]>(`/messages/conversation/${userId}`);
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

/**
 * Get unread messages for a consultation
 */
export async function getUnreadMessages(consultationId: string): Promise<Message[]> {
  try {
    const response = await apiClient.get<Message[]>(
      `/messages/consultation/${consultationId}/unread`
    );
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

/**
 * Get unread message count for a consultation
 */
export async function getUnreadMessageCount(consultationId: string): Promise<{ count: number }> {
  try {
    const response = await apiClient.get<{ count: number }>(
      `/messages/consultation/${consultationId}/unread-count`
    );
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

/**
 * Get message by ID
 */
export async function getMessageById(id: string): Promise<Message> {
  try {
    const response = await apiClient.get<Message>(`/messages/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

/**
 * Mark message as read
 */
export async function markMessageAsRead(id: string): Promise<Message> {
  try {
    const response = await apiClient.patch<Message>(`/messages/${id}/read`);
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

/**
 * Mark all messages in a consultation as read
 */
export async function markAllMessagesAsRead(consultationId: string): Promise<void> {
  try {
    await apiClient.patch(`/messages/consultation/${consultationId}/read-all`);
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

/**
 * Delete a message
 */
export async function deleteMessage(id: string): Promise<void> {
  try {
    await apiClient.delete(`/messages/${id}`);
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}
