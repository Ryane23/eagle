/**
 * Dashboard-specific type definitions
 * These extend the base API types for UI/display purposes
 */

import type { Patient, VitalSigns } from "./api";

// ============ PATIENT DISPLAY TYPES ============

/**
 * Extended patient type for doctor dashboard display
 * Includes computed fields and display-friendly data
 */
export type PatientDisplay = {
    id: string | number;
    name: string;
    age: number;
    gender?: "M" | "F" | "Homme" | "Femme";
    patientId: string;
    patientCode?: string;
    phone?: string;
    email?: string;
    address?: string;
    lastVisit?: string;
    nextAppointment?: string;
    totalConsultations?: number;
    chronicConditions?: string[];
    currentMedications?: string[];
    allergies?: string[];
    recentDiagnosis?: string;
    status?: "active" | "inactive" | "chronic";
    identityVerified?: boolean;
    createdAt?: string;
};

/**
 * Patient in waiting room (for dashboard display)
 */
export type DashboardWaitingPatient = {
    id: string | number;
    name: string;
    age: number;
    gender: "M" | "F" | "Homme" | "Femme";
    urgencyLevel: number;
    reason: string;
    symptoms?: string;
    waitTime: number;
    arrivalTime?: string;
    specialty?: string;
    vitalSigns?: VitalSigns;
    patientCode?: string;
    position?: number;
};

/**
 * Patient for pre-consultation room
 */
export type PreConsultationPatient = {
    id: string;
    name: string;
    age: number;
    gender: "Homme" | "Femme";
    patientCode: string;
    specialty: string;
    arrivalTime: string;
    waitTime: number;
    urgencyLevel: number;
    reason: string;
    vitalsTaken: boolean;
    status: "waiting" | "ready" | "in-consultation" | "done";
    vitalSigns?: VitalSigns;
};

// ============ CONSULTATION TYPES ============

/**
 * Consultation display type for lists
 */
export type ConsultationDisplay = {
    id: string;
    consultationId?: string;
    patientName: string;
    patientAge?: number;
    patientCode?: string;
    doctorName?: string;
    specialty: string;
    scheduledAt?: string;
    startedAt?: string;
    completedAt?: string;
    status: "scheduled" | "in-progress" | "completed" | "cancelled";
    diagnosis?: string;
    notes?: string;
    urgencyLevel?: number;
    room?: string;
};

/**
 * Active consultation for doctor
 */
export type ActiveConsultation = {
    id: string;
    patientName: string;
    patientAge: number;
    patientGender: "M" | "F";
    reason: string;
    symptoms?: string[];
    vitalSigns?: VitalSigns;
    allergies?: string[];
    chronicConditions?: string[];
    currentMedications?: string[];
    history?: ConsultationHistoryItem[];
};

export type ConsultationHistoryItem = {
    date: string;
    diagnosis: string;
    doctor: string;
};

// ============ URGENCY/EMERGENCY TYPES ============

/**
 * Emergency patient display type (for dashboard display)
 */
export type DashboardEmergencyPatient = {
    id: string | number;
    name: string;
    age: number;
    gender: "M" | "F" | "Homme" | "Femme";
    urgencyLevel: number;
    reason: string;
    symptoms: string;
    arrivalTime: string;
    waitTime?: number;
    vitalSigns?: VitalSigns;
    status?: "waiting" | "in-progress" | "stabilized" | "transferred";
    assignedDoctor?: string;
};

/**
 * Pending urgency for validation (Primary Secretary)
 */
export type PendingUrgencyValidation = {
    id: string | number;
    name: string;
    age: number;
    center: string;
    requestedLevel: number;
    motif: string;
    symptoms: string;
    vital?: string;
    requestTime: string;
    requestedBy: string;
    trend?: "up" | "down" | "stable";
};

// ============ CENTER/HOSPITAL TYPES ============

/**
 * Center display type for network overview
 */
export type CenterDisplay = {
    id: string | number;
    name: string;
    code: string;
    type: string;
    status: "online" | "offline";
    bandwidth?: number;
    waitingPatients: number;
    consultants: number;
    alertLevel: "normal" | "warning" | "issue";
    trend?: "up" | "down" | "stable";
    lastUpdate: string;
    location?: { lat: number; lng: number };
};

// ============ CONSULTANT/DOCTOR TYPES ============

/**
 * Active consultant display
 */
export type ConsultantDisplay = {
    id: string | number;
    name: string;
    specialty: string;
    patients: number;
    status: "En consultation" | "Disponible" | "En pause" | "Absent";
    center: string;
    since?: string;
    photo?: string;
    trend?: "up" | "down" | "stable";
};

// ============ QUEUE TYPES ============

/**
 * Queue patient display
 */
export type QueuePatientDisplay = {
    id: string;
    ticketNumber: string;
    patientName: string;
    patientAge?: number;
    patientCode?: string;
    specialty: string;
    urgencyLevel: number;
    position: number;
    estimatedWaitTime: number;
    arrivalTime: string;
    status: "waiting" | "called" | "in-progress" | "completed" | "no-show";
};

// ============ APPOINTMENT TYPES ============

export type AppointmentStatus = "confirmed" | "pending" | "cancelled" | "completed" | "no-show";
export type AppointmentType = "new" | "followup" | "control" | "emergency";
export type UrgencyLevelNumber = 1 | 2 | 3 | 4 | 5;

export type AppointmentDisplay = {
    id: string;
    patientName: string;
    patientCode?: string;
    patientAge?: number;
    specialty: string;
    type: AppointmentType;
    status: AppointmentStatus;
    urgencyLevel?: UrgencyLevelNumber;
    scheduledAt: string;
    time: string;
    duration?: number;
    doctor?: string;
    room?: string;
    notes?: string;
};

// ============ SCHEDULE TYPES ============

export type ScheduleItem = {
    id: string;
    patientName: string;
    patientCode?: string;
    time: string;
    duration?: number;
    type: "consultation" | "followup" | "procedure" | "break";
    specialty?: string;
    status?: "scheduled" | "confirmed" | "in-progress" | "completed" | "cancelled";
    notes?: string;
};

// ============ NOTIFICATION TYPES ============

export type DashboardNotificationType =
    | "consultation"
    | "urgency"
    | "patient"
    | "system"
    | "reminder"
    | "message"
    | "validation"
    | "request"
    | "center"
    | "schedule"
    | "preparation"
    | "document"
    | "vitals"
    | "alert";

export type DashboardNotification = {
    id: string;
    type: DashboardNotificationType;
    title: string;
    message: string;
    time: string;
    isRead: boolean;
    priority?: "low" | "medium" | "high" | "urgent";
    actionUrl?: string;
    data?: Record<string, unknown>;
};

// ============ ACTIVITY TYPES ============

export type ActivityType =
    | "validation"
    | "room"
    | "assignment"
    | "login"
    | "logout"
    | "preparation"
    | "vitals"
    | "document"
    | "message"
    | "consultation";

export type ActivityItem = {
    id: string | number;
    type: ActivityType;
    action: string;
    user: string;
    details: string;
    time: string;
    center?: string;
};

// ============ MESSAGE TYPES ============

export type ContactDisplay = {
    id: string;
    name: string;
    code?: string;
    role: string;
    center?: string;
    function?: string;
    status: "online" | "offline" | "busy";
    avatar?: string;
};

export type MessageDisplay = {
    id: string | number;
    from: ContactDisplay;
    to?: ContactDisplay;
    content: string;
    timestamp: string;
    isRead: boolean;
    type?: "text" | "image" | "file" | "system";
    attachments?: { name: string; url: string }[];
};

// ============ DOCUMENT TYPES ============

export type DocumentType = "ordonnance" | "examen" | "transfert" | "signed" | "report" | "lab";
export type DocumentStatus = "pending" | "printed" | "sent" | "downloaded" | "signed";

export type DocumentDisplay = {
    id: string;
    type: DocumentType;
    name: string;
    patientName?: string;
    doctorName?: string;
    status: DocumentStatus;
    createdAt: string;
    url?: string;
};

// ============ PREPARATION TYPES ============

export type PreparationStatus = "pending" | "in-progress" | "ready" | "completed" | "cancelled";

export type PreparationDisplay = {
    id: string;
    patientName: string;
    patientCode?: string;
    specialty: string;
    preparationType: string;
    status: PreparationStatus;
    scheduledAt: string;
    room?: string;
    instructions?: string;
    nurseAssigned?: string;
};

// ============ STATISTICS TYPES ============

export type NetworkStatsData = {
    totalPatients: number;
    waitingPatients: number;
    inConsultationPatients: number;
    completedConsultations: number;
    avgWaitTime: number;
    urgentPatients: number;
    pendingValidation: number;
    centersOnline: number;
    centersOffline: number;
    totalCenters: number;
};

export type DashboardStats = {
    title: string;
    value: string | number;
    trend?: {
        value: string;
        isPositive: boolean;
    };
    color?: string;
};

// ============ REPORT TYPES ============

export type ReportDisplay = {
    id: string;
    reportId: string;
    title: string;
    type: "consultation" | "lab" | "imaging" | "referral" | "summary";
    patientName?: string;
    createdAt: string;
    status: "draft" | "pending" | "approved" | "signed";
    content?: string;
};

// ============ PRESCRIPTION TYPES ============

export type PrescriptionDisplay = {
    id: string;
    prescriptionId: string;
    patientName: string;
    patientCode?: string;
    doctorName?: string;
    createdAt: string;
    status: "active" | "dispensed" | "cancelled" | "expired";
    medications: {
        name: string;
        dosage: string;
        frequency: string;
        duration: string;
        quantity?: number;
        notes?: string;
    }[];
    instructions?: string;
};

// ============ ADMIN TYPES ============

export type AdminUser = {
    id: string;
    name: string;
    email: string;
    role: string;
    center: string;
    status: "active" | "inactive" | "suspended";
    lastLogin?: string;
    createdAt: string;
};

export type ModuleDisplay = {
    id: string;
    name: string;
    description?: string;
    version: string;
    status: "active" | "inactive" | "maintenance";
    lastUpdated: string;
    dependencies?: string[];
};

export type IncidentDisplay = {
    id: string;
    title: string;
    description: string;
    severity: "low" | "medium" | "high" | "critical";
    status: "open" | "investigating" | "resolved" | "closed";
    reportedBy: string;
    reportedAt: string;
    resolvedAt?: string;
    center?: string;
};

export type PermissionLevel = "none" | "read" | "write" | "admin";

export type RoleDisplay = {
    id: string;
    name: string;
    description?: string;
    permissions: Record<string, PermissionLevel>;
    userCount: number;
    isSystem: boolean;
};

export type HospitalDisplay = {
    id: string;
    name: string;
    code: string;
    type: "primary" | "secondary";
    address: string;
    phone?: string;
    email?: string;
    status: "active" | "inactive";
    patientCount?: number;
    staffCount?: number;
    lastSync?: string;
};

// ============ UTILITY TYPES ============

/**
 * Convert API Patient to display format
 */
export function toPatientDisplay(patient: Patient): PatientDisplay {
    const fullName = `${patient.firstName} ${patient.lastName}`;
    const birthDate = new Date(patient.dateOfBirth);
    const today = new Date();
    const age = Math.floor((today.getTime() - birthDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000));

    return {
        id: patient.id,
        name: fullName,
        age,
        patientId: patient.idNumber,
        phone: patient.phone ?? undefined,
        email: patient.email ?? undefined,
        address: patient.address ?? undefined,
        allergies: patient.allergies ?? undefined,
        currentMedications: patient.currentMedications ?? undefined,
        chronicConditions: patient.medicalHistory ?? undefined,
        status: patient.isActive ? "active" : "inactive",
        createdAt: patient.createdAt,
    };
}

/**
 * Get urgency level label
 */
export function getUrgencyLevelLabel(level: number): string {
    const labels: Record<number, string> = {
        1: "Non urgent",
        2: "Peu urgent",
        3: "Urgent",
        4: "Très urgent",
        5: "Critique",
    };
    return labels[level] || `Niveau ${level}`;
}

/**
 * Get urgency level color class
 */
export function getUrgencyLevelColor(level: number): string {
    const colors: Record<number, string> = {
        1: "bg-green-500",
        2: "bg-blue-500",
        3: "bg-yellow-500",
        4: "bg-orange-500",
        5: "bg-red-500",
    };
    return colors[level] || "bg-gray-500";
}

/**
 * Get status badge color class
 */
export function getStatusColor(status: string): string {
    const colors: Record<string, string> = {
        active: "bg-green-100 text-green-800",
        inactive: "bg-gray-100 text-gray-800",
        suspended: "bg-red-100 text-red-800",
        online: "bg-green-100 text-green-800",
        offline: "bg-red-100 text-red-800",
        pending: "bg-yellow-100 text-yellow-800",
        completed: "bg-green-100 text-green-800",
        cancelled: "bg-red-100 text-red-800",
        "in-progress": "bg-blue-100 text-blue-800",
        waiting: "bg-orange-100 text-orange-800",
        confirmed: "bg-green-100 text-green-800",
    };
    return colors[status.toLowerCase()] || "bg-gray-100 text-gray-800";
}

