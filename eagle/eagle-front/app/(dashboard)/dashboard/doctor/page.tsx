"use client";

import { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { QuickStats } from "@/components/doctor/quick-stats";
import { QuickAccessButtons } from "@/components/doctor/quick-access-buttons";
import { NextPatientBlock } from "@/components/doctor/next-patient-block";
import { TimelinePlanning } from "@/components/doctor/timeline-planning";
import { UrgentPatients } from "@/components/doctor/urgent-patients";
import { QuickActionsGrid } from "@/components/doctor/quick-actions-grid";
import { RecentActivities } from "@/components/doctor/recent-activities";
import { PatientDetailsModal } from "@/components/doctor/patient-details-modal";
import { StatisticsModal } from "@/components/doctor/statistics-modal";
import { FloatingHelpButton } from "@/components/doctor/floating-help-button";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
    RefreshCw,
    Calendar,
    Clock,
    Wifi,
    WifiOff,
    Bell,
    AlertTriangle,
    CheckCircle,
    Info,
    XCircle,
    EyeIcon,
    EyeOffIcon,
} from "lucide-react";
import {
    useDoctorDashboardQuery,
    useNotificationBell,
    consultationKeys,
    queueKeys,
    urgencyKeys,
    type ScheduleItem,
} from "@/hooks/queries";
import { toast } from "sonner";
import type { NotificationType } from "@/types/api";
import { SidebarTrigger } from "@/components/ui/sidebar";

const notificationTypeConfig: Record<
    string,
    { icon: typeof AlertTriangle; bg: string; text: string }
> = {
    urgency_created: { icon: XCircle, bg: "bg-red-100 text-red-800", text: "" },
    urgency_validated: { icon: CheckCircle, bg: "bg-green-100 text-green-800", text: "" },
    urgency_assigned: { icon: Info, bg: "bg-blue-100 text-blue-800", text: "" },
    consultation_started: { icon: Info, bg: "bg-blue-100 text-blue-800", text: "" },
    consultation_completed: { icon: CheckCircle, bg: "bg-green-100 text-green-800", text: "" },
    prescription_created: { icon: Info, bg: "bg-blue-100 text-blue-800", text: "" },
    message_received: { icon: Info, bg: "bg-blue-100 text-blue-800", text: "" },
    system: { icon: AlertTriangle, bg: "bg-yellow-100 text-yellow-800", text: "" },
};

function getNotificationConfig(type: NotificationType) {
    return notificationTypeConfig[type] ?? notificationTypeConfig.system;
}

export default function DoctorDashboard() {
    const router = useRouter();
    const queryClient = useQueryClient();
    const [patientModalOpen, setPatientModalOpen] = useState(false);
    const [statisticsModalOpen, setStatisticsModalOpen] = useState(false);
    const [statsHidden, setStatsHidden] = useState(false);
    const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
    const [showNotifications, setShowNotifications] = useState(false);
    const [currentTime, setCurrentTime] = useState(() => new Date());
    const [connected, setConnected] = useState(
        typeof navigator !== "undefined" ? navigator.onLine : true
    );

    const { unreadCount, unreadNotifications, markAsRead } = useNotificationBell();

    // TanStack Query - automatic caching and deduplication
    const {
        stats,
        nextPatient,
        urgentPatients,
        schedule,
        isLoading,
    } = useDoctorDashboardQuery();

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        if (typeof navigator === "undefined") return;
        const onOnline = () => setConnected(true);
        const onOffline = () => setConnected(false);
        if (navigator.onLine !== undefined) {
            queueMicrotask(() => setConnected(navigator.onLine));
        }
        window.addEventListener("online", onOnline);
        window.addEventListener("offline", onOffline);
        return () => {
            window.removeEventListener("online", onOnline);
            window.removeEventListener("offline", onOffline);
        };
    }, []);

    const handleRefresh = useCallback(() => {
        // Invalidate all dashboard-related queries
        queryClient.invalidateQueries({ queryKey: consultationKeys.all });
        queryClient.invalidateQueries({ queryKey: queueKeys.all });
        queryClient.invalidateQueries({ queryKey: urgencyKeys.all });
        toast.success("Tableau de bord actualisé");
    }, [queryClient]);

    const handleStartConsultation = useCallback(
        async (id: string) => {
            try {
                const scheduleItem = schedule.find((item: ScheduleItem) => item.id === id);
                const urgentPatient = urgentPatients.find((p) => p.id === id);

                if (scheduleItem) {
                    sessionStorage.setItem(
                        "consultationPatient",
                        JSON.stringify({
                            id: scheduleItem.id,
                            name: scheduleItem.patientName,
                            patientId: scheduleItem.patientId,
                            appointmentTime: scheduleItem.time,
                            urgencyLevel: scheduleItem.urgencyLevel || 2,
                            type: scheduleItem.type,
                            reason:
                                scheduleItem.type === "new"
                                    ? "Première consultation"
                                    : "Consultation de suivi",
                        })
                    );
                } else if (urgentPatient) {
                    sessionStorage.setItem(
                        "consultationPatient",
                        JSON.stringify({
                            id: urgentPatient.id,
                            name: urgentPatient.name,
                            patientId: urgentPatient.patientId,
                            urgencyLevel: urgentPatient.urgencyLevel,
                            type: "urgency",
                            reason: urgentPatient.reason,
                        })
                    );
                } else if (nextPatient && nextPatient.id === id) {
                    sessionStorage.setItem(
                        "consultationPatient",
                        JSON.stringify({
                            id: nextPatient.id,
                            name: nextPatient.name,
                            patientId: nextPatient.patientId,
                            appointmentTime: nextPatient.appointmentTime,
                            urgencyLevel: nextPatient.urgencyLevel,
                            type: nextPatient.type,
                            reason: nextPatient.reason,
                        })
                    );
                }

                router.push("/dashboard/doctor/consultation");
            } catch {
                toast.error("Erreur lors du démarrage de la consultation");
            }
        },
        [schedule, urgentPatients, nextPatient, router]
    );

    const handleViewPatientDetails = useCallback((patientId: string) => {
        setSelectedPatientId(patientId);
        setPatientModalOpen(true);
    }, []);

    const handleOpenStatistics = useCallback(() => {
        setStatisticsModalOpen(true);
    }, []);

    const handleScheduleStart = useCallback(
        (item: ScheduleItem) => {
            handleStartConsultation(item.id);
        },
        [handleStartConsultation]
    );

    const handleUrgentStart = useCallback(
        (id: string) => {
            handleStartConsultation(id);
        },
        [handleStartConsultation]
    );

    return (
        <div className="flex flex-col h-full overflow-hidden bg-gray-50/30">
            {/* Enhanced header bar (reference-style) */}
            <div className="flex items-center justify-between px-4 py-2 border-b bg-background shrink-0">
                <div className="flex items-center gap-3">
            <SidebarTrigger className="-ml-1" />
                    <Badge variant="outline" className="gap-1.5 text-xs">
                        <Calendar className="size-3" />
                        {currentTime.toLocaleDateString("fr-FR", {
                            weekday: "long",
                            day: "numeric",
                            month: "long",
                        })}
                    </Badge>
                    <Badge variant="outline" className="gap-1.5 text-xs tabular-nums">
                        <Clock className="size-3" />
                        {currentTime.toLocaleTimeString("fr-FR")}
                    </Badge>
                    <Badge
                        className={
                            connected
                                ? "bg-green-100 text-green-700 gap-1.5 dark:bg-green-900/30 dark:text-green-400"
                                : "bg-red-100 text-red-700 gap-1.5 dark:bg-red-900/30 dark:text-red-400"
                        }
                    >
                        {connected ? (
                            <>
                                <Wifi className="size-3" />
                                Connecté
                            </>
                        ) : (
                            <>
                                <WifiOff className="size-3" />
                                Hors ligne
                            </>
                        )}
                    </Badge>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setStatsHidden(!statsHidden)}
                        className="text-muted-foreground h-7"
                    >
                        {statsHidden ? (
                            <EyeOffIcon className="size-4 mr-1" />
                        ) : (
                        <EyeIcon className="size-4 mr-1" />
                        )}
                    </Button>
                    <Button variant="outline" size="sm" className="h-7 gap-1.5" onClick={handleRefresh}>
                        <RefreshCw className="size-3" />
                        <span className="text-xs">Actualiser</span>
                    </Button>
                    <div className="relative">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 relative"
                            onClick={() => setShowNotifications(!showNotifications)}
                        >
                            <Bell className="size-4" />
                            {unreadCount > 0 && (
                                <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[9px] font-medium rounded-full min-w-[1rem] h-4 px-1 flex items-center justify-center">
                                    {unreadCount > 99 ? "99+" : unreadCount}
                                </span>
                            )}
                        </Button>
                        {showNotifications && (
                            <Card className="absolute right-0 mt-2 w-80 shadow-lg z-50">
                                <div className="p-3 border-b">
                                    <h3 className="font-medium text-sm">Notifications</h3>
                                </div>
                                <div className="max-h-80 overflow-y-auto">
                                    {unreadNotifications.length === 0 ? (
                                        <p className="p-4 text-sm text-muted-foreground text-center">
                                            Aucune notification
                                        </p>
                                    ) : (
                                        unreadNotifications.map((n) => {
                                            const config = getNotificationConfig(n.type);
                                            return (
                                                <div
                                                    key={n.id}
                                                    className="p-3 border-b last:border-b-0 bg-muted/30 hover:bg-muted/50"
                                                >
                                                    <div
                                                        className={`flex items-start gap-2 p-2 rounded-lg ${config.bg}`}
                                                        role="button"
                                                        tabIndex={0}
                                                        onClick={() => {
                                                            markAsRead(n.id);
                                                            setShowNotifications(false);
                                                        }}
                                                        onKeyDown={(e) =>
                                                            e.key === "Enter" && (markAsRead(n.id), setShowNotifications(false))
                                                        }
                                                    >
                                                        <config.icon className="size-4 flex-shrink-0 mt-0.5" />
                                                        <div className="flex-1 min-w-0">
                                                            <div className="text-xs font-medium">{n.title || n.message}</div>
                                                            {n.title && n.message && (
                                                                <div className="text-[10px] opacity-80 mt-0.5 line-clamp-2">
                                                                    {n.message}
                                                                </div>
                                                            )}
                                                            <div className="text-[10px] opacity-70 mt-0.5">
                                                                {new Date(n.createdAt).toLocaleTimeString("fr-FR", {
                                                                    hour: "2-digit",
                                                                    minute: "2-digit",
                                                                })}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })
                                    )}
                                </div>
                                <div className="p-2 text-center border-t">
                                    <Link
                                        href="/dashboard/doctor/notifications"
                                        className="text-xs text-primary hover:underline"
                                        onClick={() => setShowNotifications(false)}
                                    >
                                        Voir toutes les notifications
                                    </Link>
                                </div>
                            </Card>
                        )}
                    </div>
                </div>
            </div>

            {/* Offline warning banner */}
            {!connected && (
                <div className="mx-4 mt-3 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-3 flex items-start rounded-md shrink-0">
                    <WifiOff className="size-5 text-red-500 mr-3 flex-shrink-0 mt-0.5" />
                    <div>
                        <p className="font-medium text-red-700 dark:text-red-300 text-sm">Mode hors ligne</p>
                        <p className="text-xs text-red-600 dark:text-red-400">
                            Les données seront synchronisées à la reconnexion.
                        </p>
                    </div>
                </div>
            )}

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {/* Quick Stats */}
                {!statsHidden && (
                    <QuickStats
                        patientsToday={stats.patientsToday}
                        waitingCount={stats.waitingCount}
                        completedCount={stats.completedCount}
                        averageWaitTime={stats.averageWaitTime}
                        isLoading={isLoading}
                    />
                )}

                <QuickAccessButtons />

                {/* Main grid: 3 cols (2 + 1) - reference layout */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    {/* Left column: Next patient + Timeline */}
                    <div className="lg:col-span-2 space-y-4">
                        <NextPatientBlock
                            patient={nextPatient}
                            isLoading={isLoading}
                            onStartConsultation={handleStartConsultation}
                            onViewDetails={handleViewPatientDetails}
                        />
                        <TimelinePlanning
                            scheduleItems={schedule}
                            isLoading={isLoading}
                            onStartConsultation={handleScheduleStart}
                        />
                    </div>
                    {/* Right column: Urgent + Quick actions + Activities */}
                    <div className="space-y-4">
                        <UrgentPatients
                            patients={urgentPatients.map((p) => ({
                                id: p.id,
                                name: p.name,
                                patientId: p.patientId,
                                urgencyLevel: p.urgencyLevel,
                                reason: p.reason,
                                waitTime: p.waitTime,
                            }))}
                            isLoading={isLoading}
                            onStartConsultation={handleUrgentStart}
                        />
                        <QuickActionsGrid onStatsClick={handleOpenStatistics} />
                        <RecentActivities />
                    </div>
                </div>
            </div>

            <PatientDetailsModal
                patientId={selectedPatientId}
                open={patientModalOpen}
                onOpenChange={setPatientModalOpen}
            />
            <StatisticsModal open={statisticsModalOpen} onOpenChange={setStatisticsModalOpen} />
            <FloatingHelpButton />
        </div>
    );
}
