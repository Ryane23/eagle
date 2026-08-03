import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { MessagesRepository } from './messages.repository';
import { CreateMessageDto } from './dto';
import { Message, MessageType } from './entities/message.entity';
import { FirebaseService } from '../../config/firebase';
import { ConsultationCollection } from '../consultations/entities/consultation.entity';
import {
  User,
  UserCollection,
  UserRole,
} from '../users/entities/user.entity';

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
  private conversationId(firstUserId: string, secondUserId: string): string {
    return [firstUserId, secondUserId].sort().join('__');
  }

  private async getUser(userId: string): Promise<User> {
    const snapshot = await this.firebaseService
      .collection(UserCollection)
      .doc(userId)
      .get();
    if (!snapshot.exists) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }
    return { id: snapshot.id, ...snapshot.data() } as User;
  }

  private async verifyDirectStaffAccess(
    currentUserId: string,
    otherUserId: string,
  ): Promise<void> {
    if (currentUserId === otherUserId) {
      throw new ForbiddenException('Cannot start a conversation with yourself');
    }

    const [currentUser, otherUser] = await Promise.all([
      this.getUser(currentUserId),
      this.getUser(otherUserId),
    ]);
    if (!currentUser.isActive || !otherUser.isActive) {
      throw new ForbiddenException('Both staff members must be active');
    }

    const permittedRoles = [
      UserRole.NURSE,
      UserRole.DOCTOR,
      UserRole.PRIMARY_SECRETARY,
      UserRole.SECONDARY_SECRETARY,
      UserRole.ADMIN,
    ];
    if (
      !permittedRoles.includes(currentUser.role) ||
      !permittedRoles.includes(otherUser.role)
    ) {
      throw new ForbiddenException('Direct conversations are staff-only');
    }

    if (
      otherUser.role === UserRole.DOCTOR &&
      otherUser.specialtyId &&
      currentUser.role === UserRole.NURSE
    ) {
      throw new ForbiddenException(
        'Specialist communication requires a connected consultation or referral',
      );
    }

    if (
      currentUser.role === UserRole.ADMIN ||
      otherUser.role === UserRole.ADMIN
    ) {
      return;
    }
    if (!currentUser.hospitalId || !otherUser.hospitalId) {
      throw new ForbiddenException('Both staff members must have a hospital');
    }

    const currentHospital = await this.firebaseService
      .collection('hospitals')
      .doc(currentUser.hospitalId)
      .get();
    const allowedHospitalIds = [
      currentUser.hospitalId,
      currentHospital.data()?.parentHospitalId,
    ].filter(Boolean);
    if (!allowedHospitalIds.includes(otherUser.hospitalId)) {
      throw new ForbiddenException(
        'Staff conversations are limited to the same hospital tree',
      );
    }
  }

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

    if (consultation?.doctorId === userId || consultation?.patientId === userId) {
      return;
    }

    const user = await this.getUser(userId);
    if (user.role === UserRole.NURSE && user.hospitalId) {
      const patientDoc = await this.firebaseService
        .collection('patients')
        .doc(consultation?.patientId)
        .get();
      if (patientDoc.exists && patientDoc.data()?.hospitalId === user.hospitalId) {
        return;
      }
    }

    throw new ForbiddenException(
      'You do not have permission to access this consultation',
    );
  }

  /**
   * Create a new message
   */
  async create(
    senderId: string,
    createMessageDto: CreateMessageDto,
  ): Promise<Message> {
    if (createMessageDto.consultationId) {
      await this.verifyConsultationAccess(
        createMessageDto.consultationId,
        senderId,
      );
      await this.verifyConsultationAccess(
        createMessageDto.consultationId,
        createMessageDto.receiverId,
      );
    } else {
      await this.verifyDirectStaffAccess(senderId, createMessageDto.receiverId);
    }

    // Verify sender is not sending to themselves
    if (senderId === createMessageDto.receiverId) {
      throw new ForbiddenException('Cannot send message to yourself');
    }

    const messageData: Partial<Message> = {
      consultationId: createMessageDto.consultationId || null,
      conversationId: this.conversationId(
        senderId,
        createMessageDto.receiverId,
      ),
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

  async getDirectMessages(
    currentUserId: string,
    otherUserId: string,
  ): Promise<Message[]> {
    await this.verifyDirectStaffAccess(currentUserId, otherUserId);
    return this.messagesRepository.findWhere(
      'conversationId',
      '==',
      this.conversationId(currentUserId, otherUserId),
    );
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
