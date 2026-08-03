import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { UserRole } from '../users/entities/user.entity';
import type { User } from '../users/entities/user.entity';
import { CreateVisitDto, SelectVisitSpecialtyDto } from './dto/create-visit.dto';
import { VisitStatus } from './entities/visit.entity';
import { VisitsService } from './visits.service';

@Controller('visits')
@UseGuards(JwtAuthGuard, RolesGuard)
export class VisitsController {
  constructor(private readonly service: VisitsService) {}

  @Post()
  @Roles(UserRole.NURSE, UserRole.SECONDARY_SECRETARY)
  create(@Body() dto: CreateVisitDto, @CurrentUser() user: User) {
    return this.service.create(dto, user);
  }

  @Get('my-hospital')
  getMine(@CurrentUser() user: User) {
    return this.service.findMine(user);
  }

  @Get('my-hospital/summary')
  summary(@CurrentUser() user: User) {
    return this.service.summary(user);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: User) {
    return this.service.findOne(id, user);
  }

  @Patch(':id/vitals-complete')
  @Roles(UserRole.NURSE)
  vitalsComplete(@Param('id') id: string, @CurrentUser() user: User) {
    return this.service.transition(id, VisitStatus.VITALS_COMPLETED, user);
  }

  @Patch(':id/specialty')
  @Roles(UserRole.NURSE)
  specialty(
    @Param('id') id: string,
    @Body() dto: SelectVisitSpecialtyDto,
    @CurrentUser() user: User,
  ) {
    return this.service.selectSpecialty(id, dto, user);
  }
}
