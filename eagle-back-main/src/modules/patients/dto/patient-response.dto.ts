import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class PatientResponseDto {
  @ApiProperty({ description: 'Patient ID', example: 'patient_abc123' })
  id: string;

  @ApiProperty({ description: 'First name', example: 'Jean' })
  firstName: string;

  @ApiProperty({ description: 'Last name', example: 'Kamga' })
  lastName: string;

  @ApiProperty({ description: 'Date of birth', example: '1980-05-15T00:00:00.000Z' })
  dateOfBirth: Date;

  @ApiProperty({ description: 'National ID number', example: '123456789012345' })
  idNumber: string;

  @ApiProperty({ description: 'Phone number', example: '+237699123456' })
  phone: string;

  @ApiProperty({ description: 'Hospital ID where registered', example: 'hospital_douala_001' })
  hospitalId: string;

  @ApiPropertyOptional({ description: 'Email address', example: 'jean.kamga@email.cm' })
  email?: string | null;

  @ApiPropertyOptional({ description: 'Home address', example: '456 Market Avenue, Douala' })
  address?: string | null;

  @ApiPropertyOptional({ description: 'Emergency contact name', example: 'Marie Kamga' })
  emergencyContactName?: string | null;

  @ApiPropertyOptional({ description: 'Emergency contact phone', example: '+237699987654' })
  emergencyContactPhone?: string | null;

  @ApiProperty({ description: 'Active status', example: true })
  isActive: boolean;

  @ApiPropertyOptional({
    description: 'Latest vital signs',
    example: { bloodPressure: '165/95', heartRate: 95, temperature: 37.2 },
  })
  vitalSigns?: Record<string, any> | null;

  @ApiPropertyOptional({ description: 'Vital signs last update', example: '2025-01-15T09:12:00.000Z' })
  vitalSignsUpdatedAt?: Date | null;

  @ApiPropertyOptional({ description: 'Blood type', example: 'O+' })
  bloodType?: string | null;

  @ApiProperty({ description: 'Creation timestamp', example: '2025-01-15T08:30:00.000Z' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update timestamp', example: '2025-01-15T09:12:00.000Z' })
  updatedAt: Date;
}

