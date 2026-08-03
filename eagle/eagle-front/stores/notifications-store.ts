import { create } from "zustand";
import type { Notification } from "@/types/api";
import {
    getMyNotifications,
    getUnreadNotifications,
    getUnreadNotificationsCount,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    deleteNotification,
} from "@/actions/notifications";

type NotificationsState = {
    notifications: Notification[];
    unreadCount: number;
    isLoading: boolean;
    error: string | null;
};

type NotificationsActions = {
    fetchNotifications: () => Promise<void>;
    fetchUnreadNotifications: () => Promise<void>;
    fetchUnreadCount: () => Promise<void>;
    markAsRead: (id: string) => Promise<void>;
    markAllAsRead: () => Promise<void>;
    deleteNotification: (id: string) => Promise<void>;
    addNotification: (notification: Notification) => void;
    clearError: () => void;
};

export const useNotificationsStore = create<NotificationsState & NotificationsActions>((set) => ({
    notifications: [],
    unreadCount: 0,
    isLoading: false,
    error: null,

    fetchNotifications: async () => {
        set({ isLoading: true, error: null });
        try {
            const notifications = await getMyNotifications();
            const unreadCount = notifications.filter((n) => !n.isRead).length;
            set({ notifications, unreadCount, isLoading: false });
        } catch (error) {
            set({
                isLoading: false,
                error: error instanceof Error ? error.message : "Erreur de chargement",
            });
        }
    },

    fetchUnreadNotifications: async () => {
        set({ isLoading: true, error: null });
        try {
            const notifications = await getUnreadNotifications();
            set({ notifications, unreadCount: notifications.length, isLoading: false });
        } catch (error) {
            set({
                isLoading: false,
                error: error instanceof Error ? error.message : "Erreur de chargement",
            });
        }
    },

    fetchUnreadCount: async () => {
        try {
            const { count } = await getUnreadNotificationsCount();
            set({ unreadCount: count });
        } catch (error) {
            console.error("Error fetching unread count:", error);
        }
    },

    markAsRead: async (id) => {
        try {
            await markNotificationAsRead(id);
            set((state) => ({
                notifications: state.notifications.map((n) =>
                    n.id === id ? { ...n, isRead: true } : n
                ),
                unreadCount: Math.max(0, state.unreadCount - 1),
            }));
        } catch (error) {
            set({
                error: error instanceof Error ? error.message : "Erreur de mise à jour",
            });
        }
    },

    markAllAsRead: async () => {
        try {
            await markAllNotificationsAsRead();
            set((state) => ({
                notifications: state.notifications.map((n) => ({ ...n, isRead: true })),
                unreadCount: 0,
            }));
        } catch (error) {
            set({
                error: error instanceof Error ? error.message : "Erreur de mise à jour",
            });
        }
    },

    deleteNotification: async (id) => {
        try {
            await deleteNotification(id);
            set((state) => {
                const notification = state.notifications.find((n) => n.id === id);
                return {
                    notifications: state.notifications.filter((n) => n.id !== id),
                    unreadCount: notification && !notification.isRead
                        ? Math.max(0, state.unreadCount - 1)
                        : state.unreadCount,
                };
            });
        } catch (error) {
            set({
                error: error instanceof Error ? error.message : "Erreur de suppression",
            });
        }
    },

    addNotification: (notification) => {
        set((state) => ({
            notifications: [notification, ...state.notifications],
            unreadCount: state.unreadCount + 1,
        }));
    },

    clearError: () => {
        set({ error: null });
    },
}));
