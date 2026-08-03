import { IsString, IsNotEmpty, IsOptional, IsObject } from 'class-validator';

export class AssignPermissionDto {
  @IsString()
  @IsNotEmpty()
  roleId: string;

  @IsString()
  @IsNotEmpty()
  permissionId: string;

  @IsOptional()
  @IsObject()
  conditions?: Record<string, any>;
}
