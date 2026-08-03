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
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { QueueService, QueueWithPatientInfo } from './queue.service';
import { AddToQueueDto, UpdateQueueStatusDto } from './dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserRole } from '../users/entities/user.entity';
import type { User } from '../users/entities/user.entity';
import { QueueStatus } from './entities/queue.entity';

@ApiTags('Queue')
@ApiBearerAuth('JWT-auth')
@Controller('queue')
@UseGuards(JwtAuthGuard, RolesGuard)
export class QueueController {
  constructor(private readonly queueService: QueueService) {}

  /**
   * Add patient to queue
   * Access: Can be called by consultation service or manually by PRIMARY_SECRETARY
   * Note: Usually called automatically when consultation is created, but can be called manually
   */
  @Post()
  @Roles(UserRole.PRIMARY_SECRETARY, UserRole.ADMIN)
  async addToQueue(@Body() addToQueueDto: AddToQueueDto) {
    return await this.queueService.addToQueue(addToQueueDto);
  }

  /**
   * Get queue with role-based filtering
   * Access:
   * - SECONDARY_SECRETARY: Only see patients from their hospital
   * - PRIMARY_SECRETARY, ADMIN: See all queues (global view)
   * - DOCTOR, NURSE: See all queues
   */
  @Get()
  async getQueue(
    @Query('status') status?: QueueStatus,
    @CurrentUser() user?: User,
  ): Promise<QueueWithPatientInfo[]> {
    return await this.queueService.getQueue(
      user?.role || UserRole.ADMIN,
      user?.hospitalId,
      status,
    );
  }

  /**
   * Get queue for current user's hospital
   * Access: SECONDARY_SECRETARY, DOCTOR, NURSE (see their hospital's queue)
   */
  @Get('my-hospital')
  @Roles(UserRole.SECONDARY_SECRETARY, UserRole.DOCTOR, UserRole.NURSE)
  async getMyHospitalQueue(
    @CurrentUser() user: User,
    @Query('status') status?: QueueStatus,
  ): Promise<QueueWithPatientInfo[]> {
    if (user.role === UserRole.SECONDARY_SECRETARY && !user.hospitalId) {
      return [];
    }
    return await this.queueService.getQueue(
      user.role,
      user.hospitalId,
      status,
    );
  }

  /**
   * Get queue statistics
   * Access: PRIMARY_SECRETARY, ADMIN
   */
  @Get('stats')
  @Roles(UserRole.PRIMARY_SECRETARY, UserRole.ADMIN)
  async getQueueStats() {
    return await this.queueService.getQueueStats();
  }

  @Get('my-hospital/stats')
  @Roles(UserRole.SECONDARY_SECRETARY, UserRole.NURSE, UserRole.DOCTOR)
  async getMyHospitalStats(@CurrentUser() user: User) {
    const queue = await this.queueService.getQueue(
      user.role,
      user.hospitalId,
    );
    return {
      total: queue.length,
      waiting: queue.filter((item) => item.status === QueueStatus.WAITING).length,
      inProgress: queue.filter((item) => item.status === QueueStatus.IN_PROGRESS).length,
      averageWaitMinutes: queue.length
        ? Math.round(
            queue.reduce((sum, item) => sum + (item.estimatedWaitMinutes || 0), 0) /
              queue.length,
          )
        : 0,
    };
  }

  /**
   * Get queue entry by ID
   * Access: All authenticated users (with role-based filtering in service)
   */
  @Get(':id')
  async findById(@Param('id') id: string) {
    return await this.queueService.findById(id);
  }

  /**
   * Update queue status
   * Access: PRIMARY_SECRETARY, ADMIN, DOCTOR
   */
  @Patch(':id/status')
  @Roles(UserRole.PRIMARY_SECRETARY, UserRole.ADMIN, UserRole.DOCTOR)
  @HttpCode(HttpStatus.OK)
  async updateStatus(
    @Param('id') id: string,
    @Body() updateQueueStatusDto: UpdateQueueStatusDto,
  ) {
    const calledAt = updateQueueStatusDto.calledAt
      ? new Date(updateQueueStatusDto.calledAt)
      : undefined;

    return await this.queueService.updateStatus(
      id,
      updateQueueStatusDto.status,
      calledAt,
    );
  }

  /**
   * Remove queue entry (when consultation is cancelled)
   * Access: PRIMARY_SECRETARY, ADMIN
   */
  @Patch(':id/remove')
  @Roles(UserRole.PRIMARY_SECRETARY, UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  async removeFromQueue(@Param('id') id: string) {
    await this.queueService.removeFromQueue(id);
    return { message: 'Queue entry removed successfully' };
  }

  /**
   * Get queue entry by consultation ID
   * Access: All authenticated users
   */
  @Get('consultation/:consultationId')
  async findByConsultationId(@Param('consultationId') consultationId: string) {
    const queue = await this.queueService.findByConsultationId(consultationId);
    if (!queue) {
      return null;
    }
    return queue;
  }
}
