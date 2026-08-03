import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OnEvent } from '@nestjs/event-emitter';
import { JwtService } from '@nestjs/jwt';
import {
  OnGatewayConnection,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { FirebaseService } from '../../config/firebase';

interface WorkflowSocket extends Socket {
  userId?: string;
  hospitalId?: string;
}

const frontendOrigins = [
  ...(process.env.FRONTEND_URLS ?? process.env.FRONTEND_URL ?? '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean),
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:5173',
];

@WebSocketGateway({
  cors: { origin: frontendOrigins, credentials: true },
  namespace: '/workflow',
})
export class WorkflowGateway implements OnGatewayConnection {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(WorkflowGateway.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly firebase: FirebaseService,
  ) {}

  async handleConnection(client: WorkflowSocket) {
    try {
      const token =
        client.handshake.auth?.token ||
        client.handshake.headers.authorization?.replace('Bearer ', '');
      if (!token) throw new Error('Missing token');
      const payload = await this.jwtService.verifyAsync(token, {
        secret: this.configService.get<string>('JWT_SECRET'),
      });
      const user = await this.firebase.collection('users').doc(payload.sub).get();
      const hospitalId = user.data()?.hospitalId;
      if (!user.exists || !hospitalId) throw new Error('Missing hospital context');
      client.userId = payload.sub;
      client.hospitalId = hospitalId;
      await client.join(`hospital-${hospitalId}`);
    } catch (error) {
      this.logger.warn(`Workflow socket rejected: ${String(error)}`);
      client.disconnect();
    }
  }

  @OnEvent('visit.created')
  @OnEvent('visit.status.changed')
  @OnEvent('visit.ready-for-scheduling')
  @OnEvent('urgency.created')
  @OnEvent('urgency.critical')
  @OnEvent('urgency.validated')
  @OnEvent('urgency.approved')
  @OnEvent('urgency.assigned')
  @OnEvent('urgency.status.changed')
  @OnEvent('ticket.created')
  @OnEvent('box.specialty.assigned')
  @OnEvent('box.reserved')
  @OnEvent('box.released')
  @OnEvent('appointment.created')
  @OnEvent('appointment.booked')
  @OnEvent('appointment.confirmed')
  @OnEvent('appointment.checked_in')
  @OnEvent('appointment.missed')
  @OnEvent('appointment.cancelled')
  @OnEvent('appointment.completed')
  @OnEvent('consultation.scheduled')
  @OnEvent('consultation.started')
  @OnEvent('consultation.completed')
  publish(event: Record<string, unknown>) {
    const hospitalId = String(
      event.originHospitalId || event.hospitalId || '',
    );
    if (!hospitalId) return;
    this.server.to(`hospital-${hospitalId}`).emit('workflow.updated', event);
  }

  @OnEvent('queue.recalculated')
  publishQueue(event: { hospitalIds?: string[] }) {
    for (const hospitalId of event.hospitalIds || []) {
      this.server
        .to(`hospital-${hospitalId}`)
        .emit('workflow.updated', event);
    }
  }
}
