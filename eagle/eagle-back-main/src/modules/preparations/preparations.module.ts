import { Module } from '@nestjs/common';
import { PreparationsController } from './preparations.controller';
import { PreparationsService } from './preparations.service';
import { PreparationsRepository } from './preparations.repository';
import { FirebaseModule } from '../../config/firebase/firebase.module';
import { PatientsModule } from '../patients/patients.module';
import { VisitsModule } from '../visits/visits.module';

@Module({
  imports: [FirebaseModule, PatientsModule, VisitsModule],
  controllers: [PreparationsController],
  providers: [PreparationsService, PreparationsRepository],
  exports: [PreparationsService],
})
export class PreparationsModule {}
