import { PartialType } from '@nestjs/mapped-types';
import { CreateFaqDto } from './create-faq.dto';
import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateFaqDto extends PartialType(CreateFaqDto) {
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
