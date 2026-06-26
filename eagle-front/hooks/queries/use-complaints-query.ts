import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { Complaint, ComplaintStatus, ComplaintType, CreateComplaintDto, UpdateComplaintDto } from "@/types/api";
import {
    getComplaints,
    getComplaintById,
    createComplaint,
    updateComplaint,
    deleteComplaint,
} from "@/actions/complaints";

// Query Keys
export const complaintKeys = {
    all: ["complaints"] as const,
    lists: () => [...complaintKeys.all, "list"] as const,
    list: (filters: string) => [...complaintKeys.lists(), { filters }] as const,
    details: () => [...complaintKeys.all, "detail"] as const,
    detail: (id: string) => [...complaintKeys.details(), id] as const,
};

// Filter type
export type ComplaintsQueryFilters = {
    status?: ComplaintStatus;
    type?: ComplaintType;
    search?: string;
};

// --- Queries ---

export function useComplaintsQuery(filters?: ComplaintsQueryFilters) {
    return useQuery<Complaint[], Error>({
        queryKey: complaintKeys.list(JSON.stringify(filters)),
        queryFn: async () => {
            const complaints = await getComplaints({
                status: filters?.status,
                type: filters?.type,
            });

            // Client-side search filter (by subject)
            if (filters?.search) {
                const search = filters.search.toLowerCase();
                return complaints.filter(
                    (c) =>
                        c.subject.toLowerCase().includes(search) ||
                        c.description.toLowerCase().includes(search)
                );
            }
            return complaints;
        },
        staleTime: 2 * 60 * 1000, // 2 minutes
        gcTime: 5 * 60 * 1000, // 5 minutes
    });
}

export function useComplaintQuery(id: string) {
    return useQuery<Complaint, Error>({
        queryKey: complaintKeys.detail(id),
        queryFn: () => getComplaintById(id),
        enabled: !!id,
        staleTime: 2 * 60 * 1000,
        gcTime: 5 * 60 * 1000,
    });
}

// --- Stats derived from query ---

export function useComplaintStats() {
    const { data: complaints = [] } = useComplaintsQuery();

    return {
        total: complaints.length,
        open: complaints.filter((c) => c.status === "open").length,
        inProgress: complaints.filter((c) => c.status === "in_progress").length,
        resolved: complaints.filter((c) => c.status === "resolved").length,
        closed: complaints.filter((c) => c.status === "closed").length,
    };
}

// --- Mutations ---

export function useCreateComplaint() {
    const queryClient = useQueryClient();
    return useMutation<Complaint, Error, CreateComplaintDto>({
        mutationFn: createComplaint,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: complaintKeys.lists() });
            toast.success("Plainte créée avec succès!");
        },
        onError: (error) => {
            toast.error(error.message || "Erreur lors de la création");
        },
    });
}

export function useUpdateComplaint() {
    const queryClient = useQueryClient();
    return useMutation<Complaint, Error, { id: string; data: UpdateComplaintDto }>({
        mutationFn: ({ id, data }) => updateComplaint(id, data),
        onSuccess: (updatedComplaint, { id }) => {
            queryClient.invalidateQueries({ queryKey: complaintKeys.lists() });
            queryClient.setQueryData(complaintKeys.detail(id), updatedComplaint);
            toast.success("Plainte mise à jour!");
        },
        onError: (error) => {
            toast.error(error.message || "Erreur lors de la mise à jour");
        },
    });
}

export function useDeleteComplaint() {
    const queryClient = useQueryClient();
    return useMutation<void, Error, string>({
        mutationFn: deleteComplaint,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: complaintKeys.lists() });
            toast.success("Plainte supprimée!");
        },
        onError: (error) => {
            toast.error(error.message || "Erreur lors de la suppression");
        },
    });
}
