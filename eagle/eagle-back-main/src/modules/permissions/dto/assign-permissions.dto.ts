import { IsEnum, IsArray, IsNotEmpty } from 'class-validator';
import { UserRole } from '../../users/entities/user.entity';

export class AssignPermissionsDto {
  @IsEnum(UserRole)
  @IsNotEmpty()
  role: UserRole;

  @IsArray()
  @IsNotEmpty()
  permissionIds: string[];
}
