import apiClient, { getErrorMessage } from "@/lib/api-client";
import type {
    ConsultationBox,
    WorkflowContext,
    WorkflowSummary,
    Appointment,
    Visit,
    User,
} from "@/types/api";

async function unwrap<T>(request: Promise<{ data: T }>): Promise<T> {
    try {
        return (await request).data;
    } catch (error) {
        throw new Error(getErrorMessage(error));
    }
}

export function getWorkflowContext() {
    return unwrap<WorkflowContext>(apiClient.get("/auth/me/context"));
}

export function getWorkflowSummary() {
    return unwrap<WorkflowSummary>(
        apiClient.get("/visits/my-hospital/summary"),
    );
}

export function getHospitalVisits() {
    return unwrap<Visit[]>(apiClient.get("/visits/my-hospital"));
}

export function createVisit(data: {
    patientId: string;
    type: Visit["type"];
    complaint?: string;
    departmentId?: string;
    specialtyId?: string;
    appointmentId?: string;
    referralId?: string;
}) {
    return unwrap<Visit>(apiClient.post("/visits", data));
}

export function markVisitVitalsComplete(visitId: string) {
    return unwrap<Visit>(
        apiClient.patch(`/visits/${visitId}/vitals-complete`),
    );
}

export function selectVisitSpecialty(
    visitId: string,
    data: { specialtyId: string; boxId?: string },
) {
    return unwrap<Visit>(
        apiClient.patch(`/visits/${visitId}/specialty`, data),
    );
}

export function getConsultationBoxes() {
    return unwrap<ConsultationBox[]>(
        apiClient.get("/consultation-boxes/my-hospital"),
    );
}

export function getHospitalConsultationBoxes(hospitalId: string) {
    return unwrap<ConsultationBox[]>(
        apiClient.get("/consultation-boxes", { params: { hospitalId } }),
    );
}

export function createConsultationBox(data: {
    hospitalId: string;
    code: string;
    name: string;
    defaultSpecialtyId?: string;
}) {
    return unwrap<ConsultationBox>(
        apiClient.post("/consultation-boxes", data),
    );
}

export function updateConsultationBoxStatus(
    boxId: string,
    status: "AVAILABLE" | "MAINTENANCE" | "OFFLINE",
) {
    return unwrap<ConsultationBox>(
        apiClient.patch(`/consultation-boxes/${boxId}/status`, { status }),
    );
}

export function assignBoxSpecialty(
    boxId: string,
    data: { specialtyId: string; startsAt?: string; endsAt?: string },
) {
    return unwrap<ConsultationBox>(
        apiClient.patch(`/consultation-boxes/${boxId}/specialty`, data),
    );
}

export function reserveConsultationBox(
    boxId: string,
    data: { visitId: string; consultationId?: string },
) {
    return unwrap<ConsultationBox>(
        apiClient.patch(`/consultation-boxes/${boxId}/reserve`, data),
    );
}

export function releaseConsultationBox(boxId: string) {
    return unwrap<ConsultationBox>(
        apiClient.patch(`/consultation-boxes/${boxId}/release`),
    );
}

export function getAppointments() {
    return unwrap<Appointment[]>(apiClient.get("/appointments/my-hospital"));
}

export function createAppointment(data: {
    patientId: string;
    specialtyId: string;
    selectedDoctorId?: string;
    scheduledAt: string;
    reason?: string;
}) {
    return unwrap<Appointment>(apiClient.post("/appointments", data));
}

export function updateAppointmentStatus(
    id: string,
    action: "check-in" | "missed" | "cancel" | "complete",
) {
    return unwrap<Appointment>(apiClient.patch(`/appointments/${id}/${action}`));
}

export function getCareTeam() {
    return unwrap<User[]>(apiClient.get("/users/care-team"));
}
