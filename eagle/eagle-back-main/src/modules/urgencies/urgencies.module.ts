import { Module } from '@nestjs/common';
import { FirebaseModule } from '../../config/firebase';
import { PatientsModule } from '../patients/patients.module';
import { HospitalsModule } from '../hospitals/hospitals.module';
import { UrgenciesController } from './urgencies.controller';
import { UrgenciesRepository } from './urgencies.repository';
import { UrgenciesService } from './urgencies.service';

@Module({
  imports: [FirebaseModule, PatientsModule, HospitalsModule],
  controllers: [UrgenciesController],
  providers: [UrgenciesService, UrgenciesRepository],
  exports: [UrgenciesService, UrgenciesRepository],
})
export class UrgenciesModule {}
