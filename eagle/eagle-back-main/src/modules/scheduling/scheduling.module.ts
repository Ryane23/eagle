import { Module } from '@nestjs/common';
import { FirebaseModule } from '../../config/firebase';
import { TicketsModule } from '../tickets/tickets.module';
import { SchedulingController } from './scheduling.controller';
import { SchedulingService } from './scheduling.service';

@Module({
  imports: [FirebaseModule, TicketsModule],
  controllers: [SchedulingController],
  providers: [SchedulingService],
  exports: [SchedulingService],
})
export class SchedulingModule {}
