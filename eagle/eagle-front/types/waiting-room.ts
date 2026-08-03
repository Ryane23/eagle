/**
 * Waiting Room type definitions
 */

export interface WaitingPatient {
    id: number;
    name: string;
    age: number;
    gender: "M" | "F";
    appointmentTime: string;
    waitTime: number;
    arrivalTime?: string;
    urgencyLevel: number;
    type?: "new" | "followup";
    reason: string;
    status: "waiting" | "preparation" | "ready" | "in_consultation";
    room?: string;
    nurse?: string;
    specialty: string;
    subCenter: string;
    subCenterCode?: string;
    assignedDoctor?: string;
    // Original IDs and flags for API / filtering
    _queueId?: string;
    _patientId?: string;
    _consultationId?: string;
    _doctorId?: string | null;
    _specialtyId?: string | null;
    _hasScheduledAt?: boolean;
    /** ISO date string of consultation.scheduledAt — used to split "today" vs "rendez-vous" (other days) */
    _scheduledAt?: string | null;
    /** Queue order (1-based) — order of passing / position in queue */
    position?: number;
}

export interface Doctor {
    id: string;
    name: string;
    specialty: string;
}

export type WaitingSortOption = "urgency" | "waitTime" | "appointment" | "name";
export type WaitingFilterStatus = "all" | "waiting" | "preparation" | "ready" | "in_consultation";
export type WaitingViewMode = "grid" | "list";

export const URGENCY_COLORS = {
    1: { bg: "bg-gray-100 border-gray-300", text: "text-gray-700", badge: "bg-gray-500" },
    2: { bg: "bg-blue-100 border-blue-300", text: "text-blue-700", badge: "bg-blue-500" },
    3: { bg: "bg-yellow-100 border-yellow-300", text: "text-yellow-700", badge: "bg-yellow-500" },
    4: { bg: "bg-orange-100 border-orange-300", text: "text-orange-700", badge: "bg-orange-500" },
    5: { bg: "bg-red-100 border-red-300", text: "text-red-700", badge: "bg-red-500" },
} as const;

export const STATUS_CONFIG = {
    waiting: { label: "En attente", color: "bg-gray-500" },
    preparation: { label: "Préparation", color: "bg-blue-500" },
    ready: { label: "Prêt", color: "bg-green-500" },
    in_consultation: { label: "En consultation", color: "bg-purple-500" },
} as const;

export function getUrgencyColors(level: number) {
    return URGENCY_COLORS[level as keyof typeof URGENCY_COLORS] || URGENCY_COLORS[1];
}

export function getStatusConfig(status: WaitingPatient["status"]) {
    return STATUS_CONFIG[status];
}

