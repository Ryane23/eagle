import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsOptional,
  IsArray,
  MinLength,
  MaxLength,
  IsDateString,
} from 'class-validator';
import { ReferralPriority } from '../entities/referral.entity';

export class CreateReferralDto {
  @IsString()
  @IsNotEmpty()
  patientId: string;

  @IsOptional()
  @IsString()
  urgencyId?: string | null;

  @IsString()
  @IsNotEmpty()
  toHospitalId: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(20)
  @MaxLength(1000)
  reason: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(50)
  @MaxLength(5000)
  medicalSummary: string;

  @IsOptional()
  @IsString()
  specialtyNeeded?: string | null;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  requiredResources?: string[] | null;

  @IsEnum(ReferralPriority)
  @IsNotEmpty()
  priority: ReferralPriority;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  attachmentUrls?: string[] | null;

  @IsOptional()
  @IsDateString()
  estimatedArrivalTime?: string | null;
}
