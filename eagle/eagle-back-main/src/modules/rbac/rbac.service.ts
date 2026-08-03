import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import {
  PermissionsRepository,
  RolePermissionsRepository,
} from './rbac.repository';
import { CreatePermissionDto, AssignPermissionDto } from './dto';
import { Permission, RolePermission } from './entities/permission.entity';

@Injectable()
export class RbacService {
  constructor(
    private readonly permissionsRepository: PermissionsRepository,
    private readonly rolePermissionsRepository: RolePermissionsRepository,
  ) {}

  /**
   * Create a new permission
   */
  async createPermission(
    createPermissionDto: CreatePermissionDto,
  ): Promise<Permission> {
    // Check if permission already exists
    const existing = await this.permissionsRepository.findByResourceAndAction(
      createPermissionDto.resource,
      createPermissionDto.action,
    );

    if (existing) {
      throw new ConflictException(
        `Permission for ${createPermissionDto.action} on ${createPermissionDto.resource} already exists`,
      );
    }

    const permission: Partial<Permission> = {
      ...createPermissionDto,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    return await this.permissionsRepository.create(permission);
  }

  /**
   * Get all permissions
   */
  async findAllPermissions(): Promise<Permission[]> {
    return await this.permissionsRepository.findAll();
  }

  /**
   * Get permission by ID
   */
  async findPermissionById(id: string): Promise<Permission> {
    const permission = await this.permissionsRepository.findById(id);
    if (!permission) {
      throw new NotFoundException(`Permission with ID ${id} not found`);
    }
    return permission;
  }

  /**
   * Get permissions by resource
   */
  async findPermissionsByResource(resource: string): Promise<Permission[]> {
    return await this.permissionsRepository.findByResource(resource);
  }

  /**
   * Delete a permission
   */
  async deletePermission(id: string): Promise<void> {
    const permission = await this.findPermissionById(id);

    // Delete all role-permission associations
    await this.rolePermissionsRepository.deleteByPermission(id);

    // Delete the permission
    await this.permissionsRepository.delete(id);
  }

  /**
   * Assign permission to role
   */
  async assignPermission(
    assignPermissionDto: AssignPermissionDto,
  ): Promise<RolePermission> {
    const { roleId, permissionId, conditions } = assignPermissionDto;

    // Verify permission exists
    await this.findPermissionById(permissionId);

    // Check if already assigned
    const existing =
      await this.rolePermissionsRepository.findByRoleAndPermission(
        roleId,
        permissionId,
      );

    if (existing) {
      throw new ConflictException(
        `Permission ${permissionId} is already assigned to role ${roleId}`,
      );
    }

    const rolePermission: Partial<RolePermission> = {
      roleId,
      permissionId,
      conditions,
      createdAt: new Date(),
    };

    return await this.rolePermissionsRepository.create(rolePermission);
  }

  /**
   * Remove permission from role
   */
  async revokePermission(roleId: string, permissionId: string): Promise<void> {
    const rolePermission =
      await this.rolePermissionsRepository.findByRoleAndPermission(
        roleId,
        permissionId,
      );

    if (!rolePermission) {
      throw new NotFoundException(
        `Permission ${permissionId} is not assigned to role ${roleId}`,
      );
    }

    await this.rolePermissionsRepository.delete(rolePermission.id);
  }

  /**
   * Get all permissions for a role
   */
  async getRolePermissions(roleId: string): Promise<Permission[]> {
    const rolePermissions =
      await this.rolePermissionsRepository.findByRole(roleId);

    const permissions = await Promise.all(
      rolePermissions.map((rp) =>
        this.permissionsRepository.findById(rp.permissionId),
      ),
    );

    return permissions.filter((p) => p !== null) as Permission[];
  }

  /**
   * Check if role has specific permission
   */
  async hasPermission(
    roleId: string,
    resource: string,
    action: string,
  ): Promise<boolean> {
    const rolePermissions =
      await this.rolePermissionsRepository.findByRole(roleId);

    for (const rp of rolePermissions) {
      const permission = await this.permissionsRepository.findById(
        rp.permissionId,
      );
      if (
        permission &&
        permission.resource === resource &&
        (permission.action === action || permission.action === 'manage')
      ) {
        return true;
      }
    }

    return false;
  }

  /**
   * Get all roles that have a specific permission
   */
  async getRolesWithPermission(permissionId: string): Promise<string[]> {
    const rolePermissions =
      await this.rolePermissionsRepository.findByPermission(permissionId);

    return rolePermissions.map((rp) => rp.roleId);
  }
}
