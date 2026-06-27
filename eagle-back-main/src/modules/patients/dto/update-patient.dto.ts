import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsDateString,
  IsEmail,
  IsOptional,
  IsPhoneNumber,
  MaxLength,
  MinLength,
} from 'class-validator';

export class UpdatePatientDto {
  @ApiPropertyOptional({
    description: 'Patient first name',
    example: 'Jean',
    minLength: 2,
    maxLength: 50,
  })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  firstName?: string;

  @ApiPropertyOptional({
    description: 'Patient last name',
    example: 'Kamga',
    minLength: 2,
    maxLength: 50,
  })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  lastName?: string;

  @ApiPropertyOptional({
    description: 'Date of birth (ISO format)',
    example: '1980-05-15',
  })
  @IsOptional()
  @IsDateString()
  dateOfBirth?: string;

  @ApiPropertyOptional({
    description: 'National ID number',
    example: '123456789012345',
    minLength: 5,
    maxLength: 50,
  })
  @IsOptional()
  @IsString()
  @MinLength(5)
  @MaxLength(50)
  idNumber?: string;

  @ApiPropertyOptional({
    description: 'Phone number',
    example: '+237699123456',
  })
  @IsOptional()
  @IsString()
  @IsPhoneNumber()
  phone?: string;

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
}
