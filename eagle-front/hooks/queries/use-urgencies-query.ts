import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type {
    Urgency,
    UrgencyStatus,
    CreateUrgencyDto,
    ValidateUrgencyDto,
    AssignUrgencyDto,
    RejectUrgencyDto,
} from "@/types/api";
import {
    getUrgencies,
    getPendingUrgencies,
    getUrgencyById,
    createUrgency,
    validateUrgency,
    assignUrgency,
    rejectUrgency,
    startUrgencyConsultation,
    completeUrgency,
} from "@/actions/urgencies";

// Query Keys
export const urgencyKeys = {
    all: ["urgencies"] as const,
    lists: () => [...urgencyKeys.all, "list"] as const,
    list: (filters: string) => [...urgencyKeys.lists(), { filters }] as const,
    details: () => [...urgencyKeys.all, "detail"] as const,
    detail: (id: string) => [...urgencyKeys.details(), id] as const,
    pending: () => [...urgencyKeys.all, "pending"] as const,
};

// Filter type
export type UrgenciesQueryFilters = {
    status?: UrgencyStatus;
    hospitalId?: string;
};

// --- Queries ---

export function useUrgenciesQuery(filters?: UrgenciesQueryFilters) {
    return useQuery<Urgency[], Error>({
        queryKey: urgencyKeys.list(JSON.stringify(filters)),
        queryFn: () => getUrgencies({
            status: filters?.status,
            hospitalId: filters?.hospitalId,
        }),
        staleTime: 30 * 1000, // 30 seconds
        gcTime: 2 * 60 * 1000, // 2 minutes
        refetchInterval: 30 * 1000,
    });
}

export function usePendingUrgenciesQuery() {
    return useQuery<Urgency[], Error>({
        queryKey: urgencyKeys.pending(),
        queryFn: getPendingUrgencies,
        staleTime: 30 * 1000,
        gcTime: 2 * 60 * 1000,
        refetchInterval: 30 * 1000,
    });
}

export function useUrgencyQuery(id: string) {
    return useQuery<Urgency, Error>({
        queryKey: urgencyKeys.detail(id),
        queryFn: () => getUrgencyById(id),
        enabled: !!id,
        staleTime: 30 * 1000,
        gcTime: 2 * 60 * 1000,
    });
}

// --- Stats derived from query ---

export function useUrgencyStats() {
    const { data: urgencies = [] } = useUrgenciesQuery();

    return {
        total: urgencies.length,
        pending: urgencies.filter((u) => u.status === "pending").length,
        validated: urgencies.filter((u) => u.status === "validated").length,
        assigned: urgencies.filter((u) => u.status === "assigned").length,
        inProgress: urgencies.filter((u) => u.status === "in_progress").length,
        completed: urgencies.filter((u) => u.status === "completed").length,
        critical: urgencies.filter((u) => u.urgencyLevel >= 4).length,
        highPriority: urgencies.filter((u) => u.urgencyLevel >= 3).length,
    };
}

// --- Mutations ---

export function useCreateUrgency() {
    const queryClient = useQueryClient();
    return useMutation<Urgency, Error, CreateUrgencyDto>({
        mutationFn: createUrgency,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: urgencyKeys.lists() });
            queryClient.invalidateQueries({ queryKey: urgencyKeys.pending() });
            toast.success("Urgence créée avec succès!");
        },
        onError: (error) => {
            toast.error(error.message || "Erreur lors de la création");
        },
    });
}

export function useValidateUrgency() {
    const queryClient = useQueryClient();
    return useMutation<Urgency, Error, { id: string; data: ValidateUrgencyDto }>({
        mutationFn: ({ id, data }) => validateUrgency(id, data),
        onSuccess: (_, { id }) => {
            queryClient.invalidateQueries({ queryKey: urgencyKeys.lists() });
            queryClient.invalidateQueries({ queryKey: urgencyKeys.pending() });
            queryClient.invalidateQueries({ queryKey: urgencyKeys.detail(id) });
            toast.success("Urgence validée!");
        },
        onError: (error) => {
            toast.error(error.message || "Erreur lors de la validation");
        },
    });
}

export function useAssignUrgency() {
    const queryClient = useQueryClient();
    return useMutation<Urgency, Error, { id: string; data: AssignUrgencyDto }>({
        mutationFn: ({ id, data }) => assignUrgency(id, data),
        onSuccess: (_, { id }) => {
            queryClient.invalidateQueries({ queryKey: urgencyKeys.lists() });
            queryClient.invalidateQueries({ queryKey: urgencyKeys.detail(id) });
            toast.success("Médecin assigné!");
        },
        onError: (error) => {
            toast.error(error.message || "Erreur lors de l'assignation");
        },
    });
}

export function useRejectUrgency() {
    const queryClient = useQueryClient();
    return useMutation<Urgency, Error, { id: string; data: RejectUrgencyDto }>({
        mutationFn: ({ id, data }) => rejectUrgency(id, data),
        onSuccess: (_, { id }) => {
            queryClient.invalidateQueries({ queryKey: urgencyKeys.lists() });
            queryClient.invalidateQueries({ queryKey: urgencyKeys.pending() });
            queryClient.invalidateQueries({ queryKey: urgencyKeys.detail(id) });
            toast.success("Urgence rejetée!");
        },
        onError: (error) => {
            toast.error(error.message || "Erreur lors du rejet");
        },
    });
}

export function useStartUrgencyConsultation() {
    const queryClient = useQueryClient();
    return useMutation<Urgency, Error, string>({
        mutationFn: startUrgencyConsultation,
        onSuccess: (_, id) => {
            queryClient.invalidateQueries({ queryKey: urgencyKeys.lists() });
            queryClient.invalidateQueries({ queryKey: urgencyKeys.detail(id) });
            toast.success("Consultation démarrée!");
        },
        onError: (error) => {
            toast.error(error.message || "Erreur lors du démarrage");
        },
    });
}

export function useCompleteUrgency() {
    const queryClient = useQueryClient();
    return useMutation<Urgency, Error, string>({
        mutationFn: completeUrgency,
        onSuccess: (_, id) => {
            queryClient.invalidateQueries({ queryKey: urgencyKeys.lists() });
            queryClient.invalidateQueries({ queryKey: urgencyKeys.detail(id) });
            toast.success("Urgence terminée!");
        },
        onError: (error) => {
            toast.error(error.message || "Erreur lors de la complétion");
        },
    });
}
