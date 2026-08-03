import { Module } from '@nestjs/common';
import { PrescriptionsController } from './prescriptions.controller';
import { PrescriptionsService } from './prescriptions.service';
import { PrescriptionsRepository } from './prescriptions.repository';
import { FirebaseModule } from '../../config/firebase';
import { EventsModule } from '../../common/events/events.module';

@Module({
  imports: [FirebaseModule, EventsModule],
  controllers: [PrescriptionsController],
  providers: [PrescriptionsService, PrescriptionsRepository],
  exports: [PrescriptionsService, PrescriptionsRepository],
})
export class PrescriptionsModule {}
