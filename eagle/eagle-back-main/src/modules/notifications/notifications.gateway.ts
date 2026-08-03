import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
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
  'https://eagle-front.onrender.com',
];

@WebSocketGateway({
  cors: {
    origin: frontendOrigins,
    credentials: true,
  },
  namespace: '/notifications',
})
export class NotificationsGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(NotificationsGateway.name);
  private readonly connectedClients = new Map<string, Set<string>>(); // userId -> Set of socketIds

  constructor(
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
   * Push notification to a specific user
   */
  pushNotification(userId: string, notification: any) {
    const userSockets = this.connectedClients.get(userId);
    if (userSockets && userSockets.size > 0) {
      // Emit to all sockets for this user (in case they have multiple tabs/devices)
      userSockets.forEach((socketId) => {
        const socket = this.server.sockets.sockets.get(socketId);
        if (socket) {
          socket.emit('notification', notification);
          this.logger.debug(
            `Notification pushed to user ${userId} on socket ${socketId}`,
          );
        }
      });
      return true;
    }
    this.logger.debug(`User ${userId} is not connected, notification queued in database`);
    return false;
  }

  /**
   * Push notification to multiple users
   */
  pushNotificationToMany(userIds: string[], notification: any) {
    const results = userIds.map((userId) => ({
      userId,
      pushed: this.pushNotification(userId, notification),
    }));
    return results;
  }

  /**
   * Get count of connected clients for a user
   */
  getConnectionCount(userId: string): number {
    return this.connectedClients.get(userId)?.size || 0;
  }

  /**
   * Check if a user is connected
   */
  isUserConnected(userId: string): boolean {
    return this.getConnectionCount(userId) > 0;
  }
}
