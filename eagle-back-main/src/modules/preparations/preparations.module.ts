import { Module } from '@nestjs/common';
import { PreparationsController } from './preparations.controller';
import { PreparationsService } from './preparations.service';
import { PreparationsRepository } from './preparations.repository';
import { FirebaseModule } from 'src/config/firebase/firebase.module';

@Module({
  imports: [FirebaseModule],
  controllers: [PreparationsController],
  providers: [PreparationsService, PreparationsRepository],
  exports: [PreparationsService],
})
export class PreparationsModule {}
