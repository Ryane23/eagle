"use client";

import { useState, useMemo } from "react";
import { DashboardHeader } from "@/components/layout/dashboard-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Bell,
  CheckCircle,
  Clock,
  AlertTriangle,
  Info,
  Trash2,
  Check,
  CheckCheck,
  Search,
  Circle,
} from "lucide-react";
import {
  useNotificationsQuery,
  useMarkNotificationAsRead,
  useMarkAllNotificationsAsRead,
  useDeleteNotification,
} from "@/hooks/queries";
import type { Notification as ApiNotification } from "@/types/api";

type NotificationDisplay = {
  id: string;
  type: "urgency" | "consultation" | "system" | "alert";
  title: string;
  message: string;
  time: string;
  timestamp?: string;
  isRead: boolean;
  actionUrl?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  details?: Record<string, unknown>;
};

function mapApiNotification(n: ApiNotification): NotificationDisplay {
  const typeMap: Record<string, NotificationDisplay["type"]> = {
    urgency_created: "urgency",
    urgency_validated: "urgency",
    urgency_assigned: "urgency",
    consultation_started: "consultation",
    consultation_completed: "consultation",
    prescription_created: "consultation",
    message_received: "alert",
    system: "system",
  };
  return {
    id: n.id,
    type: typeMap[n.type] || "system",
    title: n.title,
    message: n.message,
    time: new Date(n.createdAt).toLocaleString("fr-FR", { hour: "2-digit", minute: "2-digit", day: "2-digit", month: "2-digit" }),
    timestamp: n.createdAt,
    isRead: n.isRead,
    details: n.data as Record<string, unknown>,
  };
}

const getNotificationIcon = (type: NotificationDisplay["type"]) => {
  switch (type) {
    case "urgency":
      return <AlertTriangle className="size-4" />;
    case "consultation":
      return <CheckCircle className="size-4" />;
    case "system":
      return <Info className="size-4" />;
    case "alert":
      return <Clock className="size-4" />;
  }
};

export default function NotificationsPage() {
  const { data: apiNotifications = [], isLoading } = useNotificationsQuery();
  const markAsReadMutation = useMarkNotificationAsRead();
  const markAllAsReadMutation = useMarkAllNotificationsAsRead();
  const deleteNotificationMutation = useDeleteNotification();
  const notifications = useMemo(() => apiNotifications.map(mapApiNotification), [apiNotifications]);
  const [filter, setFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedNotification, setSelectedNotification] = useState<NotificationDisplay | null>(null);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const filteredNotifications = notifications.filter((n) => {
    const matchesFilter =
      filter === "all" || (filter === "unread" && !n.isRead) || (filter === "read" && n.isRead);
    const matchesSearch =
      n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.message.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const markAsRead = (id: string) => {
    markAsReadMutation.mutate(id);
  };

  const markAllAsRead = () => {
    markAllAsReadMutation.mutate();
  };

  const deleteNotification = (id: string) => {
    deleteNotificationMutation.mutate(id);
  };

  return (
    <div className="flex flex-col h-full">
      <DashboardHeader
        breadcrumbs={[
          { label: "Tableau de bord", href: "/dashboard/secondary" },
          { label: "Notifications" },
        ]}
      />

      <div className="flex-1 flex overflow-hidden">
        {/* Notification List - Left Side */}
        <div className="w-96 border-r bg-muted/30 flex flex-col min-h-0">
          {/* Header */}
          <div className="p-3 border-b flex-shrink-0">
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
                <Button variant="ghost" size="sm" onClick={markAllAsRead}>
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
          <Tabs value={filter} onValueChange={setFilter} className="border-b flex-shrink-0">
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
            <div className="divide-y">
              {filteredNotifications.map((notification) => (
                <Card
                  key={notification.id}
                  className={`rounded-none border-0 border-b cursor-pointer hover:bg-muted/50 transition-colors ${
                    !notification.isRead ? "bg-background" : "bg-muted/20"
                  }`}
                  onClick={() => {
                    setSelectedNotification(notification);
                    if (!notification.isRead) {
                      markAsRead(notification.id);
                    }
                  }}
                >
                  <CardContent className="p-3">
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-full flex-shrink-0 ${
                        !notification.isRead 
                          ? "bg-primary/10 text-primary" 
                          : "bg-muted text-muted-foreground"
                      }`}>
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <h3 className={`text-sm font-medium truncate ${
                            !notification.isRead ? "font-semibold" : ""
                          }`}>
                            {notification.title}
                          </h3>
                          {!notification.isRead && (
                            <Circle className="size-2 text-primary flex-shrink-0 mt-1.5" fill="currentColor" />
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
                        !selectedNotification.isRead 
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
                      {!selectedNotification.isRead && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => markAsRead(selectedNotification.id)}
                        >
                          <Check className="size-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteNotification(selectedNotification.id)}
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

                  {selectedNotification.details && (
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
    </div>
  );
}
