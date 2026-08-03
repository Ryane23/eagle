import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ConsultationResponseDto {
  @ApiProperty({ description: 'Consultation ID', example: 'consult_abc123' })
  id: string;

  @ApiProperty({ description: 'Patient ID', example: 'patient_xyz789' })
  patientId: string;

  @ApiProperty({ description: 'Doctor ID', example: 'doctor_123' })
  doctorId: string;

  @ApiPropertyOptional({ description: 'Specialty ID', example: 'specialty_cardiology' })
  specialtyId?: string | null;

  @ApiProperty({
    description: 'Consultation type',
    enum: ['video', 'audio', 'chat'],
    example: 'video',
  })
  type: string;

  @ApiProperty({
    description: 'Consultation status',
    enum: ['scheduled', 'in_progress', 'completed', 'cancelled'],
    example: 'scheduled',
  })
  status: string;

  @ApiProperty({ description: 'Scheduled start time', example: '2025-01-15T09:15:00.000Z' })
  scheduledAt: Date;

  @ApiPropertyOptional({ description: 'Actual start time', example: '2025-01-15T09:17:00.000Z' })
  startedAt?: Date | null;

  @ApiPropertyOptional({ description: 'End time', example: '2025-01-15T09:45:00.000Z' })
  endedAt?: Date | null;

  @ApiPropertyOptional({ description: 'Patient symptoms (encrypted)', example: 'Chest pain, shortness of breath' })
  symptoms?: string | null;

  @ApiPropertyOptional({ description: 'Diagnosis (encrypted)', example: 'Suspected unstable angina' })
  diagnosis?: string | null;

  @ApiPropertyOptional({ description: 'Consultation notes (encrypted)' })
  notes?: string | null;

  @ApiPropertyOptional({ description: 'Urgency level', example: '4' })
  urgencyLevel?: string | null;

  @ApiPropertyOptional({ description: 'Consultation fee', example: 15000 })
  fee?: number | null;

  @ApiProperty({ description: 'Creation timestamp', example: '2025-01-15T08:30:00.000Z' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update timestamp', example: '2025-01-15T09:45:00.000Z' })
  updatedAt: Date;
}

