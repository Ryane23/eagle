import { UserRole } from '../../users/entities/user.entity';

export interface RolePermissions {
  id: string;
  role: UserRole;
  permissionIds: string[]; // Array of permission IDs
  description: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export const RolePermissionsCollection = 'role_permissions';
