import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, MaxLength } from 'class-validator';

export class CompleteConsultationDto {
  @ApiPropertyOptional({
    description: 'Final diagnosis',
    example: 'Suspected unstable angina. Referral to cardiology recommended.',
    maxLength: 2000,
  })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  diagnosis?: string;

  @ApiPropertyOptional({
    description: 'Additional consultation notes',
    example: 'Patient advised to avoid physical exertion. Follow-up in 48 hours.',
    maxLength: 5000,
  })
  @IsOptional()
  @IsString()
  @MaxLength(5000)
  notes?: string;
}
