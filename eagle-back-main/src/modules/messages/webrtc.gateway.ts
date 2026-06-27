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
import { UseGuards, Logger } from '@nestjs/common';
import { WebRTCService } from './webrtc.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UserRole } from '../users/entities/user.entity';

interface AuthenticatedSocket extends Socket {
  userId?: string;
  userRole?: UserRole;
}

@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  },
  namespace: '/webrtc',
})
export class WebRTCGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(WebRTCGateway.name);

  constructor(
    private readonly webrtcService: WebRTCService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Authenticate WebSocket connection using JWT
   */
  async handleConnection(client: AuthenticatedSocket) {
    try {
      const token = client.handshake.auth?.token || client.handshake.headers?.authorization?.replace('Bearer ', '');

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

      this.logger.log(`Client connected: ${client.userId} (${client.userRole})`);
    } catch (error) {
      this.logger.error(`Connection rejected: Invalid token`, error);
      client.disconnect();
    }
  }

  async handleDisconnect(client: AuthenticatedSocket) {
    if (client.userId) {
      this.logger.log(`Client disconnected: ${client.userId}`);
    }
  }

  /**
   * Join WebRTC room for consultation
   */
  @SubscribeMessage('join-room')
  async handleJoinRoom(
    @MessageBody() data: { consultationId: string },
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    try {
      if (!client.userId) {
        return { error: 'Unauthorized' };
      }

      // Create or get room
      const room = await this.webrtcService.createRoom(data.consultationId);

      // Verify user has access
      await this.webrtcService.verifyRoomAccess(room.id, client.userId);

      // Join socket room
      const roomName = `consultation-${data.consultationId}`;
      await client.join(roomName);

      // Mark user as connected
      await this.webrtcService.markUserConnected(room.id, client.userId);

      // Notify other participants
      client.to(roomName).emit('user-joined', {
        userId: client.userId,
        roomId: room.id,
      });

      return {
        success: true,
        roomId: room.id,
        consultationId: data.consultationId,
      };
    } catch (error) {
      this.logger.error('Error joining room', error);
      return { error: error.message || 'Failed to join room' };
    }
  }

  /**
   * Leave WebRTC room
   */
  @SubscribeMessage('leave-room')
  async handleLeaveRoom(
    @MessageBody() data: { consultationId: string },
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    try {
      if (!client.userId) {
        return { error: 'Unauthorized' };
      }

      const room = await this.webrtcService.getRoomByConsultationId(
        data.consultationId,
      );

      if (room) {
        await this.webrtcService.markUserDisconnected(room.id, client.userId);

        const roomName = `consultation-${data.consultationId}`;
        client.to(roomName).emit('user-left', {
          userId: client.userId,
        });

        client.leave(roomName);
      }

      return { success: true };
    } catch (error) {
      this.logger.error('Error leaving room', error);
      return { error: error.message || 'Failed to leave room' };
    }
  }

  /**
   * Handle WebRTC offer
   */
  @SubscribeMessage('offer')
  async handleOffer(
    @MessageBody() data: { consultationId: string; offer: RTCSessionDescriptionInit },
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    try {
      if (!client.userId) {
        return { error: 'Unauthorized' };
      }

      const room = await this.webrtcService.getRoomByConsultationId(
        data.consultationId,
      );

      if (!room) {
        return { error: 'Room not found' };
      }

      await this.webrtcService.verifyRoomAccess(room.id, client.userId);

      const roomName = `consultation-${data.consultationId}`;
      client.to(roomName).emit('offer', {
        offer: data.offer,
        from: client.userId,
      });

      return { success: true };
    } catch (error) {
      this.logger.error('Error handling offer', error);
      return { error: error.message || 'Failed to handle offer' };
    }
  }

  /**
   * Handle WebRTC answer
   */
  @SubscribeMessage('answer')
  async handleAnswer(
    @MessageBody() data: { consultationId: string; answer: RTCSessionDescriptionInit },
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    try {
      if (!client.userId) {
        return { error: 'Unauthorized' };
      }

      const room = await this.webrtcService.getRoomByConsultationId(
        data.consultationId,
      );

      if (!room) {
        return { error: 'Room not found' };
      }

      await this.webrtcService.verifyRoomAccess(room.id, client.userId);

      const roomName = `consultation-${data.consultationId}`;
      client.to(roomName).emit('answer', {
        answer: data.answer,
        from: client.userId,
      });

      return { success: true };
    } catch (error) {
      this.logger.error('Error handling answer', error);
      return { error: error.message || 'Failed to handle answer' };
    }
  }

  /**
   * Handle ICE candidate
   */
  @SubscribeMessage('ice-candidate')
  async handleIceCandidate(
    @MessageBody() data: { consultationId: string; candidate: RTCIceCandidateInit },
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    try {
      if (!client.userId) {
        return { error: 'Unauthorized' };
      }

      const room = await this.webrtcService.getRoomByConsultationId(
        data.consultationId,
      );

      if (!room) {
        return { error: 'Room not found' };
      }

      await this.webrtcService.verifyRoomAccess(room.id, client.userId);

      const roomName = `consultation-${data.consultationId}`;
      client.to(roomName).emit('ice-candidate', {
        candidate: data.candidate,
        from: client.userId,
      });

      return { success: true };
    } catch (error) {
      this.logger.error('Error handling ICE candidate', error);
      return { error: error.message || 'Failed to handle ICE candidate' };
    }
  }
}
