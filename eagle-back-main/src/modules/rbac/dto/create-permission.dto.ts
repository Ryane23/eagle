import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { ResourceType, ActionType } from '../entities/permission.entity';

export class CreatePermissionDto {
  @IsEnum(ResourceType)
  resource: ResourceType;

  @IsEnum(ActionType)
  action: ActionType;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;
}
