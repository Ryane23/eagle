import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { MessagesService } from './messages.service';
import { CreateMessageDto } from './dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import type { User } from '../users/entities/user.entity';

@ApiTags('Messages')
@ApiBearerAuth('JWT-auth')
@Controller('messages')
@UseGuards(JwtAuthGuard)
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  /**
   * Send a message
   * Access: Doctor or Patient in the consultation
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() createMessageDto: CreateMessageDto,
    @CurrentUser() user: User,
  ) {
    return await this.messagesService.create(user.id, createMessageDto);
  }

  /**
   * Get messages for a consultation
   * Access: Doctor or Patient in the consultation
   */
  @Get('consultation/:consultationId')
  async getConsultationMessages(
    @Param('consultationId') consultationId: string,
    @CurrentUser() user: User,
  ) {
    return await this.messagesService.getConsultationMessages(
      consultationId,
      user.id,
    );
  }

  /**
   * Get unread messages for a user in a consultation
   * Access: Doctor or Patient in the consultation
   */
  @Get('consultation/:consultationId/unread')
  async getUnreadMessages(
    @Param('consultationId') consultationId: string,
    @CurrentUser() user: User,
  ) {
    return await this.messagesService.getUnreadMessages(
      consultationId,
      user.id,
    );
  }

  /**
   * Get unread message count for a user in a consultation
   * Access: Doctor or Patient in the consultation
   */
  @Get('consultation/:consultationId/unread-count')
  async getUnreadCount(
    @Param('consultationId') consultationId: string,
    @CurrentUser() user: User,
  ) {
    const count = await this.messagesService.getUnreadCount(
      consultationId,
      user.id,
    );
    return { count };
  }

  /**
   * Get message by ID
   * Access: Sender or Receiver
   */
  @Get(':id')
  async findById(@Param('id') id: string, @CurrentUser() user: User) {
    return await this.messagesService.findById(id, user.id);
  }

  /**
   * Mark message as read
   * Access: Receiver only
   */
  @Patch(':id/read')
  @HttpCode(HttpStatus.OK)
  async markAsRead(@Param('id') id: string, @CurrentUser() user: User) {
    return await this.messagesService.markAsRead(id, user.id);
  }

  /**
   * Mark all messages as read for a user in a consultation
   * Access: Doctor or Patient in the consultation
   */
  @Patch('consultation/:consultationId/read-all')
  @HttpCode(HttpStatus.OK)
  async markAllAsRead(
    @Param('consultationId') consultationId: string,
    @CurrentUser() user: User,
  ) {
    return await this.messagesService.markAllAsRead(consultationId, user.id);
  }

  /**
   * Delete message
   * Access: Sender only
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id') id: string, @CurrentUser() user: User) {
    await this.messagesService.delete(id, user.id);
  }
}
