import { Module } from '@nestjs/common';
import { FirebaseModule } from '../../config/firebase';
import { PatientsModule } from '../patients/patients.module';
import { VisitsController } from './visits.controller';
import { VisitsRepository } from './visits.repository';
import { VisitsService } from './visits.service';

@Module({
  imports: [FirebaseModule, PatientsModule],
  controllers: [VisitsController],
  providers: [VisitsService, VisitsRepository],
  exports: [VisitsService, VisitsRepository],
})
export class VisitsModule {}
