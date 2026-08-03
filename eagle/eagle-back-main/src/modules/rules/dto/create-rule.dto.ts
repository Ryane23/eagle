import { IsString, IsEnum, IsOptional, IsObject, IsNotEmpty } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserRole } from '../../users/entities/user.entity';
import { RuleAction, RuleResource } from '../entities/rule.entity';

export class CreateRuleDto {
  @ApiProperty({ description: 'Rule name', example: 'Doctor can read own consultations' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ description: 'Rule description', example: 'Allows doctors to view consultations assigned to them' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ description: 'User role', enum: UserRole, example: UserRole.DOCTOR })
  @IsEnum(UserRole)
  role: UserRole;

  @ApiProperty({ description: 'Resource type', enum: RuleResource, example: RuleResource.CONSULTATIONS })
  @IsEnum(RuleResource)
  resource: RuleResource;

  @ApiProperty({ description: 'Action', enum: RuleAction, example: RuleAction.READ })
  @IsEnum(RuleAction)
  action: RuleAction;

  @ApiPropertyOptional({ 
    description: 'Conditions as JSON object',
    example: { "doctorId": "$user.id" }
  })
  @IsObject()
  @IsOptional()
  conditions?: Record<string, any>;
}
