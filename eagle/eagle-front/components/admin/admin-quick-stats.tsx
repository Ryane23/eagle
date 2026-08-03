"use client";

import { useEffect, type ElementType } from "react";
import { useAdminStatsVisibility } from "@/components/admin/admin-stats-visibility";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export type AdminQuickStat = {
    label: string;
    value: string | number;
    icon: ElementType;
    detail?: string;
    color: string;
};

type AdminQuickStatsProps = {
    stats: AdminQuickStat[];
    isLoading?: boolean;
};

export function AdminQuickStats({
    stats,
    isLoading = false,
}: AdminQuickStatsProps) {
    const visibility = useAdminStatsVisibility();
    const registerQuickStats = visibility?.registerQuickStats;

    useEffect(() => {
        if (!registerQuickStats) return;
        return registerQuickStats();
    }, [registerQuickStats]);

    if (visibility?.statsHidden) return null;

    return (
        <div
            data-admin-quick-stats
            className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
            {stats.map((stat) => {
                const Icon = stat.icon;
                return (
                    <Card
                        key={stat.label}
                        className="min-w-[180px] shrink-0 rounded-xl transition-shadow hover:shadow-md"
                    >
                        <CardContent className="p-3">
                            {isLoading ? (
                                <div className="flex items-center gap-3">
                                    <Skeleton className="size-8 rounded-lg" />
                                    <div className="space-y-1">
                                        <Skeleton className="h-5 w-12" />
                                        <Skeleton className="h-3 w-24" />
                                    </div>
                                </div>
                            ) : (
                                <div className="flex items-center gap-3">
                                    <div
                                        className={`shrink-0 rounded-lg bg-muted/50 p-2 ${stat.color}`}
                                    >
                                        <Icon className="size-4" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="text-lg font-bold leading-tight">
                                            {stat.value}
                                        </p>
                                        <p className="truncate text-[11px] leading-tight text-muted-foreground">
                                            {stat.label}
                                        </p>
                                        {stat.detail && (
                                            <p className="mt-0.5 truncate text-[10px] text-muted-foreground">
                                                {stat.detail}
                                            </p>
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
