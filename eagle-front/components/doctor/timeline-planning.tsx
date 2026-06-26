"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Clock,
    AlertTriangle,
    CheckCircle2,
    Circle,
    ArrowRight,
    Play,
    Video,
    Calendar
} from "lucide-react";
import type { ScheduleItem } from "@/hooks/queries/use-doctor-dashboard-query";

type TimelinePlanningProps = {
    scheduleItems?: ScheduleItem[];
    isLoading?: boolean;
    onStartConsultation?: (item: ScheduleItem) => void;
};

const statusConfig = {
    completed: {
        icon: CheckCircle2,
        color: "text-green-600",
        bgColor: "bg-green-50 border-green-200",
        label: "Terminé",
        dotColor: "bg-green-500"
    },
    in_progress: {
        icon: Circle,
        color: "text-blue-600",
        bgColor: "bg-blue-50 border-blue-300",
        label: "En cours",
        dotColor: "bg-blue-500 animate-pulse"
    },
    cancelled: {
        icon: Clock,
        color: "text-gray-600",
        bgColor: "bg-gray-50 border-gray-200",
        label: "Annulé",
        dotColor: "bg-gray-500"
    },
    scheduled: {
        icon: Circle,
        color: "text-gray-400",
        bgColor: "bg-gray-50 border-gray-200",
        label: "Planifié",
        dotColor: "bg-gray-400"
    }
} as const;

const getUrgencyColor = (level?: number) => {
    if (!level) return "border-l-gray-200";
    if (level >= 5) return "border-l-red-500";
    if (level >= 4) return "border-l-orange-500";
    if (level >= 3) return "border-l-yellow-400";
    return "border-l-blue-400";
};

export function TimelinePlanning({
    scheduleItems = [],
    isLoading = false,
    onStartConsultation
}: TimelinePlanningProps) {
    const router = useRouter();

    const handleStartConsultation = (item: ScheduleItem) => {
        if (onStartConsultation) {
            onStartConsultation(item);
        } else {
            // Store consultation data in session for the consultation page
            sessionStorage.setItem('consultationPatient', JSON.stringify({
                id: item.id,
                name: item.patientName,
                patientId: item.patientId,
                appointmentTime: item.time,
                urgencyLevel: item.urgencyLevel || 2,
                type: item.type,
                reason: item.type === "new" ? "Première consultation" : "Consultation de suivi"
            }));
            router.push('/dashboard/doctor/consultation');
        }
    };

    return (
        <Card>
            <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-sm">
                        <Clock className="size-4" />
                        Planning du jour
                    </CardTitle>
                    <Button variant="ghost" size="sm" className="h-7 text-xs" asChild>
                        <a href="/dashboard/doctor/schedule">
                            Voir tout
                            <ArrowRight className="size-3 ml-1" />
                        </a>
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="p-0">
                <ScrollArea className="h-[280px]">
                    <div className="px-4 pb-4">
                        {isLoading ? (
                            <div className="space-y-2">
                                {[1, 2, 3, 4].map((i) => (
                                    <Skeleton key={i} className="h-14 w-full" />
                                ))}
                            </div>
                        ) : scheduleItems.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-8 text-center">
                                <Calendar className="size-10 text-muted-foreground/50 mb-2" />
                                <p className="text-sm text-muted-foreground">
                                    Aucune consultation planifiée aujourd&apos;hui
                                </p>
                            </div>
                        ) : (
                            <div className="relative">
                                <div className="absolute left-[7px] top-2 bottom-2 w-0.5 bg-border" />

                                <div className="space-y-1">
                                    {scheduleItems.map((appointment) => {
                                        const config = statusConfig[appointment.status];

                                        return (
                                            <div
                                                key={appointment.id}
                                                className={`relative flex items-center gap-3 p-2 rounded-lg border-l-4 ${getUrgencyColor(appointment.urgencyLevel)} ${config.bgColor} ml-4`}
                                            >
                                                <div className="absolute -left-[22px] z-10">
                                                    <div className={`size-3 rounded-full ${config.dotColor} border-2 border-background`} />
                                                </div>

                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center justify-between gap-2">
                                                        <div className="flex items-center gap-2 min-w-0">
                                                            <span className={`text-xs font-bold ${config.color}`}>
                                                                {appointment.time}
                                                            </span>
                                                            <span className="text-sm font-medium truncate">
                                                                {appointment.patientName}
                                                            </span>
                                                            {appointment.urgencyLevel && appointment.urgencyLevel >= 4 && (
                                                                <AlertTriangle className="size-3 text-orange-500 shrink-0" />
                                                            )}
                                                        </div>
                                                        <div className="flex items-center gap-1 shrink-0">
                                                            <Badge variant="outline" className="text-[9px] h-4 px-1">
                                                                {appointment.type === "new" ? "Nouveau" : "Suivi"}
                                                            </Badge>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center justify-between mt-1">
                                                        <Badge variant="secondary" className={`text-[9px] h-4 px-1 ${config.color}`}>
                                                            {config.label}
                                                        </Badge>
                                                        {(appointment.status === "scheduled" || appointment.status === "in_progress") && (
                                                            <Button
                                                                size="sm"
                                                                className="h-6 text-[10px] px-2"
                                                                onClick={() => handleStartConsultation(appointment)}
                                                            >
                                                                {appointment.status === "in_progress" ? (
                                                                    <>
                                                                        <Video className="size-3 mr-1" />
                                                                        Rejoindre
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <Play className="size-3 mr-1" />
                                                                        Démarrer
                                                                    </>
                                                                )}
                                                            </Button>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                </ScrollArea>
            </CardContent>
        </Card>
    );
}
