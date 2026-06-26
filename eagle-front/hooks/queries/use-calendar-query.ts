import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
    getCalendarEvents,
    getMyCalendar,
    getCalendarEventById,
    getEventsByDateRange,
    getEventsByType,
    createCalendarEvent,
    updateCalendarEvent,
    cancelCalendarEvent,
    deleteCalendarEvent,
    type CalendarEvent,
    type CreateCalendarEventDto,
    type UpdateCalendarEventDto,
    type EventType,
} from "@/actions/calendar";

// ============ Query Keys ============

export const calendarKeys = {
    all: ["calendar"] as const,
    lists: () => [...calendarKeys.all, "list"] as const,
    my: () => [...calendarKeys.all, "my"] as const,
    details: () => [...calendarKeys.all, "detail"] as const,
    detail: (id: string) => [...calendarKeys.details(), id] as const,
    dateRange: (start: string, end: string) => [...calendarKeys.all, "range", start, end] as const,
    byType: (type: EventType) => [...calendarKeys.all, "type", type] as const,
};

// ============ Queries ============

export function useCalendarEventsQuery() {
    return useQuery<CalendarEvent[], Error>({
        queryKey: calendarKeys.lists(),
        queryFn: getCalendarEvents,
        staleTime: 60 * 1000,
    });
}

export function useMyCalendarQuery() {
    return useQuery<CalendarEvent[], Error>({
        queryKey: calendarKeys.my(),
        queryFn: getMyCalendar,
        staleTime: 60 * 1000,
    });
}

export function useCalendarEventQuery(id: string) {
    return useQuery<CalendarEvent, Error>({
        queryKey: calendarKeys.detail(id),
        queryFn: () => getCalendarEventById(id),
        enabled: !!id,
    });
}

export function useDateRangeEventsQuery(startDate: string, endDate: string) {
    return useQuery<CalendarEvent[], Error>({
        queryKey: calendarKeys.dateRange(startDate, endDate),
        queryFn: () => getEventsByDateRange(startDate, endDate),
        enabled: !!startDate && !!endDate,
        staleTime: 60 * 1000,
    });
}

export function useEventsByTypeQuery(type: EventType) {
    return useQuery<CalendarEvent[], Error>({
        queryKey: calendarKeys.byType(type),
        queryFn: () => getEventsByType(type),
        enabled: !!type,
    });
}

// ============ Mutations ============

export function useCreateCalendarEvent() {
    const queryClient = useQueryClient();
    return useMutation<CalendarEvent, Error, CreateCalendarEventDto>({
        mutationFn: createCalendarEvent,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: calendarKeys.all });
            toast.success("Événement créé avec succès!");
        },
        onError: (error) => {
            toast.error(error.message || "Erreur lors de la création");
        },
    });
}

export function useUpdateCalendarEvent() {
    const queryClient = useQueryClient();
    return useMutation<CalendarEvent, Error, { id: string; data: UpdateCalendarEventDto }>({
        mutationFn: ({ id, data }) => updateCalendarEvent(id, data),
        onSuccess: (_, { id }) => {
            queryClient.invalidateQueries({ queryKey: calendarKeys.all });
            queryClient.invalidateQueries({ queryKey: calendarKeys.detail(id) });
            toast.success("Événement mis à jour!");
        },
        onError: (error) => {
            toast.error(error.message || "Erreur lors de la mise à jour");
        },
    });
}

export function useCancelCalendarEvent() {
    const queryClient = useQueryClient();
    return useMutation<CalendarEvent, Error, string>({
        mutationFn: cancelCalendarEvent,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: calendarKeys.all });
            toast.success("Événement annulé!");
        },
        onError: (error) => {
            toast.error(error.message || "Erreur lors de l'annulation");
        },
    });
}

export function useDeleteCalendarEvent() {
    const queryClient = useQueryClient();
    return useMutation<void, Error, string>({
        mutationFn: deleteCalendarEvent,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: calendarKeys.all });
            toast.success("Événement supprimé!");
        },
        onError: (error) => {
            toast.error(error.message || "Erreur lors de la suppression");
        },
    });
}
