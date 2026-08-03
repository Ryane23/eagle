import { ApiProperty } from '@nestjs/swagger';

export class UserResponseDto {
  @ApiProperty({ description: 'User ID', example: 'user_abc123' })
  id: string;

  @ApiProperty({ description: 'User email', example: 'doctor@eagle.cm' })
  email: string;

  @ApiProperty({ description: 'User full name', example: 'Dr. Jean Kamga' })
  name: string;

  @ApiProperty({
    description: 'User role',
    example: 'doctor',
    enum: ['admin', 'primary_secretary', 'secondary_secretary', 'nurse', 'doctor'],
  })
  role: string;

  @ApiProperty({ description: 'Phone number', example: '+237612345678', required: false, nullable: true })
  phone?: string | null;

  @ApiProperty({ description: 'Hospital ID', example: 'hospital_douala_001', required: false, nullable: true })
  hospitalId?: string | null;

  @ApiProperty({ description: 'Specialty ID (doctors only)', example: 'specialty_cardiology', required: false, nullable: true })
  specialtyId?: string | null;

  @ApiProperty({ description: 'Account status', example: true })
  isActive: boolean;

  @ApiProperty({ description: 'Creation timestamp', example: '2025-01-15T10:30:00.000Z' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update timestamp', example: '2025-01-15T10:30:00.000Z' })
  updatedAt: Date;
}

export class AuthResponseDto {
  @ApiProperty({
    description: 'JWT access token',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  accessToken: string;

  @ApiProperty({
    description: 'JWT refresh token for obtaining new access tokens',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  refreshToken: string;

  @ApiProperty({
    description: 'Authenticated user data',
    type: UserResponseDto,
  })
  user: UserResponseDto;

  @ApiProperty({
    description: 'Access token expiration time in seconds',
    example: 3600,
  })
  expiresIn: number;
}
