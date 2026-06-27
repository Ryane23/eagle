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
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { SystemModulesService } from './system-modules.service';
import { CreateSystemModuleDto, UpdateSystemModuleDto, UpdateHospitalModuleConfigDto } from './dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { UserRole } from '../users/entities/user.entity';
import type { User } from '../users/entities/user.entity';
import { ModuleCategory } from './entities/system-module.entity';

@ApiTags('System Modules')
@ApiBearerAuth('JWT-auth')
@Controller('system-modules')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SystemModulesController {
  constructor(private readonly systemModulesService: SystemModulesService) {}

  @Post()
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new system module (ADMIN only)' })
  async create(@Body() createDto: CreateSystemModuleDto, @CurrentUser() user: User) {
    return await this.systemModulesService.create(createDto, user.id);
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.PRIMARY_SECRETARY)
  @ApiOperation({ summary: 'Get all system modules' })
  async findAll() {
    return await this.systemModulesService.findAll();
  }

  @Get('enabled')
  @ApiOperation({ summary: 'Get all enabled modules' })
  async findEnabled() {
    return await this.systemModulesService.findEnabled();
  }

  @Get('my-hospital')
  @ApiOperation({ summary: 'Get enabled modules for my hospital' })
  async getMyHospitalModules(@CurrentUser() user: User) {
    if (!user.hospitalId) {
      throw new Error('User must be associated with a hospital');
    }
    return await this.systemModulesService.getHospitalModules(user.hospitalId);
  }

  @Get('core')
  @ApiOperation({ summary: 'Get core modules' })
  async findCoreModules() {
    return await this.systemModulesService.findCoreModules();
  }

  @Get('category/:category')
  @ApiOperation({ summary: 'Get modules by category' })
  async findByCategory(@Param('category') category: ModuleCategory) {
    return await this.systemModulesService.findByCategory(category);
  }

  @Get('hospital/:hospitalId')
  @Roles(UserRole.ADMIN, UserRole.PRIMARY_SECRETARY)
  @ApiOperation({ summary: 'Get enabled modules for a hospital' })
  async getHospitalModules(@Param('hospitalId') hospitalId: string) {
    return await this.systemModulesService.getHospitalModules(hospitalId);
  }

  @Get('hospital/:hospitalId/configs')
  @Roles(UserRole.ADMIN, UserRole.PRIMARY_SECRETARY)
  @ApiOperation({ summary: 'Get all hospital-specific configurations' })
  async getAllHospitalConfigs(@Param('hospitalId') hospitalId: string) {
    return await this.systemModulesService.getAllHospitalConfigs(hospitalId);
  }

  @Get('hospital/:hospitalId/module/:moduleId')
  @Roles(UserRole.ADMIN, UserRole.PRIMARY_SECRETARY)
  @ApiOperation({ summary: 'Get hospital-specific configuration for a module' })
  async getHospitalConfig(
    @Param('hospitalId') hospitalId: string,
    @Param('moduleId') moduleId: string,
  ) {
    return await this.systemModulesService.getHospitalConfig(hospitalId, moduleId);
  }

  @Get('hospital/:hospitalId/module/:moduleId/enabled')
  @ApiOperation({ summary: 'Check if module is enabled for hospital' })
  async isModuleEnabledForHospital(
    @Param('hospitalId') hospitalId: string,
    @Param('moduleId') moduleId: string,
  ) {
    const isEnabled = await this.systemModulesService.isModuleEnabledForHospital(
      hospitalId,
      moduleId,
    );
    return { isEnabled };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get module by ID' })
  async findById(@Param('id') id: string) {
    return await this.systemModulesService.findById(id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Update a module (ADMIN only)' })
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdateSystemModuleDto,
    @CurrentUser() user: User,
  ) {
    return await this.systemModulesService.update(id, updateDto, user.id);
  }

  @Patch(':id/toggle')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Toggle module enabled status (ADMIN only)' })
  async toggleEnabled(@Param('id') id: string, @CurrentUser() user: User) {
    return await this.systemModulesService.toggleEnabled(id, user.id);
  }

  @Post('hospital-config')
  @Roles(UserRole.ADMIN, UserRole.PRIMARY_SECRETARY)
  @ApiOperation({ summary: 'Update hospital-specific module configuration' })
  async updateHospitalConfig(
    @Body() updateDto: UpdateHospitalModuleConfigDto,
    @CurrentUser() user: User,
  ) {
    return await this.systemModulesService.updateHospitalConfig(updateDto, user.id);
  }

  @Delete('hospital-config/:hospitalId/:moduleId')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Reset hospital configuration (use global defaults)' })
  async resetHospitalConfig(
    @Param('hospitalId') hospitalId: string,
    @Param('moduleId') moduleId: string,
  ) {
    await this.systemModulesService.resetHospitalConfig(hospitalId, moduleId);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a module (ADMIN only)' })
  async delete(@Param('id') id: string) {
    await this.systemModulesService.delete(id);
  }
}
