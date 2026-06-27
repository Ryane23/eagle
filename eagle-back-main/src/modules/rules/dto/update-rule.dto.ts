import { PartialType } from '@nestjs/swagger';
import { CreateRuleDto } from './create-rule.dto';
import { IsBoolean, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateRuleDto extends PartialType(CreateRuleDto) {
  @ApiPropertyOptional({ description: 'Active status', example: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
