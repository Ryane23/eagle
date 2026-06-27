export enum NotificationType {
  APPOINTMENT = 'appointment',
  MESSAGE = 'message',
  REMINDER = 'reminder',
  ALERT = 'alert',
  SYSTEM = 'system',
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  readAt?: Date | null;
  relatedEntityId?: string | null;
  relatedEntityType?: string | null;
  createdAt: Date;
}

export const NotificationCollection = 'notifications';
