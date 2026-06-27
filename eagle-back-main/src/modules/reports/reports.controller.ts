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
import { ReportsService } from './reports.service';
import { CreateReportDto, UpdateReportDto } from './dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { UserRole } from '../users/entities/user.entity';
import type { User } from '../users/entities/user.entity';
import { ReportStatus } from './entities/report.entity';

@ApiTags('Reports')
@ApiBearerAuth('JWT-auth')
@Controller('reports')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  /**
   * Create a new report
   * Access: All authenticated users
   */
  @Post()
  async create(
    @Body() createReportDto: CreateReportDto,
    @CurrentUser() user: User,
  ) {
    return await this.reportsService.create(createReportDto, user.id);
  }

  /**
   * Get all reports (Admin only)
   * Query params: status, type, hospitalId
   */
  @Get()
  @Roles(UserRole.ADMIN)
  async findAll(
    @Query('status') status?: ReportStatus,
    @Query('type') type?: string,
    @Query('hospitalId') hospitalId?: string,
  ) {
    return await this.reportsService.findAll({ status, type, hospitalId });
  }

  /**
   * Get my reports
   * Access: All authenticated users
   */
  @Get('my')
  async findMyReports(@CurrentUser() user: User) {
    return await this.reportsService.findByReporter(user.id);
  }

  /**
   * Get report by ID
   * Access: Owner or Admin
   */
  @Get(':id')
  async findById(
    @Param('id') id: string,
    @CurrentUser() user: User,
  ) {
    const isAdmin = user.role === UserRole.ADMIN;
    return await this.reportsService.findById(id, user.id, isAdmin);
  }

  /**
   * Update report
   * Access: Owner (limited) or Admin (full)
   */
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateReportDto: UpdateReportDto,
    @CurrentUser() user: User,
  ) {
    const isAdmin = user.role === UserRole.ADMIN;
    return await this.reportsService.update(id, updateReportDto, user.id, isAdmin);
  }

  /**
   * Delete report
   * Access: Admin only
   */
  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id') id: string) {
    await this.reportsService.delete(id);
  }
}

