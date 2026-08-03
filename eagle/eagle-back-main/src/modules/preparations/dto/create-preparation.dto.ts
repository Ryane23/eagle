import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';

export class CreatePreparationDto {
  @ApiProperty({
    description: 'Patient ID',
    example: 'pat-123',
  })
  @IsString()
  patientId: string;

  @ApiProperty({
    description: 'Clinical visit being prepared',
    example: 'visit-123',
    required: false,
  })
  @IsOptional()
  @IsString()
  visitId?: string;

  @ApiProperty({
    description: 'Consultation ID (if linked to consultation)',
    example: 'cons-123',
    required: false,
  })
  @IsOptional()
  @IsString()
  consultationId?: string;

  @ApiProperty({
    description: 'Urgency ID (if linked to urgency)',
    example: 'urg-123',
    required: false,
  })
  @IsOptional()
  @IsString()
  urgencyId?: string;
}
