import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsDateString,
  IsEmail,
  IsOptional,
  IsPhoneNumber,
  IsBoolean,
  IsEnum,
  MaxLength,
  MinLength,
} from 'class-validator';
import {
  MaritalStatus,
  PatientGender,
} from '../entities/patient.entity';

export class CreatePatientDto {
  @ApiProperty({
    description: 'Patient first name',
    example: 'Jean',
    minLength: 2,
    maxLength: 50,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(50)
  firstName: string;

  @ApiProperty({
    description: 'Patient last name',
    example: 'Kamga',
    minLength: 2,
    maxLength: 50,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(50)
  lastName: string;

  @ApiProperty({
    description: 'Date of birth (ISO format)',
    example: '1980-05-15',
  })
  @IsDateString()
  @IsNotEmpty()
  dateOfBirth: string;

  @ApiPropertyOptional({ enum: PatientGender })
  @IsOptional()
  @IsEnum(PatientGender)
  gender?: PatientGender;

  @ApiPropertyOptional({ enum: MaritalStatus })
  @IsOptional()
  @IsEnum(MaritalStatus)
  maritalStatus?: MaritalStatus;

  @ApiProperty({
    description: 'National ID number (unique)',
    example: '123456789012345',
    minLength: 5,
    maxLength: 50,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(5)
  @MaxLength(50)
  idNumber: string;

  @ApiProperty({
    description: 'Phone number',
    example: '+237699123456',
  })
  @IsString()
  @IsNotEmpty()
  @IsPhoneNumber()
  phone: string;

  @ApiPropertyOptional({
    description: 'Email address',
    example: 'jean.kamga@email.cm',
  })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({
    description: 'Home address',
    example: '456 Market Avenue, Douala',
    maxLength: 255,
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  address?: string;

  @ApiPropertyOptional({
    description: 'Emergency contact name',
    example: 'Marie Kamga',
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  emergencyContactName?: string;

  @ApiPropertyOptional({
    description: 'Emergency contact phone',
    example: '+237699987654',
  })
  @IsOptional()
  @IsString()
  @IsPhoneNumber()
  emergencyContactPhone?: string;

  @ApiPropertyOptional({ description: 'Whether the patient is diabetic' })
  @IsOptional()
  @IsBoolean()
  diabetic?: boolean;

  @ApiPropertyOptional({ description: 'Whether the patient has drug allergies' })
  @IsOptional()
  @IsBoolean()
  hasDrugAllergies?: boolean;

  @ApiPropertyOptional({ description: 'Drug allergy details', maxLength: 1000 })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  allergyDetails?: string;

  @ApiPropertyOptional({ description: 'Existing chronic conditions', maxLength: 1000 })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  chronicConditions?: string;
}
