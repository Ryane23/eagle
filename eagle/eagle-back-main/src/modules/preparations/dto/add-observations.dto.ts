import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, ValidateNested, IsNumber, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

class SymptomHistoryDto {
  @ApiProperty({ example: 'Chest pain' })
  @IsString()
  chiefComplaint: string;

  @ApiProperty({ example: '3 days' })
  @IsString()
  duration: string;

  @ApiProperty({ example: 6, minimum: 1, maximum: 10 })
  @IsNumber()
  @Min(1)
  @Max(10)
  severity: number;

  @ApiProperty({ example: 'Pressure-like, worse with exertion' })
  @IsString()
  characteristics: string;
}

export class AddObservationsDto {
  @ApiProperty({
    description: 'Clinical observations',
    example: 'Patient appears anxious, chest pain 6/10',
  })
  @IsString()
  observations: string;

  @ApiProperty({
    description: 'Symptom history details',
    type: SymptomHistoryDto,
    required: false,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => SymptomHistoryDto)
  symptomHistory?: SymptomHistoryDto;
}
