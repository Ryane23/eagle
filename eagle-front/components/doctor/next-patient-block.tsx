"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
    User,
    Clock,
    AlertTriangle,
    ArrowRight,
    FileText,
    UserX
} from "lucide-react";
import type { NextPatientInfo } from "@/hooks/queries/use-doctor-dashboard-query";

const urgencyColors = {
    1: "bg-gray-200 text-gray-700",
    2: "bg-blue-200 text-blue-700",
    3: "bg-yellow-200 text-yellow-700",
    4: "bg-orange-200 text-orange-700",
    5: "bg-red-200 text-red-700"
} as const;

const urgencyLabels = {
    1: "Très faible",
    2: "Faible",
    3: "Modéré",
    4: "Urgent",
    5: "Très urgent"
} as const;

type NextPatientBlockProps = {
    patient?: NextPatientInfo;
    isLoading?: boolean;
    onStartConsultation?: (id: string) => void;
    onViewDetails?: (patientId: string) => void;
};

export function NextPatientBlock({
    patient,
    isLoading = false,
    onStartConsultation,
    onViewDetails
}: NextPatientBlockProps) {
    if (isLoading) {
        return (
            <Card className="border-2 border-primary/20 shadow-lg min-h-[200px] max-h-[240px] flex flex-col">
                <CardContent className="p-3 flex-1 flex flex-col min-h-0">
                    <div className="flex items-center justify-between mb-2">
                        <Skeleton className="h-5 w-32" />
                        <Skeleton className="h-5 w-20" />
                    </div>
                    <div className="grid md:grid-cols-2 gap-2 mb-2 flex-1 min-h-0">
                        <div className="min-w-0 space-y-2">
                            <Skeleton className="h-6 w-36" />
                            <Skeleton className="h-4 w-24" />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            <Skeleton className="h-12" />
                            <Skeleton className="h-12" />
                        </div>
                    </div>
                    <div className="flex gap-2 mt-auto">
                        <Skeleton className="h-8 flex-1" />
                        <Skeleton className="h-8 w-10" />
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (!patient) {
        return (
            <Card className="border-2 border-muted shadow-lg min-h-[200px] max-h-[240px] flex flex-col">
                <CardContent className="p-3 flex-1 flex flex-col items-center justify-center min-h-0">
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                        <UserX className="size-12 opacity-50" />
                        <p className="text-sm font-medium">Aucun patient en attente</p>
                        <p className="text-xs text-center">
                            Votre file d&apos;attente est vide pour le moment
                        </p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    const urgencyLevel = Math.min(Math.max(patient.urgencyLevel, 1), 5) as 1 | 2 | 3 | 4 | 5;

    return (
        <Card className="border-2 border-primary/20 shadow-lg min-h-[200px] max-h-[240px] flex flex-col">
            <CardContent className="p-3 flex-1 flex flex-col min-h-0">
                <div className="flex items-center justify-between mb-2">
                    <h3 className="text-base font-semibold flex items-center gap-1.5">
                        <User className="size-4 text-primary" />
                        Prochain patient
                    </h3>
                    <Badge
                        className={`${urgencyColors[urgencyLevel]} flex items-center gap-1 text-xs`}
                    >
                        <AlertTriangle className="size-3" />
                        {urgencyLabels[urgencyLevel]}
                    </Badge>
                </div>

                <div className="grid md:grid-cols-2 gap-2 mb-2 flex-1 min-h-0">
                    <div className="min-w-0">
                        <p className="text-lg font-bold text-primary mb-0.5 truncate">{patient.name}</p>
                        <p className="text-xs text-muted-foreground truncate">
                            {patient.age} ans • {patient.gender === "M" ? "Homme" : "Femme"}
                            {patient.type === "new" ? " • Nouveau patient" : " • Suivi"}
                        </p>
                        {patient.reason && (
                            <p className="text-xs text-muted-foreground mt-1 truncate">
                                {patient.reason}
                            </p>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                        <div className="flex items-center gap-1.5">
                            <Clock className="size-3.5 text-muted-foreground shrink-0" />
                            <div className="min-w-0">
                                <p className="text-[10px] text-muted-foreground">Heure RDV</p>
                                <p className="font-semibold text-xs">{patient.appointmentTime}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <Clock className="size-3.5 text-orange-500 shrink-0" />
                            <div className="min-w-0">
                                <p className="text-[10px] text-muted-foreground">En attente</p>
                                <p className="font-semibold text-xs text-orange-600">{patient.waitTime}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex gap-2 mt-auto">
                    <Button
                        className="flex-1 gap-1.5 h-8 text-xs"
                        size="sm"
                        onClick={() => onStartConsultation?.(patient.id)}
                    >
                        Démarrer la consultation
                        <ArrowRight className="size-3" />
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        className="h-8 px-2"
                        onClick={() => onViewDetails?.(patient.patientId)}
                    >
                        <FileText className="size-3.5" />
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
