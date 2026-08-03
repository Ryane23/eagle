import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { UserRole } from '../users/entities/user.entity';
import type { User } from '../users/entities/user.entity';
import { ConsultationBoxesService } from './consultation-boxes.service';
import {
  CreateConsultationBoxDto,
  UpdateConsultationBoxStatusDto,
} from './dto/consultation-box.dto';

@Controller('consultation-boxes')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ConsultationBoxesController {
  constructor(private readonly service: ConsultationBoxesService) {}

  @Post()
  @Roles(UserRole.ADMIN)
  create(@Body() dto: CreateConsultationBoxDto) {
    return this.service.create(dto);
  }

  @Get()
  @Roles(UserRole.ADMIN)
  findForAdmin(@Query('hospitalId') hospitalId?: string) {
    return this.service.findForAdmin(hospitalId);
  }

  @Get('my-hospital')
  @Roles(UserRole.NURSE, UserRole.SECONDARY_SECRETARY, UserRole.DOCTOR)
  mine(@CurrentUser() user: User) {
    return this.service.findMine(user);
  }

  @Patch(':id/specialty')
  @Roles(UserRole.NURSE, UserRole.ADMIN)
  specialty(
    @Param('id') id: string,
    @Body() dto: { specialtyId: string; startsAt?: string; endsAt?: string },
    @CurrentUser() user: User,
  ) {
    return this.service.assignSpecialty(id, dto, user);
  }

  @Patch(':id/status')
  @Roles(UserRole.ADMIN)
  status(
    @Param('id') id: string,
    @Body() dto: UpdateConsultationBoxStatusDto,
    @CurrentUser() user: User,
  ) {
    return this.service.setStatus(id, dto.status, user);
  }

  @Patch(':id/reserve')
  @Roles(UserRole.NURSE)
  reserve(
    @Param('id') id: string,
    @Body() dto: { visitId: string; consultationId?: string },
    @CurrentUser() user: User,
  ) {
    return this.service.reserve(id, dto.visitId, dto.consultationId, user);
  }

  @Patch(':id/release')
  @Roles(UserRole.NURSE, UserRole.DOCTOR)
  release(@Param('id') id: string, @CurrentUser() user: User) {
    return this.service.release(id, user);
  }
}
