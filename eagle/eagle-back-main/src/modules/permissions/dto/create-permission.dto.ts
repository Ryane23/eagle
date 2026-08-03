import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsOptional,
  IsObject,
  MinLength,
  MaxLength,
} from 'class-validator';
import { PermissionAction, PermissionResource } from '../entities/permission.entity';

export class CreatePermissionDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(100)
  name: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(10)
  @MaxLength(500)
  description: string;

  @IsEnum(PermissionResource)
  @IsNotEmpty()
  resource: PermissionResource;

  @IsEnum(PermissionAction)
  @IsNotEmpty()
  action: PermissionAction;

  @IsOptional()
  @IsObject()
  conditions?: Record<string, any> | null;
}
