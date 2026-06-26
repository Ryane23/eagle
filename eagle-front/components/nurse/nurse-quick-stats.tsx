"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ClipboardList, HeartPulse, Clock, AlertTriangle } from "lucide-react";
import { useQueueStats, useConsultationStats, useUrgencyStats } from "@/hooks/queries";

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
    const queueStats = useQueueStats();
    const consultationStats = useConsultationStats();
    const urgencyStats = useUrgencyStats();

    if (hidden) return null;

    const isLoading = !queueStats || !consultationStats;

    const stats: Stat[] = [
        {
            title: "Patients du jour",
            value: consultationStats.todayTotal,
            icon: ClipboardList,
            trend: { 
                value: `${consultationStats.todayCompleted} terminés`, 
                isPositive: true 
            },
            color: "text-blue-500"
        },
        {
            title: "En attente",
            value: queueStats.totalWaiting,
            icon: ClipboardList,
            trend: { 
                value: `${queueStats.inProgress} en cours`, 
                isPositive: queueStats.totalWaiting < 5 
            },
            color: "text-orange-500"
        },
        {
            title: "En préparation",
            value: queueStats.inProgress,
            icon: HeartPulse,
            trend: { value: "En cours", isPositive: true },
            color: "text-yellow-500"
        },
        {
            title: "Temps d'attente moyen",
            value: `${queueStats.averageWaitTime} min`,
            icon: Clock,
            trend: { 
                value: queueStats.averageWaitTime < 20 ? "Bon" : "À surveiller", 
                isPositive: queueStats.averageWaitTime < 20 
            },
            color: "text-purple-500"
        },
        {
            title: "Urgences en cours",
            value: urgencyStats.inProgress,
            icon: AlertTriangle,
            trend: { 
                value: `${urgencyStats.critical} critiques`, 
                isPositive: urgencyStats.critical === 0 
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
