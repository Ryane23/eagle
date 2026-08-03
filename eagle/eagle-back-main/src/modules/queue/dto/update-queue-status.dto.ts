import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsDateString,
} from 'class-validator';
import { QueueStatus } from '../entities/queue.entity';

export class UpdateQueueStatusDto {
  @IsEnum(QueueStatus)
  @IsNotEmpty()
  status: QueueStatus;

  @IsOptional()
  @IsDateString()
  calledAt?: string; // ISO date string (optional, used when status is IN_PROGRESS)
}
