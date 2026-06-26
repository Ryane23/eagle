import apiClient, { getErrorMessage } from "@/lib/api-client";
import type { WebRTCRoom } from "@/types/api";

/**
 * Create a WebRTC room for a consultation
 */
export async function createRoom(consultationId: string): Promise<WebRTCRoom> {
  try {
    const response = await apiClient.post<WebRTCRoom>(`/webrtc/room/${consultationId}`);
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

/**
 * Get room by consultation ID
 */
export async function getRoomByConsultationId(consultationId: string): Promise<WebRTCRoom> {
  try {
    const response = await apiClient.get<WebRTCRoom>(`/webrtc/room/consultation/${consultationId}`);
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

/**
 * Get room by room ID
 */
export async function getRoomById(roomId: string): Promise<WebRTCRoom> {
  try {
    const response = await apiClient.get<WebRTCRoom>(`/webrtc/room/${roomId}`);
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

/**
 * End a WebRTC room by room ID
 */
export async function endRoom(roomId: string): Promise<WebRTCRoom> {
  try {
    const response = await apiClient.post<WebRTCRoom>(`/webrtc/room/${roomId}/end`);
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

/**
 * End a WebRTC room by consultation ID
 */
export async function endRoomByConsultationId(consultationId: string): Promise<WebRTCRoom> {
  try {
    const response = await apiClient.post<WebRTCRoom>(
      `/webrtc/room/consultation/${consultationId}/end`
    );
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

