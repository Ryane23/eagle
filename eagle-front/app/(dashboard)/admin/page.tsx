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
    Server,
    ArrowRight,
    Bell,
    CheckCircle,
    Clock,
    TrendingUp,
    ChevronUp,
    ChevronDown,
    RefreshCw,
    Loader2,
    AlertCircle,
} from "lucide-react";
import Link from "next/link";
import {
    useNetworkAnalyticsQuery,
    useSystemHealthQuery,
    useNetworkStats,
    useToggleMaintenanceMode,
    useSystemSettingsQuery,
} from "@/hooks/queries";

const quickLinks = [
    { title: "Gérer les utilisateurs", url: "/admin/users", icon: Users },
    { title: "Voir les incidents", url: "/admin/incidents", icon: AlertTriangle },
    { title: "Supervision technique", url: "/admin/supervision", icon: Activity },
    { title: "Configurer les règles", url: "/admin/rules", icon: CheckCircle },
];

export default function AdminDashboard() {
    const [statsHidden, setStatsHidden] = useState(false);
    
    // TanStack Query hooks
    const { 
        data: networkData, 
        isLoading, 
        error, 
        refetch: refreshNetwork,
        dataUpdatedAt,
    } = useNetworkAnalyticsQuery();
    
    const { 
        data: systemHealth,
        refetch: refreshHealth,
    } = useSystemHealthQuery();
    
    const { data: systemSettings } = useSystemSettingsQuery();
    const toggleMaintenanceMutation = useToggleMaintenanceMode();
    
    const networkStats = useNetworkStats();
    
    // Calculate admin dashboard stats
    const stats = useMemo(() => {
        if (!networkData) {
            return {
                activeUsers: 0,
                openIncidents: 0,
                systemHealthPercent: 0,
                activeServers: "0/0",
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
            activeServers: `${activeCenters}/${totalCenters}`,
        };
    }, [networkData, systemHealth]);

    const handleRefresh = async () => {
        await Promise.all([refreshNetwork(), refreshHealth()]);
    };

    const systemStats = [
        { 
            title: "Utilisateurs actifs", 
            value: stats.activeUsers.toString(), 
            icon: Users, 
            trend: "+5%", 
            color: "text-blue-500" 
        },
        { 
            title: "Urgences aujourd'hui", 
            value: stats.openIncidents.toString(), 
            icon: AlertTriangle, 
            trend: networkData?.urgenciesToday ? `${networkData.urgenciesToday}` : "0", 
            color: "text-orange-500" 
        },
        { 
            title: "Santé système", 
            value: `${stats.systemHealthPercent}%`, 
            icon: Activity, 
            trend: systemHealth?.status || "unknown",
            color: systemHealth?.status === "healthy" ? "text-green-500" : 
                   systemHealth?.status === "degraded" ? "text-yellow-500" : "text-red-500" 
        },
        { 
            title: "Serveurs actifs", 
            value: stats.activeServers, 
            icon: Server, 
            trend: "stable", 
            color: "text-purple-500" 
        },
    ];

    const formatLastUpdated = (timestamp: number | undefined) => {
        if (!timestamp) return "Jamais";
        const date = new Date(timestamp);
        const now = new Date();
        const diffMinutes = Math.floor((now.getTime() - date.getTime()) / 60000);
        
        if (diffMinutes < 1) return "À l'instant";
        if (diffMinutes < 60) return `Il y a ${diffMinutes} min`;
        return `Il y a ${Math.floor(diffMinutes / 60)}h`;
    };

    if (error) {
        return (
            <div className="flex flex-col h-full font-sans">
                <DashboardHeader breadcrumbs={[{ label: "Administration" }]} />
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
                breadcrumbs={[{ label: "Administration" }]}
            />

            <div className="flex-1 p-4 space-y-4 overflow-auto font-sans">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-xl font-bold text-primary">Tableau de bord</h1>
                        <p className="text-xs text-muted-foreground">
                            Vue d&apos;ensemble du système EAGLE
                            {dataUpdatedAt && (
                                <span className="ml-2">• Mis à jour {formatLastUpdated(dataUpdatedAt)}</span>
                            )}
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Button 
                            variant="outline" 
                            size="sm" 
                            className="h-7"
                            onClick={handleRefresh}
                            disabled={isLoading}
                        >
                            <RefreshCw className={`mr-1.5 size-3 ${isLoading ? "animate-spin" : ""}`} />
                            <span className="text-[10px]">Actualiser</span>
                        </Button>
                        <Button variant="outline" size="sm" className="h-7">
                            <Bell className="mr-1.5 size-3" />
                            <span className="text-[10px]">Notifications</span>
                        </Button>
                    </div>
                </div>

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

                <div className="flex items-center gap-2">
                    <div className="flex-1">
                        {isLoading && !networkData ? (
                            <div className="flex gap-2 overflow-x-auto">
                                {[1, 2, 3, 4].map((i) => (
                                    <Card key={i} className="rounded-xl shrink-0 min-w-[180px]">
                                        <CardContent className="p-3">
                                            <Skeleton className="h-16 w-full" />
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        ) : !statsHidden && (
                            <div className="flex gap-2 overflow-x-auto">
                                {systemStats.map((stat) => (
                                    <Card key={stat.title} className="rounded-xl shrink-0 min-w-[180px]">
                                        <CardContent className="p-3">
                                            <div className="flex items-center gap-3">
                                                <div className={`p-2 rounded-lg bg-muted/50 ${stat.color} shrink-0`}>
                                                    <stat.icon className="size-4" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-lg font-bold leading-tight">{stat.value}</p>
                                                    <p className="text-[11px] text-muted-foreground leading-tight truncate">{stat.title}</p>
                                                    <p className="text-[10px] text-muted-foreground flex items-center gap-0.5 mt-0.5">
                                                        <TrendingUp className="size-2.5" />
                                                        {stat.trend}
                                                    </p>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </div>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 px-2 gap-1 shrink-0"
                        onClick={() => setStatsHidden(!statsHidden)}
                    >
                        {statsHidden ? (
                            <>
                                <ChevronDown className="size-3" />
                                <span className="text-[10px]">Afficher stats</span>
                            </>
                        ) : (
                            <>
                                <ChevronUp className="size-3" />
                                <span className="text-[10px]">Masquer stats</span>
                            </>
                        )}
                    </Button>
                </div>

                <Tabs defaultValue="overview" className="space-y-4">
                    <TabsList>
                        <TabsTrigger value="overview">Vue d&apos;ensemble</TabsTrigger>
                        <TabsTrigger value="activity">Activité récente</TabsTrigger>
                        <TabsTrigger value="reports">Rapports</TabsTrigger>
                    </TabsList>

                    <TabsContent value="overview" className="space-y-4">
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

                        {/* Summary Cards */}
                        {networkData && (
                            <div className="grid gap-4 md:grid-cols-4">
                                <Card>
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-sm font-medium text-muted-foreground">
                                            Patients totaux
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-2xl font-bold">{networkData.totalPatients}</p>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-sm font-medium text-muted-foreground">
                                            Consultations totales
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-2xl font-bold">{networkData.totalConsultations}</p>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-sm font-medium text-muted-foreground">
                                            Consultations aujourd&apos;hui
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-2xl font-bold text-green-600">{networkData.consultationsToday}</p>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-sm font-medium text-muted-foreground">
                                            Temps d&apos;attente moyen
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-2xl font-bold">{networkData.averageWaitTime} min</p>
                                    </CardContent>
                                </Card>
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent value="activity">
                        <Card>
                            <CardHeader>
                                <CardTitle>Activité récente</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-center py-8 text-muted-foreground">
                                    <Clock className="size-8 mx-auto mb-2 text-muted-foreground/50" />
                                    <p>L&apos;historique d&apos;activité sera disponible prochainement.</p>
                                    <p className="text-xs mt-1">Les actions des utilisateurs seront enregistrées ici.</p>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="reports">
                        <Card>
                            <CardHeader>
                                <CardTitle>Rapports disponibles</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-muted-foreground">Les rapports seront disponibles prochainement.</p>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}
