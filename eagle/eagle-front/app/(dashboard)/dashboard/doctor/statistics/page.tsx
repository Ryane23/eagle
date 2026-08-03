"use client";

import { useMemo, useCallback } from "react";
import { DashboardHeader } from "@/components/layout/dashboard-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
    BarChart3,
    TrendingUp,
    TrendingDown,
    Users,
    Clock,
    Calendar,
    Activity,
    RefreshCw,
    AlertTriangle,
    CheckCircle,
} from "lucide-react";
import {
    useConsultationStats,
    useUrgencyStats,
    useQueueStats,
    useConsultationsQuery,
    consultationKeys,
    urgencyKeys,
    queueKeys,
} from "@/hooks/queries";
import type { Consultation } from "@/types/api";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export default function StatisticsPage() {
    const queryClient = useQueryClient();

    // TanStack Query hooks
    const { data: consultations = [], isLoading: consultationsLoading, error: statsError } = useConsultationsQuery();
    const consultationStats = useConsultationStats();
    const queueStats = useQueueStats();
    const urgencyStats = useUrgencyStats();

    const isLoading = consultationsLoading;

    // Calculate additional metrics
    const metrics = useMemo(() => {
        const today = new Date();
        const thisWeekStart = new Date(today);
        thisWeekStart.setDate(today.getDate() - today.getDay());

        const thisWeekConsultations = consultations.filter((c: Consultation) => {
            const date = new Date(c.scheduledAt);
            return date >= thisWeekStart;
        });

        const completedThisWeek = thisWeekConsultations.filter(
            (c: Consultation) => c.status === "completed"
        ).length;

        const averagePerDay = consultations.length > 0
            ? Math.round(thisWeekConsultations.length / 7)
            : 0;

        return {
            totalConsultations: consultationStats.total,
            todayCount: consultationStats.todayTotal,
            completedToday: consultationStats.todayCompleted,
            completedThisWeek,
            averagePerDay,
            averageWaitTime: queueStats.averageWaitTime,
            currentWaiting: queueStats.totalWaiting,
            urgenciesHandled: urgencyStats.completed,
            pendingUrgencies: urgencyStats.pending,
        };
    }, [consultationStats, queueStats, consultations, urgencyStats]);

    const handleRefresh = useCallback(() => {
        queryClient.invalidateQueries({ queryKey: consultationKeys.all });
        queryClient.invalidateQueries({ queryKey: urgencyKeys.all });
        queryClient.invalidateQueries({ queryKey: queueKeys.all });
        toast.success("Statistiques actualisées");
    }, [queryClient]);

    if (statsError) {
        return (
            <div className="flex flex-col h-full">
                <DashboardHeader
                    breadcrumbs={[
                        { label: "Tableau de bord", href: "/dashboard/doctor" },
                        { label: "Statistiques" },
                    ]}
                />
                <div className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                        <AlertTriangle className="size-12 mx-auto text-red-500 mb-4" />
                        <p className="text-lg font-medium text-red-600">{statsError.message}</p>
                        <Button onClick={handleRefresh} className="mt-4">
                            Réessayer
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full">
            <DashboardHeader
                breadcrumbs={[
                    { label: "Tableau de bord", href: "/dashboard/doctor" },
                    { label: "Statistiques" },
                ]}
                actions={
                    <Button variant="outline" size="sm" onClick={handleRefresh}>
                        <RefreshCw className="size-4 mr-2" />
                        Actualiser
                    </Button>
                }
            />

            <div className="flex-1 p-4 space-y-4 overflow-y-auto">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-xl font-bold text-primary flex items-center gap-2">
                            <BarChart3 className="size-5" />
                            Statistiques
                        </h1>
                        <p className="text-xs text-muted-foreground">
                            Vue d&apos;ensemble de votre activité
                        </p>
                    </div>
                </div>

                {/* Main Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    {isLoading ? (
                                        <Skeleton className="h-8 w-16" />
                                    ) : (
                                        <p className="text-2xl font-bold">{metrics.todayCount}</p>
                                    )}
                                    <p className="text-xs text-muted-foreground">
                                        Consultations aujourd&apos;hui
                                    </p>
                                </div>
                                <div className="p-2 rounded-full bg-blue-100">
                                    <Calendar className="size-5 text-blue-600" />
                                </div>
                            </div>
                            <div className="mt-2 flex items-center gap-1 text-xs">
                                <TrendingUp className="size-3 text-green-500" />
                                <span className="text-green-600">+12%</span>
                                <span className="text-muted-foreground">vs hier</span>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    {isLoading ? (
                                        <Skeleton className="h-8 w-16" />
                                    ) : (
                                        <p className="text-2xl font-bold">{metrics.completedToday}</p>
                                    )}
                                    <p className="text-xs text-muted-foreground">Terminées</p>
                                </div>
                                <div className="p-2 rounded-full bg-green-100">
                                    <CheckCircle className="size-5 text-green-600" />
                                </div>
                            </div>
                            <div className="mt-2 flex items-center gap-1 text-xs">
                                <span className="text-muted-foreground">
                                    {metrics.todayCount > 0
                                        ? Math.round((metrics.completedToday / metrics.todayCount) * 100)
                                        : 0}
                                    % de complétion
                                </span>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    {isLoading ? (
                                        <Skeleton className="h-8 w-16" />
                                    ) : (
                                        <p className="text-2xl font-bold">{metrics.currentWaiting}</p>
                                    )}
                                    <p className="text-xs text-muted-foreground">En attente</p>
                                </div>
                                <div className="p-2 rounded-full bg-orange-100">
                                    <Users className="size-5 text-orange-600" />
                                </div>
                            </div>
                            <div className="mt-2 flex items-center gap-1 text-xs">
                                <Clock className="size-3 text-muted-foreground" />
                                <span className="text-muted-foreground">
                                    ~{metrics.averageWaitTime} min d&apos;attente
                                </span>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    {isLoading ? (
                                        <Skeleton className="h-8 w-16" />
                                    ) : (
                                        <p className="text-2xl font-bold">{metrics.pendingUrgencies}</p>
                                    )}
                                    <p className="text-xs text-muted-foreground">Urgences actives</p>
                                </div>
                                <div className="p-2 rounded-full bg-red-100">
                                    <Activity className="size-5 text-red-600" />
                                </div>
                            </div>
                            <div className="mt-2 flex items-center gap-1 text-xs">
                                <span className="text-muted-foreground">
                                    {metrics.urgenciesHandled} résolues aujourd&apos;hui
                                </span>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Weekly Summary */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">Résumé hebdomadaire</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-muted-foreground">
                                        Consultations cette semaine
                                    </span>
                                    {isLoading ? (
                                        <Skeleton className="h-5 w-12" />
                                    ) : (
                                        <Badge variant="secondary">{metrics.completedThisWeek}</Badge>
                                    )}
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-muted-foreground">
                                        Moyenne par jour
                                    </span>
                                    {isLoading ? (
                                        <Skeleton className="h-5 w-12" />
                                    ) : (
                                        <Badge variant="secondary">{metrics.averagePerDay}</Badge>
                                    )}
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-muted-foreground">
                                        Total consultations
                                    </span>
                                    {isLoading ? (
                                        <Skeleton className="h-5 w-12" />
                                    ) : (
                                        <Badge variant="secondary">{metrics.totalConsultations}</Badge>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">Performance</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-muted-foreground">
                                        Temps d&apos;attente moyen
                                    </span>
                                    {isLoading ? (
                                        <Skeleton className="h-5 w-20" />
                                    ) : (
                                        <div className="flex items-center gap-1">
                                            <Badge
                                                variant={
                                                    metrics.averageWaitTime <= 15
                                                        ? "default"
                                                        : "destructive"
                                                }
                                            >
                                                {metrics.averageWaitTime} min
                                            </Badge>
                                            {metrics.averageWaitTime <= 15 ? (
                                                <TrendingDown className="size-4 text-green-500" />
                                            ) : (
                                                <TrendingUp className="size-4 text-red-500" />
                                            )}
                                        </div>
                                    )}
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-muted-foreground">
                                        Urgences gérées
                                    </span>
                                    {isLoading ? (
                                        <Skeleton className="h-5 w-12" />
                                    ) : (
                                        <Badge variant="outline">{metrics.urgenciesHandled}</Badge>
                                    )}
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-muted-foreground">
                                        Taux de complétion
                                    </span>
                                    {isLoading ? (
                                        <Skeleton className="h-5 w-16" />
                                    ) : (
                                        <Badge variant="default">
                                            {metrics.todayCount > 0
                                                ? Math.round(
                                                    (metrics.completedToday / metrics.todayCount) * 100
                                                )
                                                : 100}
                                            %
                                        </Badge>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
