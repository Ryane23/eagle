import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsOptional,
  IsBoolean,
  IsNumber,
  IsArray,
  MinLength,
  MaxLength,
  IsDateString,
} from 'class-validator';
import { EventType, RecurrencePattern } from '../entities/calendar-event.entity';

export class CreateCalendarEventDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(200)
  title: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string | null;

  @IsEnum(EventType)
  @IsNotEmpty()
  type: EventType;

  @IsDateString()
  @IsNotEmpty()
  startDate: string;

  @IsDateString()
  @IsNotEmpty()
  endDate: string;

  @IsOptional()
  @IsBoolean()
  allDay?: boolean;

  @IsOptional()
  @IsEnum(RecurrencePattern)
  recurrence?: RecurrencePattern;

  @IsOptional()
  @IsDateString()
  recurrenceEndDate?: string | null;

  @IsOptional()
  @IsNumber()
  recurrenceCount?: number | null;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  participantIds?: string[] | null;

  @IsOptional()
  @IsString()
  resourceType?: string | null;

  @IsOptional()
  @IsString()
  resourceId?: string | null;

  @IsOptional()
  @IsString()
  location?: string | null;

  @IsOptional()
  @IsNumber()
  reminderMinutes?: number | null;
}
