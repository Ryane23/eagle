import { Module } from '@nestjs/common';
import { HospitalsController } from './hospitals.controller';
import { HospitalsService } from './hospitals.service';
import { HospitalsRepository } from './hospitals.repository';
import { FirebaseModule } from '../../config/firebase';
import { HospitalScopeService } from './hospital-scope.service';

@Module({
  imports: [FirebaseModule],
  controllers: [HospitalsController],
  providers: [HospitalsService, HospitalsRepository, HospitalScopeService],
  exports: [HospitalsService, HospitalsRepository, HospitalScopeService],
})
export class HospitalsModule {}
