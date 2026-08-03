import { Module } from '@nestjs/common';
import { FirebaseModule } from '../../config/firebase';
import { HospitalsModule } from '../hospitals/hospitals.module';
import { ConsultationBoxesController } from './consultation-boxes.controller';
import { ConsultationBoxesRepository } from './consultation-boxes.repository';
import { ConsultationBoxesService } from './consultation-boxes.service';

@Module({
  imports: [FirebaseModule, HospitalsModule],
  controllers: [ConsultationBoxesController],
  providers: [ConsultationBoxesService, ConsultationBoxesRepository],
  exports: [ConsultationBoxesService, ConsultationBoxesRepository],
})
export class ConsultationBoxesModule {}
