"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ClipboardList, HeartPulse, Clock, AlertTriangle } from "lucide-react";
import {
    useHospitalQueueQuery,
    useUrgenciesQuery,
    useWorkflowSummaryQuery,
} from "@/hooks/queries";

type Stat = {
    title: string;
    value: string | number;
    icon: React.ElementType;
    trend?: {
        value: string;
        isPositive: boolean;
    };
    color: string;
};

export function NurseQuickStats({ hidden = false }: { hidden?: boolean }) {
    const summaryQuery = useWorkflowSummaryQuery();
    const queueQuery = useHospitalQueueQuery();
    const urgencyQuery = useUrgenciesQuery();
    const summary = summaryQuery.data;
    const queue = queueQuery.data || [];
    const urgencies = urgencyQuery.data || [];

    if (hidden) return null;

    const isLoading =
        summaryQuery.isLoading || queueQuery.isLoading || urgencyQuery.isLoading;
    const hasError = summaryQuery.error || queueQuery.error || urgencyQuery.error;
    const waiting = queue.filter((item) => item.status === "waiting").length;
    const inProgress = queue.filter((item) => item.status === "in_progress").length;
    const averageWait = queue.length
        ? Math.round(
            queue.reduce((sum, item) => sum + (item.estimatedWaitMinutes || 0), 0) /
                queue.length,
        )
        : 0;
    const activeUrgencies = urgencies.filter(
        (item) => !["completed", "rejected"].includes(item.status),
    );

    const stats: Stat[] = [
        {
            title: "Patients du jour",
            value: summary?.registrations ?? 0,
            icon: ClipboardList,
            trend: { 
                value: `${summary?.completed ?? 0} terminés`,
                isPositive: true 
            },
            color: "text-blue-500"
        },
        {
            title: "Salle d'attente",
            value: summary?.waiting ?? waiting,
            icon: ClipboardList,
            trend: { 
                value: `${inProgress} en cours`,
                isPositive: waiting < 5
            },
            color: "text-orange-500"
        },
        {
            title: "En préparation",
            value: summary?.inPreparation ?? summary?.waitingForVitals ?? 0,
            icon: HeartPulse,
            trend: { value: "En cours", isPositive: true },
            color: "text-yellow-500"
        },
        {
            title: "Prêts consultation",
            value: summary?.ready ?? summary?.vitalsCompleted ?? 0,
            icon: Clock,
            trend: { 
                value: `${averageWait} min moyen`,
                isPositive: averageWait < 20
            },
            color: "text-purple-500"
        },
        {
            title: "Urgences en cours",
            value: activeUrgencies.length,
            icon: AlertTriangle,
            trend: { 
                value: `${activeUrgencies.filter((item) => item.urgencyLevel === 5).length} critiques`,
                isPositive: !activeUrgencies.some((item) => item.urgencyLevel === 5)
            },
            color: "text-red-500"
        },
    ];

    if (isLoading) {
        return (
            <div className="flex gap-2 overflow-x-auto">
                {[...Array(5)].map((_, i) => (
                    <Card key={i} className="rounded-xl shrink-0 min-w-[180px]">
                        <CardContent className="p-3">
                            <div className="flex items-center gap-3">
                                <Skeleton className="size-10 rounded-lg" />
                                <div className="flex-1 space-y-2">
                                    <Skeleton className="h-5 w-12" />
                                    <Skeleton className="h-3 w-20" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        );
    }

    if (hasError) {
        return (
            <Card className="border-destructive/40">
                <CardContent className="p-3 text-sm text-destructive">
                    Impossible de charger les statistiques du centre.
                </CardContent>
            </Card>
        );
    }
    
    return (
        <div className="flex gap-2 overflow-x-auto">
            {stats.map((stat) => {
                const Icon = stat.icon;
                return (
                    <Card key={stat.title} className="hover:shadow-md transition-shadow rounded-xl shrink-0 min-w-[180px]">
                        <CardContent className="p-3">
                            <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-lg bg-muted/50 ${stat.color} shrink-0`}>
                                    <Icon className="size-4" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-lg font-bold leading-tight">{stat.value}</p>
                                    <p className="text-[11px] text-muted-foreground leading-tight truncate">{stat.title}</p>
                                    {stat.trend && (
                                        <div className={`flex items-center gap-0.5 text-[10px] mt-0.5 ${stat.trend.isPositive ? 'text-green-600' : 'text-orange-600'}`}>
                                            <span className="font-medium">{stat.trend.value}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                );
            })}
        </div>
    );
}
