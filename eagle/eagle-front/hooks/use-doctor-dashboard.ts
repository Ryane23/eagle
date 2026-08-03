"use client";

import { useEffect, useMemo, useCallback, useState } from "react";
import { useConsultationsStore } from "@/stores/consultations-store";
import { useUrgenciesStore } from "@/stores/urgencies-store";
import { useQueueStore } from "@/stores/queue-store";

// ============================================================================
// Doctor Dashboard Stats Hook
// ============================================================================

export type DoctorStats = {
    patientsToday: number;
    waitingCount: number;
    urgentCount: number;
    completedToday: number;
    averageWaitTime: number;
    totalScheduled: number;
};

export function useDoctorStats() {
    const consultations = useConsultationsStore((state) => state.consultations);
    const schedule = useConsultationsStore((state) => state.schedule);
    const queue = useQueueStore((state) => state.hospitalQueue);
    const urgencies = useUrgenciesStore((state) => state.urgencies);

    const doctorStats = useMemo((): DoctorStats => {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

        // Filter consultations for today
        const todayConsultations = consultations.filter((c) => {
            const consultDate = new Date(c.createdAt);
            return consultDate >= today;
        });

        // Waiting patients from queue
        const waiting = queue.filter((e) => e.status === "waiting");
        const urgent = waiting.filter((e) => e.priority >= 4);

        // Completed consultations today
        const completedToday = todayConsultations.filter(
            (c) => c.status === "completed"
        ).length;

        // Average wait time
        const avgWaitTime =
            waiting.length > 0
                ? Math.round(
                    waiting.reduce((sum, e) => sum + e.estimatedWaitTime, 0) /
                    waiting.length
                )
                : 0;

        // Urgent urgencies for doctor
        const urgentUrgencies = urgencies.filter(
            (u) => u.urgencyLevel >= 4 && u.status !== "completed"
        ).length;

        return {
            patientsToday: todayConsultations.length,
            waitingCount: waiting.length,
            urgentCount: urgent.length + urgentUrgencies,
            completedToday,
            averageWaitTime: avgWaitTime,
            totalScheduled: schedule.length,
        };
    }, [consultations, schedule, queue, urgencies]);

    return doctorStats;
}

// ============================================================================
// Next Patient Hook
// ============================================================================

export type NextPatientInfo = {
    id: string;
    name: string;
    age: number;
    gender: string;
    appointmentTime: string;
    waitTime: string;
    urgencyLevel: number;
    type: "new" | "followup";
    reason?: string;
    patientId: string;
} | null;

export function useNextPatient() {
    const queue = useQueueStore((state) => state.hospitalQueue);
    const isLoading = useQueueStore((state) => state.isLoading);
    const fetchHospitalQueue = useQueueStore((state) => state.fetchHospitalQueue);
    const [currentTime, setCurrentTime] = useState(() => Date.now());

    useEffect(() => {
        fetchHospitalQueue("waiting");
    }, [fetchHospitalQueue]);

    // Update current time periodically for wait time calculations
    useEffect(() => {
        const interval = setInterval(() => setCurrentTime(Date.now()), 60000);
        return () => clearInterval(interval);
    }, []);

    const nextPatient = useMemo((): NextPatientInfo => {
        // Get waiting patients sorted by position
        const waiting = queue
            .filter((e) => e.status === "waiting")
            .sort((a, b) => a.position - b.position);

        if (waiting.length === 0) return null;

        const first = waiting[0];
        const patient = first.patient;

        if (!patient) return null;

        // Calculate age from date of birth
        const birthDate = new Date(patient.dateOfBirth);
        const today = new Date();
        const age = Math.floor(
            (today.getTime() - birthDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000)
        );

        // Format queue entry time
        const queuedAt = new Date(first.createdAt);
        const waitMinutes = Math.round((currentTime - queuedAt.getTime()) / 60000);

        // Get appointment time from consultation if exists
        const appointmentTime = first.consultation?.scheduledAt
            ? new Date(first.consultation.scheduledAt).toLocaleTimeString("fr-FR", {
                hour: "2-digit",
                minute: "2-digit",
            })
            : queuedAt.toLocaleTimeString("fr-FR", {
                hour: "2-digit",
                minute: "2-digit",
            });

        // Determine consultation type from consultation data
        const consultationType = first.consultation?.type;
        const isFirstVisit = consultationType === "video" || !first.consultation; // Assume new if no consultation

        return {
            id: first.id,
            name: `${patient.firstName} ${patient.lastName}`,
            age,
            gender: patient.gender === "MALE" ? "M" : "F",
            appointmentTime,
            waitTime: `${waitMinutes} min`,
            urgencyLevel: first.priority,
            type: isFirstVisit ? "new" : "followup",
            reason: first.consultation?.symptoms || undefined,
            patientId: patient.id,
        };
    }, [queue, currentTime]);

    return { nextPatient, isLoading };
}

// ============================================================================
// Urgent Patients Hook
// ============================================================================

export type UrgentPatientInfo = {
    id: string;
    name: string;
    urgencyLevel: number;
    waitTime: string;
    reason?: string;
    patientId: string;
};

export function useUrgentPatients() {
    const urgencies = useUrgenciesStore((state) => state.urgencies);
    const queue = useQueueStore((state) => state.hospitalQueue);
    const urgenciesLoading = useUrgenciesStore((state) => state.isLoading);
    const queueLoading = useQueueStore((state) => state.isLoading);
    const fetchUrgencies = useUrgenciesStore((state) => state.fetchUrgencies);
    const [currentTime, setCurrentTime] = useState(() => Date.now());

    const isLoading = urgenciesLoading || queueLoading;

    useEffect(() => {
        fetchUrgencies({ status: "assigned" });
    }, [fetchUrgencies]);

    // Update current time periodically for wait time calculations
    useEffect(() => {
        const interval = setInterval(() => setCurrentTime(Date.now()), 60000);
        return () => clearInterval(interval);
    }, []);

    const urgentPatients = useMemo((): UrgentPatientInfo[] => {
        const patients: UrgentPatientInfo[] = [];

        // Add from urgencies (level 4-5)
        urgencies
            .filter(
                (u) =>
                    u.urgencyLevel >= 4 &&
                    (u.status === "assigned" || u.status === "in_progress")
            )
            .forEach((u) => {
                const patient = u.patient;
                if (patient) {
                    const createdAt = new Date(u.createdAt);
                    const waitMinutes = Math.round(
                        (currentTime - createdAt.getTime()) / 60000
                    );

                    patients.push({
                        id: u.id,
                        name: `${patient.firstName} ${patient.lastName}`,
                        urgencyLevel: u.urgencyLevel,
                        waitTime: `${waitMinutes} min`,
                        reason: u.reason,
                        patientId: patient.id,
                    });
                }
            });

        // Add urgent queue entries (priority 4-5)
        queue
            .filter((e) => e.priority >= 4 && e.status === "waiting")
            .forEach((e) => {
                const patient = e.patient;
                if (patient) {
                    const createdAt = new Date(e.createdAt);
                    const waitMinutes = Math.round(
                        (currentTime - createdAt.getTime()) / 60000
                    );

                    patients.push({
                        id: e.id,
                        name: `${patient.firstName} ${patient.lastName}`,
                        urgencyLevel: e.priority,
                        waitTime: `${waitMinutes} min`,
                        reason: e.consultation?.symptoms || undefined,
                        patientId: patient.id,
                    });
                }
            });

        // Sort by urgency level (highest first)
        return patients.sort((a, b) => b.urgencyLevel - a.urgencyLevel);
    }, [urgencies, queue, currentTime]);

    return { urgentPatients, isLoading };
}

// ============================================================================
// Timeline/Schedule Hook
// ============================================================================

export type ScheduleItem = {
    id: string;
    time: string;
    patientName: string;
    patientId: string;
    type: "new" | "followup";
    urgencyLevel?: number;
    status: "completed" | "current" | "waiting" | "scheduled";
    duration?: string;
};

export function useDoctorSchedule() {
    const schedule = useConsultationsStore((state) => state.schedule);
    const consultations = useConsultationsStore((state) => state.consultations);
    const isLoading = useConsultationsStore((state) => state.isLoading);
    const fetchMySchedule = useConsultationsStore((state) => state.fetchMySchedule);
    const fetchMyConsultations = useConsultationsStore((state) => state.fetchMyConsultations);

    useEffect(() => {
        fetchMySchedule();
        fetchMyConsultations();
    }, [fetchMySchedule, fetchMyConsultations]);

    const scheduleItems = useMemo((): ScheduleItem[] => {
        const items: ScheduleItem[] = [];
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

        // Get today's consultations (both completed and active)
        const todayConsultations = consultations.filter((c) => {
            const consultDate = new Date(c.createdAt);
            return consultDate >= today;
        });

        // Map consultations to schedule items
        todayConsultations.forEach((c) => {
            const patient = c.patient;
            if (!patient) return;

            const scheduledAt = c.scheduledAt
                ? new Date(c.scheduledAt)
                : new Date(c.createdAt);

            let status: ScheduleItem["status"] = "scheduled";
            if (c.status === "completed") status = "completed";
            else if (c.status === "in_progress") status = "current";
            else if (c.status === "scheduled") status = "scheduled";

            // Calculate duration for completed consultations
            let duration: string | undefined;
            if (c.status === "completed" && c.endedAt && c.startedAt) {
                const durationMs =
                    new Date(c.endedAt).getTime() - new Date(c.startedAt).getTime();
                duration = `${Math.round(durationMs / 60000)} min`;
            }

            // Determine if this is a new patient based on consultation type
            const isNewPatient = c.type === "video"; // First time consultations are often video

            items.push({
                id: c.id,
                time: scheduledAt.toLocaleTimeString("fr-FR", {
                    hour: "2-digit",
                    minute: "2-digit",
                }),
                patientName: `${patient.firstName} ${patient.lastName}`,
                patientId: patient.id,
                type: isNewPatient ? "new" : "followup",
                urgencyLevel: parseInt(c.urgencyLevel || "2", 10),
                status,
                duration,
            });
        });

        // Add scheduled items that haven't started yet
        schedule
            .filter((c) => c.status === "scheduled")
            .forEach((c) => {
                const patient = c.patient;
                if (!patient) return;

                // Check if already added
                if (items.find((i) => i.id === c.id)) return;

                const scheduledAt = new Date(c.scheduledAt || c.createdAt);
                const isNewPatient = c.type === "video";

                items.push({
                    id: c.id,
                    time: scheduledAt.toLocaleTimeString("fr-FR", {
                        hour: "2-digit",
                        minute: "2-digit",
                    }),
                    patientName: `${patient.firstName} ${patient.lastName}`,
                    patientId: patient.id,
                    type: isNewPatient ? "new" : "followup",
                    urgencyLevel: parseInt(c.urgencyLevel || "2", 10),
                    status: "scheduled",
                });
            });

        // Sort by time
        return items.sort((a, b) => a.time.localeCompare(b.time));
    }, [consultations, schedule]);

    return { scheduleItems, isLoading };
}

// ============================================================================
// Refresh All Data Hook
// ============================================================================

export function useDoctorDashboardRefresh(refreshInterval: number = 30000) {
    const fetchMySchedule = useConsultationsStore((state) => state.fetchMySchedule);
    const fetchMyConsultations = useConsultationsStore((state) => state.fetchMyConsultations);
    const fetchHospitalQueue = useQueueStore((state) => state.fetchHospitalQueue);
    const fetchQueueStats = useQueueStore((state) => state.fetchQueueStats);
    const fetchUrgencies = useUrgenciesStore((state) => state.fetchUrgencies);

    const refreshAll = useCallback(() => {
        fetchMySchedule();
        fetchMyConsultations();
        fetchHospitalQueue();
        fetchQueueStats();
        fetchUrgencies();
    }, [
        fetchMySchedule,
        fetchMyConsultations,
        fetchHospitalQueue,
        fetchQueueStats,
        fetchUrgencies,
    ]);

    // Initial fetch
    useEffect(() => {
        refreshAll();
    }, [refreshAll]);

    // Auto-refresh
    useEffect(() => {
        const interval = setInterval(refreshAll, refreshInterval);
        return () => clearInterval(interval);
    }, [refreshAll, refreshInterval]);

    return { refreshAll };
}

// ============================================================================
// Start Consultation Hook
// ============================================================================

export function useStartConsultation() {
    const startConsultation = useConsultationsStore((state) => state.startConsultation);
    const startUrgency = useUrgenciesStore((state) => state.startUrgency);
    const consultationsLoading = useConsultationsStore((state) => state.isLoading);
    const urgenciesLoading = useUrgenciesStore((state) => state.isLoading);

    const isLoading = consultationsLoading || urgenciesLoading;

    const handleStartConsultation = useCallback(
        async (id: string, type: "consultation" | "urgency" = "consultation") => {
            if (type === "urgency") {
                await startUrgency(id);
            } else {
                await startConsultation(id);
            }
        },
        [startConsultation, startUrgency]
    );

    return { startConsultation: handleStartConsultation, isLoading };
}
