import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { MessagesService } from './messages.service';
import { CreateMessageDto } from './dto';
import { UserRole } from '../users/entities/user.entity';

interface AuthenticatedSocket extends Socket {
  userId?: string;
  userRole?: UserRole;
}

const frontendOrigins = [
  ...(process.env.FRONTEND_URLS ?? process.env.FRONTEND_URL ?? '')
    .split(',')
    .map(origin => origin.trim())
    .filter(Boolean),
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:5173',
];

@WebSocketGateway({
  cors: {
    origin: frontendOrigins,
    credentials: true,
  },
  namespace: '/messages',
})
export class MessagesGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(MessagesGateway.name);
  private readonly connectedClients = new Map<string, Set<string>>(); // userId -> Set of socketIds

  constructor(
    private readonly messagesService: MessagesService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Authenticate WebSocket connection using JWT
   */
  async handleConnection(client: AuthenticatedSocket) {
    try {
      const token =
        client.handshake.auth?.token ||
        client.handshake.headers?.authorization?.replace('Bearer ', '');

      if (!token) {
        this.logger.warn(`Connection rejected: No token provided`);
        client.disconnect();
        return;
      }

      const payload = await this.jwtService.verifyAsync(token, {
        secret: this.configService.get<string>('JWT_SECRET'),
      });

      client.userId = payload.sub;
      client.userRole = payload.role;

      if (!client.userId) {
        this.logger.warn(`Connection rejected: No userId in token payload`);
        client.disconnect();
        return;
      }

      // Track connected client
      if (!this.connectedClients.has(client.userId)) {
        this.connectedClients.set(client.userId, new Set());
      }
      this.connectedClients.get(client.userId)!.add(client.id);

      this.logger.log(
        `Client connected: ${client.userId} (${client.userRole}) - Total connections: ${this.connectedClients.get(client.userId)!.size}`,
      );
    } catch (error) {
      this.logger.error(`Connection rejected: Invalid token`, error);
      client.disconnect();
    }
  }

  async handleDisconnect(client: AuthenticatedSocket) {
    if (client.userId) {
      const userSockets = this.connectedClients.get(client.userId);
      if (userSockets) {
        userSockets.delete(client.id);
        if (userSockets.size === 0) {
          this.connectedClients.delete(client.userId);
        }
      }
      this.logger.log(
        `Client disconnected: ${client.userId} - Remaining connections: ${userSockets?.size || 0}`,
      );
    }
  }

  /**
   * Join consultation chat room
   */
  @SubscribeMessage('join-consultation')
  async handleJoinConsultation(
    @MessageBody() data: { consultationId: string },
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    try {
      if (!client.userId) {
        return { error: 'Unauthorized' };
      }

      // Verify user has access to consultation
      await this.messagesService.getConsultationMessages(
        data.consultationId,
        client.userId,
      );

      // Join socket room
      const roomName = `consultation-${data.consultationId}`;
      await client.join(roomName);

      this.logger.log(
        `User ${client.userId} joined consultation room ${data.consultationId}`,
      );

      return {
        success: true,
        consultationId: data.consultationId,
      };
    } catch (error) {
      this.logger.error('Error joining consultation', error);
      return { error: error.message || 'Failed to join consultation' };
    }
  }

  /**
   * Leave consultation chat room
   */
  @SubscribeMessage('leave-consultation')
  async handleLeaveConsultation(
    @MessageBody() data: { consultationId: string },
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    try {
      if (!client.userId) {
        return { error: 'Unauthorized' };
      }

      const roomName = `consultation-${data.consultationId}`;
      client.leave(roomName);

      this.logger.log(
        `User ${client.userId} left consultation room ${data.consultationId}`,
      );

      return { success: true };
    } catch (error) {
      this.logger.error('Error leaving consultation', error);
      return { error: error.message || 'Failed to leave consultation' };
    }
  }

  /**
   * Send message
   */
  @SubscribeMessage('send-message')
  async handleSendMessage(
    @MessageBody() data: CreateMessageDto,
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    try {
      if (!client.userId) {
        return { error: 'Unauthorized' };
      }

      // Create message in database
      const message = await this.messagesService.create(client.userId, data);

      // Emit to all users in the consultation room (including sender)
      const roomName = `consultation-${data.consultationId}`;
      this.server.to(roomName).emit('new-message', message);

      // Also emit to receiver if they're connected (even if not in room)
      const receiverSockets = this.connectedClients.get(data.receiverId);
      if (receiverSockets && receiverSockets.size > 0) {
        receiverSockets.forEach(socketId => {
          const socket = this.server.sockets.sockets.get(socketId);
          if (socket && !socket.rooms.has(roomName)) {
            socket.emit('new-message', message);
          }
        });
      }

      this.logger.debug(
        `Message sent from ${client.userId} to ${data.receiverId} in consultation ${data.consultationId}`,
      );

      return {
        success: true,
        message,
      };
    } catch (error) {
      this.logger.error('Error sending message', error);
      return { error: error.message || 'Failed to send message' };
    }
  }

  /**
   * Mark message as read
   */
  @SubscribeMessage('mark-read')
  async handleMarkRead(
    @MessageBody() data: { messageId: string },
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    try {
      if (!client.userId) {
        return { error: 'Unauthorized' };
      }

      const message = await this.messagesService.markAsRead(
        data.messageId,
        client.userId,
      );

      // Notify sender that message was read
      const senderSockets = this.connectedClients.get(message.senderId);
      if (senderSockets && senderSockets.size > 0) {
        senderSockets.forEach(socketId => {
          const socket = this.server.sockets.sockets.get(socketId);
          if (socket) {
            socket.emit('message-read', {
              messageId: message.id,
              readAt: message.readAt,
            });
          }
        });
      }

      return {
        success: true,
        message,
      };
    } catch (error) {
      this.logger.error('Error marking message as read', error);
      return { error: error.message || 'Failed to mark message as read' };
    }
  }

  /**
   * Typing indicator
   */
  @SubscribeMessage('typing')
  async handleTyping(
    @MessageBody() data: { consultationId: string; isTyping: boolean },
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    try {
      if (!client.userId) {
        return { error: 'Unauthorized' };
      }

      const roomName = `consultation-${data.consultationId}`;
      // Broadcast typing status to other users in room
      client.to(roomName).emit('user-typing', {
        userId: client.userId,
        isTyping: data.isTyping,
      });

      return { success: true };
    } catch (error) {
      this.logger.error('Error handling typing indicator', error);
      return { error: error.message || 'Failed to handle typing indicator' };
    }
  }
}
