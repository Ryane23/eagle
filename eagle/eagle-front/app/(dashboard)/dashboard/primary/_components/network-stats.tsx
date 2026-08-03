"use client";

import { memo } from "react";
import { StatsCard } from "@/components/shared";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { Users, Activity, Clock, ShieldAlert, Building } from "lucide-react";
import type { NetworkStatsData } from "@/types/dashboard";

type NetworkStatsProps = {
    stats: NetworkStatsData;
    isLoading?: boolean;
};

function NetworkStatsComponent({ stats, isLoading }: NetworkStatsProps) {
    if (isLoading) {
        return (
            <div className="flex gap-2 overflow-x-auto">
                {[...Array(5)].map((_, i) => (
                    <Card key={i} className="shrink-0 min-w-[140px]">
                        <CardContent className="p-3">
                            <div className="flex items-center gap-2">
                                <Skeleton className="size-8 rounded-lg" />
                                <div className="space-y-1">
                                    <Skeleton className="h-5 w-10" />
                                    <Skeleton className="h-3 w-16" />
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
            <StatsCard
                title="Patients en attente"
                value={stats.waitingPatients}
                icon={Users}
                color="text-blue-500"
            />
            <StatsCard
                title="En consultation"
                value={stats.inConsultationPatients}
                icon={Activity}
                color="text-purple-500"
            />
            <StatsCard
                title="min d'attente moyen"
                value={stats.avgWaitTime}
                icon={Clock}
                color="text-yellow-500"
            />
            <StatsCard
                title="Urgences à valider"
                value={stats.pendingValidation}
                icon={ShieldAlert}
                color="text-red-500"
            />
            <StatsCard
                title="Centres en ligne"
                value={`${stats.centersOnline}/${stats.totalCenters}`}
                icon={Building}
                color="text-green-500"
            />
        </div>
    );
}

export const NetworkStats = memo(NetworkStatsComponent);
