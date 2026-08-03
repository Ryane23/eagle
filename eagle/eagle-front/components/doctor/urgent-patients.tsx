"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import {
    AlertTriangle,
    Clock,
    ArrowRight,
    CheckCircle
} from "lucide-react";
import type { UrgentPatientInfo } from "@/hooks/queries/use-doctor-dashboard-query";

type UrgentPatientsProps = {
    patients?: UrgentPatientInfo[];
    isLoading?: boolean;
    onStartConsultation?: (id: string) => void;
};

const urgencyColors = {
    4: {
        bg: "bg-orange-100 border-orange-300",
        text: "text-orange-700",
        badge: "bg-orange-500"
    },
    5: {
        bg: "bg-red-100 border-red-300",
        text: "text-red-700",
        badge: "bg-red-500"
    }
} as const;

export function UrgentPatients({
    patients = [],
    isLoading = false,
    onStartConsultation
}: UrgentPatientsProps) {
    const urgentCount = patients.length;

    return (
        <Card className="border-red-200 flex flex-col overflow-hidden min-h-0 max-h-[280px]">
            <CardHeader className="pb-2 shrink-0">
                <CardTitle className="text-sm flex items-center gap-1.5 text-red-700">
                    <AlertTriangle className="size-4" />
                    Patients Urgents
                    <Badge className="ml-auto bg-red-500 text-xs">
                        {isLoading ? "-" : urgentCount}
                    </Badge>
                </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 min-h-0 overflow-hidden pt-0 px-3 pb-3">
                {isLoading ? (
                    <div className="space-y-2">
                        <Skeleton className="h-16 w-full" />
                        <Skeleton className="h-16 w-full" />
                    </div>
                ) : urgentCount === 0 ? (
                    <div className="flex flex-col items-center justify-center py-4 text-center">
                        <CheckCircle className="size-8 text-green-500 mb-2" />
                        <p className="text-xs text-muted-foreground">
                            Aucun patient urgent
                        </p>
                    </div>
                ) : (
                    <ScrollArea className="h-[200px] w-full">
                        <div className="space-y-2 pr-2">
                            {patients.map((patient) => {
                                const level = Math.min(Math.max(patient.urgencyLevel, 4), 5) as 4 | 5;
                                const colors = urgencyColors[level];
                                return (
                                    <div
                                        key={patient.id}
                                        className={`p-2 rounded-lg border-2 ${colors.bg}`}
                                    >
                                        <div className="flex items-start justify-between mb-1">
                                            <div className="flex-1 min-w-0">
                                                <p className="font-semibold text-xs mb-0.5 truncate">
                                                    {patient.name}
                                                </p>
                                                {patient.reason && (
                                                    <p className="text-[10px] text-muted-foreground truncate">
                                                        {patient.reason}
                                                    </p>
                                                )}
                                            </div>
                                            <Badge
                                                className={`${colors.badge} text-white text-xs shrink-0 ml-1`}
                                            >
                                                Urgence {patient.urgencyLevel}
                                            </Badge>
                                        </div>

                                        <div className="flex items-center justify-between gap-2">
                                            <div className={`flex items-center gap-1 text-[10px] font-medium ${colors.text} truncate`}>
                                                <Clock className="size-3 shrink-0" />
                                                Attend depuis {patient.waitTime}
                                            </div>
                                            <Button
                                                size="sm"
                                                variant="default"
                                                className="h-6 text-[10px] px-2 shrink-0"
                                                onClick={() => onStartConsultation?.(patient.id)}
                                            >
                                                Consulter
                                                <ArrowRight className="size-2.5 ml-0.5" />
                                            </Button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </ScrollArea>
                )}
            </CardContent>
        </Card>
    );
}
