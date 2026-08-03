import { IsIn, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';
import { ConsultationBoxStatus } from '../entities/consultation-box.entity';

export class CreateConsultationBoxDto {
  @IsString()
  @IsNotEmpty()
  hospitalId: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(10)
  code: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(80)
  name: string;

  @IsOptional()
  @IsString()
  defaultSpecialtyId?: string;
}

export const ADMIN_CONSULTATION_BOX_STATUSES = [
  ConsultationBoxStatus.AVAILABLE,
  ConsultationBoxStatus.MAINTENANCE,
  ConsultationBoxStatus.OFFLINE,
] as const;

export type AdminConsultationBoxStatus =
  (typeof ADMIN_CONSULTATION_BOX_STATUSES)[number];

export class UpdateConsultationBoxStatusDto {
  @IsIn(ADMIN_CONSULTATION_BOX_STATUSES)
  status: AdminConsultationBoxStatus;
}
