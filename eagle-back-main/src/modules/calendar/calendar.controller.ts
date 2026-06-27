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
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { CalendarService } from './calendar.service';
import { CreateCalendarEventDto, UpdateCalendarEventDto } from './dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { UserRole } from '../users/entities/user.entity';
import type { User } from '../users/entities/user.entity';
import { EventType } from './entities/calendar-event.entity';

@ApiTags('Calendar')
@ApiBearerAuth('JWT-auth')
@Controller('calendar')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CalendarController {
  constructor(private readonly calendarService: CalendarService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a calendar event' })
  async create(
    @Body() createCalendarEventDto: CreateCalendarEventDto,
    @CurrentUser() user: User,
  ) {
    return await this.calendarService.create(
      user.id,
      createCalendarEventDto,
      user.hospitalId,
    );
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.PRIMARY_SECRETARY, UserRole.SECONDARY_SECRETARY)
  @ApiOperation({ summary: 'Get all calendar events' })
  async findAll() {
    return await this.calendarService.findAll();
  }

  @Get('my')
  @ApiOperation({ summary: 'Get my calendar (events I organized or am participating in)' })
  async getMyCalendar(@CurrentUser() user: User) {
    return await this.calendarService.getUserCalendar(user.id);
  }

  @Get('organizer/:organizerId')
  @ApiOperation({ summary: 'Get events by organizer' })
  async findByOrganizer(@Param('organizerId') organizerId: string) {
    return await this.calendarService.findByOrganizer(organizerId);
  }

  @Get('participant/:userId')
  @ApiOperation({ summary: 'Get events where user is a participant' })
  async findByParticipant(@Param('userId') userId: string) {
    return await this.calendarService.findByParticipant(userId);
  }

  @Get('date-range')
  @ApiOperation({ summary: 'Get events by date range' })
  @ApiQuery({ name: 'startDate', required: true, type: String })
  @ApiQuery({ name: 'endDate', required: true, type: String })
  async findByDateRange(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return await this.calendarService.findByDateRange(
      new Date(startDate),
      new Date(endDate),
    );
  }

  @Get('type/:type')
  @ApiOperation({ summary: 'Get events by type' })
  async findByType(@Param('type') type: EventType) {
    return await this.calendarService.findByType(type);
  }

  @Get('hospital/:hospitalId')
  @Roles(UserRole.ADMIN, UserRole.PRIMARY_SECRETARY, UserRole.SECONDARY_SECRETARY)
  @ApiOperation({ summary: 'Get events by hospital' })
  async findByHospital(@Param('hospitalId') hospitalId: string) {
    return await this.calendarService.findByHospital(hospitalId);
  }

  @Get('resource/:resourceType/:resourceId')
  @ApiOperation({ summary: 'Get events by resource' })
  async findByResource(
    @Param('resourceType') resourceType: string,
    @Param('resourceId') resourceId: string,
  ) {
    return await this.calendarService.findByResource(resourceType, resourceId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get calendar event by ID' })
  async findById(@Param('id') id: string) {
    return await this.calendarService.findById(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a calendar event' })
  async update(@Param('id') id: string, @Body() updateCalendarEventDto: UpdateCalendarEventDto) {
    return await this.calendarService.update(id, updateCalendarEventDto);
  }

  @Patch(':id/cancel')
  @ApiOperation({ summary: 'Cancel a calendar event' })
  async cancel(@Param('id') id: string) {
    return await this.calendarService.cancel(id);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.PRIMARY_SECRETARY)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a calendar event' })
  async delete(@Param('id') id: string) {
    await this.calendarService.delete(id);
  }
}
