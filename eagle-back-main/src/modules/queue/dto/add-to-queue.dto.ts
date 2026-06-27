import {
  IsString,
  IsNotEmpty,
  IsOptional,
  MinLength,
  MaxLength,
} from 'class-validator';

export class AddToQueueDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  consultationId: string;

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
