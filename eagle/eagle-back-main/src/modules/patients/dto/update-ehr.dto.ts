import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, MaxLength } from 'class-validator';

export class UpdateEhrDto {
  @ApiPropertyOptional({
    description: 'Medical history (will be encrypted)',
    example: 'Previous surgeries: Appendectomy (2015). Chronic conditions: Hypertension.',
    maxLength: 5000,
  })
  @IsOptional()
  @IsString()
  @MaxLength(5000)
  medicalHistory?: string;

  @ApiPropertyOptional({
    description: 'Known allergies (will be encrypted)',
    example: 'Penicillin, Shellfish',
    maxLength: 2000,
  })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  allergies?: string;

  @ApiPropertyOptional({
    description: 'Current medications (will be encrypted)',
    example: 'Lisinopril 10mg daily, Aspirin 81mg daily',
    maxLength: 2000,
  })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  currentMedications?: string;

  @ApiPropertyOptional({
    description: 'Blood type',
    example: 'O+',
    maxLength: 10,
  })
  @IsOptional()
  @IsString()
  @MaxLength(10)
  bloodType?: string;
}
