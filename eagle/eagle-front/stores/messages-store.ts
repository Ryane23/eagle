"use client";

import { create } from "zustand";
import type { Message, CreateMessageDto } from "@/types/api";
import {
    getConsultationMessages,
    getUnreadMessages,
    getUnreadMessageCount,
    createMessage,
    markMessageAsRead,
    markAllMessagesAsRead,
    deleteMessage,
} from "@/actions/messages";

type Conversation = {
    id: string;
    participantName: string;
    participantRole: string;
    participantCenter: string;
    lastMessage?: string;
    lastMessageTime?: string;
    unreadCount: number;
    isUrgent: boolean;
    status: "online" | "offline";
};

type MessagesState = {
    conversations: Conversation[];
    messages: Message[];
    currentConversationId: string | null;
    isLoading: boolean;
    isSending: boolean;
    error: string | null;
    unreadTotal: number;
};

type MessagesActions = {
    fetchConversationMessages: (consultationId: string) => Promise<void>;
    fetchUnreadMessages: (consultationId: string) => Promise<void>;
    sendMessage: (data: CreateMessageDto) => Promise<Message>;
    markAsRead: (messageId: string) => Promise<void>;
    markAllAsRead: (consultationId: string) => Promise<void>;
    deleteMessage: (messageId: string) => Promise<void>;
    setCurrentConversation: (conversationId: string | null) => void;
    addMessage: (message: Message) => void;
    clearError: () => void;
};

export const useMessagesStore = create<MessagesState & MessagesActions>((set, get) => ({
    conversations: [],
    messages: [],
    currentConversationId: null,
    isLoading: false,
    isSending: false,
    error: null,
    unreadTotal: 0,

    fetchConversationMessages: async (consultationId) => {
        set({ isLoading: true, error: null, currentConversationId: consultationId });
        try {
            const messages = await getConsultationMessages(consultationId);
            set({ messages, isLoading: false });
        } catch (error) {
            set({
                isLoading: false,
                error: error instanceof Error ? error.message : "Erreur de chargement",
            });
        }
    },

    fetchUnreadMessages: async (consultationId) => {
        try {
            const messages = await getUnreadMessages(consultationId);
            set({ messages, isLoading: false });
        } catch (error) {
            console.error("Error fetching unread messages:", error);
        }
    },

    sendMessage: async (data) => {
        set({ isSending: true, error: null });
        try {
            const message = await createMessage(data);
            set((state) => ({
                messages: [...state.messages, message],
                isSending: false,
            }));
            return message;
        } catch (error) {
            set({
                isSending: false,
                error: error instanceof Error ? error.message : "Erreur d'envoi",
            });
            throw error;
        }
    },

    markAsRead: async (messageId) => {
        try {
            await markMessageAsRead(messageId);
            set((state) => ({
                messages: state.messages.map((m) =>
                    m.id === messageId ? { ...m, isRead: true } : m
                ),
            }));
        } catch (error) {
            set({
                error: error instanceof Error ? error.message : "Erreur de mise à jour",
            });
        }
    },

    markAllAsRead: async (consultationId) => {
        try {
            await markAllMessagesAsRead(consultationId);
            set((state) => ({
                messages: state.messages.map((m) => ({ ...m, isRead: true })),
            }));
        } catch (error) {
            set({
                error: error instanceof Error ? error.message : "Erreur de mise à jour",
            });
        }
    },

    deleteMessage: async (messageId) => {
        try {
            await deleteMessage(messageId);
            set((state) => ({
                messages: state.messages.filter((m) => m.id !== messageId),
            }));
        } catch (error) {
            set({
                error: error instanceof Error ? error.message : "Erreur de suppression",
            });
        }
    },

    setCurrentConversation: (conversationId) => {
        set({ currentConversationId: conversationId });
    },

    addMessage: (message) => {
        set((state) => ({
            messages: [...state.messages, message],
        }));
    },

    clearError: () => {
        set({ error: null });
    },
}));

