"use client";

import {
    useQuery,
    useMutation,
    useQueryClient,
    type UseQueryOptions,
} from "@tanstack/react-query";
import {
    getReports,
    getMyReports,
    getReportById,
    createReport as apiCreateReport,
    updateReport as apiUpdateReport,
    deleteReport as apiDeleteReport,
} from "@/actions/reports";
import type { Report, CreateReportDto, UpdateReportDto, ReportStatus, ReportType } from "@/types/api";
import { toast } from "sonner";

// ============================================================================
// Query Keys
// ============================================================================

export const reportKeys = {
    all: ["reports"] as const,
    lists: () => [...reportKeys.all, "list"] as const,
    list: (filters?: { status?: ReportStatus; type?: ReportType; search?: string }) =>
        [...reportKeys.lists(), filters] as const,
    my: () => [...reportKeys.all, "my"] as const,
    details: () => [...reportKeys.all, "detail"] as const,
    detail: (id: string) => [...reportKeys.details(), id] as const,
};

// ============================================================================
// Query Hooks
// ============================================================================

export function useReportsQuery(
    filters?: { status?: ReportStatus; type?: ReportType; search?: string },
    options?: Omit<UseQueryOptions<Report[], Error>, "queryKey" | "queryFn">
) {
    return useQuery({
        queryKey: reportKeys.list(filters),
        queryFn: async () => {
            const reports = await getReports();
            if (!filters) return reports;

            return reports.filter((r) => {
                const matchesStatus = !filters.status || r.status === filters.status;
                const matchesType = !filters.type || r.type === filters.type;
                const matchesSearch =
                    !filters.search ||
                    r.title.toLowerCase().includes(filters.search.toLowerCase()) ||
                    r.content?.toLowerCase().includes(filters.search.toLowerCase());
                return matchesStatus && matchesType && matchesSearch;
            });
        },
        staleTime: 60 * 1000,
        ...options,
    });
}

export function useMyReportsQuery(
    options?: Omit<UseQueryOptions<Report[], Error>, "queryKey" | "queryFn">
) {
    return useQuery({
        queryKey: reportKeys.my(),
        queryFn: getMyReports,
        staleTime: 60 * 1000,
        ...options,
    });
}

export function useReportQuery(
    id: string,
    options?: Omit<UseQueryOptions<Report, Error>, "queryKey" | "queryFn">
) {
    return useQuery({
        queryKey: reportKeys.detail(id),
        queryFn: () => getReportById(id),
        enabled: !!id,
        ...options,
    });
}

// ============================================================================
// Mutation Hooks
// ============================================================================

export function useCreateReport() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreateReportDto) => apiCreateReport(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: reportKeys.lists() });
            queryClient.invalidateQueries({ queryKey: reportKeys.my() });
            toast.success("Rapport créé avec succès");
        },
        onError: (error) => {
            toast.error(error instanceof Error ? error.message : "Erreur lors de la création");
        },
    });
}

export function useUpdateReport() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: UpdateReportDto }) =>
            apiUpdateReport(id, data),
        onMutate: async ({ id, data }) => {
            await queryClient.cancelQueries({ queryKey: reportKeys.detail(id) });
            const previous = queryClient.getQueryData<Report>(reportKeys.detail(id));
            if (previous) {
                queryClient.setQueryData<Report>(reportKeys.detail(id), { ...previous, ...data });
            }
            return { previous };
        },
        onError: (_err, { id }, context) => {
            if (context?.previous) {
                queryClient.setQueryData(reportKeys.detail(id), context.previous);
            }
            toast.error("Erreur lors de la mise à jour");
        },
        onSuccess: (_data, { id }) => {
            queryClient.invalidateQueries({ queryKey: reportKeys.detail(id) });
            queryClient.invalidateQueries({ queryKey: reportKeys.lists() });
            queryClient.invalidateQueries({ queryKey: reportKeys.my() });
            toast.success("Rapport mis à jour");
        },
    });
}

export function useDeleteReport() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => apiDeleteReport(id),
        onMutate: async (id) => {
            await queryClient.cancelQueries({ queryKey: reportKeys.lists() });
            const previous = queryClient.getQueryData<Report[]>(reportKeys.list());
            if (previous) {
                queryClient.setQueryData<Report[]>(
                    reportKeys.list(),
                    previous.filter((r) => r.id !== id)
                );
            }
            return { previous };
        },
        onError: (_err, _id, context) => {
            if (context?.previous) {
                queryClient.setQueryData(reportKeys.list(), context.previous);
            }
            toast.error("Erreur lors de la suppression");
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: reportKeys.all });
            toast.success("Rapport supprimé");
        },
    });
}

// ============================================================================
// Stats Hook
// ============================================================================

export function useReportStats() {
    const { data: reports = [] } = useMyReportsQuery();

    return {
        total: reports.length,
        draft: reports.filter((r) => r.status === "draft").length,
        final: reports.filter((r) => r.status === "final").length,
        amended: reports.filter((r) => r.status === "amended").length,
    };
}

