import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { Prescription, PrescriptionStatus, CreatePrescriptionDto, UpdatePrescriptionDto } from "@/types/api";
import {
    createPrescription,
    getPrescriptions,
    getPrescriptionById,
    updatePrescription,
    deletePrescription,
    markPrescriptionAsDispensed,
    getPrescriptionsByPatient,
    getPrescriptionsByConsultation,
} from "@/actions/prescriptions";

// Query Keys
export const prescriptionKeys = {
    all: ["prescriptions"] as const,
    lists: () => [...prescriptionKeys.all, "list"] as const,
    list: (filters: string) => [...prescriptionKeys.lists(), { filters }] as const,
    details: () => [...prescriptionKeys.all, "detail"] as const,
    detail: (id: string) => [...prescriptionKeys.details(), id] as const,
    byPatient: (patientId: string) => [...prescriptionKeys.all, "patient", patientId] as const,
    byConsultation: (consultationId: string) => [...prescriptionKeys.all, "consultation", consultationId] as const,
};

// --- Queries ---

export function usePrescriptionsQuery(
    status?: PrescriptionStatus | "all",
    patientId?: string,
    consultationId?: string
) {
    return useQuery<Prescription[], Error>({
        queryKey: prescriptionKeys.list(JSON.stringify({ status, patientId, consultationId })),
        queryFn: async () => {
            let fetchedPrescriptions: Prescription[] = [];
            if (patientId) {
                fetchedPrescriptions = await getPrescriptionsByPatient(patientId);
            } else if (consultationId) {
                fetchedPrescriptions = await getPrescriptionsByConsultation(consultationId);
            } else {
                // Use general prescriptions endpoint - the backend handles permissions
                fetchedPrescriptions = await getPrescriptions();
            }
            return status === "all" || !status
                ? fetchedPrescriptions
                : fetchedPrescriptions.filter(p => p.status === status);
        },
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 10 * 60 * 1000, // 10 minutes
    });
}

export function usePrescriptionQuery(id: string) {
    return useQuery<Prescription, Error>({
        queryKey: prescriptionKeys.detail(id),
        queryFn: () => getPrescriptionById(id),
        enabled: !!id,
        staleTime: 5 * 60 * 1000,
        gcTime: 10 * 60 * 1000,
    });
}

export function usePatientPrescriptionsQuery(patientId: string) {
    return useQuery<Prescription[], Error>({
        queryKey: prescriptionKeys.byPatient(patientId),
        queryFn: () => getPrescriptionsByPatient(patientId),
        enabled: !!patientId,
        staleTime: 5 * 60 * 1000,
        gcTime: 10 * 60 * 1000,
    });
}

// --- Stats ---

export function usePrescriptionStats() {
    const { data: prescriptions = [] } = usePrescriptionsQuery();

    return {
        total: prescriptions.length,
        active: prescriptions.filter((p) => p.status === "active").length,
        dispensed: prescriptions.filter((p) => p.status === "dispensed").length,
        cancelled: prescriptions.filter((p) => p.status === "cancelled").length,
    };
}

// --- Mutations ---

export function useCreatePrescription() {
    const queryClient = useQueryClient();
    return useMutation<Prescription, Error, CreatePrescriptionDto>({
        mutationFn: createPrescription,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: prescriptionKeys.lists() });
            toast.success("Ordonnance créée avec succès!");
        },
        onError: (error) => {
            toast.error(error.message || "Erreur lors de la création");
        },
    });
}

export function useUpdatePrescription() {
    const queryClient = useQueryClient();
    return useMutation<Prescription, Error, { id: string; data: UpdatePrescriptionDto }>({
        mutationFn: ({ id, data }) => updatePrescription(id, data),
        onSuccess: (updatedPrescription, { id }) => {
            queryClient.invalidateQueries({ queryKey: prescriptionKeys.lists() });
            queryClient.setQueryData(prescriptionKeys.detail(id), updatedPrescription);
            toast.success("Ordonnance mise à jour!");
        },
        onError: (error) => {
            toast.error(error.message || "Erreur lors de la mise à jour");
        },
    });
}

export function useDeletePrescription() {
    const queryClient = useQueryClient();
    return useMutation<void, Error, string>({
        mutationFn: deletePrescription,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: prescriptionKeys.lists() });
            toast.success("Ordonnance supprimée!");
        },
        onError: (error) => {
            toast.error(error.message || "Erreur lors de la suppression");
        },
    });
}

export function useMarkPrescriptionAsDispensed() {
    const queryClient = useQueryClient();
    return useMutation<Prescription, Error, string>({
        mutationFn: markPrescriptionAsDispensed,
        onSuccess: (dispensedPrescription, id) => {
            queryClient.invalidateQueries({ queryKey: prescriptionKeys.lists() });
            queryClient.setQueryData(prescriptionKeys.detail(id), dispensedPrescription);
            toast.success("Ordonnance marquée comme délivrée!");
        },
        onError: (error) => {
            toast.error(error.message || "Erreur lors de la mise à jour");
        },
    });
}
