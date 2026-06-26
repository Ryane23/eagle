"use client";

import { create } from "zustand";
import type { Report, CreateReportDto, UpdateReportDto } from "@/types/api";
import {
    getReports,
    getMyReports,
    getReportById,
    createReport,
    updateReport,
    deleteReport,
} from "@/actions/reports";

type ReportsState = {
    reports: Report[];
    currentReport: Report | null;
    isLoading: boolean;
    error: string | null;
    filters: {
        status: string;
        type: string;
        search: string;
    };
};

type ReportsActions = {
    fetchReports: (params?: { status?: string; type?: string }) => Promise<void>;
    fetchMyReports: () => Promise<void>;
    fetchReportById: (id: string) => Promise<void>;
    createReport: (data: CreateReportDto) => Promise<Report>;
    updateReport: (id: string, data: UpdateReportDto) => Promise<void>;
    deleteReport: (id: string) => Promise<void>;
    setFilters: (filters: Partial<ReportsState["filters"]>) => void;
    clearError: () => void;
};

export const useReportsStore = create<ReportsState & ReportsActions>((set) => ({
    reports: [],
    currentReport: null,
    isLoading: false,
    error: null,
    filters: {
        status: "all",
        type: "all",
        search: "",
    },

    fetchReports: async (params) => {
        set({ isLoading: true, error: null });
        try {
            const reports = await getReports(params);
            set({ reports, isLoading: false });
        } catch (error) {
            set({
                isLoading: false,
                error: error instanceof Error ? error.message : "Erreur de chargement",
            });
        }
    },

    fetchMyReports: async () => {
        set({ isLoading: true, error: null });
        try {
            const reports = await getMyReports();
            set({ reports, isLoading: false });
        } catch (error) {
            set({
                isLoading: false,
                error: error instanceof Error ? error.message : "Erreur de chargement",
            });
        }
    },

    fetchReportById: async (id) => {
        set({ isLoading: true, error: null });
        try {
            const report = await getReportById(id);
            set({ currentReport: report, isLoading: false });
        } catch (error) {
            set({
                isLoading: false,
                error: error instanceof Error ? error.message : "Erreur de chargement",
            });
        }
    },

    createReport: async (data) => {
        set({ isLoading: true, error: null });
        try {
            const report = await createReport(data);
            set((state) => ({
                reports: [report, ...state.reports],
                isLoading: false,
            }));
            return report;
        } catch (error) {
            set({
                isLoading: false,
                error: error instanceof Error ? error.message : "Erreur de création",
            });
            throw error;
        }
    },

    updateReport: async (id, data) => {
        set({ isLoading: true, error: null });
        try {
            const updated = await updateReport(id, data);
            set((state) => ({
                reports: state.reports.map((r) => (r.id === id ? updated : r)),
                currentReport:
                    state.currentReport?.id === id ? updated : state.currentReport,
                isLoading: false,
            }));
        } catch (error) {
            set({
                isLoading: false,
                error: error instanceof Error ? error.message : "Erreur de mise à jour",
            });
            throw error;
        }
    },

    deleteReport: async (id) => {
        set({ isLoading: true, error: null });
        try {
            await deleteReport(id);
            set((state) => ({
                reports: state.reports.filter((r) => r.id !== id),
                currentReport:
                    state.currentReport?.id === id ? null : state.currentReport,
                isLoading: false,
            }));
        } catch (error) {
            set({
                isLoading: false,
                error: error instanceof Error ? error.message : "Erreur de suppression",
            });
            throw error;
        }
    },

    setFilters: (filters) => {
        set((state) => ({
            filters: { ...state.filters, ...filters },
        }));
    },

    clearError: () => {
        set({ error: null });
    },
}));

