import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { UserRole } from '../users/entities/user.entity';
import type { User } from '../users/entities/user.entity';
import { AppointmentsService } from './appointments.service';
import { AppointmentStatus } from './entities/appointment.entity';

@Controller('appointments')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AppointmentsController {
  constructor(private readonly service: AppointmentsService) {}
  @Post()
  @Roles(UserRole.NURSE, UserRole.SECONDARY_SECRETARY, UserRole.PRIMARY_SECRETARY)
  create(@Body() dto: any, @CurrentUser() user: User) { return this.service.create(dto, user); }
  @Get('my-hospital')
  mine(@CurrentUser() user: User) { return this.service.findMine(user); }
  @Patch(':id/check-in')
  @Roles(UserRole.NURSE, UserRole.SECONDARY_SECRETARY)
  checkIn(@Param('id') id: string, @CurrentUser() user: User) {
    return this.service.setStatus(id, AppointmentStatus.CHECKED_IN, user);
  }
  @Patch(':id/missed')
  missed(@Param('id') id: string, @CurrentUser() user: User) {
    return this.service.setStatus(id, AppointmentStatus.MISSED, user);
  }
  @Patch(':id/cancel')
  cancel(@Param('id') id: string, @CurrentUser() user: User) {
    return this.service.setStatus(id, AppointmentStatus.CANCELLED, user);
  }
  @Patch(':id/complete')
  complete(@Param('id') id: string, @CurrentUser() user: User) {
    return this.service.setStatus(id, AppointmentStatus.COMPLETED, user);
  }
}
