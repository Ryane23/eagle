import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { CalendarRepository } from './calendar.repository';
import { CreateCalendarEventDto, UpdateCalendarEventDto } from './dto';
import { CalendarEvent, EventType, RecurrencePattern } from './entities/calendar-event.entity';

@Injectable()
export class CalendarService {
  constructor(private readonly calendarRepository: CalendarRepository) {}

  /**
   * Create a calendar event
   */
  async create(
    organizerId: string,
    createDto: CreateCalendarEventDto,
    hospitalId?: string | null,
  ): Promise<CalendarEvent> {
    const startDate = new Date(createDto.startDate);
    const endDate = new Date(createDto.endDate);

    // Validate dates
    if (endDate <= startDate) {
      throw new BadRequestException('End date must be after start date');
    }

    const eventData: Partial<CalendarEvent> = {
      ...createDto,
      startDate,
      endDate,
      recurrenceEndDate: createDto.recurrenceEndDate ? new Date(createDto.recurrenceEndDate) : null,
      allDay: createDto.allDay || false,
      recurrence: createDto.recurrence || RecurrencePattern.NONE,
      organizerId,
      hospitalId: hospitalId || null,
      isActive: true,
      isCancelled: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    return await this.calendarRepository.create(eventData);
  }

  /**
   * Find all active events
   */
  async findAll(): Promise<CalendarEvent[]> {
    return await this.calendarRepository.findActive();
  }

  /**
   * Find event by ID
   */
  async findById(id: string): Promise<CalendarEvent | null> {
    const event = await this.calendarRepository.findById(id);
    if (!event) {
      throw new NotFoundException(`Calendar event with ID ${id} not found`);
    }
    return event;
  }

  /**
   * Find events by organizer
   */
  async findByOrganizer(organizerId: string): Promise<CalendarEvent[]> {
    return await this.calendarRepository.findByOrganizer(organizerId);
  }

  /**
   * Find events where user is a participant
   */
  async findByParticipant(userId: string): Promise<CalendarEvent[]> {
    return await this.calendarRepository.findByParticipant(userId);
  }

  /**
   * Find events by date range
   */
  async findByDateRange(startDate: Date, endDate: Date): Promise<CalendarEvent[]> {
    return await this.calendarRepository.findByDateRange(startDate, endDate);
  }

  /**
   * Find events by type
   */
  async findByType(type: EventType): Promise<CalendarEvent[]> {
    return await this.calendarRepository.findByType(type);
  }

  /**
   * Find events by hospital
   */
  async findByHospital(hospitalId: string): Promise<CalendarEvent[]> {
    return await this.calendarRepository.findByHospital(hospitalId);
  }

  /**
   * Find events by resource
   */
  async findByResource(resourceType: string, resourceId: string): Promise<CalendarEvent[]> {
    return await this.calendarRepository.findByResource(resourceType, resourceId);
  }

  /**
   * Update a calendar event
   */
  async update(id: string, updateDto: UpdateCalendarEventDto): Promise<CalendarEvent> {
    const event = await this.findById(id);
    if (!event) {
      throw new NotFoundException(`Calendar event with ID ${id} not found`);
    }

    // Validate dates if both provided
    if (updateDto.startDate && updateDto.endDate) {
      const startDate = new Date(updateDto.startDate);
      const endDate = new Date(updateDto.endDate);
      if (endDate <= startDate) {
        throw new BadRequestException('End date must be after start date');
      }
    }

    const updateData: Partial<CalendarEvent> = {
      ...updateDto,
      startDate: updateDto.startDate ? new Date(updateDto.startDate) : event.startDate,
      endDate: updateDto.endDate ? new Date(updateDto.endDate) : event.endDate,
      recurrenceEndDate: updateDto.recurrenceEndDate
        ? new Date(updateDto.recurrenceEndDate)
        : event.recurrenceEndDate,
      updatedAt: new Date(),
    };

    return await this.calendarRepository.update(id, updateData) as CalendarEvent;
  }

  /**
   * Cancel an event
   */
  async cancel(id: string): Promise<CalendarEvent> {
    const event = await this.findById(id);
    if (!event) {
      throw new NotFoundException(`Calendar event with ID ${id} not found`);
    }
    return await this.calendarRepository.update(id, {
      isCancelled: true,
      updatedAt: new Date(),
    }) as CalendarEvent;
  }

  /**
   * Delete a calendar event
   */
  async delete(id: string): Promise<void> {
    await this.findById(id);
    await this.calendarRepository.delete(id);
  }

  /**
   * Get user's calendar (events organized by user or where user is a participant)
   */
  async getUserCalendar(userId: string): Promise<CalendarEvent[]> {
    const organizedEvents = await this.findByOrganizer(userId);
    const participantEvents = await this.findByParticipant(userId);

    // Combine and deduplicate
    const eventMap = new Map<string, CalendarEvent>();
    [...organizedEvents, ...participantEvents].forEach((event) => {
      eventMap.set(event.id, event);
    });

    return Array.from(eventMap.values()).sort(
      (a, b) => a.startDate.getTime() - b.startDate.getTime(),
    );
  }
}
