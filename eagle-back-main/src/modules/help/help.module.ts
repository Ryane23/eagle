import { Module } from '@nestjs/common';
import { HelpController } from './help.controller';
import { HelpService } from './help.service';
import { HelpRepository } from './help.repository';
import { FirebaseModule } from 'src/config/firebase';

@Module({
  imports: [FirebaseModule],
  controllers: [HelpController],
  providers: [HelpService, HelpRepository],
  exports: [HelpService],
})
export class HelpModule {}
