import { IsEnum, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';
import { VisitType } from '../entities/visit.entity';

export class CreateVisitDto {
  @IsString()
  @IsNotEmpty()
  patientId: string;

  @IsEnum(VisitType)
  type: VisitType;

  @IsOptional()
  @IsString()
  @MinLength(2)
  complaint?: string;

  @IsOptional()
  @IsString()
  departmentId?: string;

  @IsOptional()
  @IsString()
  specialtyId?: string;

  @IsOptional()
  @IsString()
  appointmentId?: string;

  @IsOptional()
  @IsString()
  referralId?: string;
}

export class SelectVisitSpecialtyDto {
  @IsString()
  @IsNotEmpty()
  specialtyId: string;

  @IsOptional()
  @IsString()
  boxId?: string;
}
