import {
  Controller,
  Get,
  Patch,
  Param,
  Body,
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
} from '@nestjs/swagger';
import { ConsultationsService } from './consultations.service';
import { AddNoteDto, AssignDoctorDto, CompleteConsultationDto, ConsultationResponseDto } from './dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { UserRole } from '../users/entities/user.entity';
import type { User } from '../users/entities/user.entity';

@ApiTags('Consultations')
@ApiBearerAuth('JWT-auth')
@Controller('consultations')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ConsultationsController {
  constructor(private readonly consultationsService: ConsultationsService) {}

  @Get('my-schedule')
  @Roles(UserRole.DOCTOR)
  @ApiOperation({
    summary: 'Get my schedule',
    description: 'Retrieves scheduled consultations for the current doctor.',
  })
  @ApiResponse({
    status: 200,
    description: 'Schedule retrieved successfully',
    type: [ConsultationResponseDto],
  })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  @ApiForbiddenResponse({ description: 'Not authorized (Doctor only)' })
  async getMySchedule(@CurrentUser() user: User) {
    return await this.consultationsService.getMySchedule(user.id);
  }

  @Get('nurse-teleconsultation')
  @Roles(UserRole.NURSE)
  @ApiOperation({
    summary: 'Get consultations for nurse teleconsultation',
    description: 'Retrieves video consultations (scheduled or in progress) that nurses can join.',
  })
  @ApiResponse({
    status: 200,
    description: 'Consultations retrieved successfully',
    type: [ConsultationResponseDto],
  })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  @ApiForbiddenResponse({ description: 'Not authorized (Nurse only)' })
  async getNurseTeleconsultation() {
    return await this.consultationsService.findForNurseTeleconsultation();
  }

  @Get('my')
  @Roles(UserRole.DOCTOR)
  @ApiOperation({
    summary: 'Get all my consultations',
    description: 'Retrieves all consultations for the current doctor.',
  })
  @ApiResponse({
    status: 200,
    description: 'Consultations retrieved successfully',
    type: [ConsultationResponseDto],
  })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  @ApiForbiddenResponse({ description: 'Not authorized (Doctor only)' })
  async getMyConsultations(@CurrentUser() user: User) {
    return await this.consultationsService.findByDoctor(user.id);
  }

  @Get('patient/:patientId')
  @ApiOperation({
    summary: 'Get consultations by patient',
    description: 'Retrieves all consultations for a specific patient.',
  })
  @ApiParam({ name: 'patientId', description: 'Patient ID' })
  @ApiResponse({
    status: 200,
    description: 'Patient consultations retrieved successfully',
    type: [ConsultationResponseDto],
  })
  @ApiNotFoundResponse({ description: 'Patient not found' })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  async getByPatient(
    @Param('patientId') patientId: string,
    @CurrentUser() user: User,
  ) {
    return await this.consultationsService.findByPatient(patientId);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get consultation by ID',
    description: 'Retrieves a specific consultation by its ID.',
  })
  @ApiParam({ name: 'id', description: 'Consultation ID' })
  @ApiResponse({
    status: 200,
    description: 'Consultation retrieved successfully',
    type: ConsultationResponseDto,
  })
  @ApiNotFoundResponse({ description: 'Consultation not found' })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  async findById(@Param('id') id: string) {
    return await this.consultationsService.findById(id);
  }

  @Patch(':id/assign')
  @Roles(UserRole.DOCTOR, UserRole.PRIMARY_SECRETARY, UserRole.ADMIN)
  @ApiOperation({
    summary: 'Assign doctor to consultation',
    description: 'Assigns a doctor to a consultation. Doctor, Primary Secretary, or Admin.',
  })
  @ApiParam({ name: 'id', description: 'Consultation ID' })
  @ApiResponse({
    status: 200,
    description: 'Doctor assigned successfully',
    type: ConsultationResponseDto,
  })
  @ApiNotFoundResponse({ description: 'Consultation not found' })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  @ApiForbiddenResponse({ description: 'Not authorized' })
  async assignDoctor(
    @Param('id') id: string,
    @Body() assignDoctorDto: AssignDoctorDto,
  ) {
    return await this.consultationsService.assignDoctor(id, assignDoctorDto);
  }

  @Patch(':id/start')
  @Roles(UserRole.DOCTOR)
  @ApiOperation({
    summary: 'Start consultation',
    description: 'Marks a consultation as started. Doctor only.',
  })
  @ApiParam({ name: 'id', description: 'Consultation ID' })
  @ApiResponse({
    status: 200,
    description: 'Consultation started successfully',
    type: ConsultationResponseDto,
  })
  @ApiNotFoundResponse({ description: 'Consultation not found' })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  @ApiForbiddenResponse({ description: 'Not authorized (Doctor only)' })
  async startConsultation(
    @Param('id') id: string,
    @CurrentUser() user: User,
  ) {
    return await this.consultationsService.startConsultation(id, user.id);
  }

  @Patch(':id/note')
  @Roles(UserRole.DOCTOR, UserRole.NURSE)
  @ApiOperation({
    summary: 'Add note to consultation',
    description: 'Adds a note to an existing consultation. Doctor or Nurse.',
  })
  @ApiParam({ name: 'id', description: 'Consultation ID' })
  @ApiResponse({
    status: 200,
    description: 'Note added successfully',
    type: ConsultationResponseDto,
  })
  @ApiNotFoundResponse({ description: 'Consultation not found' })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  @ApiForbiddenResponse({ description: 'Not authorized' })
  async addNote(
    @Param('id') id: string,
    @Body() addNoteDto: AddNoteDto,
    @CurrentUser() user: User,
  ) {
    return await this.consultationsService.addNote(
      id,
      addNoteDto,
      user.id,
      user.role,
    );
  }

  @Patch(':id/complete')
  @Roles(UserRole.DOCTOR)
  @ApiOperation({
    summary: 'Complete consultation',
    description: 'Marks a consultation as completed with diagnosis. Doctor only.',
  })
  @ApiParam({ name: 'id', description: 'Consultation ID' })
  @ApiResponse({
    status: 200,
    description: 'Consultation completed successfully',
    type: ConsultationResponseDto,
  })
  @ApiNotFoundResponse({ description: 'Consultation not found' })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  @ApiForbiddenResponse({ description: 'Not authorized (Doctor only)' })
  async complete(
    @Param('id') id: string,
    @Body() completeDto: CompleteConsultationDto,
    @CurrentUser() user: User,
  ) {
    return await this.consultationsService.complete(id, completeDto, user.id);
  }

  @Patch(':id/cancel')
  @Roles(UserRole.DOCTOR, UserRole.PRIMARY_SECRETARY, UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Cancel consultation',
    description: 'Cancels a scheduled consultation. Doctor, Primary Secretary, or Admin.',
  })
  @ApiParam({ name: 'id', description: 'Consultation ID' })
  @ApiResponse({
    status: 200,
    description: 'Consultation cancelled successfully',
    type: ConsultationResponseDto,
  })
  @ApiNotFoundResponse({ description: 'Consultation not found' })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  @ApiForbiddenResponse({ description: 'Not authorized' })
  async cancel(
    @Param('id') id: string,
    @CurrentUser() user: User,
  ) {
    const doctorId = user.role === UserRole.DOCTOR ? user.id : undefined;
    return await this.consultationsService.cancel(id, doctorId);
  }
}
