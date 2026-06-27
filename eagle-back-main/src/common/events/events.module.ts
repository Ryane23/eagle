import { Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { NotificationListener } from './listeners/notification.listener';
import { NotificationsModule } from 'src/modules/notifications/notifications.module';
import { UsersModule } from 'src/modules/users/users.module';
import { HospitalsModule } from 'src/modules/hospitals/hospitals.module';

@Module({
  imports: [
    EventEmitterModule.forRoot(),
    NotificationsModule,
    UsersModule,
    HospitalsModule,
  ],
  providers: [NotificationListener],
  exports: [EventEmitterModule],
})
export class EventsModule {}

