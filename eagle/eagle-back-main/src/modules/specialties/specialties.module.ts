import { Module } from '@nestjs/common';
import { SpecialtiesController } from './specialties.controller';
import { SpecialtiesService } from './specialties.service';
import { SpecialtiesRepository } from './specialties.repository';
import { FirebaseModule } from '../../config/firebase';

@Module({
  imports: [FirebaseModule],
  controllers: [SpecialtiesController],
  providers: [SpecialtiesService, SpecialtiesRepository],
  exports: [SpecialtiesService],
})
export class SpecialtiesModule {}
