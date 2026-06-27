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
} from '@nestjs/common';
import { FollowupsService } from './followups.service';
import { CreateFollowupDto, UpdateFollowupDto } from './dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { UserRole } from '../users/entities/user.entity';
import type { User } from '../users/entities/user.entity';

@Controller('followups')
@UseGuards(JwtAuthGuard, RolesGuard)
export class FollowupsController {
  constructor(private readonly followupsService: FollowupsService) {}

  /**
   * Create follow-up appointment
   * Access: DOCTOR, PRIMARY_SECRETARY, ADMIN
   */
  @Post()
  @Roles(UserRole.DOCTOR, UserRole.PRIMARY_SECRETARY, UserRole.ADMIN)
  async create(
    @Body() createFollowupDto: CreateFollowupDto,
    @CurrentUser() user: User,
  ) {
    return await this.followupsService.create(
      createFollowupDto,
      user.id,
      user.role,
    );
  }

  /**
   * Get all follow-ups
   * Access: All authenticated users (filtered by role)
   */
  @Get()
  async findAll(@CurrentUser() user: User) {
    return await this.followupsService.findAll(
      user.role,
      user.id,
      user.hospitalId,
    );
  }

  /**
   * Get upcoming follow-ups
   * Access: All authenticated users
   */
  @Get('upcoming')
  async findUpcoming(@Query('limit') limit?: string) {
    const limitNum = limit ? parseInt(limit, 10) : 50;
    return await this.followupsService.findUpcoming(limitNum);
  }

  /**
   * Get follow-ups by patient
   * Access: All authenticated users
   */
  @Get('patient/:patientId')
  async findByPatient(
    @Param('patientId') patientId: string,
    @CurrentUser() user: User,
  ) {
    return await this.followupsService.findByPatient(patientId, user.role);
  }

  /**
   * Get follow-ups by doctor
   * Access: DOCTOR (own), ADMIN, PRIMARY_SECRETARY
   */
  @Get('doctor/:doctorId')
  async findByDoctor(
    @Param('doctorId') doctorId: string,
    @CurrentUser() user: User,
  ) {
    return await this.followupsService.findByDoctor(
      doctorId,
      user.role,
      user.id,
    );
  }

  /**
   * Get follow-up by ID
   * Access: All authenticated users (with access control)
   */
  @Get(':id')
  async findById(@Param('id') id: string, @CurrentUser() user: User) {
    return await this.followupsService.findById(id, user.role, user.id);
  }

  /**
   * Update follow-up
   * Access: DOCTOR (own), ADMIN, PRIMARY_SECRETARY
   */
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateFollowupDto: UpdateFollowupDto,
    @CurrentUser() user: User,
  ) {
    return await this.followupsService.update(
      id,
      updateFollowupDto,
      user.role,
      user.id,
    );
  }

  /**
   * Complete follow-up
   * Access: DOCTOR, ADMIN, PRIMARY_SECRETARY
   */
  @Patch(':id/complete')
  @Roles(UserRole.DOCTOR, UserRole.ADMIN, UserRole.PRIMARY_SECRETARY)
  @HttpCode(HttpStatus.OK)
  async complete(
    @Param('id') id: string,
    @Body() body: { progressNotes?: string },
    @CurrentUser() user: User,
  ) {
    return await this.followupsService.complete(
      id,
      body.progressNotes,
      user.role,
      user.id,
    );
  }

  /**
   * Cancel follow-up
   * Access: DOCTOR (own), ADMIN, PRIMARY_SECRETARY
   */
  @Patch(':id/cancel')
  @HttpCode(HttpStatus.OK)
  async cancel(@Param('id') id: string, @CurrentUser() user: User) {
    return await this.followupsService.cancel(id, user.role, user.id);
  }

  /**
   * Mark follow-up as missed
   * Access: ADMIN, PRIMARY_SECRETARY
   */
  @Patch(':id/missed')
  @Roles(UserRole.ADMIN, UserRole.PRIMARY_SECRETARY)
  @HttpCode(HttpStatus.OK)
  async markAsMissed(@Param('id') id: string) {
    return await this.followupsService.markAsMissed(id);
  }
}
