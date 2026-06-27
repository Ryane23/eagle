import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { MessagesRepository } from './messages.repository';
import { CreateMessageDto } from './dto';
import { Message, MessageType } from './entities/message.entity';
import { FirebaseService } from 'src/config/firebase';
import { ConsultationCollection } from '../consultations/entities/consultation.entity';

@Injectable()
export class MessagesService {
  private readonly logger = new Logger(MessagesService.name);

  constructor(
    private readonly messagesRepository: MessagesRepository,
    private readonly firebaseService: FirebaseService,
  ) {}

  /**
   * Verify user has access to consultation (doctor or patient)
   */
  private async verifyConsultationAccess(
    consultationId: string,
    userId: string,
  ): Promise<void> {
    const consultationDoc = await this.firebaseService
      .collection(ConsultationCollection)
      .doc(consultationId)
      .get();

    if (!consultationDoc.exists) {
      throw new NotFoundException(
        `Consultation with ID ${consultationId} not found`,
      );
    }

    const consultation = consultationDoc.data();

    if (consultation?.doctorId !== userId && consultation?.patientId !== userId) {
      throw new ForbiddenException(
        'You do not have permission to access this consultation',
      );
    }
  }

  /**
   * Create a new message
   */
  async create(
    senderId: string,
    createMessageDto: CreateMessageDto,
  ): Promise<Message> {
    // Verify sender has access to consultation
    await this.verifyConsultationAccess(createMessageDto.consultationId, senderId);

    // Verify receiver is part of the consultation
    const consultationDoc = await this.firebaseService
      .collection(ConsultationCollection)
      .doc(createMessageDto.consultationId)
      .get();

    if (!consultationDoc.exists) {
      throw new NotFoundException(
        `Consultation with ID ${createMessageDto.consultationId} not found`,
      );
    }

    const consultation = consultationDoc.data();

    // Verify receiver is either doctor or patient in this consultation
    if (
      createMessageDto.receiverId !== consultation?.doctorId &&
      createMessageDto.receiverId !== consultation?.patientId
    ) {
      throw new ForbiddenException(
        'Receiver must be either the doctor or patient in this consultation',
      );
    }

    // Verify sender is not sending to themselves
    if (senderId === createMessageDto.receiverId) {
      throw new ForbiddenException('Cannot send message to yourself');
    }

    const messageData: Partial<Message> = {
      consultationId: createMessageDto.consultationId,
      senderId,
      receiverId: createMessageDto.receiverId,
      content: createMessageDto.content,
      type: createMessageDto.type,
      attachmentUrl: createMessageDto.attachmentUrl || null,
      isRead: false,
      createdAt: new Date(),
    };

    return await this.messagesRepository.create(messageData);
  }

  /**
   * Get messages for a consultation
   */
  async getConsultationMessages(
    consultationId: string,
    userId: string,
  ): Promise<Message[]> {
    // Verify user has access to consultation
    await this.verifyConsultationAccess(consultationId, userId);

    return await this.messagesRepository.findByConsultationId(consultationId);
  }

  /**
   * Get unread messages for a user in a consultation
   */
  async getUnreadMessages(
    consultationId: string,
    userId: string,
  ): Promise<Message[]> {
    // Verify user has access to consultation
    await this.verifyConsultationAccess(consultationId, userId);

    return await this.messagesRepository.findUnreadByConsultationAndReceiver(
      consultationId,
      userId,
    );
  }

  /**
   * Get unread message count for a user in a consultation
   */
  async getUnreadCount(
    consultationId: string,
    userId: string,
  ): Promise<number> {
    // Verify user has access to consultation
    await this.verifyConsultationAccess(consultationId, userId);

    return await this.messagesRepository.countUnreadByConsultationAndReceiver(
      consultationId,
      userId,
    );
  }

  /**
   * Mark message as read
   */
  async markAsRead(messageId: string, userId: string): Promise<Message> {
    const message = await this.messagesRepository.findById(messageId);

    if (!message) {
      throw new NotFoundException(`Message with ID ${messageId} not found`);
    }

    // Only receiver can mark as read
    if (message.receiverId !== userId) {
      throw new ForbiddenException(
        'You can only mark your own received messages as read',
      );
    }

    if (message.isRead) {
      return message; // Already read
    }

    const updated = await this.messagesRepository.update(messageId, {
      isRead: true,
      readAt: new Date(),
    });

    if (!updated) {
      throw new NotFoundException(`Message with ID ${messageId} not found`);
    }

    return updated;
  }

  /**
   * Mark all messages as read for a user in a consultation
   */
  async markAllAsRead(
    consultationId: string,
    userId: string,
  ): Promise<{ count: number }> {
    // Verify user has access to consultation
    await this.verifyConsultationAccess(consultationId, userId);

    const unreadMessages = await this.messagesRepository.findUnreadByConsultationAndReceiver(
      consultationId,
      userId,
    );

    const updatePromises = unreadMessages.map(message =>
      this.messagesRepository.update(message.id, {
        isRead: true,
        readAt: new Date(),
      }),
    );

    await Promise.all(updatePromises);

    return { count: unreadMessages.length };
  }

  /**
   * Get message by ID
   */
  async findById(messageId: string, userId: string): Promise<Message> {
    const message = await this.messagesRepository.findById(messageId);

    if (!message) {
      throw new NotFoundException(`Message with ID ${messageId} not found`);
    }

    // Verify user is sender or receiver
    if (message.senderId !== userId && message.receiverId !== userId) {
      throw new ForbiddenException(
        'You do not have permission to view this message',
      );
    }

    return message;
  }

  /**
   * Delete message (only sender can delete)
   */
  async delete(messageId: string, userId: string): Promise<void> {
    const message = await this.messagesRepository.findById(messageId);

    if (!message) {
      throw new NotFoundException(`Message with ID ${messageId} not found`);
    }

    // Only sender can delete
    if (message.senderId !== userId) {
      throw new ForbiddenException('Only the sender can delete a message');
    }

    await this.messagesRepository.delete(messageId);
  }
}
