import {
  IsString,
  IsOptional,
  IsEnum,
} from 'class-validator';

export enum RelatedEntityType {
  URGENCY = 'urgency',
  PATIENT = 'patient',
  CONSULTATION = 'consultation',
  PRESCRIPTION = 'prescription',
  OTHER = 'other',
}

export class UploadFileDto {
  @IsOptional()
  @IsString()
  relatedEntityType?: RelatedEntityType;

  @IsOptional()
  @IsString()
  relatedEntityId?: string;
}

