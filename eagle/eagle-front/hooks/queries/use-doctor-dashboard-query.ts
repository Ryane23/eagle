import { useQueries, useQuery } from "@tanstack/react-query";
import type { Consultation, Urgency, QueueStats } from "@/types/api";
import { getMySchedule } from "@/actions/consultations";
import { getUrgencies } from "@/actions/urgencies";
import { getQueueStats, getMyHospitalQueue } from "@/actions/queue";

// Query Keys
export const doctorDashboardKeys = {
    all: ["doctor-dashboard"] as const,
    stats: () => [...doctorDashboardKeys.all, "stats"] as const,
    schedule: () => [...doctorDashboardKeys.all, "schedule"] as const,
    urgent: () => [...doctorDashboardKeys.all, "urgent"] as const,
    queue: () => [...doctorDashboardKeys.all, "queue"] as const,
};

// --- Types ---

export type DoctorStats = {
    patientsToday: number;
    waitingCount: number;
    completedCount: number;
    averageWaitTime: number;
    isLoading: boolean;
};

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

export type UrgentPatientInfo = {
    id: string;
    name: string;
    patientId: string;
    urgencyLevel: number;
    reason: string;
    waitTime: string;
};

export type ScheduleItem = {
    id: string;
    patientName: string;
    patientId: string;
    time: string;
    type: "new" | "followup" | "urgency";
    status: "scheduled" | "in_progress" | "completed" | "cancelled";
    reason?: string;
    urgencyLevel?: number;
};

// --- Combined Dashboard Query ---

export function useDoctorDashboardQuery() {
    const results = useQueries({
        queries: [
            {
                queryKey: doctorDashboardKeys.stats(),
                queryFn: getQueueStats,
                staleTime: 30 * 1000,
                refetchInterval: 30 * 1000,
            },
            {
                queryKey: doctorDashboardKeys.schedule(),
                queryFn: getMySchedule,
                staleTime: 60 * 1000,
                refetchInterval: 60 * 1000,
            },
            {
                queryKey: doctorDashboardKeys.urgent(),
                queryFn: () => getUrgencies({ status: "assigned" }),
                staleTime: 30 * 1000,
                refetchInterval: 30 * 1000,
            },
            {
                queryKey: doctorDashboardKeys.queue(),
                queryFn: () => getMyHospitalQueue("waiting"),
                staleTime: 30 * 1000,
                refetchInterval: 30 * 1000,
            },
        ],
    });

    const [statsResult, scheduleResult, urgentResult, queueResult] = results;
    const isLoading = results.some((r) => r.isLoading);
    const error = results.find((r) => r.error)?.error;

    // Calculate stats
    const stats: DoctorStats = {
        patientsToday: scheduleResult.data?.length ?? 0,
        waitingCount: statsResult.data?.totalWaiting ?? queueResult.data?.length ?? 0,
        completedCount: statsResult.data?.completedToday ?? 0,
        averageWaitTime: statsResult.data?.averageWaitTime ?? 0,
        isLoading,
    };

    // Get next patient from queue
    const nextPatient: NextPatientInfo = (() => {
        const queue = queueResult.data ?? [];
        const firstEntry = queue[0];
        const patient = firstEntry?.patient;
        const patientName = (firstEntry as { patientName?: string })?.patientName;
        if (!patient && !patientName) return null;

        const consultation = firstEntry.consultation;
        const birthDate = toDate(patient?.dateOfBirth);
        const age = birthDate ? new Date().getFullYear() - birthDate.getFullYear() : 0;

        return {
            id: firstEntry.id,
            name: patient ? `${patient.firstName} ${patient.lastName}` : patientName || "Patient",
            age,
            gender: patient?.gender === "MALE" ? "M" : "F",
            appointmentTime: formatTime(consultation?.scheduledAt ?? firstEntry.createdAt),
            waitTime: `${(firstEntry as { estimatedWaitMinutes?: number }).estimatedWaitMinutes ?? firstEntry.estimatedWaitTime ?? 0} min`,
            urgencyLevel: (firstEntry as { urgencyLevel?: number }).urgencyLevel ?? 3,
            type: "new" as const,
            reason: consultation?.symptoms ?? undefined,
            patientId: patient?.id ?? firstEntry.patientId,
        };
    })();

    // Get urgent patients (use patient when populated, else patientId for details modal)
    const urgentPatients: UrgentPatientInfo[] = (urgentResult.data ?? [])
        .slice(0, 5)
        .map((urgency: Urgency) => {
            const patient = urgency.patient;
            const name = patient
                ? `${patient.firstName} ${patient.lastName}`
                : `Patient (${urgency.patientId?.slice(0, 8) || "?"})`;
            return {
                id: urgency.id,
                name,
                patientId: urgency.patientId,
                urgencyLevel: typeof urgency.urgencyLevel === "number" ? urgency.urgencyLevel : 3,
                reason: urgency.reason || "Urgence",
                waitTime: formatWaitTime(urgency.createdAt),
            };
        });

    // Get schedule items
    const schedule: ScheduleItem[] = (scheduleResult.data ?? [])
        .slice(0, 10)
        .map((consultation: Consultation) => ({
            id: consultation.id,
            patientName: consultation.patient
                ? `${consultation.patient.firstName} ${consultation.patient.lastName}`
                : "Patient",
            patientId: consultation.patientId,
            time: formatTime(consultation.scheduledAt),
            type: consultation.type === "video" ? "new" as const : "followup" as const,
            status: consultation.status,
            reason: consultation.symptoms ?? undefined,
            urgencyLevel: consultation.urgencyLevel ? parseInt(consultation.urgencyLevel, 10) : undefined,
        }));

    return {
        stats,
        nextPatient,
        urgentPatients,
        schedule,
        isLoading,
        error,
    };
}

// Convert Firebase Timestamp / Date / string to Date
function toDate(value: unknown): Date | null {
    if (!value) return null;
    if (value instanceof Date) return value;
    if (typeof value === "string") return new Date(value);
    const obj = value as { seconds?: number; _seconds?: number };
    const sec = obj.seconds ?? obj._seconds;
    if (typeof sec === "number") return new Date(sec * 1000);
    return null;
}

// Format time for display (HH:MM)
function formatTime(value: unknown): string {
    const d = toDate(value);
    return d ? d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }) : "--:--";
}

// Helper function to format wait time
function formatWaitTime(createdAt: unknown): string {
    const created = toDate(createdAt) ?? new Date();
    const now = new Date();
    const diffMs = now.getTime() - created.getTime();
    const diffMinutes = Math.floor(diffMs / 60000);

    if (diffMinutes < 60) {
        return `${diffMinutes} min`;
    }
    const hours = Math.floor(diffMinutes / 60);
    const minutes = diffMinutes % 60;
    return `${hours}h ${minutes}min`;
}

// --- Individual queries for specific data ---

export function useQueueStatsQuery() {
    return useQuery<QueueStats, Error>({
        queryKey: doctorDashboardKeys.stats(),
        queryFn: getQueueStats,
        staleTime: 30 * 1000,
        refetchInterval: 30 * 1000,
    });
}

export function useDoctorScheduleQuery() {
    return useQuery<Consultation[], Error>({
        queryKey: doctorDashboardKeys.schedule(),
        queryFn: getMySchedule,
        staleTime: 60 * 1000,
        refetchInterval: 60 * 1000,
    });
}

export function useAssignedUrgenciesQuery() {
    return useQuery<Urgency[], Error>({
        queryKey: doctorDashboardKeys.urgent(),
        queryFn: () => getUrgencies({ status: "assigned" }),
        staleTime: 30 * 1000,
        refetchInterval: 30 * 1000,
    });
}
