import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { UserRole } from '../users/entities/user.entity';
import type { User } from '../users/entities/user.entity';
import { AssignUrgencyDto, CreateUrgencyDto, ValidateUrgencyDto } from './dto/urgency.dto';
import { UrgencyStatus } from './entities/urgency.entity';
import { UrgenciesService } from './urgencies.service';

@Controller('urgencies')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UrgenciesController {
  constructor(private readonly service: UrgenciesService) {}
  @Post()
  @Roles(UserRole.NURSE, UserRole.SECONDARY_SECRETARY)
  create(@Body() dto: CreateUrgencyDto, @CurrentUser() user: User) { return this.service.create(dto, user); }
  @Get()
  find(@CurrentUser() user: User, @Query('status') status?: UrgencyStatus) {
    return this.service.findForUser(user, status);
  }
  @Get(':id')
  one(@Param('id') id: string, @CurrentUser() user: User) { return this.service.findOne(id, user); }
  @Patch(':id/validate')
  @Roles(UserRole.PRIMARY_SECRETARY)
  validate(@Param('id') id: string, @Body() dto: ValidateUrgencyDto, @CurrentUser() user: User) {
    return this.service.validate(id, dto, user);
  }
  @Patch(':id/approve')
  @Roles(UserRole.PRIMARY_SECRETARY)
  approve(@Param('id') id: string, @CurrentUser() user: User) { return this.service.approve(id, user); }
  @Patch(':id/assign')
  @Roles(UserRole.PRIMARY_SECRETARY)
  assign(@Param('id') id: string, @Body() dto: AssignUrgencyDto) { return this.service.assign(id, dto); }
  @Patch(':id/start')
  @Roles(UserRole.DOCTOR)
  start(@Param('id') id: string) { return this.service.setStatus(id, UrgencyStatus.IN_PROGRESS); }
  @Patch(':id/complete')
  @Roles(UserRole.DOCTOR)
  complete(@Param('id') id: string) { return this.service.setStatus(id, UrgencyStatus.COMPLETED); }
  @Patch(':id/reject')
  @Roles(UserRole.PRIMARY_SECRETARY, UserRole.DOCTOR)
  reject(@Param('id') id: string) { return this.service.setStatus(id, UrgencyStatus.REJECTED); }
}
