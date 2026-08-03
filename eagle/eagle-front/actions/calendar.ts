import apiClient, { getErrorMessage } from "@/lib/api-client";

// ============ Types ============

export type EventType = "consultation" | "followup" | "meeting" | "reminder" | "holiday" | "unavailable" | "other";
export type RecurrencePattern = "none" | "daily" | "weekly" | "monthly" | "yearly";

export type CalendarEvent = {
    id: string;
    title: string;
    description?: string;
    type: EventType;
    startDate: string;
    endDate: string;
    allDay?: boolean;
    recurrence?: RecurrencePattern;
    recurrenceEndDate?: string;
    recurrenceCount?: number;
    organizerId: string;
    organizer?: { id: string; name: string };
    participantIds?: string[];
    participants?: { id: string; name: string }[];
    resourceType?: string;
    resourceId?: string;
    location?: string;
    reminderMinutes?: number;
    hospitalId: string;
    isCancelled?: boolean;
    createdAt: string;
    updatedAt: string;
};

export type CreateCalendarEventDto = {
    title: string;
    description?: string;
    type: EventType;
    startDate: string;
    endDate: string;
    allDay?: boolean;
    recurrence?: RecurrencePattern;
    recurrenceEndDate?: string;
    recurrenceCount?: number;
    participantIds?: string[];
    resourceType?: string;
    resourceId?: string;
    location?: string;
    reminderMinutes?: number;
};

export type UpdateCalendarEventDto = Partial<CreateCalendarEventDto> & {
    isCancelled?: boolean;
};

// ============ API Functions ============

export async function createCalendarEvent(data: CreateCalendarEventDto): Promise<CalendarEvent> {
    try {
        const response = await apiClient.post<CalendarEvent>("/calendar", data);
        return response.data;
    } catch (error) {
        throw new Error(getErrorMessage(error));
    }
}

export async function getCalendarEvents(): Promise<CalendarEvent[]> {
    try {
        const response = await apiClient.get<CalendarEvent[]>("/calendar");
        return response.data;
    } catch (error) {
        throw new Error(getErrorMessage(error));
    }
}

export async function getMyCalendar(): Promise<CalendarEvent[]> {
    try {
        const response = await apiClient.get<CalendarEvent[]>("/calendar/my");
        return response.data;
    } catch (error) {
        throw new Error(getErrorMessage(error));
    }
}

export async function getCalendarEventById(id: string): Promise<CalendarEvent> {
    try {
        const response = await apiClient.get<CalendarEvent>(`/calendar/${id}`);
        return response.data;
    } catch (error) {
        throw new Error(getErrorMessage(error));
    }
}

export async function getEventsByDateRange(startDate: string, endDate: string): Promise<CalendarEvent[]> {
    try {
        const response = await apiClient.get<CalendarEvent[]>("/calendar/date-range", {
            params: { startDate, endDate },
        });
        return response.data;
    } catch (error) {
        throw new Error(getErrorMessage(error));
    }
}

export async function getEventsByType(type: EventType): Promise<CalendarEvent[]> {
    try {
        const response = await apiClient.get<CalendarEvent[]>(`/calendar/type/${type}`);
        return response.data;
    } catch (error) {
        throw new Error(getErrorMessage(error));
    }
}

export async function getEventsByOrganizer(organizerId: string): Promise<CalendarEvent[]> {
    try {
        const response = await apiClient.get<CalendarEvent[]>(`/calendar/organizer/${organizerId}`);
        return response.data;
    } catch (error) {
        throw new Error(getErrorMessage(error));
    }
}

export async function getEventsByParticipant(userId: string): Promise<CalendarEvent[]> {
    try {
        const response = await apiClient.get<CalendarEvent[]>(`/calendar/participant/${userId}`);
        return response.data;
    } catch (error) {
        throw new Error(getErrorMessage(error));
    }
}

export async function getEventsByHospital(hospitalId: string): Promise<CalendarEvent[]> {
    try {
        const response = await apiClient.get<CalendarEvent[]>(`/calendar/hospital/${hospitalId}`);
        return response.data;
    } catch (error) {
        throw new Error(getErrorMessage(error));
    }
}

export async function updateCalendarEvent(id: string, data: UpdateCalendarEventDto): Promise<CalendarEvent> {
    try {
        const response = await apiClient.patch<CalendarEvent>(`/calendar/${id}`, data);
        return response.data;
    } catch (error) {
        throw new Error(getErrorMessage(error));
    }
}

export async function cancelCalendarEvent(id: string): Promise<CalendarEvent> {
    try {
        const response = await apiClient.patch<CalendarEvent>(`/calendar/${id}/cancel`);
        return response.data;
    } catch (error) {
        throw new Error(getErrorMessage(error));
    }
}

export async function deleteCalendarEvent(id: string): Promise<void> {
    try {
        await apiClient.delete(`/calendar/${id}`);
    } catch (error) {
        throw new Error(getErrorMessage(error));
    }
}
