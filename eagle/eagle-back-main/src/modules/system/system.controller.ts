import {
  Body,
  Controller,
  Get,
  Patch,
  UseGuards,
  Query,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';
import type { User } from '../users/entities/user.entity';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UpdateSystemSettingsDto } from './dto/update-system-settings.dto';
import { SystemService } from './system.service';

@ApiTags('System')
@ApiBearerAuth('JWT-auth')
@Controller('system')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SystemController {
  constructor(private readonly systemService: SystemService) {}

  @Get('settings')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get global system settings' })
  getSettings() {
    return this.systemService.getSettings();
  }

  @Patch('settings')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Update global system settings' })
  updateSettings(
    @Body() updateDto: UpdateSystemSettingsDto,
    @CurrentUser() user: User,
  ) {
    return this.systemService.updateSettings(updateDto, user.id);
  }

  @Get('settings/history')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get global system settings change history' })
  getSettingsHistory(@Query('limit') limit?: string) {
    return this.systemService.getSettingsHistory(
      limit ? Number.parseInt(limit, 10) : 20,
    );
  }

  @Get('maintenance')
  @ApiOperation({ summary: 'Get maintenance mode status' })
  getMaintenanceStatus() {
    return this.systemService.getMaintenanceStatus();
  }

  @Patch('maintenance')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Toggle maintenance mode' })
  toggleMaintenance() {
    return this.systemService.toggleMaintenance();
  }

  @Get('health')
  @ApiOperation({ summary: 'Get API and database health status' })
  getHealth() {
    return this.systemService.getHealth();
  }
}
