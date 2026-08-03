import { Module } from '@nestjs/common';
import { ConsultationsController } from './consultations.controller';
import { ConsultationsService } from './consultations.service';
import { ConsultationsRepository } from './consultations.repository';
import { FirebaseModule } from '../../config/firebase';
import { QueueModule } from '../queue/queue.module';
import { EventsModule } from '../../common/events/events.module';

@Module({
  imports: [FirebaseModule, QueueModule, EventsModule],
  controllers: [ConsultationsController],
  providers: [ConsultationsService, ConsultationsRepository],
  exports: [ConsultationsService],
})
export class ConsultationsModule {}
