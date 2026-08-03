import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
    getActivePreparations,
    getMyPreparations,
    getPreparationById,
    getPreparationsByPatient,
    getPreparationByConsultation,
    createPreparation,
    updatePreparationProgress,
    updatePreparationChecklist,
    addPreparationObservations,
    completePreparation,
    type Preparation,
    type CreatePreparationDto,
    type UpdatePreparationProgressDto,
    type UpdateChecklistDto,
    type AddObservationsDto,
} from "@/actions/preparations";

// ============ Query Keys ============

export const preparationKeys = {
    all: ["preparations"] as const,
    lists: () => [...preparationKeys.all, "list"] as const,
    active: () => [...preparationKeys.all, "active"] as const,
    my: () => [...preparationKeys.all, "my"] as const,
    details: () => [...preparationKeys.all, "detail"] as const,
    detail: (id: string) => [...preparationKeys.details(), id] as const,
    byPatient: (patientId: string) => [...preparationKeys.all, "patient", patientId] as const,
    byConsultation: (consultationId: string) => [...preparationKeys.all, "consultation", consultationId] as const,
};

// ============ Queries ============

export function useActivePreparationsQuery() {
    return useQuery<Preparation[], Error>({
        queryKey: preparationKeys.active(),
        queryFn: getActivePreparations,
        staleTime: 30 * 1000,
    });
}

export function useMyPreparationsQuery() {
    return useQuery<Preparation[], Error>({
        queryKey: preparationKeys.my(),
        queryFn: getMyPreparations,
        staleTime: 30 * 1000,
    });
}

export function usePreparationQuery(id: string) {
    return useQuery<Preparation, Error>({
        queryKey: preparationKeys.detail(id),
        queryFn: () => getPreparationById(id),
        enabled: !!id,
    });
}

export function usePatientPreparationsQuery(patientId: string) {
    return useQuery<Preparation[], Error>({
        queryKey: preparationKeys.byPatient(patientId),
        queryFn: () => getPreparationsByPatient(patientId),
        enabled: !!patientId,
    });
}

export function useConsultationPreparationQuery(consultationId: string) {
    return useQuery<Preparation, Error>({
        queryKey: preparationKeys.byConsultation(consultationId),
        queryFn: () => getPreparationByConsultation(consultationId),
        enabled: !!consultationId,
    });
}

// ============ Mutations ============

export function useCreatePreparation() {
    const queryClient = useQueryClient();
    return useMutation<Preparation, Error, CreatePreparationDto>({
        mutationFn: createPreparation,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: preparationKeys.lists() });
            queryClient.invalidateQueries({ queryKey: preparationKeys.active() });
            queryClient.invalidateQueries({ queryKey: preparationKeys.my() });
            toast.success("Préparation créée avec succès!");
        },
        onError: (error) => {
            toast.error(error.message || "Erreur lors de la création");
        },
    });
}

export function useUpdatePreparationProgress() {
    const queryClient = useQueryClient();
    return useMutation<Preparation, Error, { id: string; data: UpdatePreparationProgressDto }>({
        mutationFn: ({ id, data }) => updatePreparationProgress(id, data),
        onSuccess: (_, { id }) => {
            queryClient.invalidateQueries({ queryKey: preparationKeys.detail(id) });
            queryClient.invalidateQueries({ queryKey: preparationKeys.active() });
            queryClient.invalidateQueries({ queryKey: preparationKeys.my() });
            toast.success("Progression mise à jour!");
        },
        onError: (error) => {
            toast.error(error.message || "Erreur lors de la mise à jour");
        },
    });
}

export function useUpdatePreparationChecklist() {
    const queryClient = useQueryClient();
    return useMutation<Preparation, Error, { id: string; data: UpdateChecklistDto }>({
        mutationFn: ({ id, data }) => updatePreparationChecklist(id, data),
        onSuccess: (_, { id }) => {
            queryClient.invalidateQueries({ queryKey: preparationKeys.detail(id) });
            toast.success("Checklist mise à jour!");
        },
        onError: (error) => {
            toast.error(error.message || "Erreur lors de la mise à jour");
        },
    });
}

export function useAddPreparationObservations() {
    const queryClient = useQueryClient();
    return useMutation<Preparation, Error, { id: string; data: AddObservationsDto }>({
        mutationFn: ({ id, data }) => addPreparationObservations(id, data),
        onSuccess: (_, { id }) => {
            queryClient.invalidateQueries({ queryKey: preparationKeys.detail(id) });
            toast.success("Observations ajoutées!");
        },
        onError: (error) => {
            toast.error(error.message || "Erreur lors de l'ajout");
        },
    });
}

export function useCompletePreparation() {
    const queryClient = useQueryClient();
    return useMutation<Preparation, Error, string>({
        mutationFn: completePreparation,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: preparationKeys.all });
            toast.success("Préparation terminée!");
        },
        onError: (error) => {
            toast.error(error.message || "Erreur lors de la complétion");
        },
    });
}

// ============ Stats ============

export function usePreparationStats() {
    const { data: preparations = [] } = useActivePreparationsQuery();
    return {
        total: preparations.length,
        pending: preparations.filter((p) => p.status === "pending").length,
        inProgress: preparations.filter((p) => p.status === "in_progress").length,
        completed: preparations.filter((p) => p.status === "completed").length,
    };
}
