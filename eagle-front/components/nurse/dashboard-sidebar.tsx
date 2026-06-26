"use client";

import { useMemo, useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertTriangle, Clock, Stethoscope, FileText, AlertCircle } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    useUrgenciesQuery,
    useNurseTeleconsultationConsultationsQuery,
    usePrescriptionsQuery,
} from "@/hooks/queries";
import type { Urgency, Consultation, Prescription } from "@/types/api";

// Types for display
type UrgentPatient = {
    id: string;
    name: string;
    urgencyLevel: number;
    waitTime: number;
    reason: string;
};

type Appointment = {
    id: string;
    patientName: string;
    time: string;
    doctor: string;
    specialty: string;
    urgencyLevel: number;
    status: "arrive" | "attendu" | "termine";
};

type PostConsultationAction = {
    id: string;
    type: "ordonnance" | "examen" | "transfert";
    patientName: string;
    doctor: string;
};

// Map urgency to display format
function mapUrgencyToPatient(urgency: Urgency, currentTime: number): UrgentPatient {
    const waitTime = Math.floor((currentTime - new Date(urgency.createdAt).getTime()) / 60000);
    return {
        id: urgency.id,
        name: urgency.patient
            ? `${urgency.patient.firstName} ${urgency.patient.lastName}`
            : "Patient inconnu",
        urgencyLevel: urgency.urgencyLevel,
        waitTime,
        reason: urgency.reason,
    };
}

// Map consultation to appointment format
function mapConsultationToAppointment(consultation: Consultation): Appointment {
    const scheduledDate = consultation.scheduledAt
        ? new Date(consultation.scheduledAt)
        : new Date(consultation.createdAt);

    let status: Appointment["status"] = "attendu";
    if (consultation.status === "in_progress") status = "arrive";
    else if (consultation.status === "completed") status = "termine";

    return {
        id: consultation.id,
        patientName: consultation.patient
            ? `${consultation.patient.firstName} ${consultation.patient.lastName}`
            : "Patient inconnu",
        time: scheduledDate.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }),
        doctor: consultation.doctor?.name || "Non assigné",
        specialty: "Général", // Would need specialty info from API
        urgencyLevel: consultation.urgencyLevel ? parseInt(consultation.urgencyLevel) : 2,
        status,
    };
}

// Map prescription to post-consultation action
function mapPrescriptionToAction(prescription: Prescription): PostConsultationAction {
    return {
        id: prescription.id,
        type: "ordonnance",
        patientName: prescription.patient
            ? `${prescription.patient.firstName} ${prescription.patient.lastName}`
            : "Patient inconnu",
        doctor: prescription.doctor?.name || "Non assigné",
    };
}

export function DashboardSidebar() {
    const [currentTime, setCurrentTime] = useState(new Date().getTime());

    // Update current time every minute
    useEffect(() => {
        const interval = setInterval(() => setCurrentTime(Date.now()), 60000);
        return () => clearInterval(interval);
    }, []);

    // Fetch data using TanStack Query
    const { data: urgencies = [], isLoading: urgenciesLoading } = useUrgenciesQuery();
    const { data: schedule = [], isLoading: scheduleLoading } = useNurseTeleconsultationConsultationsQuery();
    const { data: prescriptions = [], isLoading: prescriptionsLoading } = usePrescriptionsQuery("active");

    // Filter urgent patients (level 4 or 5, not completed)
    const urgentPatients = useMemo<UrgentPatient[]>(() => {
        return urgencies
            .filter((u) => u.urgencyLevel >= 4 && u.status !== "completed" && u.status !== "rejected")
            .map((u) => mapUrgencyToPatient(u, currentTime))
            .sort((a, b) => b.urgencyLevel - a.urgencyLevel || a.waitTime - b.waitTime);
    }, [urgencies, currentTime]);

    // Get today's appointments
    const todayAppointments = useMemo<Appointment[]>(() => {
        const today = new Date().toDateString();
        return schedule
            .filter((c) => {
                const consultDate = c.scheduledAt
                    ? new Date(c.scheduledAt).toDateString()
                    : new Date(c.createdAt).toDateString();
                return consultDate === today;
            })
            .map(mapConsultationToAppointment)
            .sort((a, b) => a.time.localeCompare(b.time));
    }, [schedule]);

    // Get pending post-consultation actions
    const postActions = useMemo<PostConsultationAction[]>(() => {
        return prescriptions
            .filter((p) => p.status === "active")
            .slice(0, 5) // Limit to 5 most recent
            .map(mapPrescriptionToAction);
    }, [prescriptions]);

    return (
        <div className="space-y-2">
            {/* Urgent Patients */}
            <Card className="min-h-[200px] max-h-[240px] flex flex-col">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-sm">
                        <AlertTriangle className="size-4 text-red-500" />
                        Patients Urgents
                        <Badge variant="destructive" className="ml-auto text-xs">
                            {urgentPatients.length}
                        </Badge>
                    </CardTitle>
                </CardHeader>
                <CardContent className="flex-1 min-h-0">
                    <ScrollArea className="h-full">
                        {urgenciesLoading ? (
                            <div className="space-y-2">
                                {[1, 2].map((i) => (
                                    <Skeleton key={i} className="h-20 w-full" />
                                ))}
                            </div>
                        ) : urgentPatients.length === 0 ? (
                            <div className="text-center py-4 text-muted-foreground text-sm">
                                <AlertCircle className="size-8 mx-auto mb-2 opacity-50" />
                                Aucun patient urgent
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {urgentPatients.map((patient) => (
                                    <div
                                        key={patient.id}
                                        className={`p-2 rounded-lg border ${patient.urgencyLevel === 5
                                            ? "bg-red-50 dark:bg-red-950/20 border-red-200"
                                            : "bg-orange-50 dark:bg-orange-950/20 border-orange-200"
                                            }`}
                                    >
                                        <div className="flex items-start justify-between mb-1">
                                            <p className="font-medium text-sm truncate">{patient.name}</p>
                                            <Badge
                                                variant="destructive"
                                                className={`text-xs shrink-0 ml-1 ${patient.urgencyLevel === 5 ? "bg-red-600" : "bg-orange-500"
                                                    }`}
                                            >
                                                Niveau {patient.urgencyLevel}
                                            </Badge>
                                        </div>
                                        <p className="text-xs text-muted-foreground mb-1.5 truncate">
                                            {patient.reason}
                                        </p>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                                <Clock className="size-3" />
                                                <span>{patient.waitTime} min</span>
                                            </div>
                                            <Button size="sm" variant="outline" className="h-7 text-xs px-2">
                                                Préparer
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </ScrollArea>
                </CardContent>
            </Card>

            {/* Daily Planning */}
            <Card className="min-h-[200px] max-h-[240px] flex flex-col">
                <CardHeader>
                    <CardTitle className="text-sm">Planning du Jour</CardTitle>
                </CardHeader>
                <CardContent className="flex-1 min-h-0">
                    <ScrollArea className="h-full">
                        {scheduleLoading ? (
                            <div className="space-y-2">
                                {[1, 2].map((i) => (
                                    <Skeleton key={i} className="h-16 w-full" />
                                ))}
                            </div>
                        ) : todayAppointments.length === 0 ? (
                            <div className="text-center py-4 text-muted-foreground text-sm">
                                Aucun rendez-vous aujourd&apos;hui
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {todayAppointments.map((apt) => (
                                    <div
                                        key={apt.id}
                                        className="flex items-start gap-2 p-2 rounded-lg hover:bg-muted/50"
                                    >
                                        <div className="text-center min-w-[45px] shrink-0">
                                            <p className="font-semibold text-xs">{apt.time}</p>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium text-xs truncate">{apt.patientName}</p>
                                            <div className="flex items-center gap-1.5 mt-0.5">
                                                <Stethoscope className="size-3 text-muted-foreground shrink-0" />
                                                <span className="text-xs text-muted-foreground truncate">
                                                    {apt.doctor} - {apt.specialty}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                                                <Badge variant="outline" className="text-xs">
                                                    {apt.status === "arrive" && "Arrivé"}
                                                    {apt.status === "attendu" && "Attendu"}
                                                    {apt.status === "termine" && "Terminé"}
                                                </Badge>
                                                <Badge variant="secondary" className="text-xs">
                                                    Urgence {apt.urgencyLevel}
                                                </Badge>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </ScrollArea>
                </CardContent>
            </Card>

            {/* Post-Consultation Actions */}
            <Card className="min-h-[200px] max-h-[240px] flex flex-col">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-sm">
                        <FileText className="size-4" />
                        Actions Post-Consultation
                        <Badge variant="secondary" className="ml-auto text-xs">
                            {postActions.length}
                        </Badge>
                    </CardTitle>
                </CardHeader>
                <CardContent className="flex-1 min-h-0">
                    <ScrollArea className="h-full">
                        {prescriptionsLoading ? (
                            <div className="space-y-2">
                                {[1, 2].map((i) => (
                                    <Skeleton key={i} className="h-16 w-full" />
                                ))}
                            </div>
                        ) : postActions.length === 0 ? (
                            <div className="text-center py-4 text-muted-foreground text-sm">
                                Aucune action en attente
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {postActions.map((action) => (
                                    <div
                                        key={action.id}
                                        className="flex items-center justify-between p-2 border rounded-lg gap-2"
                                    >
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium text-xs truncate">{action.patientName}</p>
                                            <p className="text-xs text-muted-foreground truncate">{action.doctor}</p>
                                            <Badge variant="outline" className="text-xs mt-0.5">
                                                {action.type === "ordonnance" && "Ordonnance"}
                                                {action.type === "examen" && "Examen"}
                                                {action.type === "transfert" && "Transfert"}
                                            </Badge>
                                        </div>
                                        <Button size="sm" variant="outline" className="h-7 text-xs px-2 shrink-0">
                                            Traiter
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </ScrollArea>
                </CardContent>
            </Card>
        </div>
    );
}
