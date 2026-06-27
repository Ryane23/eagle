import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { ActivitiesService } from './activities.service';
import { CreateActivityDto } from './dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { UserRole } from '../users/entities/user.entity';
import type { User } from '../users/entities/user.entity';
import { ActivityResource, ActivityType } from './entities/activity.entity';

@ApiTags('Activities')
@ApiBearerAuth('JWT-auth')
@Controller('activities')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ActivitiesController {
  constructor(private readonly activitiesService: ActivitiesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Log an activity' })
  async log(@Body() createActivityDto: CreateActivityDto, @CurrentUser() user: User) {
    return await this.activitiesService.log(
      user.id,
      user.role,
      createActivityDto,
      user.hospitalId,
    );
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.PRIMARY_SECRETARY)
  @ApiOperation({ summary: 'Get all activities (ADMIN, PRIMARY_SECRETARY)' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async findAll(@Query('limit') limit?: string) {
    const limitNum = limit ? parseInt(limit, 10) : 100;
    return await this.activitiesService.findAll(limitNum);
  }

  @Get('my')
  @ApiOperation({ summary: 'Get my activities' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async findMy(@CurrentUser() user: User, @Query('limit') limit?: string) {
    const limitNum = limit ? parseInt(limit, 10) : 100;
    return await this.activitiesService.findByUser(user.id, limitNum);
  }

  @Get('stats')
  @Roles(UserRole.ADMIN, UserRole.PRIMARY_SECRETARY)
  @ApiOperation({ summary: 'Get activity statistics' })
  async getStats(@Query('userId') userId?: string) {
    return await this.activitiesService.getStats(userId);
  }

  @Get('user/:userId')
  @Roles(UserRole.ADMIN, UserRole.PRIMARY_SECRETARY)
  @ApiOperation({ summary: 'Get activities by user ID' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async findByUser(@Param('userId') userId: string, @Query('limit') limit?: string) {
    const limitNum = limit ? parseInt(limit, 10) : 100;
    return await this.activitiesService.findByUser(userId, limitNum);
  }

  @Get('resource/:resource/:resourceId')
  @ApiOperation({ summary: 'Get activities by resource' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async findByResource(
    @Param('resource') resource: ActivityResource,
    @Param('resourceId') resourceId: string,
    @Query('limit') limit?: string,
  ) {
    const limitNum = limit ? parseInt(limit, 10) : 50;
    return await this.activitiesService.findByResource(resource, resourceId, limitNum);
  }

  @Get('type/:type')
  @Roles(UserRole.ADMIN, UserRole.PRIMARY_SECRETARY)
  @ApiOperation({ summary: 'Get activities by type' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async findByType(@Param('type') type: ActivityType, @Query('limit') limit?: string) {
    const limitNum = limit ? parseInt(limit, 10) : 100;
    return await this.activitiesService.findByType(type, limitNum);
  }

  @Get('hospital/:hospitalId')
  @Roles(UserRole.ADMIN, UserRole.PRIMARY_SECRETARY, UserRole.SECONDARY_SECRETARY)
  @ApiOperation({ summary: 'Get activities by hospital' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async findByHospital(
    @Param('hospitalId') hospitalId: string,
    @Query('limit') limit?: string,
  ) {
    const limitNum = limit ? parseInt(limit, 10) : 100;
    return await this.activitiesService.findByHospital(hospitalId, limitNum);
  }

  @Get('date-range')
  @Roles(UserRole.ADMIN, UserRole.PRIMARY_SECRETARY)
  @ApiOperation({ summary: 'Get activities by date range' })
  @ApiQuery({ name: 'startDate', required: true, type: String })
  @ApiQuery({ name: 'endDate', required: true, type: String })
  async findByDateRange(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return await this.activitiesService.findByDateRange(
      new Date(startDate),
      new Date(endDate),
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get activity by ID' })
  async findById(@Param('id') id: string) {
    return await this.activitiesService.findById(id);
  }
}
