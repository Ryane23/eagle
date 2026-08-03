import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiUnauthorizedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { RulesService } from './rules.service';
import { CreateRuleDto, UpdateRuleDto } from './dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserRole } from '../users/entities/user.entity';
import type { User } from '../users/entities/user.entity';

@ApiTags('Rules')
@ApiBearerAuth('JWT-auth')
@Controller('rules')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class RulesController {
  constructor(private readonly rulesService: RulesService) {}

  @Post()
  @ApiOperation({
    summary: 'Create a new rule',
    description: 'Creates a new RBAC rule. Admin only.',
  })
  @ApiResponse({
    status: 201,
    description: 'Rule created successfully',
  })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  @ApiForbiddenResponse({ description: 'Not authorized (Admin only)' })
  async create(
    @Body() createRuleDto: CreateRuleDto,
    @CurrentUser() user: User,
  ) {
    return await this.rulesService.create(createRuleDto, user.id);
  }

  @Get()
  @ApiOperation({
    summary: 'Get all rules',
    description: 'Retrieves all RBAC rules. Admin only.',
  })
  @ApiQuery({ name: 'role', enum: UserRole, required: false, description: 'Filter by role' })
  @ApiQuery({ name: 'activeOnly', required: false, description: 'Show only active rules' })
  @ApiResponse({
    status: 200,
    description: 'List of rules retrieved successfully',
  })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  @ApiForbiddenResponse({ description: 'Not authorized (Admin only)' })
  async findAll(
    @Query('role') role?: UserRole,
    @Query('activeOnly') activeOnly?: string,
  ) {
    if (role) {
      return await this.rulesService.findByRole(role);
    }

    if (activeOnly === 'true') {
      return await this.rulesService.findActive();
    }

    return await this.rulesService.findAll();
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get rule by ID',
    description: 'Retrieves a specific rule by its ID. Admin only.',
  })
  @ApiParam({ name: 'id', description: 'Rule ID' })
  @ApiResponse({
    status: 200,
    description: 'Rule retrieved successfully',
  })
  @ApiNotFoundResponse({ description: 'Rule not found' })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  @ApiForbiddenResponse({ description: 'Not authorized (Admin only)' })
  async findById(@Param('id') id: string) {
    return await this.rulesService.findById(id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update rule',
    description: 'Updates a rule. Admin only.',
  })
  @ApiParam({ name: 'id', description: 'Rule ID' })
  @ApiResponse({
    status: 200,
    description: 'Rule updated successfully',
  })
  @ApiNotFoundResponse({ description: 'Rule not found' })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  @ApiForbiddenResponse({ description: 'Not authorized (Admin only)' })
  async update(
    @Param('id') id: string,
    @Body() updateRuleDto: UpdateRuleDto,
  ) {
    return await this.rulesService.update(id, updateRuleDto);
  }

  @Patch(':id/activate')
  @ApiOperation({
    summary: 'Activate rule',
    description: 'Activates a deactivated rule. Admin only.',
  })
  @ApiParam({ name: 'id', description: 'Rule ID' })
  @ApiResponse({
    status: 200,
    description: 'Rule activated successfully',
  })
  @ApiNotFoundResponse({ description: 'Rule not found' })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  @ApiForbiddenResponse({ description: 'Not authorized (Admin only)' })
  async activate(@Param('id') id: string) {
    return await this.rulesService.activate(id);
  }

  @Patch(':id/deactivate')
  @ApiOperation({
    summary: 'Deactivate rule',
    description: 'Deactivates an active rule. Admin only.',
  })
  @ApiParam({ name: 'id', description: 'Rule ID' })
  @ApiResponse({
    status: 200,
    description: 'Rule deactivated successfully',
  })
  @ApiNotFoundResponse({ description: 'Rule not found' })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  @ApiForbiddenResponse({ description: 'Not authorized (Admin only)' })
  async deactivate(@Param('id') id: string) {
    return await this.rulesService.deactivate(id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Delete rule',
    description: 'Deletes a rule. Admin only.',
  })
  @ApiParam({ name: 'id', description: 'Rule ID' })
  @ApiResponse({ status: 204, description: 'Rule deleted successfully' })
  @ApiNotFoundResponse({ description: 'Rule not found' })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  @ApiForbiddenResponse({ description: 'Not authorized (Admin only)' })
  async delete(@Param('id') id: string) {
    await this.rulesService.delete(id);
  }
}
