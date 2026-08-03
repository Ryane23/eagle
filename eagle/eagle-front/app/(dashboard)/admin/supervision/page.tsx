"use client";

import { useEffect } from "react";
import { DashboardHeader } from "@/components/layout/dashboard-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Activity,
    Cpu,
    HardDrive,
    Wifi,
    Users,
    Server,
    Clock,
    Download,
    RefreshCw,
    CheckCircle,
    AlertTriangle,
    Loader2,
    AlertCircle,
} from "lucide-react";
import { useNetworkAnalytics, useSystemHealth, useRefreshAnalytics } from "@/hooks";

// Mock data for metrics not available in API (would need a real monitoring system)
const systemMetrics = {
    cpu: { current: 45, peak: 78, unit: "%" },
    memory: { current: 62, peak: 85, unit: "%" },
    disk: { current: 38, peak: 38, unit: "%" },
    bandwidth: { current: 125, peak: 890, unit: "Mbps" },
};

const backupHistory = [
    { id: 1, type: "Complet", date: "2025-01-15 03:00", size: "2.4 GB", status: "success" },
    { id: 2, type: "Incrémental", date: "2025-01-14 03:00", size: "156 MB", status: "success" },
    { id: 3, type: "Incrémental", date: "2025-01-13 03:00", size: "142 MB", status: "success" },
    { id: 4, type: "Complet", date: "2025-01-12 03:00", size: "2.3 GB", status: "success" },
];

const maintenanceSchedule = [
    { component: "Base de données", lastMaintenance: "2025-01-10", nextMaintenance: "2025-02-10", health: 95 },
    { component: "Serveur vidéo", lastMaintenance: "2025-01-05", nextMaintenance: "2025-02-05", health: 88 },
    { component: "API Gateway", lastMaintenance: "2025-01-08", nextMaintenance: "2025-02-08", health: 92 },
    { component: "Stockage", lastMaintenance: "2025-01-01", nextMaintenance: "2025-02-01", health: 78 },
];

export default function SupervisionPage() {
    const { data: networkData, isLoading, error, refresh, clearError } = useNetworkAnalytics();
    const { health: systemHealth, refresh: refreshHealth, statusColor } = useSystemHealth();
    const { refresh: refreshAll, isLoading: isRefreshing } = useRefreshAnalytics();

    // Fetch data on mount
    useEffect(() => {
        refresh();
        refreshHealth();
    }, [refresh, refreshHealth]);

    const handleRefresh = async () => {
        await refreshAll();
    };

    if (error) {
        return (
            <div className="flex flex-col h-full font-sans">
                <DashboardHeader
                    breadcrumbs={[
                        { label: "Administration", href: "/admin" },
                        { label: "Supervision technique" },
                    ]}
                />
                <div className="flex-1 flex items-center justify-center">
                    <div className="text-center space-y-4">
                        <AlertCircle className="size-12 text-destructive mx-auto" />
                        <p className="text-muted-foreground">{error}</p>
                        <Button onClick={() => { clearError(); refresh(); }}>
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
                    { label: "Supervision technique" },
                ]}
                actions={
                    <div className="flex items-center gap-2">
                        {systemHealth && (
                            <Badge className={statusColor}>
                                {systemHealth.status === "healthy"
                                    ? "Système OK"
                                    : systemHealth.status === "degraded"
                                        ? "Dégradé"
                                        : "Critique"}
                            </Badge>
                        )}
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleRefresh}
                            disabled={isRefreshing}
                        >
                            <RefreshCw
                                className={`mr-2 size-4 ${
                                    isRefreshing ? "animate-spin" : ""
                                }`}
                            />
                            Actualiser
                        </Button>
                    </div>
                }
            />

            <div className="flex-1 p-4 space-y-4 overflow-auto">
                {isLoading && !networkData ? (
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="size-8 animate-spin text-muted-foreground" />
                    </div>
                ) : (
                    <>
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between pb-2">
                                    <CardTitle className="text-sm font-medium text-muted-foreground">CPU</CardTitle>
                                    <Cpu className="size-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{systemMetrics.cpu.current}%</div>
                                    <Progress value={systemMetrics.cpu.current} className="mt-2" />
                                    <p className="text-xs text-muted-foreground mt-1">Pic: {systemMetrics.cpu.peak}%</p>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between pb-2">
                                    <CardTitle className="text-sm font-medium text-muted-foreground">Mémoire</CardTitle>
                                    <Activity className="size-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{systemMetrics.memory.current}%</div>
                                    <Progress value={systemMetrics.memory.current} className="mt-2" />
                                    <p className="text-xs text-muted-foreground mt-1">Pic: {systemMetrics.memory.peak}%</p>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between pb-2">
                                    <CardTitle className="text-sm font-medium text-muted-foreground">Disque</CardTitle>
                                    <HardDrive className="size-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{systemMetrics.disk.current}%</div>
                                    <Progress value={systemMetrics.disk.current} className="mt-2" />
                                    <p className="text-xs text-muted-foreground mt-1">1.2 TB utilisé</p>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between pb-2">
                                    <CardTitle className="text-sm font-medium text-muted-foreground">Bande passante</CardTitle>
                                    <Wifi className="size-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{systemMetrics.bandwidth.current} Mbps</div>
                                    <Progress value={(systemMetrics.bandwidth.current / 1000) * 100} className="mt-2" />
                                    <p className="text-xs text-muted-foreground mt-1">Pic: {systemMetrics.bandwidth.peak} Mbps</p>
                                </CardContent>
                            </Card>
                        </div>

                        <Tabs defaultValue="users">
                            <TabsList>
                                <TabsTrigger value="users">Utilisateurs connectés</TabsTrigger>
                                <TabsTrigger value="centers">État des centres</TabsTrigger>
                                <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
                                <TabsTrigger value="backups">Sauvegardes</TabsTrigger>
                            </TabsList>

                            <TabsContent value="users" className="mt-4">
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Users className="size-5" />
                                            Utilisateurs connectés ({networkData?.centerStats?.reduce((acc, c) => acc + c.activeUsers, 0) || 0})
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        {networkData?.centerStats && networkData.centerStats.length > 0 ? (
                                            <div className="space-y-4">
                                                {networkData.centerStats.map((center) => (
                                                    <div key={center.hospitalId} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                                                        <div className="flex items-center gap-3">
                                                            <div className={`size-2 rounded-full ${center.activeUsers > 0 ? "bg-green-500" : "bg-gray-400"}`} />
                                                            <div>
                                                                <p className="font-medium">{center.hospitalName}</p>
                                                                <p className="text-sm text-muted-foreground">
                                                                    {center.activeUsers} utilisateur{center.activeUsers !== 1 ? "s" : ""} connecté{center.activeUsers !== 1 ? "s" : ""}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="text-sm">{center.totalConsultations} consultations</p>
                                                            <p className="text-xs text-muted-foreground flex items-center gap-1 justify-end">
                                                                <Clock className="size-3" />
                                                                Attente moy: {center.averageWaitTime} min
                                                            </p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="text-center py-8 text-muted-foreground">
                                                Aucune donnée d&apos;utilisateur disponible
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            <TabsContent value="centers" className="mt-4">
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Server className="size-5" />
                                            État des centres et services
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        {networkData?.centerStats && networkData.centerStats.length > 0 ? (
                                            <div className="space-y-4">
                                                {networkData.centerStats.map((center) => {
                                                    const isOnline = center.activeUsers > 0;
                                                    return (
                                                        <div key={center.hospitalId} className="p-4 bg-muted/50 rounded-lg">
                                                            <div className="flex items-center justify-between mb-3">
                                                                <div className="flex items-center gap-3">
                                                                    <div className={`size-3 rounded-full ${isOnline ? "bg-green-500" : "bg-gray-400"}`} />
                                                                    <span className="font-medium">{center.hospitalName}</span>
                                                                </div>
                                                                <Badge variant={isOnline ? "default" : "secondary"}>
                                                                    {isOnline ? "En ligne" : "Hors ligne"}
                                                                </Badge>
                                                            </div>
                                                            <div className="grid grid-cols-4 gap-4 text-sm">
                                                                <div>
                                                                    <p className="text-muted-foreground">Patients</p>
                                                                    <p className="font-medium">{center.totalPatients}</p>
                                                                </div>
                                                                <div>
                                                                    <p className="text-muted-foreground">Consultations</p>
                                                                    <p className="font-medium">{center.totalConsultations}</p>
                                                                </div>
                                                                <div>
                                                                    <p className="text-muted-foreground">Attente moy.</p>
                                                                    <p className={`font-medium ${center.averageWaitTime > 30 ? "text-orange-500" : ""}`}>
                                                                        {center.averageWaitTime} min
                                                                    </p>
                                                                </div>
                                                                <div>
                                                                    <p className="text-muted-foreground">Utilisateurs</p>
                                                                    <p className="font-medium">{center.activeUsers}</p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        ) : (
                                            <div className="text-center py-8 text-muted-foreground">
                                                Aucune donnée de centre disponible
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            <TabsContent value="maintenance" className="mt-4">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Maintenance préventive</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-4">
                                            {maintenanceSchedule.map((item) => (
                                                <div key={item.component} className="p-4 bg-muted/50 rounded-lg">
                                                    <div className="flex items-center justify-between mb-2">
                                                        <span className="font-medium">{item.component}</span>
                                                        <div className="flex items-center gap-2">
                                                            {item.health >= 90 ? (
                                                                <CheckCircle className="size-4 text-green-500" />
                                                            ) : item.health >= 80 ? (
                                                                <AlertTriangle className="size-4 text-yellow-500" />
                                                            ) : (
                                                                <AlertTriangle className="size-4 text-orange-500" />
                                                            )}
                                                            <span className={`font-medium ${item.health >= 90 ? "text-green-600" : item.health >= 80 ? "text-yellow-600" : "text-orange-600"}`}>
                                                                {item.health}%
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <Progress value={item.health} className="mb-2" />
                                                    <div className="flex justify-between text-xs text-muted-foreground">
                                                        <span>Dernière: {item.lastMaintenance}</span>
                                                        <span>Prochaine: {item.nextMaintenance}</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            <TabsContent value="backups" className="mt-4">
                                <Card>
                                    <CardHeader className="flex flex-row items-center justify-between">
                                        <CardTitle className="flex items-center gap-2">
                                            <Download className="size-5" />
                                            Historique des sauvegardes
                                        </CardTitle>
                                        <Button size="sm">
                                            Lancer une sauvegarde
                                        </Button>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-4">
                                            {backupHistory.map((backup) => (
                                                <div key={backup.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                                                    <div className="flex items-center gap-3">
                                                        <CheckCircle className="size-4 text-green-500" />
                                                        <div>
                                                            <p className="font-medium">{backup.type}</p>
                                                            <p className="text-sm text-muted-foreground">{backup.date}</p>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="font-medium">{backup.size}</p>
                                                        <Badge variant="default" className="text-xs">Succès</Badge>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>
                        </Tabs>
                    </>
                )}
            </div>
        </div>
    );
}
