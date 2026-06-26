import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { Patient, CreatePatientDto, UpdatePatientDto, UpdateVitalsDto, UpdateEhrDto } from "@/types/api";
import {
    getPatients,
    getPatientById,
    searchPatients,
    createPatient,
    updatePatient,
    updatePatientVitals,
    updatePatientEhr,
    deactivatePatient,
} from "@/actions/patients";

// Query Keys
export const patientKeys = {
    all: ["patients"] as const,
    lists: () => [...patientKeys.all, "list"] as const,
    list: (filters: string) => [...patientKeys.lists(), { filters }] as const,
    details: () => [...patientKeys.all, "detail"] as const,
    detail: (id: string) => [...patientKeys.details(), id] as const,
    search: (query: string) => [...patientKeys.all, "search", query] as const,
};

// Filter type
export type PatientsQueryFilters = {
    search?: string;
    isActive?: boolean;
};

// --- Queries ---

export function usePatientsQuery(
    filters?: PatientsQueryFilters,
    options?: { enabled?: boolean }
) {
    return useQuery<Patient[], Error>({
        queryKey: patientKeys.list(JSON.stringify(filters)),
        queryFn: async () => {
            let patients: Patient[];

            if (filters?.search) {
                patients = await searchPatients(filters.search);
            } else {
                patients = await getPatients();
            }

            // Client-side filter for active status
            if (filters?.isActive !== undefined) {
                patients = patients.filter((p) => p.isActive === filters.isActive);
            }

            return patients;
        },
        staleTime: 2 * 60 * 1000, // 2 minutes
        gcTime: 5 * 60 * 1000, // 5 minutes
        enabled: options?.enabled ?? true,
    });
}

export function usePatientQuery(id: string) {
    return useQuery<Patient, Error>({
        queryKey: patientKeys.detail(id),
        queryFn: () => getPatientById(id),
        enabled: !!id,
        staleTime: 2 * 60 * 1000,
        gcTime: 5 * 60 * 1000,
    });
}

export function usePatientSearchQuery(query: string) {
    return useQuery<Patient[], Error>({
        queryKey: patientKeys.search(query),
        queryFn: () => searchPatients(query),
        enabled: query.length >= 2,
        staleTime: 30 * 1000,
        gcTime: 2 * 60 * 1000,
    });
}

// --- Stats derived from query ---

export function usePatientStats() {
    const { data: patients = [] } = usePatientsQuery();

    return {
        total: patients.length,
        active: patients.filter((p) => p.isActive).length,
        inactive: patients.filter((p) => !p.isActive).length,
    };
}

// --- Mutations ---

export function useCreatePatient() {
    const queryClient = useQueryClient();
    return useMutation<Patient, Error, CreatePatientDto>({
        mutationFn: createPatient,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: patientKeys.lists() });
            toast.success("Patient créé avec succès!");
        },
        onError: (error) => {
            toast.error(error.message || "Erreur lors de la création");
        },
    });
}

export function useUpdatePatient() {
    const queryClient = useQueryClient();
    return useMutation<Patient, Error, { id: string; data: UpdatePatientDto }>({
        mutationFn: ({ id, data }) => updatePatient(id, data),
        onSuccess: (updatedPatient, { id }) => {
            queryClient.invalidateQueries({ queryKey: patientKeys.lists() });
            queryClient.setQueryData(patientKeys.detail(id), updatedPatient);
            toast.success("Patient mis à jour!");
        },
        onError: (error) => {
            toast.error(error.message || "Erreur lors de la mise à jour");
        },
    });
}

export function useUpdatePatientVitals() {
    const queryClient = useQueryClient();
    return useMutation<Patient, Error, { id: string; data: UpdateVitalsDto }>({
        mutationFn: ({ id, data }) => updatePatientVitals(id, data),
        onSuccess: (updatedPatient, { id }) => {
            queryClient.setQueryData(patientKeys.detail(id), updatedPatient);
            toast.success("Signes vitaux mis à jour!");
        },
        onError: (error) => {
            toast.error(error.message || "Erreur lors de la mise à jour");
        },
    });
}

export function useUpdatePatientEhr() {
    const queryClient = useQueryClient();
    return useMutation<Patient, Error, { id: string; data: UpdateEhrDto }>({
        mutationFn: ({ id, data }) => updatePatientEhr(id, data),
        onSuccess: (updatedPatient, { id }) => {
            queryClient.setQueryData(patientKeys.detail(id), updatedPatient);
            toast.success("Dossier médical mis à jour!");
        },
        onError: (error) => {
            toast.error(error.message || "Erreur lors de la mise à jour");
        },
    });
}

export function useDeactivatePatient() {
    const queryClient = useQueryClient();
    return useMutation<Patient, Error, string>({
        mutationFn: deactivatePatient,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: patientKeys.lists() });
            toast.success("Patient désactivé!");
        },
        onError: (error) => {
            toast.error(error.message || "Erreur lors de la désactivation");
        },
    });
}
