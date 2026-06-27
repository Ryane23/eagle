import { Module } from '@nestjs/common';
import { PatientsController } from './patients.controller';
import { PatientsService } from './patients.service';
import { PatientsRepository } from './patients.repository';
import { FirebaseModule } from 'src/config/firebase';
import { VitalsProcessingService } from 'src/common/services/vitals-processing.service';

@Module({
  imports: [FirebaseModule],
  controllers: [PatientsController],
  providers: [PatientsService, PatientsRepository, VitalsProcessingService],
  exports: [PatientsService],
})
export class PatientsModule {}
