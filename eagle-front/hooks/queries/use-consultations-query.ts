import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type {
    Consultation,
    ConsultationStatus,
    AddNoteDto,
    CompleteConsultationDto,
} from "@/types/api";
import { queueKeys } from "./use-queue-query";
import {
    getMyConsultations,
    getMySchedule,
    getNurseTeleconsultationConsultations,
    getConsultationsByPatient,
    getConsultationById,
    startConsultation,
    addConsultationNote,
    completeConsultation,
    cancelConsultation,
    assignConsultationDoctor,
} from "@/actions/consultations";

// Query Keys
export const consultationKeys = {
    all: ["consultations"] as const,
    lists: () => [...consultationKeys.all, "list"] as const,
    list: (filters: string) => [...consultationKeys.lists(), { filters }] as const,
    details: () => [...consultationKeys.all, "detail"] as const,
    detail: (id: string) => [...consultationKeys.details(), id] as const,
    schedule: () => [...consultationKeys.all, "schedule"] as const,
    myConsultations: () => [...consultationKeys.all, "my"] as const,
    nurseTeleconsultation: () => [...consultationKeys.all, "nurse-teleconsultation"] as const,
    byPatient: (patientId: string) => [...consultationKeys.all, "patient", patientId] as const,
};

// Filter type
export type ConsultationsQueryFilters = {
    status?: ConsultationStatus;
    patientId?: string;
};

// --- Queries ---

export function useConsultationsQuery(filters?: ConsultationsQueryFilters) {
    return useQuery<Consultation[], Error>({
        queryKey: consultationKeys.list(JSON.stringify(filters)),
        queryFn: async () => {
            let consultations: Consultation[];

            if (filters?.patientId) {
                consultations = await getConsultationsByPatient(filters.patientId);
            } else {
                consultations = await getMyConsultations();
            }

            // Client-side status filter
            if (filters?.status) {
                consultations = consultations.filter((c) => c.status === filters.status);
            }

            return consultations;
        },
        staleTime: 60 * 1000, // 1 minute
        gcTime: 5 * 60 * 1000, // 5 minutes
    });
}

export function useScheduleQuery() {
    return useQuery<Consultation[], Error>({
        queryKey: consultationKeys.schedule(),
        queryFn: getMySchedule,
        staleTime: 60 * 1000,
        gcTime: 5 * 60 * 1000,
        refetchInterval: 60 * 1000, // Auto-refresh every minute
    });
}

export function useConsultationQuery(id: string) {
    return useQuery<Consultation, Error>({
        queryKey: consultationKeys.detail(id),
        queryFn: () => getConsultationById(id),
        enabled: !!id,
        staleTime: 30 * 1000,
        gcTime: 5 * 60 * 1000,
    });
}

export function usePatientConsultationsQuery(patientId: string) {
    return useQuery<Consultation[], Error>({
        queryKey: consultationKeys.byPatient(patientId),
        queryFn: () => getConsultationsByPatient(patientId),
        enabled: !!patientId,
        staleTime: 60 * 1000,
        gcTime: 5 * 60 * 1000,
    });
}

export function useNurseTeleconsultationConsultationsQuery() {
    return useQuery<Consultation[], Error>({
        queryKey: consultationKeys.nurseTeleconsultation(),
        queryFn: getNurseTeleconsultationConsultations,
        staleTime: 30 * 1000,
        gcTime: 5 * 60 * 1000,
        refetchInterval: 30 * 1000,
    });
}

// --- Stats derived from query ---

export function useConsultationStats() {
    const { data: consultations = [] } = useConsultationsQuery();
    const { data: schedule = [] } = useScheduleQuery();

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayConsultations = consultations.filter((c) => {
        const consultDate = new Date(c.scheduledAt);
        consultDate.setHours(0, 0, 0, 0);
        return consultDate.getTime() === today.getTime();
    });

    return {
        total: consultations.length,
        scheduled: consultations.filter((c) => c.status === "scheduled").length,
        inProgress: consultations.filter((c) => c.status === "in_progress").length,
        completed: consultations.filter((c) => c.status === "completed").length,
        cancelled: consultations.filter((c) => c.status === "cancelled").length,
        todayTotal: todayConsultations.length,
        todayCompleted: todayConsultations.filter((c) => c.status === "completed").length,
        upcomingCount: schedule.filter((c) => c.status === "scheduled").length,
    };
}

// --- Mutations ---

export function useStartConsultation() {
    const queryClient = useQueryClient();
    return useMutation<Consultation, Error, string>({
        mutationFn: startConsultation,
        onSuccess: (_, id) => {
            queryClient.invalidateQueries({ queryKey: consultationKeys.lists() });
            queryClient.invalidateQueries({ queryKey: consultationKeys.schedule() });
            queryClient.invalidateQueries({ queryKey: consultationKeys.detail(id) });
            toast.success("Consultation démarrée!");
        },
        onError: (error) => {
            toast.error(error.message || "Erreur lors du démarrage");
        },
    });
}

export function useAddConsultationNote() {
    const queryClient = useQueryClient();
    return useMutation<Consultation, Error, { id: string; data: AddNoteDto }>({
        mutationFn: ({ id, data }) => addConsultationNote(id, data),
        onSuccess: (_, { id }) => {
            queryClient.invalidateQueries({ queryKey: consultationKeys.detail(id) });
            toast.success("Note ajoutée!");
        },
        onError: (error) => {
            toast.error(error.message || "Erreur lors de l'ajout");
        },
    });
}

export function useCompleteConsultation() {
    const queryClient = useQueryClient();
    return useMutation<Consultation, Error, { id: string; data: CompleteConsultationDto }>({
        mutationFn: ({ id, data }) => completeConsultation(id, data),
        onSuccess: (_, { id }) => {
            queryClient.invalidateQueries({ queryKey: consultationKeys.lists() });
            queryClient.invalidateQueries({ queryKey: consultationKeys.schedule() });
            queryClient.invalidateQueries({ queryKey: consultationKeys.detail(id) });
            toast.success("Consultation terminée!");
        },
        onError: (error) => {
            toast.error(error.message || "Erreur lors de la complétion");
        },
    });
}

export function useCancelConsultation() {
    const queryClient = useQueryClient();
    return useMutation<Consultation, Error, string>({
        mutationFn: cancelConsultation,
        onSuccess: (_, id) => {
            queryClient.invalidateQueries({ queryKey: consultationKeys.lists() });
            queryClient.invalidateQueries({ queryKey: consultationKeys.schedule() });
            queryClient.invalidateQueries({ queryKey: consultationKeys.detail(id) });
            toast.success("Consultation annulée!");
        },
        onError: (error) => {
            toast.error(error.message || "Erreur lors de l'annulation");
        },
    });
}

export function useAssignConsultationDoctor() {
    const queryClient = useQueryClient();
    return useMutation<Consultation, Error, { consultationId: string; doctorId: string }>({
        mutationFn: ({ consultationId, doctorId }) =>
            assignConsultationDoctor(consultationId, doctorId),
        onSuccess: (_, { consultationId }) => {
            queryClient.invalidateQueries({ queryKey: consultationKeys.all });
            queryClient.invalidateQueries({ queryKey: consultationKeys.detail(consultationId) });
            queryClient.invalidateQueries({ queryKey: queueKeys.all });
            toast.success("Médecin assigné avec succès!");
        },
        onError: (error) => {
            toast.error(error.message || "Erreur lors de l'assignation");
        },
    });
}
