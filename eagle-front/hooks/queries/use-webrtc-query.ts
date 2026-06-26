import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { WebRTCRoom } from "@/types/api";
import {
    createRoom,
    getRoomByConsultationId,
    getRoomById,
    endRoom,
    endRoomByConsultationId,
} from "@/actions/webrtc";

// Query Keys
export const webrtcKeys = {
    all: ["webrtc"] as const,
    rooms: () => [...webrtcKeys.all, "room"] as const,
    room: (id: string) => [...webrtcKeys.rooms(), id] as const,
    byConsultation: (consultationId: string) => [...webrtcKeys.all, "consultation", consultationId] as const,
};

// ============================================================================
// Queries
// ============================================================================

/**
 * Get WebRTC room by room ID
 */
export function useWebRTCRoomQuery(roomId: string) {
    return useQuery<WebRTCRoom, Error>({
        queryKey: webrtcKeys.room(roomId),
        queryFn: () => getRoomById(roomId),
        enabled: !!roomId,
        staleTime: 30 * 1000, // 30 seconds - rooms change frequently
        gcTime: 5 * 60 * 1000,
    });
}

/**
 * Get WebRTC room by consultation ID
 */
export function useWebRTCRoomByConsultationQuery(consultationId: string) {
    return useQuery<WebRTCRoom, Error>({
        queryKey: webrtcKeys.byConsultation(consultationId),
        queryFn: () => getRoomByConsultationId(consultationId),
        enabled: !!consultationId,
        staleTime: 30 * 1000,
        gcTime: 5 * 60 * 1000,
        retry: 1, // Room might not exist yet
    });
}

// ============================================================================
// Mutations
// ============================================================================

/**
 * Create a new WebRTC room for a consultation
 */
export function useCreateRoom() {
    const queryClient = useQueryClient();

    return useMutation<WebRTCRoom, Error, string>({
        mutationFn: createRoom,
        onSuccess: (room, consultationId) => {
            queryClient.setQueryData(webrtcKeys.room(room.id), room);
            queryClient.setQueryData(webrtcKeys.byConsultation(consultationId), room);
            toast.success("Salle de consultation créée");
        },
        onError: (error) => {
            toast.error(error.message || "Erreur lors de la création de la salle");
        },
    });
}

/**
 * End a WebRTC room by room ID
 */
export function useEndRoom() {
    const queryClient = useQueryClient();

    return useMutation<WebRTCRoom, Error, string>({
        mutationFn: endRoom,
        onSuccess: (room) => {
            queryClient.setQueryData(webrtcKeys.room(room.id), room);
            queryClient.invalidateQueries({ queryKey: webrtcKeys.all });
            toast.success("Salle de consultation fermée");
        },
        onError: (error) => {
            toast.error(error.message || "Erreur lors de la fermeture de la salle");
        },
    });
}

/**
 * End a WebRTC room by consultation ID
 */
export function useEndRoomByConsultation() {
    const queryClient = useQueryClient();

    return useMutation<WebRTCRoom, Error, string>({
        mutationFn: endRoomByConsultationId,
        onSuccess: (room, consultationId) => {
            queryClient.setQueryData(webrtcKeys.byConsultation(consultationId), room);
            queryClient.invalidateQueries({ queryKey: webrtcKeys.all });
            toast.success("Consultation terminée");
        },
        onError: (error) => {
            toast.error(error.message || "Erreur lors de la fermeture de la consultation");
        },
    });
}

