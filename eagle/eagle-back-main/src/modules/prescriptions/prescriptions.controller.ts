import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { PrescriptionsService } from './prescriptions.service';
import { CreatePrescriptionDto, UpdatePrescriptionDto } from './dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserRole } from '../users/entities/user.entity';
import type { User } from '../users/entities/user.entity';

@ApiTags('Prescriptions')
@ApiBearerAuth('JWT-auth')
@Controller('prescriptions')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PrescriptionsController {
  constructor(
    private readonly prescriptionsService: PrescriptionsService,
  ) {}

  /**
   * Create prescription
   * Access: DOCTOR only
   */
  @Post()
  @Roles(UserRole.DOCTOR)
  async create(
    @Body() createPrescriptionDto: CreatePrescriptionDto,
    @CurrentUser() user: User,
  ) {
    return await this.prescriptionsService.create(
      createPrescriptionDto,
      user.id,
    );
  }

  /**
   * Get all prescriptions with role-based filtering
   * Access: All authenticated users (filtered by role)
   */
  @Get()
  async findAll(@CurrentUser() user: User) {
    return await this.prescriptionsService.findAll(
      user.role,
      user.id,
      user.hospitalId,
    );
  }

  /**
   * Get prescriptions for my hospital (NURSE)
   * Access: NURSE only
   */
  @Get('my-hospital')
  @Roles(UserRole.NURSE)
  async getMyHospitalPrescriptions(@CurrentUser() user: User) {
    if (!user.hospitalId) {
      return [];
    }
    return await this.prescriptionsService.findAll(
      UserRole.NURSE,
      user.id,
      user.hospitalId,
    );
  }

  /**
   * Get prescriptions by consultation ID
   * Access: DOCTOR (own prescriptions), ADMIN, PRIMARY_SECRETARY
   */
  @Get('consultation/:consultationId')
  async findByConsultationId(
    @Param('consultationId') consultationId: string,
    @CurrentUser() user: User,
  ) {
    return await this.prescriptionsService.findByConsultationId(
      consultationId,
      user.role,
      user.id,
    );
  }

  /**
   * Get prescriptions by patient ID
   * Access: All authenticated users (filtered by role)
   */
  @Get('patient/:patientId')
  async findByPatientId(
    @Param('patientId') patientId: string,
    @CurrentUser() user: User,
  ) {
    return await this.prescriptionsService.findByPatientId(
      patientId,
      user.role,
      user.hospitalId,
    );
  }

  /**
   * Get prescription by ID
   * Access: DOCTOR (own prescriptions), NURSE (their hospital), ADMIN, PRIMARY_SECRETARY
   */
  @Get(':id')
  async findById(@Param('id') id: string, @CurrentUser() user: User) {
    return await this.prescriptionsService.findById(
      id,
      user.role,
      user.id,
      user.hospitalId,
    );
  }

  /**
   * Update prescription
   * Access: DOCTOR (own prescriptions), ADMIN
   */
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updatePrescriptionDto: UpdatePrescriptionDto,
    @CurrentUser() user: User,
  ) {
    return await this.prescriptionsService.update(
      id,
      updatePrescriptionDto,
      user.id,
      user.role,
    );
  }

  /**
   * Mark prescription as dispensed
   * Access: NURSE, ADMIN
   */
  @Patch(':id/dispense')
  @Roles(UserRole.NURSE, UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  async markAsDispensed(@Param('id') id: string, @CurrentUser() user: User) {
    return await this.prescriptionsService.markAsDispensed(
      id,
      user.id,
      user.role,
    );
  }

  /**
   * Delete prescription
   * Access: ADMIN only
   */
  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id') id: string) {
    await this.prescriptionsService.delete(id);
  }
}
