import { Module } from '@nestjs/common';
import { QueueController } from './queue.controller';
import { QueueService } from './queue.service';
import { QueueRepository } from './queue.repository';
import { FirebaseModule } from 'src/config/firebase';

@Module({
  imports: [FirebaseModule],
  controllers: [QueueController],
  providers: [QueueService, QueueRepository],
  exports: [QueueService, QueueRepository],
})
export class QueueModule {}
