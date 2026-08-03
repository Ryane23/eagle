import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsOptional,
  MaxLength,
} from 'class-validator';
import { MessageType } from '../entities/message.entity';

export class CreateMessageDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  consultationId?: string;

  @IsString()
  @IsNotEmpty()
  receiverId: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(5000)
  content: string;

  @IsEnum(MessageType)
  @IsNotEmpty()
  type: MessageType;

  @IsOptional()
  @IsString()
  attachmentUrl?: string;
}
