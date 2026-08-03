"use client";

import { useState } from "react";
import { DashboardHeader } from "@/components/layout/dashboard-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import {
  Bell,
  Clock,
  ShieldAlert,
  Building,
  Calendar,
  MessageSquare,
  FileText,
  Trash2,
  Check,
  CheckCheck,
  Search,
  Circle,
} from "lucide-react";

type NotificationType = "validation" | "request" | "center" | "system" | "message" | "schedule";

type Notification = {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp?: string;
  time: string;
  read: boolean;
  priority?: "normal" | "urgent";
  centerName?: string;
  actionUrl?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  details?: Record<string, any>;
};

const mockNotifications: Notification[] = [
  {
    id: "notif-1",
    type: "validation",
    title: "Nouvelle demande d'urgence à valider",
    message: "Le patient Kamga Jean nécessite une validation de niveau d'urgence 4",
    timestamp: "2025-01-15 10:25",
    time: "Il y a 5 min",
    read: false,
    priority: "urgent",
    centerName: "CSJ-YDE",
    actionUrl: "/dashboard/primary/validation",
    details: {
      patient: "Kamga Jean",
      urgencyLevel: 4,
      center: "CSJ-YDE"
    }
  },
  {
    id: "notif-2",
    type: "center",
    title: "Centre hors ligne",
    message: "Le centre HD-BAF est actuellement hors ligne depuis 32 minutes",
    timestamp: "2025-01-15 09:45",
    time: "Il y a 10 min",
    read: false,
    priority: "urgent",
    centerName: "HD-BAF",
    actionUrl: "/dashboard/primary/centers",
    details: {
      center: "HD-BAF",
      downtime: "32 minutes"
    }
  },
  {
    id: "notif-3",
    type: "request",
    title: "Nouvelle demande reçue",
    message: "Une demande de consultation a été soumise pour le patient Mbarga Marie",
    timestamp: "2025-01-15 10:32",
    time: "Il y a 15 min",
    read: false,
    priority: "normal",
    centerName: "CM-LIM",
    actionUrl: "/dashboard/primary/requests",
    details: {
      patient: "Mbarga Marie",
      center: "CM-LIM"
    }
  },
  {
    id: "notif-4",
    type: "schedule",
    title: "Conflit de planning détecté",
    message: "Conflit détecté entre Dr. Nana et Dr. Fouda le Mercredi à 09:00",
    timestamp: "2025-01-15 09:30",
    time: "Il y a 30 min",
    read: false,
    priority: "normal",
    actionUrl: "/dashboard/primary/schedule",
    details: {
      doctors: "Dr. Nana, Dr. Fouda",
      date: "Mercredi",
      time: "09:00"
    }
  },
  {
    id: "notif-5",
    type: "message",
    title: "Nouveau message",
    message: "Vous avez reçu un message de Dr. Tamo concernant une demande de transfert",
    timestamp: "2025-01-15 08:45",
    time: "Il y a 45 min",
    read: true,
    priority: "normal",
    actionUrl: "/dashboard/primary/messages"
  },
  {
    id: "notif-6",
    type: "system",
    title: "Mise à jour système",
    message: "Le système a été mis à jour avec de nouvelles fonctionnalités de gestion",
    timestamp: "2025-01-14 18:00",
    time: "Hier",
    read: true,
    priority: "normal",
  },
  {
    id: "notif-7",
    type: "center",
    title: "Alerte de performance",
    message: "Le centre CM-LIM a un temps d'attente moyen supérieur à 30 minutes",
    timestamp: "2025-01-15 10:15",
    time: "Il y a 1h",
    read: false,
    priority: "normal",
    centerName: "CM-LIM",
    actionUrl: "/dashboard/primary/stats",
    details: {
      center: "CM-LIM",
      waitTime: "30+ minutes"
    }
  },
  {
    id: "notif-8",
    type: "validation",
    title: "Urgence validée",
    message: "Le niveau d'urgence du patient Fouda Alice a été validé avec succès",
    timestamp: "2025-01-15 08:30",
    time: "Il y a 2h",
    read: true,
    priority: "normal",
    centerName: "HDB-BON",
    details: {
      patient: "Fouda Alice",
      center: "HDB-BON"
    }
  },
];

const getNotificationIcon = (type: NotificationType) => {
  switch (type) {
    case "validation":
      return <ShieldAlert className="size-4" />;
    case "request":
      return <FileText className="size-4" />;
    case "center":
      return <Building className="size-4" />;
    case "schedule":
      return <Calendar className="size-4" />;
    case "message":
      return <MessageSquare className="size-4" />;
    case "system":
      return <Bell className="size-4" />;
  }
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState(mockNotifications);
  const [activeTab, setActiveTab] = useState<"all" | "unread" | "read">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);

  const filteredNotifications = notifications.filter((notif) => {
    const matchesTab =
      activeTab === "all" || (activeTab === "unread" && !notif.read) || (activeTab === "read" && notif.read);
    const matchesSearch =
      notif.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      notif.message.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleMarkAsRead = (id: string) => {
    setNotifications(notifications.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const handleMarkAllAsRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, read: true })));
  };

  const handleDelete = (id: string) => {
    setNotifications(notifications.filter((n) => n.id !== id));
  };

  return (
    <div className="flex flex-col h-full">
      <DashboardHeader breadcrumbs={[{ label: "Notifications" }]} />

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
                <Button variant="ghost" size="sm" onClick={handleMarkAllAsRead}>
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
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)} className="border-b flex-shrink-0">
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
                      <div className={`p-2 rounded-full flex-shrink-0 ${
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
                        >
                          <Check className="size-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(selectedNotification.id)}
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
