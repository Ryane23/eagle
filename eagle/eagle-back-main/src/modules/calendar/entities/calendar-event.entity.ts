export enum EventType {
  CONSULTATION = 'consultation',
  FOLLOWUP = 'followup',
  MEETING = 'meeting',
  REMINDER = 'reminder',
  HOLIDAY = 'holiday',
  UNAVAILABLE = 'unavailable',
  OTHER = 'other',
}

export enum RecurrencePattern {
  NONE = 'none',
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  YEARLY = 'yearly',
}

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string | null;
  type: EventType;
  startDate: Date;
  endDate: Date;
  allDay: boolean;
  
  // Recurrence
  recurrence: RecurrencePattern;
  recurrenceEndDate?: Date | null; // When the recurrence ends
  recurrenceCount?: number | null; // How many times to repeat
  
  // Participants
  organizerId: string; // User who created the event
  participantIds?: string[] | null; // Users invited to the event
  
  // Related resources
  resourceType?: string | null; // e.g., 'consultation', 'patient'
  resourceId?: string | null; // ID of related resource
  
  // Location/Context
  location?: string | null;
  hospitalId?: string | null;
  
  // Notifications
  reminderMinutes?: number | null; // Minutes before event to send reminder
  
  // Status
  isActive: boolean;
  isCancelled: boolean;
  
  createdAt: Date;
  updatedAt: Date;
}

export const CalendarEventCollection = 'calendar_events';
