import { Module } from '@nestjs/common';
import { FirebaseModule } from '../../config/firebase';
import { SystemController } from './system.controller';
import { SystemService } from './system.service';

@Module({
  imports: [FirebaseModule],
  controllers: [SystemController],
  providers: [SystemService],
  exports: [SystemService],
})
export class SystemModule {}
