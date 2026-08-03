import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { Message, CreateMessageDto } from "@/types/api";
import {
    createMessage,
    getDirectMessages,
    getConsultationMessages,
    getUnreadMessages,
    getUnreadMessageCount,
    markMessageAsRead,
    markAllMessagesAsRead,
    deleteMessage,
} from "@/actions/messages";

// Query Keys
export const messageKeys = {
    all: ["messages"] as const,
    byConsultation: (consultationId: string) => [...messageKeys.all, "consultation", consultationId] as const,
    byContact: (userId: string) => [...messageKeys.all, "contact", userId] as const,
    unread: (consultationId: string) => [...messageKeys.all, "unread", consultationId] as const,
    unreadCount: (consultationId: string) => [...messageKeys.all, "unread-count", consultationId] as const,
};

// --- Queries ---

export function useConsultationMessagesQuery(consultationId: string) {
    return useQuery<Message[], Error>({
        queryKey: messageKeys.byConsultation(consultationId),
        queryFn: () => getConsultationMessages(consultationId),
        enabled: !!consultationId,
        staleTime: 10 * 1000, // 10 seconds - messages change frequently
        gcTime: 2 * 60 * 1000, // 2 minutes
        refetchInterval: 5 * 1000, // Auto-refresh every 5 seconds for real-time feel
    });
}

export function useConversationMessagesQuery(
    userId: string,
    consultationId?: string,
) {
    return useQuery<Message[], Error>({
        queryKey: consultationId
            ? messageKeys.byConsultation(consultationId)
            : messageKeys.byContact(userId),
        queryFn: () =>
            consultationId
                ? getConsultationMessages(consultationId)
                : getDirectMessages(userId),
        enabled: !!userId,
        staleTime: 10 * 1000,
        gcTime: 2 * 60 * 1000,
        refetchInterval: 5 * 1000,
    });
}

export function useUnreadMessagesQuery(consultationId: string) {
    return useQuery<Message[], Error>({
        queryKey: messageKeys.unread(consultationId),
        queryFn: () => getUnreadMessages(consultationId),
        enabled: !!consultationId,
        staleTime: 10 * 1000,
        gcTime: 2 * 60 * 1000,
        refetchInterval: 5 * 1000,
    });
}

export function useUnreadMessageCountQuery(consultationId: string) {
    return useQuery<{ count: number }, Error>({
        queryKey: messageKeys.unreadCount(consultationId),
        queryFn: () => getUnreadMessageCount(consultationId),
        enabled: !!consultationId,
        staleTime: 10 * 1000,
        gcTime: 2 * 60 * 1000,
        refetchInterval: 10 * 1000,
    });
}

// --- Mutations ---

export function useSendMessage() {
    const queryClient = useQueryClient();
    return useMutation<Message, Error, CreateMessageDto>({
        mutationFn: createMessage,
        onSuccess: (_, { consultationId, receiverId }) => {
            queryClient.invalidateQueries({
                queryKey: consultationId
                    ? messageKeys.byConsultation(consultationId)
                    : messageKeys.byContact(receiverId),
            });
        },
        onError: (error) => {
            toast.error(error.message || "Erreur lors de l'envoi");
        },
    });
}

export function useMarkMessageAsRead() {
    const queryClient = useQueryClient();
    return useMutation<Message, Error, { id: string; consultationId: string }>({
        mutationFn: ({ id }) => markMessageAsRead(id),
        onSuccess: (_, { consultationId }) => {
            queryClient.invalidateQueries({
                queryKey: messageKeys.byConsultation(consultationId),
            });
            queryClient.invalidateQueries({
                queryKey: messageKeys.unreadCount(consultationId),
            });
        },
        onError: (error) => {
            toast.error(error.message || "Erreur lors de la mise à jour");
        },
    });
}

export function useMarkAllMessagesAsRead() {
    const queryClient = useQueryClient();
    return useMutation<void, Error, string>({
        mutationFn: markAllMessagesAsRead,
        onSuccess: (_, consultationId) => {
            queryClient.invalidateQueries({
                queryKey: messageKeys.byConsultation(consultationId),
            });
            queryClient.invalidateQueries({
                queryKey: messageKeys.unreadCount(consultationId),
            });
        },
        onError: (error) => {
            toast.error(error.message || "Erreur lors de la mise à jour");
        },
    });
}

export function useDeleteMessage() {
    const queryClient = useQueryClient();
    return useMutation<void, Error, { id: string; consultationId: string }>({
        mutationFn: ({ id }) => deleteMessage(id),
        onSuccess: (_, { consultationId }) => {
            queryClient.invalidateQueries({
                queryKey: messageKeys.byConsultation(consultationId),
            });
            toast.success("Message supprimé!");
        },
        onError: (error) => {
            toast.error(error.message || "Erreur lors de la suppression");
        },
    });
}
