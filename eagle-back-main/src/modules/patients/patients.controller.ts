import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiUnauthorizedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiBadRequestResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { PatientsService } from './patients.service';
import {
  CreatePatientDto,
  UpdatePatientDto,
  UpdateVitalsDto,
  UpdateEhrDto,
  PatientResponseDto,
} from './dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { UserRole } from '../users/entities/user.entity';
import type { User } from '../users/entities/user.entity';

@ApiTags('Patients')
@ApiBearerAuth('JWT-auth')
@Controller('patients')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PatientsController {
  constructor(private readonly patientsService: PatientsService) {}

  @Post()
  @Roles(UserRole.SECONDARY_SECRETARY)
  @ApiOperation({
    summary: 'Register a new patient',
    description: 'Creates a new patient record. Only accessible by Secondary Secretaries.',
  })
  @ApiResponse({
    status: 201,
    description: 'Patient successfully registered',
    type: PatientResponseDto,
  })
  @ApiBadRequestResponse({ description: 'Invalid input data or user not associated with hospital' })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  @ApiForbiddenResponse({ description: 'Not authorized (Secondary Secretary only)' })
  async create(
    @Body() createPatientDto: CreatePatientDto,
    @CurrentUser() user: User,
  ) {
    if (!user.hospitalId) {
      throw new BadRequestException('User must be associated with a hospital');
    }
    return await this.patientsService.create(createPatientDto, user.hospitalId);
  }

  @Get()
  @ApiOperation({
    summary: 'Get all patients',
    description: 'Retrieves patients based on user role and hospital access.',
  })
  @ApiResponse({
    status: 200,
    description: 'List of patients retrieved successfully',
    type: [PatientResponseDto],
  })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  async findAll(@CurrentUser() user: User) {
    return await this.patientsService.findAll(user.role, user.hospitalId);
  }

  @Get('search')
  @ApiOperation({
    summary: 'Search patients',
    description: 'Search patients by name, ID number, or phone.',
  })
  @ApiQuery({ name: 'q', description: 'Search query (name, ID, phone)', required: true })
  @ApiResponse({
    status: 200,
    description: 'Search results',
    type: [PatientResponseDto],
  })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  async search(
    @Query('q') query: string,
    @CurrentUser() user: User,
  ) {
    if (!query || query.trim().length === 0) {
      return [];
    }
    return await this.patientsService.search(query, user.role, user.hospitalId);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get patient by ID',
    description: 'Retrieves a specific patient by their ID.',
  })
  @ApiParam({ name: 'id', description: 'Patient ID' })
  @ApiResponse({
    status: 200,
    description: 'Patient retrieved successfully',
    type: PatientResponseDto,
  })
  @ApiNotFoundResponse({ description: 'Patient not found' })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  async findById(
    @Param('id') id: string,
    @CurrentUser() user: User,
  ) {
    return await this.patientsService.findById(id, user.role, user.hospitalId);
  }

  @Patch(':id')
  @Roles(UserRole.SECONDARY_SECRETARY, UserRole.ADMIN)
  @ApiOperation({
    summary: 'Update patient information',
    description: 'Updates patient details. Accessible by Secondary Secretary (own hospital) or Admin.',
  })
  @ApiParam({ name: 'id', description: 'Patient ID' })
  @ApiResponse({
    status: 200,
    description: 'Patient updated successfully',
    type: PatientResponseDto,
  })
  @ApiNotFoundResponse({ description: 'Patient not found' })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  @ApiForbiddenResponse({ description: 'Not authorized' })
  async update(
    @Param('id') id: string,
    @Body() updatePatientDto: UpdatePatientDto,
    @CurrentUser() user: User,
  ) {
    return await this.patientsService.update(
      id,
      updatePatientDto,
      user.role,
      user.hospitalId,
    );
  }

  @Patch(':id/vitals')
  @Roles(UserRole.NURSE)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Update patient vital signs',
    description: 'Updates vital signs for a patient. Nurse only.',
  })
  @ApiParam({ name: 'id', description: 'Patient ID' })
  @ApiResponse({
    status: 200,
    description: 'Vital signs updated successfully',
    type: PatientResponseDto,
  })
  @ApiNotFoundResponse({ description: 'Patient not found' })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  @ApiForbiddenResponse({ description: 'Not authorized (Nurse only)' })
  async updateVitals(
    @Param('id') id: string,
    @Body() updateVitalsDto: UpdateVitalsDto,
    @CurrentUser() user: User,
  ) {
    return await this.patientsService.updateVitals(
      id,
      updateVitalsDto,
      user.role,
      user.id,
      user.hospitalId,
    );
  }

  @Patch(':id/ehr')
  @Roles(UserRole.NURSE, UserRole.DOCTOR, UserRole.SECONDARY_SECRETARY)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Update patient EHR',
    description: 'Updates Electronic Health Record. Accessible by Nurse, Doctor, or Secondary Secretary.',
  })
  @ApiParam({ name: 'id', description: 'Patient ID' })
  @ApiResponse({
    status: 200,
    description: 'EHR updated successfully',
    type: PatientResponseDto,
  })
  @ApiNotFoundResponse({ description: 'Patient not found' })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  @ApiForbiddenResponse({ description: 'Not authorized' })
  async updateEhr(
    @Param('id') id: string,
    @Body() updateEhrDto: UpdateEhrDto,
    @CurrentUser() user: User,
  ) {
    return await this.patientsService.updateEhr(
      id,
      updateEhrDto,
      user.role,
      user.hospitalId,
    );
  }

  @Patch(':id/deactivate')
  @Roles(UserRole.ADMIN, UserRole.PRIMARY_SECRETARY)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Deactivate patient',
    description: 'Deactivates a patient record. Admin or Primary Secretary only.',
  })
  @ApiParam({ name: 'id', description: 'Patient ID' })
  @ApiResponse({
    status: 200,
    description: 'Patient deactivated successfully',
    type: PatientResponseDto,
  })
  @ApiNotFoundResponse({ description: 'Patient not found' })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  @ApiForbiddenResponse({ description: 'Not authorized' })
  async deactivate(@Param('id') id: string, @CurrentUser() user: User) {
    return await this.patientsService.deactivate(id, user.role);
  }

  @Patch(':id/verify-identity')
  @Roles(UserRole.NURSE)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Verify patient identity',
    description: 'Verifies patient identity with document. Nurse only.',
  })
  @ApiParam({ name: 'id', description: 'Patient ID' })
  @ApiResponse({
    status: 200,
    description: 'Identity verified successfully',
  })
  async verifyIdentity(
    @Param('id') id: string,
    @Body() verifyIdentityDto: any,
    @CurrentUser() user: User,
  ) {
    return await this.patientsService.verifyIdentity(
      id,
      verifyIdentityDto,
      user.id,
      user.role,
      user.hospitalId,
    );
  }

  @Patch(':id/workflow-status')
  @Roles(UserRole.NURSE)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Update patient workflow status',
    description: 'Updates nurse workflow status. Nurse only.',
  })
  @ApiParam({ name: 'id', description: 'Patient ID' })
  @ApiResponse({
    status: 200,
    description: 'Workflow status updated',
  })
  async updateWorkflowStatus(
    @Param('id') id: string,
    @Body() updateWorkflowStatusDto: any,
    @CurrentUser() user: User,
  ) {
    return await this.patientsService.updateWorkflowStatus(
      id,
      updateWorkflowStatusDto.status,
      user.id,
      user.role,
      user.hospitalId,
    );
  }

  @Patch(':id/vitals-enhanced')
  @Roles(UserRole.NURSE)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Update patient vital signs with BMI and alerts',
    description: 'Updates vital signs with automatic BMI calculation and health alerts. Nurse only.',
  })
  @ApiParam({ name: 'id', description: 'Patient ID' })
  @ApiResponse({
    status: 200,
    description: 'Vital signs updated with processing',
  })
  async updateVitalsEnhanced(
    @Param('id') id: string,
    @Body() updateVitalsDto: any,
    @CurrentUser() user: User,
  ) {
    return await this.patientsService.updateVitalsEnhanced(
      id,
      updateVitalsDto,
      user.role,
      user.id,
      user.hospitalId,
    );
  }
}
