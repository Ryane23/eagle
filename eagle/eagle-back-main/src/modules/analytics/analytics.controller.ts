import {
  Controller,
  Get,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';

@ApiTags('Analytics')
@ApiBearerAuth('JWT-auth')
@Controller('analytics')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  /**
   * Get network overview (all branches)
   * Access: ADMIN only
   */
  @Get('network')
  @Roles(UserRole.ADMIN)
  async getNetworkOverview() {
    return await this.analyticsService.getNetworkOverview();
  }

  /**
   * Get statistics for a specific branch/hospital
   * Access: ADMIN only
   */
  @Get('branch/:hospitalId')
  @Roles(UserRole.ADMIN)
  async getBranchStatistics(@Param('hospitalId') hospitalId: string) {
    return await this.analyticsService.getBranchStatistics(hospitalId);
  }
}

