import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';
import { CreateNotificationDto } from './dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserRole } from '../users/entities/user.entity';
import type { User } from '../users/entities/user.entity';

@ApiTags('Notifications')
@ApiBearerAuth('JWT-auth')
@Controller('notifications')
@UseGuards(JwtAuthGuard, RolesGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  /**
   * Send notification (Admin or system)
   * Access: ADMIN only (for manual sending)
   */
  @Post('send/:userId')
  @Roles(UserRole.ADMIN)
  async send(
    @Param('userId') userId: string,
    @Body() createNotificationDto: CreateNotificationDto,
  ) {
    return await this.notificationsService.send(userId, createNotificationDto);
  }

  /**
   * Get my notifications
   * Access: All authenticated users
   */
  @Get('my')
  async getMyNotifications(
    @CurrentUser() user: User,
    @Query('type') type?: string,
    @Query('isRead') isRead?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    // If no filters, use original method
    if (!type && isRead === undefined && !startDate && !endDate) {
      return await this.notificationsService.getMyNotifications(user.id);
    }

    // Build filters
    const filters: any = {};
    if (type) filters.type = type;
    if (isRead !== undefined) filters.isRead = isRead === 'true';
    if (startDate) filters.startDate = new Date(startDate);
    if (endDate) filters.endDate = new Date(endDate);

    return await this.notificationsService.getMyNotificationsWithFilters(user.id, filters);
  }

  /**
   * Get my unread notifications
   * Access: All authenticated users
   */
  @Get('my/unread')
  async getUnreadNotifications(@CurrentUser() user: User) {
    return await this.notificationsService.getUnreadNotifications(user.id);
  }

  /**
   * Get unread notification count
   * Access: All authenticated users
   */
  @Get('my/unread-count')
  async getUnreadCount(@CurrentUser() user: User) {
    const count = await this.notificationsService.getUnreadCount(user.id);
    return { count };
  }

  /**
   * Get notification by ID
   * Access: Owner only
   */
  @Get(':id')
  async findById(@Param('id') id: string, @CurrentUser() user: User) {
    return await this.notificationsService.findById(id, user.id);
  }

  /**
   * Mark notification as read
   * Access: Owner only
   */
  @Patch(':id/read')
  @HttpCode(HttpStatus.OK)
  async markAsRead(@Param('id') id: string, @CurrentUser() user: User) {
    return await this.notificationsService.markAsRead(id, user.id);
  }

  /**
   * Mark all notifications as read
   * Access: All authenticated users
   */
  @Patch('read-all')
  @HttpCode(HttpStatus.OK)
  async markAllAsRead(@CurrentUser() user: User) {
    return await this.notificationsService.markAllAsRead(user.id);
  }

  /**
   * Delete notification
   * Access: Owner only
   */
  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id') id: string, @CurrentUser() user: User) {
    await this.notificationsService.delete(id, user.id);
  }
}
