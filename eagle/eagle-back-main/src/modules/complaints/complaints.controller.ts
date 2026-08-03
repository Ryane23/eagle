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
import { ApiTags } from '@nestjs/swagger';
import { ComplaintsService } from './complaints.service';
import { CreateComplaintDto, UpdateComplaintDto } from './dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserRole } from '../users/entities/user.entity';
import type { User } from '../users/entities/user.entity';
import { ComplaintStatus } from './entities/complaint.entity';

@ApiTags('Complaints')
@Controller('complaints')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ComplaintsController {
  constructor(private readonly complaintsService: ComplaintsService) {}

  /**
   * Create a new complaint
   * Access: All authenticated users
   */
  @Post()
  async create(
    @Body() createComplaintDto: CreateComplaintDto,
    @CurrentUser() user: User,
  ) {
    return await this.complaintsService.create(createComplaintDto, user.id);
  }

  /**
   * Get all complaints (Admin only)
   * Query params: status, type, priority, hospitalId
   */
  @Get()
  @Roles(UserRole.ADMIN)
  async findAll(
    @Query('status') status?: ComplaintStatus,
    @Query('type') type?: string,
    @Query('priority') priority?: string,
    @Query('hospitalId') hospitalId?: string,
  ) {
    return await this.complaintsService.findAll({ status, type, priority, hospitalId });
  }

  /**
   * Get my complaints
   * Access: All authenticated users
   */
  @Get('my')
  async findMyComplaints(@CurrentUser() user: User) {
    return await this.complaintsService.findByComplainant(user.id);
  }

  /**
   * Get complaint by ID
   * Access: Owner or Admin
   */
  @Get(':id')
  async findById(
    @Param('id') id: string,
    @CurrentUser() user: User,
  ) {
    const isAdmin = user.role === UserRole.ADMIN;
    return await this.complaintsService.findById(id, user.id, isAdmin);
  }

  /**
   * Update complaint
   * Access: Owner (limited) or Admin (full)
   */
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateComplaintDto: UpdateComplaintDto,
    @CurrentUser() user: User,
  ) {
    const isAdmin = user.role === UserRole.ADMIN;
    return await this.complaintsService.update(id, updateComplaintDto, user.id, isAdmin);
  }

  /**
   * Delete complaint
   * Access: Admin only
   */
  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id') id: string) {
    await this.complaintsService.delete(id);
  }
}
