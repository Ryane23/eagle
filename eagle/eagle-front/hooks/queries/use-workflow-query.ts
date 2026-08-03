"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
    assignBoxSpecialty,
    createConsultationBox,
    createVisit,
    getConsultationBoxes,
    getHospitalConsultationBoxes,
    getHospitalVisits,
    getWorkflowContext,
    getWorkflowSummary,
    releaseConsultationBox,
    reserveConsultationBox,
    createAppointment,
    getAppointments,
    getCareTeam,
    updateAppointmentStatus,
    updateConsultationBoxStatus,
    markVisitVitalsComplete,
    selectVisitSpecialty,
} from "@/actions/workflow";

export const workflowKeys = {
    all: ["workflow"] as const,
    context: () => ["workflow", "context"] as const,
    summary: () => ["workflow", "summary"] as const,
    visits: () => ["workflow", "visits"] as const,
    boxes: () => ["workflow", "boxes"] as const,
    hospitalBoxes: (hospitalId: string) =>
        [...workflowKeys.boxes(), "hospital", hospitalId] as const,
    appointments: () => ["workflow", "appointments"] as const,
    careTeam: () => ["workflow", "care-team"] as const,
};

export function useWorkflowContextQuery() {
    return useQuery({
        queryKey: workflowKeys.context(),
        queryFn: getWorkflowContext,
        staleTime: 5 * 60 * 1000,
    });
}

export function useWorkflowSummaryQuery() {
    return useQuery({
        queryKey: workflowKeys.summary(),
        queryFn: getWorkflowSummary,
        refetchInterval: 30 * 1000,
    });
}

export function useHospitalVisitsQuery() {
    return useQuery({
        queryKey: workflowKeys.visits(),
        queryFn: getHospitalVisits,
        refetchInterval: 15 * 1000,
    });
}

export function useCreateVisit() {
    const client = useQueryClient();
    return useMutation({
        mutationFn: createVisit,
        onSuccess: () => {
            client.invalidateQueries({ queryKey: workflowKeys.visits() });
            client.invalidateQueries({ queryKey: workflowKeys.summary() });
        },
    });
}

export function useMarkVisitVitalsComplete() {
    const client = useQueryClient();
    return useMutation({
        mutationFn: markVisitVitalsComplete,
        onSuccess: () => {
            client.invalidateQueries({ queryKey: workflowKeys.visits() });
            client.invalidateQueries({ queryKey: workflowKeys.summary() });
        },
    });
}

export function useSelectVisitSpecialty() {
    const client = useQueryClient();
    return useMutation({
        mutationFn: ({
            visitId,
            data,
        }: {
            visitId: string;
            data: { specialtyId: string; boxId?: string };
        }) => selectVisitSpecialty(visitId, data),
        onSuccess: () => {
            client.invalidateQueries({ queryKey: workflowKeys.visits() });
            client.invalidateQueries({ queryKey: workflowKeys.summary() });
        },
    });
}

export function useConsultationBoxesQuery() {
    return useQuery({
        queryKey: workflowKeys.boxes(),
        queryFn: getConsultationBoxes,
        refetchInterval: 15 * 1000,
    });
}

export function useHospitalConsultationBoxesQuery(hospitalId: string) {
    return useQuery({
        queryKey: workflowKeys.hospitalBoxes(hospitalId),
        queryFn: () => getHospitalConsultationBoxes(hospitalId),
        enabled: Boolean(hospitalId),
        refetchInterval: 30 * 1000,
    });
}

export function useCreateConsultationBox() {
    const client = useQueryClient();
    return useMutation({
        mutationFn: createConsultationBox,
        onSuccess: () =>
            client.invalidateQueries({ queryKey: workflowKeys.boxes() }),
    });
}

export function useUpdateConsultationBoxStatus() {
    const client = useQueryClient();
    return useMutation({
        mutationFn: ({
            boxId,
            status,
        }: {
            boxId: string;
            status: "AVAILABLE" | "MAINTENANCE" | "OFFLINE";
        }) => updateConsultationBoxStatus(boxId, status),
        onSuccess: () =>
            client.invalidateQueries({ queryKey: workflowKeys.boxes() }),
    });
}

export function useAssignBoxSpecialty() {
    const client = useQueryClient();
    return useMutation({
        mutationFn: ({ boxId, data }: {
            boxId: string;
            data: { specialtyId: string; startsAt?: string; endsAt?: string };
        }) => assignBoxSpecialty(boxId, data),
        onSuccess: () => client.invalidateQueries({ queryKey: workflowKeys.boxes() }),
    });
}

export function useReserveConsultationBox() {
    const client = useQueryClient();
    return useMutation({
        mutationFn: ({ boxId, data }: {
            boxId: string;
            data: { visitId: string; consultationId?: string };
        }) => reserveConsultationBox(boxId, data),
        onSuccess: () => client.invalidateQueries({ queryKey: workflowKeys.boxes() }),
    });
}

export function useReleaseConsultationBox() {
    const client = useQueryClient();
    return useMutation({
        mutationFn: releaseConsultationBox,
        onSuccess: () => client.invalidateQueries({ queryKey: workflowKeys.boxes() }),
    });
}

export function useAppointmentsQuery() {
    return useQuery({
        queryKey: workflowKeys.appointments(),
        queryFn: getAppointments,
        refetchInterval: 30 * 1000,
    });
}

export function useCreateAppointment() {
    const client = useQueryClient();
    return useMutation({
        mutationFn: createAppointment,
        onSuccess: () =>
            client.invalidateQueries({ queryKey: workflowKeys.appointments() }),
    });
}

export function useAppointmentStatus(action: "check-in" | "missed" | "cancel" | "complete") {
    const client = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => updateAppointmentStatus(id, action),
        onSuccess: () =>
            client.invalidateQueries({ queryKey: workflowKeys.appointments() }),
    });
}

export function useCareTeamQuery() {
    return useQuery({
        queryKey: workflowKeys.careTeam(),
        queryFn: getCareTeam,
        staleTime: 5 * 60 * 1000,
    });
}
