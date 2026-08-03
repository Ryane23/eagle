import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PermissionsRepository } from './permissions.repository';
import { CreatePermissionDto, UpdatePermissionDto, AssignPermissionsDto } from './dto';
import { Permission } from './entities/permission.entity';
import { RolePermissions } from './entities/role.entity';
import { UserRole } from '../users/entities/user.entity';

@Injectable()
export class PermissionsService {
  constructor(private readonly permissionsRepository: PermissionsRepository) {}

  /**
   * Create new permission
   */
  async create(createPermissionDto: CreatePermissionDto): Promise<Permission> {
    // Check if permission with same name exists
    const existing = await this.permissionsRepository.findByName(createPermissionDto.name);
    if (existing) {
      throw new ConflictException(`Permission with name "${createPermissionDto.name}" already exists`);
    }

    const permissionData: Partial<Permission> = {
      ...createPermissionDto,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    return await this.permissionsRepository.create(permissionData);
  }

  /**
   * Get all permissions
   */
  async findAll(): Promise<Permission[]> {
    return await this.permissionsRepository.findAll();
  }

  /**
   * Get active permissions only
   */
  async findActive(): Promise<Permission[]> {
    return await this.permissionsRepository.findActive();
  }

  /**
   * Get permission by ID
   */
  async findById(id: string): Promise<Permission> {
    const permission = await this.permissionsRepository.findById(id);
    if (!permission) {
      throw new NotFoundException(`Permission with ID ${id} not found`);
    }
    return permission;
  }

  /**
   * Get permissions by resource
   */
  async findByResource(resource: string): Promise<Permission[]> {
    return await this.permissionsRepository.findByResource(resource);
  }

  /**
   * Update permission
   */
  async update(id: string, updatePermissionDto: UpdatePermissionDto): Promise<Permission> {
    await this.findById(id); // Check if exists

    const updated = await this.permissionsRepository.update(id, {
      ...updatePermissionDto,
      updatedAt: new Date(),
    });

    if (!updated) {
      throw new NotFoundException(`Permission with ID ${id} not found`);
    }

    return updated;
  }

  /**
   * Delete permission
   */
  async delete(id: string): Promise<void> {
    await this.findById(id); // Check if exists
    await this.permissionsRepository.delete(id);
  }

  /**
   * Activate/deactivate permission
   */
  async toggleActive(id: string): Promise<Permission> {
    const permission = await this.findById(id);
    return await this.update(id, { isActive: !permission.isActive });
  }

  /**
   * Assign permissions to a role
   */
  async assignPermissionsToRole(assignDto: AssignPermissionsDto): Promise<RolePermissions> {
    // Verify all permissions exist
    const permissions = await Promise.all(
      assignDto.permissionIds.map((id) => this.findById(id)),
    );

    const rolePermissions: Partial<RolePermissions> = {
      role: assignDto.role,
      permissionIds: assignDto.permissionIds,
      description: `Permissions for ${assignDto.role}`,
    };

    return await this.permissionsRepository.setRolePermissions(rolePermissions);
  }

  /**
   * Get permissions for a role
   */
  async getRolePermissions(role: UserRole): Promise<Permission[]> {
    const rolePermissions = await this.permissionsRepository.getRolePermissions(role);
    
    if (!rolePermissions || rolePermissions.permissionIds.length === 0) {
      return [];
    }

    const permissions = await Promise.all(
      rolePermissions.permissionIds.map((id) => this.permissionsRepository.findById(id)),
    );

    return permissions.filter((p) => p !== null && p.isActive) as Permission[];
  }

  /**
   * Get all role-permission mappings
   */
  async getAllRolePermissions(): Promise<RolePermissions[]> {
    return await this.permissionsRepository.getAllRolePermissions();
  }

  /**
   * Check if user has specific permission
   */
  async userHasPermission(
    userRole: UserRole,
    resource: string,
    action: string,
  ): Promise<boolean> {
    const permissions = await this.getRolePermissions(userRole);
    
    return permissions.some(
      (p) => p.resource === resource && p.action === action && p.isActive,
    );
  }
}
