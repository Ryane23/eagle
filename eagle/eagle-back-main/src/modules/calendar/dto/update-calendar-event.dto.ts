import { PartialType } from '@nestjs/mapped-types';
import { CreateCalendarEventDto } from './create-calendar-event.dto';
import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateCalendarEventDto extends PartialType(CreateCalendarEventDto) {
  @IsOptional()
  @IsBoolean()
  isCancelled?: boolean;
}
