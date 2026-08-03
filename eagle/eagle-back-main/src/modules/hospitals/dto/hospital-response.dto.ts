import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { HospitalType } from '../entities/hospital.entity';

export class HospitalResponseDto {
  @ApiProperty({ description: 'Hospital ID', example: 'hospital_douala_001' })
  id: string;

  @ApiProperty({
    description: 'Hospital name',
    example: 'Centre Hospitalier de Douala',
  })
  name: string;

  @ApiProperty({
    description: 'Hospital type',
    enum: HospitalType,
    example: HospitalType.SUB,
  })
  type: HospitalType;

  @ApiPropertyOptional({
    description: 'Parent PRIMARY hospital ID; null for PRIMARY hospitals',
    example: 'primary_hospital_001',
    nullable: true,
  })
  parentHospitalId: string | null;

  @ApiProperty({
    description: 'Full address',
    example: '123 Avenue de la Santé, Bonanjo',
  })
  address: string;

  @ApiProperty({ description: 'City', example: 'Douala' })
  city: string;

  @ApiProperty({ description: 'Country', example: 'Cameroon' })
  country: string;

  @ApiProperty({ description: 'Contact phone', example: '+237233456789' })
  contactPhone: string;

  @ApiProperty({
    description: 'Contact email',
    example: 'contact@hopital-douala.cm',
  })
  contactEmail: string;

  @ApiProperty({ description: 'Active status', example: true })
  isActive: boolean;

  @ApiPropertyOptional({ description: 'Center code', example: 'DLA' })
  code?: string;

  @ApiPropertyOptional({ description: 'Patient capacity', example: 100 })
  capacity?: number | null;

  @ApiProperty({
    description: 'Creation timestamp',
    example: '2025-01-01T00:00:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Last update timestamp',
    example: '2025-01-15T10:30:00.000Z',
  })
  updatedAt: Date;
}

export class HospitalTreeNodeResponseDto extends HospitalResponseDto {
  @ApiProperty({
    description: 'Direct child hospitals in the database hierarchy',
    type: () => [HospitalTreeNodeResponseDto],
  })
  children: HospitalTreeNodeResponseDto[];
}
