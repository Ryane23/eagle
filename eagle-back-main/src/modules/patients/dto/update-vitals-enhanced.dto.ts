import { ApiProperty } from '@nestjs/swagger';
import {
  IsNumber,
  IsOptional,
  Min,
  Max,
  ValidateNested,
  IsObject,
} from 'class-validator';
import { Type } from 'class-transformer';

class VitalSignsDataDto {
  @ApiProperty({ example: 120, description: 'Systolic blood pressure', required: false })
  @IsOptional()
  @IsNumber()
  bloodPressureSystolic?: number;

  @ApiProperty({ example: 80, description: 'Diastolic blood pressure', required: false })
  @IsOptional()
  @IsNumber()
  bloodPressureDiastolic?: number;

  @ApiProperty({ example: 75, description: 'Heart rate (bpm)', required: false })
  @IsOptional()
  @IsNumber()
  heartRate?: number;

  @ApiProperty({ example: 37.0, description: 'Temperature (°C)', required: false })
  @IsOptional()
  @IsNumber()
  temperature?: number;

  @ApiProperty({ example: 98, description: 'Oxygen saturation (%)', required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  oxygenSaturation?: number;

  @ApiProperty({ example: 70, description: 'Weight (kg)', required: false })
  @IsOptional()
  @IsNumber()
  weight?: number;

  @ApiProperty({ example: 172, description: 'Height (cm)', required: false })
  @IsOptional()
  @IsNumber()
  height?: number;

  @ApiProperty({ example: 16, description: 'Respiratory rate', required: false })
  @IsOptional()
  @IsNumber()
  respiratoryRate?: number;

  @ApiProperty({ example: 1.0, description: 'Glycemia (g/L)', required: false })
  @IsOptional()
  @IsNumber()
  glycemia?: number;
}

export class UpdateVitalsEnhancedDto {
  @ApiProperty({
    description: 'Vital signs data',
    type: VitalSignsDataDto,
  })
  @ValidateNested()
  @Type(() => VitalSignsDataDto)
  vitalSigns: VitalSignsDataDto;
}
