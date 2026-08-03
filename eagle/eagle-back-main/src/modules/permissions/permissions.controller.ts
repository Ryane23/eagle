import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { PermissionsService } from './permissions.service';
import { CreatePermissionDto, UpdatePermissionDto, AssignPermissionsDto } from './dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';

@ApiTags('Permissions')
@ApiBearerAuth('JWT-auth')
@Controller('permissions')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PermissionsController {
  constructor(private readonly permissionsService: PermissionsService) {}

  @Post()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Create new permission (ADMIN only)' })
  async create(@Body() createPermissionDto: CreatePermissionDto) {
    return await this.permissionsService.create(createPermissionDto);
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.PRIMARY_SECRETARY)
  @ApiOperation({ summary: 'Get all permissions' })
  async findAll(@Query('active') active?: string) {
    if (active === 'true') {
      return await this.permissionsService.findActive();
    }
    return await this.permissionsService.findAll();
  }

  @Get('resource/:resource')
  @Roles(UserRole.ADMIN, UserRole.PRIMARY_SECRETARY)
  @ApiOperation({ summary: 'Get permissions by resource' })
  async findByResource(@Param('resource') resource: string) {
    return await this.permissionsService.findByResource(resource);
  }

  @Get('roles')
  @Roles(UserRole.ADMIN, UserRole.PRIMARY_SECRETARY)
  @ApiOperation({ summary: 'Get all role-permission mappings' })
  async getAllRolePermissions() {
    return await this.permissionsService.getAllRolePermissions();
  }

  @Get('roles/:role')
  @Roles(UserRole.ADMIN, UserRole.PRIMARY_SECRETARY)
  @ApiOperation({ summary: 'Get permissions for a specific role' })
  async getRolePermissions(@Param('role') role: UserRole) {
    return await this.permissionsService.getRolePermissions(role);
  }

  @Post('roles/assign')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Assign permissions to a role (ADMIN only)' })
  async assignPermissionsToRole(@Body() assignDto: AssignPermissionsDto) {
    return await this.permissionsService.assignPermissionsToRole(assignDto);
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.PRIMARY_SECRETARY)
  @ApiOperation({ summary: 'Get permission by ID' })
  async findById(@Param('id') id: string) {
    return await this.permissionsService.findById(id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update permission (ADMIN only)' })
  async update(
    @Param('id') id: string,
    @Body() updatePermissionDto: UpdatePermissionDto,
  ) {
    return await this.permissionsService.update(id, updatePermissionDto);
  }

  @Patch(':id/toggle')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Activate/deactivate permission (ADMIN only)' })
  async toggleActive(@Param('id') id: string) {
    return await this.permissionsService.toggleActive(id);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete permission (ADMIN only)' })
  async delete(@Param('id') id: string) {
    await this.permissionsService.delete(id);
  }
}
