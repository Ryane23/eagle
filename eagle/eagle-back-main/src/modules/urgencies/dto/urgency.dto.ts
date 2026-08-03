import { IsDateString, IsEnum, IsNotEmpty, IsObject, IsOptional, IsString, MinLength } from 'class-validator';
import { UrgencyLevel } from '../entities/urgency.entity';

export class CreateUrgencyDto {
  @IsString() @IsNotEmpty() patientId: string;
  @IsString() @IsNotEmpty() visitId: string;
  @IsEnum(UrgencyLevel) level: UrgencyLevel;
  @IsString() @MinLength(2) reasonForConsultation: string;
  @IsString() @IsNotEmpty() requestedSpecialty: string;
  @IsOptional() @IsString() symptoms?: string;
  @IsOptional() @IsObject() vitalSigns?: Record<string, unknown>;
}

export class ValidateUrgencyDto {
  @IsEnum(UrgencyLevel) newLevel: UrgencyLevel;
  @IsString() @MinLength(3) justification: string;
}

export class AssignUrgencyDto {
  @IsString() @IsNotEmpty() assignedDoctorId: string;
  @IsDateString() scheduledAt: string;
}
