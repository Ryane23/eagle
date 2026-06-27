import {
  Controller,
  Post,
  Get,
  Patch,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { SyncService } from './sync.service';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import type { User } from '../users/entities/user.entity';

@Controller('sync')
@UseGuards(JwtAuthGuard)
export class SyncController {
  constructor(private readonly syncService: SyncService) {}

  /**
   * Sync pending operations
   */
  @Post('sync')
  async syncPending(@CurrentUser() user: User) {
    return await this.syncService.syncPendingOperations(user.id);
  }

  /**
   * Get pending operations
   */
  @Get('pending')
  async getPending(@CurrentUser() user: User) {
    return await this.syncService.getPendingOperations(user.id);
  }

  /**
   * Resolve conflict
   */
  @Patch('conflict/:operationId')
  async resolveConflict(
    @Param('operationId') operationId: string,
    @Body() body: { resolution: 'server' | 'client' | 'merge'; mergedData?: Record<string, any> },
  ) {
    return await this.syncService.resolveConflict(
      operationId,
      body.resolution,
      body.mergedData,
    );
  }
}

