"use client";

import { useState, useCallback, useMemo } from "react";
import { DashboardHeader } from "@/components/layout/dashboard-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Bell,
    CheckCircle,
    Clock,
    AlertTriangle,
    Video,
    User,
    Trash2,
    Check,
    CheckCheck,
    Search,
    Circle,
    RefreshCw,
    ExternalLink,
} from "lucide-react";
import {
    useNotificationsQuery,
    useUnreadCountQuery,
    useMarkNotificationAsRead,
    useMarkAllNotificationsAsRead,
    useDeleteNotification,
} from "@/hooks/queries";
import type { Notification } from "@/types/api";
import { toast } from "sonner";

const getNotificationIcon = (type: string) => {
    switch (type) {
        case "consultation":
            return <Video className="size-4" />;
        case "urgency":
            return <AlertTriangle className="size-4" />;
        case "patient":
            return <User className="size-4" />;
        case "system":
            return <CheckCircle className="size-4" />;
        case "reminder":
            return <Clock className="size-4" />;
        default:
            return <Bell className="size-4" />;
    }
};

const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMinutes = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMinutes < 1) return "À l'instant";
    if (diffMinutes < 60) return `Il y a ${diffMinutes} min`;
    if (diffHours < 24) return `Il y a ${diffHours}h`;
    if (diffDays < 7) return `Il y a ${diffDays}j`;
    return date.toLocaleDateString("fr-FR");
};

export default function NotificationsPage() {
    const [filter, setFilter] = useState("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
    const [detailsOpen, setDetailsOpen] = useState(false);

    // TanStack Query
    const { data: notifications = [], isLoading, error, refetch } = useNotificationsQuery();
    const unreadCount = useUnreadCountQuery();
    const markAsReadMutation = useMarkNotificationAsRead();
    const markAllAsReadMutation = useMarkAllNotificationsAsRead();
    const deleteMutation = useDeleteNotification();

    // Client-side filtering with useMemo
    const filteredNotifications = useMemo(() => {
        return notifications.filter((n) => {
            const matchesFilter =
                filter === "all" || (filter === "unread" && !n.isRead) || (filter === "read" && n.isRead);
            const matchesSearch =
                n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                n.message.toLowerCase().includes(searchQuery.toLowerCase());
            return matchesFilter && matchesSearch;
        });
    }, [notifications, filter, searchQuery]);

    const handleMarkAsRead = useCallback(
        (id: string) => {
            markAsReadMutation.mutate(id);
        },
        [markAsReadMutation]
    );

    const handleMarkAllAsRead = useCallback(() => {
        markAllAsReadMutation.mutate();
    }, [markAllAsReadMutation]);

    const handleDelete = useCallback(
        (id: string) => {
            deleteMutation.mutate(id);
        },
        [deleteMutation]
    );

    const handleRefresh = useCallback(() => {
        refetch();
        toast.success("Notifications actualisées");
    }, [refetch]);

    const handleViewDetails = useCallback((notification: Notification) => {
        setSelectedNotification(notification);
        setDetailsOpen(true);
        if (!notification.isRead) {
            markAsReadMutation.mutate(notification.id);
        }
    }, [markAsReadMutation]);

    if (error) {
        return (
            <div className="flex flex-col h-full">
                <DashboardHeader
                    breadcrumbs={[
                        { label: "Tableau de bord", href: "/dashboard/doctor" },
                        { label: "Notifications" },
                    ]}
                />
                <div className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                        <AlertTriangle className="size-12 mx-auto text-red-500 mb-4" />
                        <p className="text-lg font-medium text-red-600">{error.message}</p>
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
                    { label: "Notifications" },
                ]}
                actions={
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={handleRefresh}>
                            <RefreshCw className="size-4 mr-2" />
                            Actualiser
                        </Button>
                        {unreadCount > 0 && (
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={handleMarkAllAsRead}
                                disabled={markAllAsReadMutation.isPending}
                            >
                                <CheckCheck className="size-4 mr-1.5" />
                                Tout marquer lu
                            </Button>
                        )}
                    </div>
                }
            />

            <div className="flex-1 p-4 space-y-4 overflow-y-auto">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-xl font-bold text-primary flex items-center gap-2">
                            <Bell className="size-5" />
                            Notifications
                            {unreadCount > 0 && (
                                <Badge variant="destructive" className="ml-2">
                                    {unreadCount}
                                </Badge>
                            )}
                        </h1>
                        <p className="text-xs text-muted-foreground">
                            Consultez vos alertes et messages
                        </p>
                    </div>
                </div>

                {/* Filters */}
                <Card>
                    <CardContent className="p-3">
                        <div className="flex items-center gap-2">
                            <div className="relative flex-1">
                                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                                <Input
                                    placeholder="Rechercher dans les notifications..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-9 h-9"
                                />
                            </div>
                            <Tabs value={filter} onValueChange={setFilter}>
                                <TabsList className="h-9">
                                    <TabsTrigger value="all" className="text-xs">
                                        Toutes
                                    </TabsTrigger>
                                    <TabsTrigger value="unread" className="text-xs">
                                        Non lues
                                    </TabsTrigger>
                                    <TabsTrigger value="read" className="text-xs">
                                        Lues
                                    </TabsTrigger>
                                </TabsList>
                            </Tabs>
                        </div>
                    </CardContent>
                </Card>

                {/* Notifications List */}
                <Card>
                    <CardContent className="p-0">
                        <ScrollArea className="h-[calc(100vh-320px)]">
                            {isLoading ? (
                                <div className="p-4 space-y-3">
                                    {[...Array(5)].map((_, i) => (
                                        <div key={i} className="flex gap-3 p-3">
                                            <Skeleton className="size-10 rounded-full" />
                                            <div className="flex-1 space-y-2">
                                                <Skeleton className="h-4 w-48" />
                                                <Skeleton className="h-3 w-64" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="divide-y">
                                    {filteredNotifications.map((notification) => (
                                        <div
                                            key={notification.id}
                                            className={`p-3 hover:bg-muted/50 cursor-pointer transition-colors ${!notification.isRead ? "bg-blue-50/50" : ""
                                                }`}
                                            onClick={() => handleViewDetails(notification)}
                                        >
                                            <div className="flex items-start gap-3">
                                                <div
                                                    className={`p-2 rounded-full shrink-0 ${notification.type.startsWith("urgency")
                                                        ? "bg-red-100 text-red-600"
                                                        : notification.type.startsWith("consultation")
                                                            ? "bg-blue-100 text-blue-600"
                                                            : "bg-gray-100 text-gray-600"
                                                        }`}
                                                >
                                                    {getNotificationIcon(notification.type)}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2">
                                                        {!notification.isRead && (
                                                            <Circle className="size-2 fill-blue-500 text-blue-500 shrink-0" />
                                                        )}
                                                        <p className="font-medium text-sm truncate">
                                                            {notification.title}
                                                        </p>
                                                    </div>
                                                    <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                                                        {notification.message}
                                                    </p>
                                                    <p className="text-[10px] text-muted-foreground mt-1">
                                                        {formatTimeAgo(notification.createdAt)}
                                                    </p>
                                                </div>
                                                <div className="flex items-center gap-1 shrink-0">
                                                    {!notification.isRead && (
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="size-8"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleMarkAsRead(notification.id);
                                                            }}
                                                        >
                                                            <Check className="size-4" />
                                                        </Button>
                                                    )}
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="size-8 text-red-500 hover:text-red-600"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleDelete(notification.id);
                                                        }}
                                                    >
                                                        <Trash2 className="size-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    {filteredNotifications.length === 0 && !isLoading && (
                                        <div className="p-8 text-center">
                                            <Bell className="size-12 mx-auto text-muted-foreground mb-2 opacity-50" />
                                            <p className="text-sm text-muted-foreground">
                                                Aucune notification
                                            </p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </ScrollArea>
                    </CardContent>
                </Card>
            </div>

            {/* Details Modal */}
            <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            {selectedNotification && getNotificationIcon(selectedNotification.type)}
                            {selectedNotification?.title}
                        </DialogTitle>
                        <DialogDescription>
                            {selectedNotification && formatTimeAgo(selectedNotification.createdAt)}
                        </DialogDescription>
                    </DialogHeader>
                    {selectedNotification && (
                        <div className="space-y-4">
                            <p className="text-sm">{selectedNotification.message}</p>
                            {selectedNotification.data &&
                                typeof selectedNotification.data === "object" &&
                                "actionUrl" in selectedNotification.data &&
                                typeof selectedNotification.data.actionUrl === "string" && (
                                    <a
                                        href={selectedNotification.data.actionUrl}
                                        className="flex items-center gap-2 text-sm text-blue-600 hover:underline"
                                    >
                                        <ExternalLink className="size-4" />
                                        Voir les détails
                                    </a>
                                )}
                            <div className="flex gap-2 pt-2">
                                <Button
                                    variant="outline"
                                    className="flex-1"
                                    onClick={() => {
                                        handleDelete(selectedNotification.id);
                                        setDetailsOpen(false);
                                    }}
                                >
                                    <Trash2 className="size-4 mr-1.5" />
                                    Supprimer
                                </Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
