import { Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { NotificationListener } from './listeners/notification.listener';
import { NotificationsModule } from '../../modules/notifications/notifications.module';
import { UsersModule } from '../../modules/users/users.module';
import { HospitalsModule } from '../../modules/hospitals/hospitals.module';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { FirebaseModule } from '../../config/firebase';
import { WorkflowGateway } from './workflow.gateway';

@Module({
  imports: [
    EventEmitterModule.forRoot(),
    NotificationsModule,
    UsersModule,
    HospitalsModule,
    FirebaseModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [NotificationListener, WorkflowGateway],
  exports: [EventEmitterModule],
})
export class EventsModule {}
