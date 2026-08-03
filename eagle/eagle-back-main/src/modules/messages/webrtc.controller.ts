import {
  Controller,
  Post,
  Get,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { WebRTCService } from './webrtc.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { User } from '../users/entities/user.entity';

@ApiTags('WebRTC')
@Controller('webrtc')
@UseGuards(JwtAuthGuard, RolesGuard)
export class WebRTCController {
  constructor(private readonly webrtcService: WebRTCService) {}

  /**
   * Create/start WebRTC room for consultation
   * Access: DOCTOR, ADMIN, PRIMARY_SECRETARY
   * Usually called when consultation status changes to IN_PROGRESS
   */
  @Post('room/:consultationId')
  @HttpCode(HttpStatus.OK)
  async createRoom(
    @Param('consultationId') consultationId: string,
    @CurrentUser() user: User,
  ) {
    const room = await this.webrtcService.createRoom(consultationId);
    return room;
  }

  /**
   * Get room by consultation ID
   * Access: DOCTOR, NURSE, ADMIN, PRIMARY_SECRETARY (with access control)
   */
  @Get('room/consultation/:consultationId')
  async getRoomByConsultationId(
    @Param('consultationId') consultationId: string,
    @CurrentUser() user: User,
  ) {
    const room = await this.webrtcService.getRoomByConsultationId(
      consultationId,
    );

    if (!room) {
      return null;
    }

    // Verify access
    await this.webrtcService.verifyRoomAccess(room.id, user.id);

    return room;
  }

  /**
   * Get room by ID
   * Access: DOCTOR, NURSE, ADMIN, PRIMARY_SECRETARY (with access control)
   */
  @Get('room/:roomId')
  async getRoomById(
    @Param('roomId') roomId: string,
    @CurrentUser() user: User,
  ) {
    const room = await this.webrtcService.verifyRoomAccess(roomId, user.id);
    return room;
  }

  /**
   * End WebRTC room
   * Access: DOCTOR, ADMIN, PRIMARY_SECRETARY
   * Usually called when consultation ends
   */
  @Post('room/:roomId/end')
  @HttpCode(HttpStatus.OK)
  async endRoom(
    @Param('roomId') roomId: string,
    @CurrentUser() user: User,
  ) {
    await this.webrtcService.verifyRoomAccess(roomId, user.id);
    const room = await this.webrtcService.endRoom(roomId);
    return { message: 'Room ended successfully', room };
  }

  /**
   * End room by consultation ID
   * Access: DOCTOR, ADMIN, PRIMARY_SECRETARY
   */
  @Post('room/consultation/:consultationId/end')
  @HttpCode(HttpStatus.OK)
  async endRoomByConsultationId(
    @Param('consultationId') consultationId: string,
    @CurrentUser() user: User,
  ) {
    await this.webrtcService.endRoomByConsultationId(consultationId);
    return { message: 'Room ended successfully' };
  }
}
