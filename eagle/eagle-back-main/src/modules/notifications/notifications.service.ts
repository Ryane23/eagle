import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { NotificationsRepository } from './notifications.repository';
import { NotificationsGateway } from './notifications.gateway';
import { CreateNotificationDto } from './dto';
import { Notification } from './entities/notification.entity';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    private readonly notificationsRepository: NotificationsRepository,
    private readonly notificationsGateway: NotificationsGateway,
  ) {}

  /**
   * Send notification to a user
   */
  async send(
    userId: string,
    createNotificationDto: CreateNotificationDto,
  ): Promise<Notification> {
    const notificationData: Partial<Notification> = {
      userId,
      ...createNotificationDto,
      isRead: false,
      createdAt: new Date(),
    };

    const notification = await this.notificationsRepository.create(notificationData);

    // Push notification via WebSocket if user is connected
    try {
      this.notificationsGateway.pushNotification(userId, notification);
    } catch (error) {
      // Log error but don't fail notification creation
      this.logger.warn(
        `Failed to push notification via WebSocket for user ${userId}`,
        error,
      );
    }

    return notification;
  }

  /**
   * Send notification to multiple users
   */
  async sendToMany(
    userIds: string[],
    createNotificationDto: CreateNotificationDto,
  ): Promise<Notification[]> {
    // send() already pushes via WebSocket, so no need to push again
    const notifications = await Promise.all(
      userIds.map(userId => this.send(userId, createNotificationDto)),
    );

    return notifications;
  }

  /**
   * Get user's notifications
   */
  async getMyNotifications(userId: string): Promise<Notification[]> {
    return await this.notificationsRepository.findByUserId(userId);
  }

  /**
   * Get user's notifications with filters
   */
  async getMyNotificationsWithFilters(
    userId: string,
    filters?: {
      type?: string;
      isRead?: boolean;
      startDate?: Date;
      endDate?: Date;
    },
  ): Promise<Notification[]> {
    return await this.notificationsRepository.findByUserIdWithFilters(userId, filters as any);
  }

  /**
   * Get user's unread notifications
   */
  async getUnreadNotifications(userId: string): Promise<Notification[]> {
    return await this.notificationsRepository.findUnreadByUserId(userId);
  }

  /**
   * Get notification by ID
   */
  async findById(id: string, userId: string): Promise<Notification> {
    const notification = await this.notificationsRepository.findById(id);
    if (!notification) {
      throw new NotFoundException(`Notification with ID ${id} not found`);
    }

    // Users can only view their own notifications
    if (notification.userId !== userId) {
      throw new NotFoundException(`Notification with ID ${id} not found`);
    }

    return notification;
  }

  /**
   * Mark notification as read
   */
  async markAsRead(id: string, userId: string): Promise<Notification> {
    const notification = await this.findById(id, userId);

    if (notification.isRead) {
      return notification; // Already read
    }

    const updated = await this.notificationsRepository.update(id, {
      isRead: true,
      readAt: new Date(),
    });

    if (!updated) {
      throw new NotFoundException(`Notification with ID ${id} not found`);
    }

    return updated;
  }

  /**
   * Mark all notifications as read for a user
   */
  async markAllAsRead(userId: string): Promise<{ count: number }> {
    const unreadNotifications = await this.getUnreadNotifications(userId);

    const updatePromises = unreadNotifications.map(notification =>
      this.markAsRead(notification.id, userId),
    );

    await Promise.all(updatePromises);

    return { count: unreadNotifications.length };
  }

  /**
   * Get unread notification count
   */
  async getUnreadCount(userId: string): Promise<number> {
    return await this.notificationsRepository.countUnreadByUserId(userId);
  }

  /**
   * Delete notification
   */
  async delete(id: string, userId: string): Promise<void> {
    const notification = await this.findById(id, userId);
    await this.notificationsRepository.delete(id);
  }
}
