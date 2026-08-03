import { Module } from '@nestjs/common';
import { FirebaseModule } from '../../config/firebase';
import { VisitsModule } from '../visits/visits.module';
import { TicketsController } from './tickets.controller';
import { TicketsRepository } from './tickets.repository';
import { TicketsService } from './tickets.service';

@Module({
  imports: [FirebaseModule, VisitsModule],
  controllers: [TicketsController],
  providers: [TicketsService, TicketsRepository],
  exports: [TicketsService, TicketsRepository],
})
export class TicketsModule {}
