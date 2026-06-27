import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { PreparationsService } from './preparations.service';
import {
  CreatePreparationDto,
  UpdatePreparationProgressDto,
  UpdateChecklistDto,
  AddObservationsDto,
} from './dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { UserRole } from '../users/entities/user.entity';
import type { User } from '../users/entities/user.entity';

@ApiTags('Preparations')
@ApiBearerAuth('JWT-auth')
@Controller('preparations')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PreparationsController {
  constructor(private readonly preparationsService: PreparationsService) {}

  /**
   * Create preparation session
   * Access: NURSE only
   */
  @Post()
  @Roles(UserRole.NURSE)
  @ApiOperation({ summary: 'Create preparation session' })
  @ApiResponse({ status: 201, description: 'Preparation created successfully' })
  async create(
    @Body() createPreparationDto: CreatePreparationDto,
    @CurrentUser() user: User,
  ) {
    return await this.preparationsService.create(createPreparationDto, user.id);
  }

  /**
   * Get nurse's active preparations
   * Access: NURSE only
   */
  @Get('active')
  @Roles(UserRole.NURSE)
  @ApiOperation({ summary: 'Get active preparations for nurse' })
  @ApiResponse({ status: 200, description: 'Active preparations retrieved' })
  async getActive(@CurrentUser() user: User) {
    return await this.preparationsService.getActivePreparations(user.id);
  }

  /**
   * Get all preparations by nurse
   * Access: NURSE only
   */
  @Get('my')
  @Roles(UserRole.NURSE)
  @ApiOperation({ summary: 'Get all preparations by nurse' })
  @ApiResponse({ status: 200, description: 'Preparations retrieved' })
  async getMyPreparations(@CurrentUser() user: User) {
    return await this.preparationsService.getByNurse(user.id);
  }

  /**
   * Get preparation by ID
   * Access: NURSE, DOCTOR
   */
  @Get(':id')
  @Roles(UserRole.NURSE, UserRole.DOCTOR)
  @ApiOperation({ summary: 'Get preparation by ID' })
  @ApiResponse({ status: 200, description: 'Preparation retrieved' })
  @ApiResponse({ status: 404, description: 'Preparation not found' })
  async findById(@Param('id') id: string) {
    return await this.preparationsService.findById(id);
  }

  /**
   * Get preparations by patient
   * Access: NURSE, DOCTOR
   */
  @Get('patient/:patientId')
  @Roles(UserRole.NURSE, UserRole.DOCTOR)
  @ApiOperation({ summary: 'Get preparations by patient' })
  @ApiResponse({ status: 200, description: 'Preparations retrieved' })
  async getByPatient(@Param('patientId') patientId: string) {
    return await this.preparationsService.getByPatient(patientId);
  }

  /**
   * Update preparation progress
   * Access: NURSE only
   */
  @Patch(':id/progress')
  @Roles(UserRole.NURSE)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update preparation progress' })
  @ApiResponse({ status: 200, description: 'Progress updated' })
  @ApiResponse({ status: 403, description: 'Not authorized' })
  async updateProgress(
    @Param('id') id: string,
    @Body() updateProgressDto: UpdatePreparationProgressDto,
    @CurrentUser() user: User,
  ) {
    return await this.preparationsService.updateProgress(
      id,
      updateProgressDto,
      user.id,
    );
  }

  /**
   * Update checklist
   * Access: NURSE only
   */
  @Patch(':id/checklist')
  @Roles(UserRole.NURSE)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update preparation checklist' })
  @ApiResponse({ status: 200, description: 'Checklist updated' })
  @ApiResponse({ status: 403, description: 'Not authorized' })
  async updateChecklist(
    @Param('id') id: string,
    @Body() updateChecklistDto: UpdateChecklistDto,
    @CurrentUser() user: User,
  ) {
    return await this.preparationsService.updateChecklist(
      id,
      updateChecklistDto,
      user.id,
    );
  }

  /**
   * Add observations
   * Access: NURSE only
   */
  @Patch(':id/observations')
  @Roles(UserRole.NURSE)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Add clinical observations' })
  @ApiResponse({ status: 200, description: 'Observations added' })
  @ApiResponse({ status: 403, description: 'Not authorized' })
  async addObservations(
    @Param('id') id: string,
    @Body() addObservationsDto: AddObservationsDto,
    @CurrentUser() user: User,
  ) {
    return await this.preparationsService.addObservations(
      id,
      addObservationsDto,
      user.id,
    );
  }

  /**
   * Mark preparation as complete
   * Access: NURSE only
   */
  @Patch(':id/complete')
  @Roles(UserRole.NURSE)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Mark preparation as complete' })
  @ApiResponse({ status: 200, description: 'Preparation completed' })
  @ApiResponse({ status: 400, description: 'Progress must be at least 80%' })
  @ApiResponse({ status: 403, description: 'Not authorized' })
  async complete(@Param('id') id: string, @CurrentUser() user: User) {
    return await this.preparationsService.complete(id, user.id);
  }

  /**
   * Get preparation by consultation ID
   * Access: NURSE, DOCTOR
   */
  @Get('consultation/:consultationId')
  @Roles(UserRole.NURSE, UserRole.DOCTOR)
  @ApiOperation({ summary: 'Get preparation by consultation ID' })
  @ApiResponse({ status: 200, description: 'Preparation retrieved' })
  async getByConsultation(@Param('consultationId') consultationId: string) {
    return await this.preparationsService.getByConsultation(consultationId);
  }
}
