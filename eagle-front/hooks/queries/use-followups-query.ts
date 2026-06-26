import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { Followup, CreateFollowupDto, UpdateFollowupDto } from "@/types/api";
import {
    createFollowup,
    getFollowups,
    getUpcomingFollowups,
    getFollowupsByPatient,
    getFollowupsByDoctor,
    getFollowupById,
    updateFollowup,
    completeFollowup,
    cancelFollowup,
    markFollowupAsMissed,
} from "@/actions/followups";

// Query Keys
export const followupKeys = {
    all: ["followups"] as const,
    lists: () => [...followupKeys.all, "list"] as const,
    list: (filters: string) => [...followupKeys.lists(), { filters }] as const,
    upcoming: (limit?: number) => [...followupKeys.all, "upcoming", limit] as const,
    byPatient: (patientId: string) => [...followupKeys.all, "patient", patientId] as const,
    byDoctor: (doctorId: string) => [...followupKeys.all, "doctor", doctorId] as const,
    details: () => [...followupKeys.all, "detail"] as const,
    detail: (id: string) => [...followupKeys.details(), id] as const,
};

// ============================================================================
// Queries
// ============================================================================

/**
 * Get all follow-ups
 */
export function useFollowupsQuery() {
    return useQuery<Followup[], Error>({
        queryKey: followupKeys.lists(),
        queryFn: getFollowups,
        staleTime: 5 * 60 * 1000,
        gcTime: 10 * 60 * 1000,
    });
}

/**
 * Get upcoming follow-ups with optional limit
 */
export function useUpcomingFollowupsQuery(limit?: number) {
    return useQuery<Followup[], Error>({
        queryKey: followupKeys.upcoming(limit),
        queryFn: () => getUpcomingFollowups(limit),
        staleTime: 2 * 60 * 1000, // 2 minutes - upcoming list changes more frequently
        gcTime: 5 * 60 * 1000,
    });
}

/**
 * Get follow-ups for a specific patient
 */
export function usePatientFollowupsQuery(patientId: string) {
    return useQuery<Followup[], Error>({
        queryKey: followupKeys.byPatient(patientId),
        queryFn: () => getFollowupsByPatient(patientId),
        enabled: !!patientId,
        staleTime: 5 * 60 * 1000,
        gcTime: 10 * 60 * 1000,
    });
}

/**
 * Get follow-ups for a specific doctor
 */
export function useDoctorFollowupsQuery(doctorId: string) {
    return useQuery<Followup[], Error>({
        queryKey: followupKeys.byDoctor(doctorId),
        queryFn: () => getFollowupsByDoctor(doctorId),
        enabled: !!doctorId,
        staleTime: 5 * 60 * 1000,
        gcTime: 10 * 60 * 1000,
    });
}

/**
 * Get single follow-up by ID
 */
export function useFollowupQuery(id: string) {
    return useQuery<Followup, Error>({
        queryKey: followupKeys.detail(id),
        queryFn: () => getFollowupById(id),
        enabled: !!id,
        staleTime: 5 * 60 * 1000,
        gcTime: 10 * 60 * 1000,
    });
}

// ============================================================================
// Stats
// ============================================================================

export function useFollowupStats() {
    const { data: followups = [] } = useFollowupsQuery();

    return {
        total: followups.length,
        scheduled: followups.filter((f) => f.status === "scheduled").length,
        completed: followups.filter((f) => f.status === "completed").length,
        cancelled: followups.filter((f) => f.status === "cancelled").length,
        missed: followups.filter((f) => f.status === "missed").length,
    };
}

// ============================================================================
// Mutations
// ============================================================================

/**
 * Create a new follow-up
 */
export function useCreateFollowup() {
    const queryClient = useQueryClient();

    return useMutation<Followup, Error, CreateFollowupDto>({
        mutationFn: createFollowup,
        onSuccess: (newFollowup) => {
            queryClient.invalidateQueries({ queryKey: followupKeys.lists() });
            queryClient.invalidateQueries({ queryKey: followupKeys.upcoming() });
            if (newFollowup.patientId) {
                queryClient.invalidateQueries({ queryKey: followupKeys.byPatient(newFollowup.patientId) });
            }
            toast.success("Rendez-vous de suivi créé");
        },
        onError: (error) => {
            toast.error(error.message || "Erreur lors de la création du suivi");
        },
    });
}

/**
 * Update a follow-up
 */
export function useUpdateFollowup() {
    const queryClient = useQueryClient();

    return useMutation<Followup, Error, { id: string; data: UpdateFollowupDto }>({
        mutationFn: ({ id, data }) => updateFollowup(id, data),
        onSuccess: (updatedFollowup, { id }) => {
            queryClient.setQueryData(followupKeys.detail(id), updatedFollowup);
            queryClient.invalidateQueries({ queryKey: followupKeys.lists() });
            toast.success("Suivi mis à jour");
        },
        onError: (error) => {
            toast.error(error.message || "Erreur lors de la mise à jour");
        },
    });
}

/**
 * Complete a follow-up
 */
export function useCompleteFollowup() {
    const queryClient = useQueryClient();

    return useMutation<Followup, Error, string>({
        mutationFn: completeFollowup,
        onSuccess: (updatedFollowup, id) => {
            queryClient.setQueryData(followupKeys.detail(id), updatedFollowup);
            queryClient.invalidateQueries({ queryKey: followupKeys.lists() });
            queryClient.invalidateQueries({ queryKey: followupKeys.upcoming() });
            toast.success("Suivi marqué comme terminé");
        },
        onError: (error) => {
            toast.error(error.message || "Erreur lors de la mise à jour");
        },
    });
}

/**
 * Cancel a follow-up
 */
export function useCancelFollowup() {
    const queryClient = useQueryClient();

    return useMutation<Followup, Error, string>({
        mutationFn: cancelFollowup,
        onSuccess: (updatedFollowup, id) => {
            queryClient.setQueryData(followupKeys.detail(id), updatedFollowup);
            queryClient.invalidateQueries({ queryKey: followupKeys.lists() });
            queryClient.invalidateQueries({ queryKey: followupKeys.upcoming() });
            toast.success("Suivi annulé");
        },
        onError: (error) => {
            toast.error(error.message || "Erreur lors de l'annulation");
        },
    });
}

/**
 * Mark follow-up as missed
 */
export function useMarkFollowupAsMissed() {
    const queryClient = useQueryClient();

    return useMutation<Followup, Error, string>({
        mutationFn: markFollowupAsMissed,
        onSuccess: (updatedFollowup, id) => {
            queryClient.setQueryData(followupKeys.detail(id), updatedFollowup);
            queryClient.invalidateQueries({ queryKey: followupKeys.lists() });
            toast.success("Suivi marqué comme manqué");
        },
        onError: (error) => {
            toast.error(error.message || "Erreur lors de la mise à jour");
        },
    });
}

