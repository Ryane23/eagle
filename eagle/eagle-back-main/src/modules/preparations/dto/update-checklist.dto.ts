import { ApiProperty } from '@nestjs/swagger';
import { IsObject, IsOptional, ValidateNested, IsBoolean, IsArray, IsString, IsNumber, Min, Max } from 'class-validator';
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

class TechnicalChecklistDto {
  @ApiProperty({ example: true })
  @IsBoolean()
  videoTested: boolean;

  @ApiProperty({ example: true })
  @IsBoolean()
  audioTested: boolean;

  @ApiProperty({ example: true })
  @IsBoolean()
  patientPositioned: boolean;

  @ApiProperty({ example: true })
  @IsBoolean()
  lightingAdjusted: boolean;
}

class PsychologicalStateDto {
  @ApiProperty({ example: 7, minimum: 1, maximum: 10 })
  @IsNumber()
  @Min(1)
  @Max(10)
  anxietyLevel: number;

  @ApiProperty({ example: 'Excellent' })
  @IsString()
  cooperation: string;

  @ApiProperty({ example: 'Good' })
  @IsString()
  understanding: string;

  @ApiProperty({ example: 'Patient is calm after explanation', required: false })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdateChecklistDto {
  @ApiProperty({ type: TechnicalChecklistDto, required: false })
  @IsOptional()
  @ValidateNested()
  @Type(() => TechnicalChecklistDto)
  technicalChecklist?: TechnicalChecklistDto;

  @ApiProperty({ type: [String], required: false, example: ['What causes this pain?', 'Do I need surgery?'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  questionsForDoctor?: string[];

  @ApiProperty({ type: [String], required: false, example: ['ECG', 'Blood test'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  suggestedExams?: string[];

  @ApiProperty({ type: PsychologicalStateDto, required: false })
  @IsOptional()
  @ValidateNested()
  @Type(() => PsychologicalStateDto)
  psychologicalState?: PsychologicalStateDto;
}
