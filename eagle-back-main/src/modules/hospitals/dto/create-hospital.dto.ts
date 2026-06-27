import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, MaxLength, IsNumber } from 'class-validator';
import { HospitalType } from '../entities/hospital.entity';

export class CreateHospitalDto {
  @ApiProperty({
    description: 'Hospital/Center name',
    example: 'Centre Hospitalier de Douala',
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @ApiProperty({
    description: 'Hospital type (PRIMARY or SECONDARY)',
    enum: HospitalType,
    example: HospitalType.SECONDARY,
  })
  @IsEnum(HospitalType)
  @IsNotEmpty()
  type: HospitalType;

  @ApiProperty({
    description: 'Full address',
    example: '123 Avenue de la Santé, Bonanjo',
    maxLength: 255,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  address: string;

  @ApiProperty({
    description: 'City name',
    example: 'Douala',
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  city: string;

  @ApiProperty({
    description: 'Country name',
    example: 'Cameroon',
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  country: string;

  @ApiProperty({
    description: 'Contact phone number',
    example: '+237233456789',
    maxLength: 20,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  contactPhone: string;

  @ApiProperty({
    description: 'Contact email address',
    example: 'contact@hopital-douala.cm',
  })
  @IsEmail()
  @IsNotEmpty()
  contactEmail: string;

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
