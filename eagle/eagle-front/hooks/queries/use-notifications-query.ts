"use client";

import {
    useQuery,
    useMutation,
    useQueryClient,
    type UseQueryOptions,
} from "@tanstack/react-query";
import {
    sendNotification,
    getMyNotifications,
    getUnreadNotifications,
    markNotificationAsRead as apiMarkAsRead,
    markAllNotificationsAsRead as apiMarkAllAsRead,
    deleteNotification as apiDeleteNotification,
} from "@/actions/notifications";
import type { Notification } from "@/types/api";
import type { CreateNotificationDto } from "@/types/api";
import { toast } from "sonner";

// ============================================================================
// Query Keys
// ============================================================================

export const notificationKeys = {
    all: ["notifications"] as const,
    lists: () => [...notificationKeys.all, "list"] as const,
    list: (filters?: { type?: string; read?: boolean }) =>
        [...notificationKeys.lists(), filters] as const,
    unread: () => [...notificationKeys.all, "unread"] as const,
    count: () => [...notificationKeys.all, "count"] as const,
};

// ============================================================================
// Query Hooks
// ============================================================================

export function useNotificationsQuery(
    filters?: { type?: string; read?: boolean },
    options?: Omit<UseQueryOptions<Notification[], Error>, "queryKey" | "queryFn">
) {
    return useQuery({
        queryKey: notificationKeys.list(filters),
        queryFn: async () => {
            const notifications = await getMyNotifications();
            if (!filters) return notifications;

            return notifications.filter((n) => {
                const matchesType = !filters.type || filters.type === "all" || n.type === filters.type;
                const matchesRead = filters.read === undefined || n.isRead === filters.read;
                return matchesType && matchesRead;
            });
        },
        staleTime: 30 * 1000,
        refetchInterval: 60 * 1000, // Check for new notifications every minute
        ...options,
    });
}

export function useUnreadNotificationsQuery(
    options?: Omit<UseQueryOptions<Notification[], Error>, "queryKey" | "queryFn">
) {
    return useQuery({
        queryKey: notificationKeys.unread(),
        queryFn: getUnreadNotifications,
        staleTime: 30 * 1000,
        refetchInterval: 30 * 1000, // More frequent for unread
        ...options,
    });
}

export function useUnreadCountQuery() {
    const { data: unread = [] } = useUnreadNotificationsQuery();
    return unread.length;
}

// ============================================================================
// Mutation Hooks
// ============================================================================

export function useMarkNotificationAsRead() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => apiMarkAsRead(id),
        onMutate: async (id) => {
            await queryClient.cancelQueries({ queryKey: notificationKeys.lists() });
            await queryClient.cancelQueries({ queryKey: notificationKeys.unread() });

            const previousList = queryClient.getQueryData<Notification[]>(notificationKeys.list());
            const previousUnread = queryClient.getQueryData<Notification[]>(notificationKeys.unread());

            if (previousList) {
                queryClient.setQueryData<Notification[]>(
                    notificationKeys.list(),
                    previousList.map((n) => (n.id === id ? { ...n, isRead: true } : n))
                );
            }

            if (previousUnread) {
                queryClient.setQueryData<Notification[]>(
                    notificationKeys.unread(),
                    previousUnread.filter((n) => n.id !== id)
                );
            }

            return { previousList, previousUnread };
        },
        onError: (_err, _id, context) => {
            if (context?.previousList) {
                queryClient.setQueryData(notificationKeys.list(), context.previousList);
            }
            if (context?.previousUnread) {
                queryClient.setQueryData(notificationKeys.unread(), context.previousUnread);
            }
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: notificationKeys.all });
        },
    });
}

export function useMarkAllNotificationsAsRead() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: () => apiMarkAllAsRead(),
        onMutate: async () => {
            await queryClient.cancelQueries({ queryKey: notificationKeys.all });

            const previousList = queryClient.getQueryData<Notification[]>(notificationKeys.list());

            if (previousList) {
                queryClient.setQueryData<Notification[]>(
                    notificationKeys.list(),
                    previousList.map((n) => ({ ...n, isRead: true }))
                );
            }

            queryClient.setQueryData<Notification[]>(notificationKeys.unread(), []);

            return { previousList };
        },
        onError: (_err, _vars, context) => {
            if (context?.previousList) {
                queryClient.setQueryData(notificationKeys.list(), context.previousList);
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: notificationKeys.all });
            toast.success("Toutes les notifications marquées comme lues");
        },
    });
}

export function useDeleteNotification() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => apiDeleteNotification(id),
        onMutate: async (id) => {
            await queryClient.cancelQueries({ queryKey: notificationKeys.lists() });

            const previous = queryClient.getQueryData<Notification[]>(notificationKeys.list());

            if (previous) {
                queryClient.setQueryData<Notification[]>(
                    notificationKeys.list(),
                    previous.filter((n) => n.id !== id)
                );
            }

            return { previous };
        },
        onError: (_err, _id, context) => {
            if (context?.previous) {
                queryClient.setQueryData(notificationKeys.list(), context.previous);
            }
            toast.error("Erreur lors de la suppression");
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: notificationKeys.all });
            toast.success("Notification supprimée");
        },
    });
}

export function useSendNotifications() {
    return useMutation<
        Notification[],
        Error,
        { userIds: string[]; data: CreateNotificationDto }
    >({
        mutationFn: ({ userIds, data }) =>
            Promise.all(userIds.map((userId) => sendNotification(userId, data))),
        onSuccess: (notifications) => {
            toast.success(
                `${notifications.length} notification${notifications.length > 1 ? "s" : ""} envoyée${notifications.length > 1 ? "s" : ""}`
            );
        },
        onError: (error) => {
            toast.error(error.message || "Envoi impossible");
        },
    });
}

// ============================================================================
// Bell Hook (for header)
// ============================================================================

export function useNotificationBell() {
    const { data: unread = [], isLoading } = useUnreadNotificationsQuery();
    const markAsRead = useMarkNotificationAsRead();
    const markAllAsRead = useMarkAllNotificationsAsRead();

    return {
        unreadCount: unread.length,
        unreadNotifications: unread.slice(0, 5), // Show max 5 in dropdown
        isLoading,
        markAsRead: markAsRead.mutate,
        markAllAsRead: markAllAsRead.mutate,
    };
}
