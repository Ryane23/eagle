import { useMemo, useCallback } from "react";
import { useNotificationsStore } from "@/stores/notifications-store";

// Selectors for optimized re-renders
const selectNotifications = (state: ReturnType<typeof useNotificationsStore.getState>) =>
  state.notifications;
const selectUnreadCount = (state: ReturnType<typeof useNotificationsStore.getState>) =>
  state.unreadCount;
const selectIsLoading = (state: ReturnType<typeof useNotificationsStore.getState>) =>
  state.isLoading;

/**
 * Hook for notifications management
 */
export function useNotifications() {
  const notifications = useNotificationsStore(selectNotifications);
  const unreadCount = useNotificationsStore(selectUnreadCount);
  const isLoading = useNotificationsStore(selectIsLoading);

  const fetchNotifications = useNotificationsStore((state) => state.fetchNotifications);
  const markAsRead = useNotificationsStore((state) => state.markAsRead);
  const markAllAsRead = useNotificationsStore((state) => state.markAllAsRead);
  const deleteNotification = useNotificationsStore((state) => state.deleteNotification);

  return {
    notifications,
    unreadCount,
    isLoading,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  };
}

/**
 * Hook for unread notifications only
 */
export function useUnreadNotifications() {
  const notifications = useNotificationsStore(selectNotifications);
  const unreadCount = useNotificationsStore(selectUnreadCount);

  const unreadNotifications = useMemo(
    () => notifications.filter((n) => !n.isRead),
    [notifications]
  );

  return {
    notifications: unreadNotifications,
    count: unreadCount,
  };
}

/**
 * Hook for notification by type
 */
export function useNotificationsByType(type?: string) {
  const notifications = useNotificationsStore(selectNotifications);

  const filteredNotifications = useMemo(() => {
    if (!type) return notifications;
    return notifications.filter((n) => n.type === type);
  }, [notifications, type]);

  return filteredNotifications;
}

/**
 * Hook for notification bell (common UI pattern)
 */
export function useNotificationBell() {
  const unreadCount = useNotificationsStore(selectUnreadCount);
  const isLoading = useNotificationsStore(selectIsLoading);
  const fetchNotifications = useNotificationsStore((state) => state.fetchNotifications);
  const markAllAsRead = useNotificationsStore((state) => state.markAllAsRead);

  const hasUnread = unreadCount > 0;

  const refresh = useCallback(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  return {
    unreadCount,
    hasUnread,
    isLoading,
    refresh,
    markAllAsRead,
  };
}

