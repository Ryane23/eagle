import { Injectable } from '@nestjs/common';
import { FirebaseService } from '../../config/firebase';
import { BaseRepository } from '../../common/repositories/base.repository';
import {
  Notification,
  NotificationCollection,
  NotificationType,
} from './entities/notification.entity';

@Injectable()
export class NotificationsRepository extends BaseRepository<Notification> {
  constructor(firebaseService: FirebaseService) {
    super(firebaseService, NotificationCollection);
  }

  /**
   * Find notifications by user ID
   */
  async findByUserId(userId: string): Promise<Notification[]> {
    const querySnapshot = await this.collection
      .where('userId', '==', userId)
      .orderBy('createdAt', 'desc')
      .get();

    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data() as Omit<Notification, 'id'>,
    }));
  }

  /**
   * Find unread notifications by user ID
   */
  async findUnreadByUserId(userId: string): Promise<Notification[]> {
    const querySnapshot = await this.collection
      .where('userId', '==', userId)
      .where('isRead', '==', false)
      .orderBy('createdAt', 'desc')
      .get();

    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data() as Omit<Notification, 'id'>,
    }));
  }

  /**
   * Find notifications by type
   */
  async findByType(type: NotificationType): Promise<Notification[]> {
    const querySnapshot = await this.collection
      .where('type', '==', type)
      .get();

    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data() as Omit<Notification, 'id'>,
    }));
  }

  /**
   * Count unread notifications for user
   */
  async countUnreadByUserId(userId: string): Promise<number> {
    const querySnapshot = await this.collection
      .where('userId', '==', userId)
      .where('isRead', '==', false)
      .count()
      .get();

    return querySnapshot.data().count;
  }

  /**
   * Find notifications by user ID with filters
   */
  async findByUserIdWithFilters(
    userId: string,
    filters?: {
      type?: NotificationType;
      isRead?: boolean;
      startDate?: Date;
      endDate?: Date;
    },
  ): Promise<Notification[]> {
    let query: FirebaseFirestore.Query = this.collection.where('userId', '==', userId);

    if (filters?.type) {
      query = query.where('type', '==', filters.type);
    }

    if (filters?.isRead !== undefined) {
      query = query.where('isRead', '==', filters.isRead);
    }

    if (filters?.startDate) {
      query = query.where('createdAt', '>=', filters.startDate);
    }

    if (filters?.endDate) {
      query = query.where('createdAt', '<=', filters.endDate);
    }

    query = query.orderBy('createdAt', 'desc');

    const querySnapshot = await query.get();

    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data() as Omit<Notification, 'id'>,
    }));
  }
}

