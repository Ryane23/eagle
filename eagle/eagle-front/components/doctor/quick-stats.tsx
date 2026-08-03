"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, Clock, CheckCircle2, Timer, TrendingUp, TrendingDown } from "lucide-react";

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

export type QuickStatsProps = {
    hidden?: boolean;
    patientsToday?: number;
    waitingCount?: number;
    completedCount?: number;
    averageWaitTime?: number;
    isLoading?: boolean;
};

function getStats(props: QuickStatsProps): Stat[] {
    const {
        patientsToday = 0,
        waitingCount = 0,
        completedCount = 0,
        averageWaitTime = 0,
    } = props;

    const completedPercent = patientsToday > 0
        ? Math.round((completedCount / patientsToday) * 100)
        : 0;

    return [
        {
            title: "Patients aujourd'hui",
            value: patientsToday,
            icon: Users,
            color: "text-blue-500"
        },
        {
            title: "En attente",
            value: waitingCount,
            icon: Clock,
            color: "text-orange-500"
        },
        {
            title: "Consultations terminées",
            value: completedCount,
            icon: CheckCircle2,
            trend: patientsToday > 0
                ? { value: `${completedPercent}% du jour`, isPositive: true }
                : undefined,
            color: "text-green-500"
        },
        {
            title: "Temps d'attente moyen",
            value: `${averageWaitTime} min`,
            icon: Timer,
            color: "text-purple-500"
        },
    ];
}

export function QuickStats(props: QuickStatsProps) {
    const { hidden = false, isLoading = false } = props;

    if (hidden) return null;

    const statItems = getStats(props);

    return (
        <div className="flex gap-2 overflow-x-auto">
            {statItems.map((stat) => {
                const Icon = stat.icon;
                return (
                    <Card key={stat.title} className="hover:shadow-md transition-shadow rounded-xl shrink-0 min-w-[180px]">
                        <CardContent className="p-3">
                            {isLoading ? (
                                <div className="flex items-center gap-3">
                                    <Skeleton className="size-8 rounded-lg" />
                                    <div className="flex-1 space-y-1">
                                        <Skeleton className="h-5 w-12" />
                                        <Skeleton className="h-3 w-20" />
                                    </div>
                                </div>
                            ) : (
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-lg bg-muted/50 ${stat.color} shrink-0`}>
                                        <Icon className="size-4" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-lg font-bold leading-tight">{stat.value}</p>
                                        <p className="text-[11px] text-muted-foreground leading-tight truncate">{stat.title}</p>
                                        {stat.trend && (
                                            <div className={`flex items-center gap-0.5 text-[10px] mt-0.5 ${stat.trend.isPositive ? 'text-green-600' : 'text-orange-600'}`}>
                                                {stat.trend.isPositive ? (
                                                    <TrendingUp className="size-2.5" />
                                                ) : (
                                                    <TrendingDown className="size-2.5" />
                                                )}
                                                <span className="font-medium">{stat.trend.value}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                );
            })}
        </div>
    );
}
