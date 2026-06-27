import { Module } from '@nestjs/common';
import { FollowupsController } from './followups.controller';
import { FollowupsService } from './followups.service';
import { FollowupsRepository } from './followups.repository';
import { FirebaseModule } from 'src/config/firebase';

@Module({
  imports: [FirebaseModule],
  controllers: [FollowupsController],
  providers: [FollowupsService, FollowupsRepository],
  exports: [FollowupsService],
})
export class FollowupsModule {}
