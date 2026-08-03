import { PartialType } from '@nestjs/mapped-types';
import { CreateReferralDto } from './create-referral.dto';
import { IsEnum, IsOptional } from 'class-validator';
import { ReferralStatus } from '../entities/referral.entity';

export class UpdateReferralDto extends PartialType(CreateReferralDto) {
  @IsOptional()
  @IsEnum(ReferralStatus)
  status?: ReferralStatus;
}
