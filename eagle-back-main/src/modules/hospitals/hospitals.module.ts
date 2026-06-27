import { Module } from '@nestjs/common';
import { HospitalsController } from './hospitals.controller';
import { HospitalsService } from './hospitals.service';
import { HospitalsRepository } from './hospitals.repository';
import { FirebaseModule } from 'src/config/firebase';

@Module({
  imports: [FirebaseModule],
  controllers: [HospitalsController],
  providers: [HospitalsService, HospitalsRepository],
  exports: [HospitalsService, HospitalsRepository],
})
export class HospitalsModule {}
