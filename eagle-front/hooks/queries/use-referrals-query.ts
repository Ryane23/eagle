import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
    getReferrals,
    getSentReferrals,
    getReceivedReferrals,
    getPendingReferrals,
    getReferralStats,
    getMyReferrals,
    getReferralsByPatient,
    getReferralById,
    createReferral,
    updateReferral,
    acceptReferral,
    rejectReferral,
    markReferralInTransit,
    completeReferral,
    cancelReferral,
    deleteReferral,
    type Referral,
    type ReferralStats,
    type CreateReferralDto,
    type UpdateReferralDto,
    type AcceptReferralDto,
    type RejectReferralDto,
} from "@/actions/referrals";

// ============ Query Keys ============

export const referralKeys = {
    all: ["referrals"] as const,
    lists: () => [...referralKeys.all, "list"] as const,
    sent: () => [...referralKeys.all, "sent"] as const,
    received: () => [...referralKeys.all, "received"] as const,
    pending: () => [...referralKeys.all, "pending"] as const,
    stats: () => [...referralKeys.all, "stats"] as const,
    my: () => [...referralKeys.all, "my"] as const,
    byPatient: (patientId: string) => [...referralKeys.all, "patient", patientId] as const,
    details: () => [...referralKeys.all, "detail"] as const,
    detail: (id: string) => [...referralKeys.details(), id] as const,
};

// ============ Queries ============

export function useReferralsQuery() {
    return useQuery<Referral[], Error>({
        queryKey: referralKeys.lists(),
        queryFn: getReferrals,
        staleTime: 60 * 1000,
    });
}

export function useSentReferralsQuery() {
    return useQuery<Referral[], Error>({
        queryKey: referralKeys.sent(),
        queryFn: getSentReferrals,
        staleTime: 60 * 1000,
    });
}

export function useReceivedReferralsQuery() {
    return useQuery<Referral[], Error>({
        queryKey: referralKeys.received(),
        queryFn: getReceivedReferrals,
        staleTime: 60 * 1000,
    });
}

export function usePendingReferralsQuery() {
    return useQuery<Referral[], Error>({
        queryKey: referralKeys.pending(),
        queryFn: getPendingReferrals,
        staleTime: 30 * 1000,
    });
}

export function useReferralStatsQuery() {
    return useQuery<ReferralStats, Error>({
        queryKey: referralKeys.stats(),
        queryFn: getReferralStats,
        staleTime: 60 * 1000,
    });
}

export function useMyReferralsQuery() {
    return useQuery<Referral[], Error>({
        queryKey: referralKeys.my(),
        queryFn: getMyReferrals,
        staleTime: 60 * 1000,
    });
}

export function usePatientReferralsQuery(patientId: string) {
    return useQuery<Referral[], Error>({
        queryKey: referralKeys.byPatient(patientId),
        queryFn: () => getReferralsByPatient(patientId),
        enabled: !!patientId,
    });
}

export function useReferralQuery(id: string) {
    return useQuery<Referral, Error>({
        queryKey: referralKeys.detail(id),
        queryFn: () => getReferralById(id),
        enabled: !!id,
    });
}

// ============ Mutations ============

export function useCreateReferral() {
    const queryClient = useQueryClient();
    return useMutation<Referral, Error, CreateReferralDto>({
        mutationFn: createReferral,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: referralKeys.all });
            toast.success("Référence créée avec succès!");
        },
        onError: (error) => {
            toast.error(error.message || "Erreur lors de la création");
        },
    });
}

export function useUpdateReferral() {
    const queryClient = useQueryClient();
    return useMutation<Referral, Error, { id: string; data: UpdateReferralDto }>({
        mutationFn: ({ id, data }) => updateReferral(id, data),
        onSuccess: (_, { id }) => {
            queryClient.invalidateQueries({ queryKey: referralKeys.all });
            queryClient.invalidateQueries({ queryKey: referralKeys.detail(id) });
            toast.success("Référence mise à jour!");
        },
        onError: (error) => {
            toast.error(error.message || "Erreur lors de la mise à jour");
        },
    });
}

export function useAcceptReferral() {
    const queryClient = useQueryClient();
    return useMutation<Referral, Error, { id: string; data?: AcceptReferralDto }>({
        mutationFn: ({ id, data }) => acceptReferral(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: referralKeys.all });
            toast.success("Référence acceptée!");
        },
        onError: (error) => {
            toast.error(error.message || "Erreur lors de l'acceptation");
        },
    });
}

export function useRejectReferral() {
    const queryClient = useQueryClient();
    return useMutation<Referral, Error, { id: string; data: RejectReferralDto }>({
        mutationFn: ({ id, data }) => rejectReferral(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: referralKeys.all });
            toast.success("Référence rejetée!");
        },
        onError: (error) => {
            toast.error(error.message || "Erreur lors du rejet");
        },
    });
}

export function useMarkReferralInTransit() {
    const queryClient = useQueryClient();
    return useMutation<Referral, Error, string>({
        mutationFn: markReferralInTransit,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: referralKeys.all });
            toast.success("Référence marquée en transit!");
        },
        onError: (error) => {
            toast.error(error.message || "Erreur lors de la mise à jour");
        },
    });
}

export function useCompleteReferral() {
    const queryClient = useQueryClient();
    return useMutation<Referral, Error, string>({
        mutationFn: completeReferral,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: referralKeys.all });
            toast.success("Référence complétée!");
        },
        onError: (error) => {
            toast.error(error.message || "Erreur lors de la complétion");
        },
    });
}

export function useCancelReferral() {
    const queryClient = useQueryClient();
    return useMutation<Referral, Error, string>({
        mutationFn: cancelReferral,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: referralKeys.all });
            toast.success("Référence annulée!");
        },
        onError: (error) => {
            toast.error(error.message || "Erreur lors de l'annulation");
        },
    });
}

export function useDeleteReferral() {
    const queryClient = useQueryClient();
    return useMutation<void, Error, string>({
        mutationFn: deleteReferral,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: referralKeys.all });
            toast.success("Référence supprimée!");
        },
        onError: (error) => {
            toast.error(error.message || "Erreur lors de la suppression");
        },
    });
}
