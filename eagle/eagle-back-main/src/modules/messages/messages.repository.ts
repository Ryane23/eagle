import { Injectable } from '@nestjs/common';
import { FirebaseService } from '../../config/firebase';
import { BaseRepository } from '../../common/repositories/base.repository';
import { Message, MessageCollection } from './entities/message.entity';

@Injectable()
export class MessagesRepository extends BaseRepository<Message> {
  constructor(firebaseService: FirebaseService) {
    super(firebaseService, MessageCollection);
  }

  /**
   * Find messages by consultation ID
   */
  async findByConsultationId(consultationId: string): Promise<Message[]> {
    const querySnapshot = await this.collection
      .where('consultationId', '==', consultationId)
      .orderBy('createdAt', 'asc')
      .get();

    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data() as Omit<Message, 'id'>,
    }));
  }

  /**
   * Find unread messages for a user in a consultation
   */
  async findUnreadByConsultationAndReceiver(
    consultationId: string,
    receiverId: string,
  ): Promise<Message[]> {
    const querySnapshot = await this.collection
      .where('consultationId', '==', consultationId)
      .where('receiverId', '==', receiverId)
      .where('isRead', '==', false)
      .orderBy('createdAt', 'asc')
      .get();

    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data() as Omit<Message, 'id'>,
    }));
  }

  /**
   * Count unread messages for a user in a consultation
   */
  async countUnreadByConsultationAndReceiver(
    consultationId: string,
    receiverId: string,
  ): Promise<number> {
    const querySnapshot = await this.collection
      .where('consultationId', '==', consultationId)
      .where('receiverId', '==', receiverId)
      .where('isRead', '==', false)
      .count()
      .get();

    return querySnapshot.data().count;
  }

  /**
   * Find messages between two users in a consultation
   */
  async findConversation(
    consultationId: string,
    userId1: string,
    userId2: string,
  ): Promise<Message[]> {
    // Get messages where sender is userId1 and receiver is userId2
    const messages1 = await this.collection
      .where('consultationId', '==', consultationId)
      .where('senderId', '==', userId1)
      .where('receiverId', '==', userId2)
      .orderBy('createdAt', 'asc')
      .get();

    // Get messages where sender is userId2 and receiver is userId1
    const messages2 = await this.collection
      .where('consultationId', '==', consultationId)
      .where('senderId', '==', userId2)
      .where('receiverId', '==', userId1)
      .orderBy('createdAt', 'asc')
      .get();

    // Combine and sort
    const allMessages = [
      ...messages1.docs.map(doc => ({
        id: doc.id,
        ...doc.data() as Omit<Message, 'id'>,
      })),
      ...messages2.docs.map(doc => ({
        id: doc.id,
        ...doc.data() as Omit<Message, 'id'>,
      })),
    ];

    return allMessages.sort(
      (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    );
  }
}
