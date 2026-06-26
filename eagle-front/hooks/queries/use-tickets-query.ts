import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { Ticket, CreateTicketDto } from "@/types/api";
import {
    createTicket,
    getTicketByNumber,
    getTicketById,
    getTicketsByPatient,
    getTicketsByHospital,
    getTicketQRCode,
} from "@/actions/tickets";

// Query Keys
export const ticketKeys = {
    all: ["tickets"] as const,
    lists: () => [...ticketKeys.all, "list"] as const,
    byNumber: (ticketNumber: string) => [...ticketKeys.all, "number", ticketNumber] as const,
    byPatient: (patientId: string) => [...ticketKeys.all, "patient", patientId] as const,
    byHospital: (hospitalId: string) => [...ticketKeys.all, "hospital", hospitalId] as const,
    details: () => [...ticketKeys.all, "detail"] as const,
    detail: (id: string) => [...ticketKeys.details(), id] as const,
    qrCode: (ticketNumber: string) => [...ticketKeys.all, "qr", ticketNumber] as const,
};

// ============================================================================
// Queries
// ============================================================================

/**
 * Get ticket by ticket number
 */
export function useTicketByNumberQuery(ticketNumber: string) {
    return useQuery<Ticket, Error>({
        queryKey: ticketKeys.byNumber(ticketNumber),
        queryFn: () => getTicketByNumber(ticketNumber),
        enabled: !!ticketNumber,
        staleTime: 5 * 60 * 1000,
        gcTime: 10 * 60 * 1000,
    });
}

/**
 * Get ticket by ID
 */
export function useTicketQuery(id: string) {
    return useQuery<Ticket, Error>({
        queryKey: ticketKeys.detail(id),
        queryFn: () => getTicketById(id),
        enabled: !!id,
        staleTime: 5 * 60 * 1000,
        gcTime: 10 * 60 * 1000,
    });
}

/**
 * Get tickets by patient ID
 */
export function usePatientTicketsQuery(patientId: string) {
    return useQuery<Ticket[], Error>({
        queryKey: ticketKeys.byPatient(patientId),
        queryFn: () => getTicketsByPatient(patientId),
        enabled: !!patientId,
        staleTime: 2 * 60 * 1000, // 2 minutes - tickets can change frequently
        gcTime: 5 * 60 * 1000,
    });
}

/**
 * Get tickets by hospital ID
 */
export function useHospitalTicketsQuery(hospitalId: string) {
    return useQuery<Ticket[], Error>({
        queryKey: ticketKeys.byHospital(hospitalId),
        queryFn: () => getTicketsByHospital(hospitalId),
        enabled: !!hospitalId,
        staleTime: 1 * 60 * 1000, // 1 minute - hospital tickets change very frequently
        gcTime: 5 * 60 * 1000,
        refetchInterval: 30 * 1000, // Auto-refresh every 30 seconds
    });
}

/**
 * Get QR code for a ticket
 */
export function useTicketQRCodeQuery(ticketNumber: string) {
    return useQuery<{ qrCode: string }, Error>({
        queryKey: ticketKeys.qrCode(ticketNumber),
        queryFn: () => getTicketQRCode(ticketNumber),
        enabled: !!ticketNumber,
        staleTime: 60 * 60 * 1000, // 1 hour - QR codes don't change
        gcTime: 2 * 60 * 60 * 1000,
    });
}

// ============================================================================
// Mutations
// ============================================================================

/**
 * Create a new ticket
 */
export function useCreateTicket() {
    const queryClient = useQueryClient();

    return useMutation<Ticket, Error, CreateTicketDto>({
        mutationFn: createTicket,
        onSuccess: (newTicket) => {
            queryClient.setQueryData(ticketKeys.detail(newTicket.id), newTicket);
            queryClient.setQueryData(ticketKeys.byNumber(newTicket.ticketNumber), newTicket);
            if (newTicket.patientId) {
                queryClient.invalidateQueries({ queryKey: ticketKeys.byPatient(newTicket.patientId) });
            }
            if (newTicket.hospitalId) {
                queryClient.invalidateQueries({ queryKey: ticketKeys.byHospital(newTicket.hospitalId) });
            }
            toast.success(`Ticket créé: ${newTicket.ticketNumber}`);
        },
        onError: (error) => {
            toast.error(error.message || "Erreur lors de la création du ticket");
        },
    });
}

