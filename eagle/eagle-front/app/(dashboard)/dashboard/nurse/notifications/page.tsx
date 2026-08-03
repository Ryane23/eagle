"use client";

import { useState, useMemo, useCallback } from "react";
import { EnhancedNurseDashboardHeader } from "@/components/nurse/enhanced-dashboard-header";
import { FloatingHelpButton } from "@/components/nurse/floating-help-button";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Bell,
    Clock,
    MessageSquare,
    FileText,
    HeartPulse,
    Trash2,
    Check,
    CheckCheck,
    Search,
    Circle,
    AlertCircle,
    RefreshCw,
} from "lucide-react";
import {
    useNotificationsQuery,
    useMarkNotificationAsRead,
    useMarkAllNotificationsAsRead,
    useDeleteNotification,
} from "@/hooks/queries";
import type { Notification as ApiNotification, NotificationType } from "@/types/api";

type DisplayNotification = {
    id: string;
    type: string;
    title: string;
    message: string;
    timestamp?: string;
    time: string;
    read: boolean;
    priority?: "normal" | "urgent";
    patientName?: string;
    actionUrl?: string;
    details?: Record<string, unknown>;
};

function formatTimeAgo(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return "À l'instant";
    if (diffMins < 60) return `Il y a ${diffMins} min`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `Il y a ${diffHours}h`;
    return `Il y a ${Math.floor(diffHours / 24)}j`;
}

function mapNotification(notif: ApiNotification): DisplayNotification {
    const typeMap: Partial<Record<NotificationType, string>> = {
        appointment: "schedule",
        message: "message",
        reminder: "system",
        alert: "system",
        urgency_created: "preparation",
        urgency_validated: "preparation",
        urgency_assigned: "preparation",
        consultation_started: "preparation",
        consultation_completed: "document",
        prescription_created: "document",
        message_received: "message",
        system: "system",
    };

    return {
        id: notif.id,
        type: typeMap[notif.type] || "system",
        title: notif.title,
        message: notif.message,
        timestamp: new Date(notif.createdAt).toLocaleString("fr-FR"),
        time: formatTimeAgo(notif.createdAt),
        read: notif.isRead,
        priority: notif.type.includes("urgency") ? "urgent" : "normal",
        details: notif.data,
        actionUrl: notif.data?.actionUrl as string | undefined,
    };
}

const getNotificationIcon = (type: string) => {
    switch (type) {
        case "message":
            return <MessageSquare className="size-4" />;
        case "preparation":
            return <FileText className="size-4" />;
        case "document":
            return <FileText className="size-4" />;
        case "vitals":
            return <HeartPulse className="size-4" />;
        case "system":
        default:
            return <Bell className="size-4" />;
    }
};

export default function NotificationsPage() {
    const [activeTab, setActiveTab] = useState<"all" | "unread" | "read">("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedNotification, setSelectedNotification] = useState<DisplayNotification | null>(null);

    // TanStack Query
    const { data: apiNotifications = [], isLoading, error, refetch } = useNotificationsQuery();
    const markAsReadMutation = useMarkNotificationAsRead();
    const markAllAsReadMutation = useMarkAllNotificationsAsRead();
    const deleteMutation = useDeleteNotification();

    // Map API notifications to display format
    const notifications = useMemo(() => 
        apiNotifications.map(mapNotification),
        [apiNotifications]
    );

    const filteredNotifications = useMemo(() => {
        return notifications.filter(notif => {
            const matchesTab =
                activeTab === "all" || (activeTab === "unread" && !notif.read) || (activeTab === "read" && notif.read);
            const matchesSearch =
                notif.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                notif.message.toLowerCase().includes(searchQuery.toLowerCase());
            return matchesTab && matchesSearch;
        });
    }, [notifications, activeTab, searchQuery]);

    const unreadCount = useMemo(() => 
        notifications.filter(n => !n.read).length,
        [notifications]
    );

    const handleMarkAsRead = useCallback((id: string) => {
        markAsReadMutation.mutate(id);
    }, [markAsReadMutation]);

    const handleMarkAllAsRead = useCallback(() => {
        markAllAsReadMutation.mutate();
    }, [markAllAsReadMutation]);

    const handleDelete = useCallback((id: string) => {
        deleteMutation.mutate(id);
        if (selectedNotification?.id === id) {
            setSelectedNotification(null);
        }
    }, [deleteMutation, selectedNotification]);

    if (error) {
        return (
            <div className="flex flex-col h-full">
                <EnhancedNurseDashboardHeader />
                <div className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                        <AlertCircle className="size-12 mx-auto text-destructive mb-4" />
                        <h2 className="text-lg font-semibold mb-2">Erreur de chargement</h2>
                        <p className="text-muted-foreground mb-4">{error.message}</p>
                        <Button onClick={() => refetch()}>
                            <RefreshCw className="size-4 mr-2" />
                            Réessayer
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full">
            <EnhancedNurseDashboardHeader />

            <div className="flex-1 flex overflow-hidden">
                {/* Notification List - Left Side */}
                <div className="w-96 border-r bg-muted/30 flex flex-col min-h-0">
                    {/* Header */}
                    <div className="p-3 border-b shrink-0">
                        <div className="flex items-center justify-between mb-3">
                            <h1 className="text-lg font-bold flex items-center gap-2">
                                <Bell className="size-5" />
                                Notifications
                                {unreadCount > 0 && (
                                    <Badge variant="destructive" className="ml-1">
                                        {unreadCount}
                                    </Badge>
                                )}
                            </h1>
                            {unreadCount > 0 && (
                                <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    onClick={handleMarkAllAsRead}
                                    disabled={markAllAsReadMutation.isPending}
                                >
                                    <CheckCheck className="size-4" />
                                </Button>
                            )}
                        </div>

                        {/* Search */}
                        <div className="relative">
                            <Search className="absolute left-2 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                            <Input
                                placeholder="Rechercher..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-8 h-8 text-xs"
                            />
                        </div>
                    </div>

                    {/* Tabs */}
                    <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)} className="border-b shrink-0">
                        <TabsList className="w-full grid grid-cols-3 rounded-none border-b-0 h-8">
                            <TabsTrigger value="all" className="text-xs">
                                Toutes
                            </TabsTrigger>
                            <TabsTrigger value="unread" className="text-xs">
                                Non lues
                                {unreadCount > 0 && (
                                    <Badge variant="destructive" className="ml-1 size-4 p-0 text-[10px]">
                                        {unreadCount}
                                    </Badge>
                                )}
                            </TabsTrigger>
                            <TabsTrigger value="read" className="text-xs">
                                Lues
                            </TabsTrigger>
                        </TabsList>
                    </Tabs>

                    {/* Notification List */}
                    <ScrollArea className="flex-1">
                        {isLoading ? (
                            <div className="divide-y">
                                {[...Array(5)].map((_, i) => (
                                    <div key={i} className="p-3">
                                        <div className="flex items-start gap-3">
                                            <Skeleton className="size-8 rounded-full" />
                                            <div className="flex-1 space-y-2">
                                                <Skeleton className="h-4 w-32" />
                                                <Skeleton className="h-3 w-full" />
                                                <Skeleton className="h-2 w-16" />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="divide-y">
                                {filteredNotifications.map((notification) => (
                                    <Card
                                        key={notification.id}
                                        className={`rounded-none border-0 border-b cursor-pointer hover:bg-muted/50 transition-colors ${
                                            !notification.read ? "bg-background" : "bg-muted/20"
                                        }`}
                                        onClick={() => {
                                            setSelectedNotification(notification);
                                            if (!notification.read) {
                                                handleMarkAsRead(notification.id);
                                            }
                                        }}
                                    >
                                        <CardContent className="p-3">
                                            <div className="flex items-start gap-3">
                                                <div className={`p-2 rounded-full shrink-0 ${
                                                    !notification.read
                                                        ? "bg-primary/10 text-primary"
                                                        : "bg-muted text-muted-foreground"
                                                }`}>
                                                    {getNotificationIcon(notification.type)}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-start justify-between gap-2 mb-1">
                                                        <h3 className={`text-sm font-medium truncate ${
                                                            !notification.read ? "font-semibold" : ""
                                                        }`}>
                                                            {notification.title}
                                                        </h3>
                                                        {!notification.read && (
                                                            <Circle className="size-2 text-primary shrink-0 mt-1.5" fill="currentColor" />
                                                        )}
                                                    </div>
                                                    <p className="text-xs text-muted-foreground line-clamp-2 mb-1">
                                                        {notification.message}
                                                    </p>
                                                    <p className="text-[10px] text-muted-foreground">
                                                        {notification.time}
                                                    </p>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                                {filteredNotifications.length === 0 && (
                                    <div className="p-8 text-center">
                                        <Bell className="size-12 mx-auto text-muted-foreground mb-2 opacity-50" />
                                        <p className="text-sm text-muted-foreground">Aucune notification</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </ScrollArea>
                </div>

                {/* Notification Detail - Right Side */}
                <div className="flex-1 flex items-center justify-center bg-muted/10">
                    {selectedNotification ? (
                        <div className="max-w-2xl w-full p-6">
                            <Card>
                                <CardContent className="p-6 space-y-4">
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-start gap-3">
                                            <div className={`p-3 rounded-full ${
                                                !selectedNotification.read
                                                    ? "bg-primary/10 text-primary"
                                                    : "bg-muted text-muted-foreground"
                                            }`}>
                                                {getNotificationIcon(selectedNotification.type)}
                                            </div>
                                            <div>
                                                <h2 className="text-xl font-bold mb-1">
                                                    {selectedNotification.title}
                                                </h2>
                                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                    <Clock className="size-4" />
                                                    <span>{selectedNotification.time}</span>
                                                    {selectedNotification.timestamp && (
                                                        <>
                                                            <span>•</span>
                                                            <span>{selectedNotification.timestamp}</span>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex gap-1">
                                            {!selectedNotification.read && (
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleMarkAsRead(selectedNotification.id)}
                                                    disabled={markAsReadMutation.isPending}
                                                >
                                                    <Check className="size-4" />
                                                </Button>
                                            )}
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleDelete(selectedNotification.id)}
                                                disabled={deleteMutation.isPending}
                                            >
                                                <Trash2 className="size-4" />
                                            </Button>
                                        </div>
                                    </div>

                                    <div className="border-t pt-4">
                                        <p className="text-sm text-muted-foreground leading-relaxed">
                                            {selectedNotification.message}
                                        </p>
                                    </div>

                                    {selectedNotification.details && Object.keys(selectedNotification.details).length > 0 && (
                                        <div className="border-t pt-4 space-y-2">
                                            <h3 className="font-medium text-sm">Détails</h3>
                                            <div className="space-y-1">
                                                {Object.entries(selectedNotification.details).map(([key, value]) => (
                                                    <div key={key} className="flex justify-between text-sm">
                                                        <span className="text-muted-foreground capitalize">
                                                            {key.replace(/([A-Z])/g, " $1").trim()}:
                                                        </span>
                                                        <span className="font-medium">{String(value)}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {selectedNotification.actionUrl && (
                                        <div className="border-t pt-4">
                                            <Button asChild className="w-full">
                                                <a href={selectedNotification.actionUrl}>
                                                    Aller à la page
                                                </a>
                                            </Button>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    ) : (
                        <div className="text-center">
                            <Bell className="size-16 mx-auto text-muted-foreground mb-4 opacity-30" />
                            <p className="text-muted-foreground">Sélectionnez une notification pour voir les détails</p>
                        </div>
                    )}
                </div>
            </div>

            <FloatingHelpButton />
        </div>
    );
}
