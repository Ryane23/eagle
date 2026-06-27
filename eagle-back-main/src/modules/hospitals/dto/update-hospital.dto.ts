import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsOptional, IsString, MaxLength, IsNumber } from 'class-validator';
import { HospitalType } from '../entities/hospital.entity';

export class UpdateHospitalDto {
  @ApiPropertyOptional({
    description: 'Hospital/Center name',
    example: 'Centre Hospitalier de Douala',
    maxLength: 100,
  })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  name?: string;

  @ApiPropertyOptional({
    description: 'Hospital type',
    enum: HospitalType,
    example: HospitalType.SECONDARY,
  })
  @IsEnum(HospitalType)
  @IsOptional()
  type?: HospitalType;

  @ApiPropertyOptional({
    description: 'Full address',
    example: '123 Avenue de la Santé, Bonanjo',
    maxLength: 255,
  })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  address?: string;

  @ApiPropertyOptional({
    description: 'City name',
    example: 'Douala',
    maxLength: 100,
  })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  city?: string;

  @ApiPropertyOptional({
    description: 'Country name',
    example: 'Cameroon',
    maxLength: 100,
  })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  country?: string;

  @ApiPropertyOptional({
    description: 'Contact phone number',
    example: '+237233456789',
    maxLength: 20,
  })
  @IsString()
  @IsOptional()
  @MaxLength(20)
  contactPhone?: string;

  @ApiPropertyOptional({
    description: 'Contact email address',
    example: 'contact@hopital-douala.cm',
  })
  @IsEmail()
  @IsOptional()
  contactEmail?: string;

  @ApiPropertyOptional({
    description: 'Unique center code',
    example: 'DLA',
    maxLength: 10,
  })
  @IsString()
  @IsOptional()
  @MaxLength(10)
  code?: string;

  @ApiPropertyOptional({
    description: 'Maximum patient capacity',
    example: 100,
  })
  @IsOptional()
  @IsNumber()
  capacity?: number;
}
