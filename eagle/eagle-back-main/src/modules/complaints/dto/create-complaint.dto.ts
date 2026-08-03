import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsOptional,
  MaxLength,
  MinLength,
} from 'class-validator';
import { ComplaintType, ComplaintPriority } from '../entities/complaint.entity';

export class CreateComplaintDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(200)
  title: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(10)
  @MaxLength(2000)
  description: string;

  @IsEnum(ComplaintType)
  @IsNotEmpty()
  type: ComplaintType;

  @IsEnum(ComplaintPriority)
  @IsNotEmpty()
  priority: ComplaintPriority;

  @IsOptional()
  @IsString()
  relatedUserId?: string;

  @IsOptional()
  @IsString()
  relatedHospitalId?: string;

  @IsOptional()
  @IsString()
  relatedConsultationId?: string;
}

