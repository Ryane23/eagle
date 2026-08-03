"use client";

import { useState, useMemo } from "react";
import { DashboardHeader } from "@/components/layout/dashboard-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Activity,
    Users,
    AlertTriangle,
    Building2,
    ArrowRight,
    CheckCircle,
    Clock,
    RefreshCw,
    Loader2,
    AlertCircle,
} from "lucide-react";
import Link from "next/link";
import {
    useNetworkAnalyticsQuery,
    useSystemHealthQuery,
    useToggleMaintenanceMode,
    useSystemSettingsQuery,
    useHospitalTreeQuery,
    useBranchStatisticsQuery,
    useActivitiesQuery,
    useAdminReportsQuery,
    useUpdateAdminReport,
} from "@/hooks/queries";
import { HospitalTreeViewer } from "./_components/hospital-tree-viewer";
import { parseApiDate } from "@/lib/utils";
import type { AdminReportStatus } from "@/actions/reports";
import { AdminQuickStats } from "@/components/admin/admin-quick-stats";
import { ConsultationBoxAdminPanel } from "@/components/admin/consultation-box-admin-panel";

const quickLinks = [
    { title: "Gérer les utilisateurs", url: "/admin/users", icon: Users },
    { title: "Voir les incidents", url: "/admin/incidents", icon: AlertTriangle },
    { title: "Supervision technique", url: "/admin/supervision", icon: Activity },
    { title: "Configurer les règles", url: "/admin/rules", icon: CheckCircle },
];

export default function AdminDashboard() {
    const [selectedHospitalId, setSelectedHospitalId] = useState<string | null>(null);
    
    // TanStack Query hooks
    const { 
        data: networkData, 
        isLoading, 
        error, 
        refetch: refreshNetwork,
    } = useNetworkAnalyticsQuery();
    
    const { 
        data: systemHealth,
        refetch: refreshHealth,
    } = useSystemHealthQuery();
    
    const { data: systemSettings } = useSystemSettingsQuery();
    const toggleMaintenanceMutation = useToggleMaintenanceMode();
    const {
        data: hospitalTree = [],
        isLoading: isTreeLoading,
        refetch: refreshTree,
    } = useHospitalTreeQuery();
    const activeHospitalId = selectedHospitalId ?? hospitalTree[0]?.id ?? null;
    const activeHospital = useMemo(
        () =>
            hospitalTree
                .flatMap((primary) => [primary, ...(primary.children || [])])
                .find((hospital) => hospital.id === activeHospitalId),
        [activeHospitalId, hospitalTree],
    );
    const {
        data: selectedHospitalStatistics,
        isLoading: isHospitalStatisticsLoading,
    } = useBranchStatisticsQuery(activeHospitalId ?? "");
    const {
        data: recentActivities = [],
        isLoading: areActivitiesLoading,
        error: activitiesError,
        refetch: refreshActivities,
    } = useActivitiesQuery(30);
    const {
        data: adminReports = [],
        isLoading: areReportsLoading,
        error: reportsError,
        refetch: refreshReports,
    } = useAdminReportsQuery();
    const updateAdminReport = useUpdateAdminReport();
    
    // Calculate admin dashboard stats
    const stats = useMemo(() => {
        if (!networkData) {
            return {
                activeUsers: 0,
                openIncidents: 0,
                systemHealthPercent: 0,
                activeCenters: "0/0",
            };
        }

        // Calculate active users from center stats
        const activeUsers = networkData.centerStats?.reduce(
            (acc, center) => acc + center.activeUsers,
            0
        ) || 0;

        // System health as percentage
        let systemHealthPercent = 0;
        if (systemHealth) {
            systemHealthPercent = systemHealth.status === "healthy" ? 100 : 
                               systemHealth.status === "degraded" ? 75 : 50;
        }

        // Active servers (derived from center stats)
        const totalCenters = networkData.centerStats?.length || 0;
        const activeCenters = networkData.centerStats?.filter(
            (c) => c.activeUsers > 0
        ).length || 0;

        return {
            activeUsers,
            openIncidents: networkData.urgenciesToday || 0,
            systemHealthPercent,
            activeCenters: `${activeCenters}/${totalCenters}`,
        };
    }, [networkData, systemHealth]);

    const handleRefresh = async () => {
        await Promise.all([
            refreshNetwork(),
            refreshHealth(),
            refreshTree(),
            refreshActivities(),
            refreshReports(),
        ]);
    };

    const systemStats = [
        {
            label: "Utilisateurs actifs",
            value: stats.activeUsers,
            icon: Users,
            detail: `${networkData?.totalUsers ?? 0} au total`,
            color: "text-blue-500",
        },
        {
            label: "Urgences aujourd'hui",
            value: stats.openIncidents,
            icon: AlertTriangle,
            detail: "Attention requise",
            color: "text-orange-500",
        },
        {
            label: "Santé système",
            value: `${stats.systemHealthPercent}%`,
            icon: Activity,
            detail: systemHealth?.status || "unknown",
            color:
                systemHealth?.status === "healthy"
                    ? "text-green-500"
                    : systemHealth?.status === "degraded"
                        ? "text-yellow-500"
                        : "text-red-500",
        },
        {
            label: "Centres actifs",
            value: stats.activeCenters,
            icon: Building2,
            detail: "Réseau hospitalier",
            color: "text-purple-500",
        },
    ];

    const formatDateTime = (value: unknown) => {
        const date = parseApiDate(value);
        return date
            ? new Intl.DateTimeFormat("fr-FR", {
                dateStyle: "medium",
                timeStyle: "short",
            }).format(date)
            : "Date indisponible";
    };

    const reportStatusLabels: Record<AdminReportStatus, string> = {
        pending: "En attente",
        in_review: "En cours",
        resolved: "Résolu",
        rejected: "Rejeté",
    };

    const reportStatusVariants: Record<
        AdminReportStatus,
        "default" | "secondary" | "destructive" | "outline"
    > = {
        pending: "outline",
        in_review: "secondary",
        resolved: "default",
        rejected: "destructive",
    };

    if (error) {
        return (
            <div className="flex flex-col h-full font-sans">
                <DashboardHeader
                    breadcrumbs={[
                        { label: "Administration", href: "/admin" },
                        { label: "Tableau de bord" },
                    ]}
                />
                <div className="flex-1 flex items-center justify-center">
                    <div className="text-center space-y-4">
                        <AlertCircle className="size-12 text-destructive mx-auto" />
                        <p className="text-muted-foreground">{error.message}</p>
                        <Button onClick={() => refreshNetwork()}>
                            <RefreshCw className="mr-2 size-4" />
                            Réessayer
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full font-sans">
            <DashboardHeader
                breadcrumbs={[
                    { label: "Administration", href: "/admin" },
                    { label: "Tableau de bord" },
                ]}
                actions={
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleRefresh}
                        disabled={isLoading}
                    >
                        <RefreshCw
                            className={`mr-2 size-4 ${isLoading ? "animate-spin" : ""}`}
                        />
                        Actualiser
                    </Button>
                }
            />

            <div className="flex-1 p-4 space-y-4 overflow-auto font-sans">
                {networkData && networkData.urgenciesToday > 0 && (
                    <Alert className="border-orange-200 bg-orange-50 py-2">
                        <AlertTriangle className="size-3 text-orange-500" />
                        <AlertTitle className="text-sm text-orange-800">Attention requise</AlertTitle>
                        <AlertDescription className="text-xs text-orange-700">
                            {networkData.urgenciesToday} urgences signalées aujourd&apos;hui.
                            <Link href="/admin/incidents" className="ml-2 font-medium underline">
                                Voir les détails
                            </Link>
                        </AlertDescription>
                    </Alert>
                )}

                <AdminQuickStats
                    stats={systemStats}
                    isLoading={isLoading && !networkData}
                />

                <Tabs defaultValue="overview" className="space-y-4">
                    <TabsList>
                        <TabsTrigger value="overview">Vue d&apos;ensemble</TabsTrigger>
                        <TabsTrigger value="activity">Activité récente</TabsTrigger>
                        <TabsTrigger value="reports">Rapports</TabsTrigger>
                    </TabsList>

                    <TabsContent value="overview" className="space-y-4">
                        <HospitalTreeViewer
                            tree={hospitalTree}
                            isLoading={isTreeLoading}
                            selectedHospitalId={activeHospitalId}
                            onSelect={setSelectedHospitalId}
                            statistics={selectedHospitalStatistics}
                            isStatisticsLoading={isHospitalStatisticsLoading}
                        />

                        <ConsultationBoxAdminPanel
                            key={activeHospitalId}
                            hospital={activeHospital}
                        />

                        <div className="grid gap-6 lg:grid-cols-3">
                            <Card className="lg:col-span-2">
                                <CardHeader>
                                    <CardTitle>État des centres</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {isLoading && !networkData ? (
                                        <div className="flex items-center justify-center py-8">
                                            <Loader2 className="size-6 animate-spin text-muted-foreground" />
                                        </div>
                                    ) : networkData?.centerStats && networkData.centerStats.length > 0 ? (
                                        <div className="space-y-4">
                                            {networkData.centerStats.map((center) => (
                                                <div key={center.hospitalId} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                                                    <div className="flex items-center gap-3">
                                                        <div className={`size-3 rounded-full ${center.activeUsers > 0 ? "bg-green-500" : "bg-gray-400"}`} />
                                                        <div>
                                                            <p className="font-medium">{center.hospitalName}</p>
                                                            <p className="text-xs text-muted-foreground">
                                                                {center.activeUsers} utilisateur{center.activeUsers !== 1 ? "s" : ""} connecté{center.activeUsers !== 1 ? "s" : ""}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-4">
                                                        <div className="text-right">
                                                            <p className="text-sm font-medium">{center.totalConsultations}</p>
                                                            <p className="text-xs text-muted-foreground">Consultations</p>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="text-sm font-medium">{center.averageWaitTime} min</p>
                                                            <p className="text-xs text-muted-foreground">Attente moy.</p>
                                                        </div>
                                                        <Badge variant={center.activeUsers > 0 ? "default" : "secondary"}>
                                                            {center.activeUsers > 0 ? "En ligne" : "Hors ligne"}
                                                        </Badge>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-8 text-muted-foreground">
                                            Aucune donnée de centre disponible
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Accès rapides</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2">
                                        {quickLinks.map((link) => (
                                            <Link key={link.url} href={link.url}>
                                                <Button variant="ghost" className="w-full justify-start">
                                                    <link.icon className="mr-2 size-4" />
                                                    {link.title}
                                                    <ArrowRight className="ml-auto size-4" />
                                                </Button>
                                            </Link>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Maintenance Mode */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-sm">Mode maintenance</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-muted-foreground">
                                            {systemSettings?.maintenanceMode ? "Activé" : "Désactivé"}
                                        </span>
                                        <Button
                                            variant={systemSettings?.maintenanceMode ? "destructive" : "outline"}
                                            size="sm"
                                            onClick={() => toggleMaintenanceMutation.mutate()}
                                            disabled={toggleMaintenanceMutation.isPending}
                                        >
                                            {systemSettings?.maintenanceMode ? "Désactiver" : "Activer"}
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                    </TabsContent>

                    <TabsContent value="activity">
                        <Card>
                            <CardHeader className="flex-row items-center justify-between">
                                <CardTitle>Activité récente</CardTitle>
                                <Badge variant="secondary">{recentActivities.length} événements</Badge>
                            </CardHeader>
                            <CardContent>
                                {areActivitiesLoading ? (
                                    <div className="space-y-3">
                                        {[1, 2, 3, 4].map((item) => (
                                            <Skeleton key={item} className="h-14 w-full" />
                                        ))}
                                    </div>
                                ) : activitiesError ? (
                                    <Alert variant="destructive">
                                        <AlertCircle className="size-4" />
                                        <AlertTitle>Activité indisponible</AlertTitle>
                                        <AlertDescription>{activitiesError.message}</AlertDescription>
                                    </Alert>
                                ) : recentActivities.length === 0 ? (
                                    <div className="text-center py-8 text-muted-foreground">
                                        <Clock className="size-8 mx-auto mb-2 text-muted-foreground/50" />
                                        <p>Aucune activité enregistrée.</p>
                                    </div>
                                ) : (
                                    <div className="divide-y">
                                        {recentActivities.map((activity) => (
                                            <div
                                                key={activity.id}
                                                className="grid gap-2 py-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center"
                                            >
                                                <div className="min-w-0">
                                                    <div className="flex items-center gap-2">
                                                        <Badge variant="outline">{activity.type}</Badge>
                                                        <span className="text-xs text-muted-foreground">
                                                            {activity.resource}
                                                        </span>
                                                    </div>
                                                    <p className="mt-1 text-sm font-medium">{activity.description}</p>
                                                    <p className="text-xs text-muted-foreground">
                                                        Utilisateur {activity.user?.name ?? activity.userId}
                                                    </p>
                                                </div>
                                                <time className="text-xs text-muted-foreground">
                                                    {formatDateTime(activity.timestamp ?? activity.createdAt)}
                                                </time>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="reports">
                        <Card>
                            <CardHeader className="flex-row items-center justify-between">
                                <CardTitle>Rapports disponibles</CardTitle>
                                <Badge variant="secondary">{adminReports.length} rapports</Badge>
                            </CardHeader>
                            <CardContent>
                                {areReportsLoading ? (
                                    <div className="space-y-3">
                                        {[1, 2, 3].map((item) => (
                                            <Skeleton key={item} className="h-20 w-full" />
                                        ))}
                                    </div>
                                ) : reportsError ? (
                                    <Alert variant="destructive">
                                        <AlertCircle className="size-4" />
                                        <AlertTitle>Rapports indisponibles</AlertTitle>
                                        <AlertDescription>{reportsError.message}</AlertDescription>
                                    </Alert>
                                ) : adminReports.length === 0 ? (
                                    <p className="py-8 text-center text-sm text-muted-foreground">
                                        Aucun rapport administratif enregistré.
                                    </p>
                                ) : (
                                    <div className="divide-y">
                                        {adminReports.map((report) => (
                                            <div
                                                key={report.id}
                                                className="grid gap-3 py-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center"
                                            >
                                                <div className="min-w-0">
                                                    <div className="flex flex-wrap items-center gap-2">
                                                        <p className="font-medium">{report.title}</p>
                                                        <Badge variant={reportStatusVariants[report.status]}>
                                                            {reportStatusLabels[report.status]}
                                                        </Badge>
                                                        <Badge variant="outline">{report.type}</Badge>
                                                    </div>
                                                    <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                                                        {report.description}
                                                    </p>
                                                    <p className="mt-1 text-xs text-muted-foreground">
                                                        {report.reportedByName ?? report.reportedBy}
                                                        {" · "}
                                                        {formatDateTime(report.createdAt)}
                                                    </p>
                                                </div>
                                                <div className="flex flex-wrap gap-2">
                                                    {report.status === "pending" && (
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            disabled={updateAdminReport.isPending}
                                                            onClick={() =>
                                                                updateAdminReport.mutate({
                                                                    id: report.id,
                                                                    status: "in_review",
                                                                })
                                                            }
                                                        >
                                                            Examiner
                                                        </Button>
                                                    )}
                                                    {report.status !== "resolved" && report.status !== "rejected" && (
                                                        <Button
                                                            size="sm"
                                                            disabled={updateAdminReport.isPending}
                                                            onClick={() =>
                                                                updateAdminReport.mutate({
                                                                    id: report.id,
                                                                    status: "resolved",
                                                                })
                                                            }
                                                        >
                                                            <CheckCircle className="mr-2 size-4" />
                                                            Résoudre
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}
