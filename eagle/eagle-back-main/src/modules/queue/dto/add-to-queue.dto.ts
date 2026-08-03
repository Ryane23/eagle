import {
  IsString,
  IsNotEmpty,
  IsOptional,
  MinLength,
  MaxLength,
} from 'class-validator';

export class AddToQueueDto {
  @IsString()
  @IsOptional()
  @MinLength(1)
  consultationId?: string;

  @IsOptional()
  @IsString()
  visitId?: string;

  @IsOptional()
  @IsString()
  originHospitalId?: string;

  @IsOptional()
  @IsString()
  appointmentId?: string;

  @IsOptional()
  @IsString()
  referralId?: string;

  @IsOptional()
  @IsString()
  boxId?: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  patientId: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  specialtyId?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  urgencyLevel?: string | null; // UrgencyLevel enum as string (LOW, MODERATE, URGENT, CRITICAL)

  @IsOptional()
  @IsString()
  @MinLength(1)
  urgencyId?: string | null; // Reference to urgencies collection for validation status
}
