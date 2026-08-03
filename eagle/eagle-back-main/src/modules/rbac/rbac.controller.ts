import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { RbacService } from './rbac.service';
import { CreatePermissionDto, AssignPermissionDto } from './dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';

@ApiTags('RBAC')
@ApiBearerAuth('JWT-auth')
@Controller('rbac')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class RbacController {
  constructor(private readonly rbacService: RbacService) {}

  // ========== Permissions Management ==========

  @Post('permissions')
  @ApiOperation({ summary: 'Create a new permission' })
  @ApiResponse({ status: 201, description: 'Permission created successfully' })
  async createPermission(@Body() createPermissionDto: CreatePermissionDto) {
    return await this.rbacService.createPermission(createPermissionDto);
  }

  @Get('permissions')
  @ApiOperation({ summary: 'Get all permissions' })
  @ApiResponse({ status: 200, description: 'List of all permissions' })
  async findAllPermissions() {
    return await this.rbacService.findAllPermissions();
  }

  @Get('permissions/:id')
  @ApiOperation({ summary: 'Get permission by ID' })
  @ApiResponse({ status: 200, description: 'Permission details' })
  async findPermissionById(@Param('id') id: string) {
    return await this.rbacService.findPermissionById(id);
  }

  @Get('permissions/resource/:resource')
  @ApiOperation({ summary: 'Get permissions by resource' })
  @ApiResponse({ status: 200, description: 'List of permissions for resource' })
  async findPermissionsByResource(@Param('resource') resource: string) {
    return await this.rbacService.findPermissionsByResource(resource);
  }

  @Delete('permissions/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a permission' })
  @ApiResponse({ status: 204, description: 'Permission deleted successfully' })
  async deletePermission(@Param('id') id: string) {
    await this.rbacService.deletePermission(id);
  }

  // ========== Role-Permission Assignment ==========

  @Post('roles/permissions')
  @ApiOperation({ summary: 'Assign permission to role' })
  @ApiResponse({ status: 201, description: 'Permission assigned successfully' })
  async assignPermission(@Body() assignPermissionDto: AssignPermissionDto) {
    return await this.rbacService.assignPermission(assignPermissionDto);
  }

  @Delete('roles/:roleId/permissions/:permissionId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Revoke permission from role' })
  @ApiResponse({ status: 204, description: 'Permission revoked successfully' })
  async revokePermission(
    @Param('roleId') roleId: string,
    @Param('permissionId') permissionId: string,
  ) {
    await this.rbacService.revokePermission(roleId, permissionId);
  }

  @Get('roles/:roleId/permissions')
  @ApiOperation({ summary: 'Get all permissions for a role' })
  @ApiResponse({ status: 200, description: 'List of role permissions' })
  async getRolePermissions(@Param('roleId') roleId: string) {
    return await this.rbacService.getRolePermissions(roleId);
  }

  @Get('roles/:roleId/has-permission')
  @ApiOperation({ summary: 'Check if role has specific permission' })
  @ApiResponse({ status: 200, description: 'Permission check result' })
  async hasPermission(
    @Param('roleId') roleId: string,
    @Query('resource') resource: string,
    @Query('action') action: string,
  ) {
    const hasPermission = await this.rbacService.hasPermission(
      roleId,
      resource,
      action,
    );
    return { hasPermission };
  }

  @Get('permissions/:permissionId/roles')
  @ApiOperation({ summary: 'Get all roles with specific permission' })
  @ApiResponse({ status: 200, description: 'List of roles' })
  async getRolesWithPermission(@Param('permissionId') permissionId: string) {
    const roles = await this.rbacService.getRolesWithPermission(permissionId);
    return { roles };
  }
}
