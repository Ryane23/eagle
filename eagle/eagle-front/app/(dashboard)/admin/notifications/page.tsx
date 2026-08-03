"use client";

import { useMemo, useState } from "react";
import { DashboardHeader } from "@/components/layout/dashboard-header";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
    AlertCircle,
    Bell,
    Check,
    CheckCheck,
    Send,
    Search,
    Trash2,
} from "lucide-react";
import {
    useDeleteNotification,
    useMarkAllNotificationsAsRead,
    useMarkNotificationAsRead,
    useNotificationsQuery,
    useSendNotifications,
    useUsersQuery,
} from "@/hooks/queries";
import { parseApiDate } from "@/lib/utils";
import type { CreateNotificationDto, UserRole } from "@/types/api";

type NotificationFilter = "all" | "unread" | "read";
type ComposerType = "alert" | "message";

const roleLabels: Record<UserRole, string> = {
    admin: "Administrateur",
    primary_secretary: "Secrétaire principal",
    secondary_secretary: "Secrétaire secondaire",
    doctor: "Médecin",
    nurse: "Infirmier",
};

export default function AdminNotificationsPage() {
    const [filter, setFilter] = useState<NotificationFilter>("all");
    const [search, setSearch] = useState("");
    const [composerOpen, setComposerOpen] = useState(false);
    const [recipientSearch, setRecipientSearch] = useState("");
    const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
    const [composerType, setComposerType] = useState<ComposerType>("alert");
    const [title, setTitle] = useState("");
    const [message, setMessage] = useState("");
    const { data: notifications = [], isLoading, error } = useNotificationsQuery();
    const { data: users = [], isLoading: areUsersLoading } = useUsersQuery({
        status: "active",
    });
    const markAsRead = useMarkNotificationAsRead();
    const markAllAsRead = useMarkAllNotificationsAsRead();
    const deleteNotification = useDeleteNotification();
    const sendNotifications = useSendNotifications();

    const unreadCount = notifications.filter((notification) => !notification.isRead).length;
    const visibleNotifications = useMemo(() => {
        const query = search.trim().toLowerCase();
        return notifications.filter((notification) => {
            const matchesFilter =
                filter === "all" ||
                (filter === "unread" && !notification.isRead) ||
                (filter === "read" && notification.isRead);
            const matchesSearch =
                !query ||
                notification.title.toLowerCase().includes(query) ||
                notification.message.toLowerCase().includes(query);
            return matchesFilter && matchesSearch;
        });
    }, [filter, notifications, search]);
    const visibleUsers = useMemo(() => {
        const query = recipientSearch.trim().toLowerCase();
        return users.filter(
            (user) =>
                !query ||
                user.name.toLowerCase().includes(query) ||
                user.email.toLowerCase().includes(query) ||
                roleLabels[user.role].toLowerCase().includes(query)
        );
    }, [recipientSearch, users]);

    const resetComposer = () => {
        setRecipientSearch("");
        setSelectedUserIds([]);
        setComposerType("alert");
        setTitle("");
        setMessage("");
    };

    const submitNotification = () => {
        if (selectedUserIds.length === 0 || !title.trim() || !message.trim()) {
            return;
        }
        const data: CreateNotificationDto = {
            type: composerType,
            title: title.trim(),
            message: message.trim(),
        };
        sendNotifications.mutate(
            { userIds: selectedUserIds, data },
            {
                onSuccess: () => {
                    setComposerOpen(false);
                    resetComposer();
                },
            }
        );
    };

    const formatDateTime = (value: unknown) => {
        const date = parseApiDate(value);
        return date
            ? new Intl.DateTimeFormat("fr-FR", {
                dateStyle: "medium",
                timeStyle: "short",
            }).format(date)
            : "Date indisponible";
    };

    return (
        <div className="flex h-full flex-col">
            <DashboardHeader
                breadcrumbs={[
                    { label: "Administration", href: "/admin" },
                    { label: "Notifications" },
                ]}
                actions={
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={unreadCount === 0 || markAllAsRead.isPending}
                            onClick={() => markAllAsRead.mutate()}
                        >
                            <CheckCheck className="mr-2 size-4" />
                            Tout marquer comme lu
                        </Button>
                        <Button size="sm" onClick={() => setComposerOpen(true)}>
                            <Send className="mr-2 size-4" />
                            Envoyer
                        </Button>
                    </div>
                }
            />
            <main className="flex-1 space-y-4 overflow-auto p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                            placeholder="Rechercher une notification"
                            className="pl-9"
                        />
                    </div>
                    <Tabs
                        value={filter}
                        onValueChange={(value) => setFilter(value as NotificationFilter)}
                    >
                        <TabsList>
                            <TabsTrigger value="all">Toutes</TabsTrigger>
                            <TabsTrigger value="unread">
                                Non lues
                                {unreadCount > 0 && (
                                    <Badge variant="destructive" className="ml-2">
                                        {unreadCount}
                                    </Badge>
                                )}
                            </TabsTrigger>
                            <TabsTrigger value="read">Lues</TabsTrigger>
                        </TabsList>
                    </Tabs>
                </div>

                {error ? (
                    <Alert variant="destructive">
                        <AlertCircle className="size-4" />
                        <AlertTitle>Notifications indisponibles</AlertTitle>
                        <AlertDescription>{error.message}</AlertDescription>
                    </Alert>
                ) : isLoading ? (
                    <div className="space-y-3">
                        {[1, 2, 3, 4].map((item) => (
                            <Skeleton key={item} className="h-24 w-full" />
                        ))}
                    </div>
                ) : visibleNotifications.length === 0 ? (
                    <Card>
                        <CardContent className="py-12 text-center text-muted-foreground">
                            <Bell className="mx-auto mb-3 size-8 opacity-50" />
                            <p>Aucune notification correspondante.</p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-2">
                        {visibleNotifications.map((notification) => (
                            <Card key={notification.id}>
                                <CardContent className="flex gap-3 p-4">
                                    <div className="mt-0.5 shrink-0">
                                        <Bell
                                            className={
                                                notification.isRead
                                                    ? "size-5 text-muted-foreground"
                                                    : "size-5 text-primary"
                                            }
                                        />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <p className="font-medium">{notification.title}</p>
                                            {!notification.isRead && <Badge>Nouvelle</Badge>}
                                            <Badge variant="outline">{notification.type}</Badge>
                                        </div>
                                        <p className="mt-1 text-sm text-muted-foreground">
                                            {notification.message}
                                        </p>
                                        <time className="mt-2 block text-xs text-muted-foreground">
                                            {formatDateTime(notification.createdAt)}
                                        </time>
                                    </div>
                                    <div className="flex shrink-0 gap-1">
                                        {!notification.isRead && (
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                title="Marquer comme lue"
                                                disabled={markAsRead.isPending}
                                                onClick={() => markAsRead.mutate(notification.id)}
                                            >
                                                <Check className="size-4" />
                                            </Button>
                                        )}
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            title="Supprimer"
                                            className="text-destructive"
                                            disabled={deleteNotification.isPending}
                                            onClick={() => deleteNotification.mutate(notification.id)}
                                        >
                                            <Trash2 className="size-4" />
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </main>

            <Dialog
                open={composerOpen}
                onOpenChange={(open) => {
                    setComposerOpen(open);
                    if (!open && !sendNotifications.isPending) resetComposer();
                }}
            >
                <DialogContent className="max-h-[calc(100vh-2rem)] w-[calc(100%-2rem)] overflow-y-auto sm:max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Envoyer une notification</DialogTitle>
                        <DialogDescription>
                            Sélectionnez les destinataires puis rédigez une alerte ou un message.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid min-w-0 gap-5 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
                        <div className="min-w-0 space-y-3">
                            <div className="flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:justify-between">
                                <Label>Destinataires</Label>
                                <Badge variant="secondary">
                                    {selectedUserIds.length} sélectionné
                                    {selectedUserIds.length > 1 ? "s" : ""}
                                </Badge>
                            </div>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    value={recipientSearch}
                                    onChange={(event) => setRecipientSearch(event.target.value)}
                                    placeholder="Nom, email ou rôle"
                                    className="pl-9"
                                />
                            </div>
                            <ScrollArea className="h-64 min-w-0 border">
                                <div className="divide-y">
                                    {areUsersLoading ? (
                                        <div className="space-y-2 p-3">
                                            {[1, 2, 3].map((item) => (
                                                <Skeleton key={item} className="h-10 w-full" />
                                            ))}
                                        </div>
                                    ) : visibleUsers.length === 0 ? (
                                        <p className="p-4 text-center text-sm text-muted-foreground">
                                            Aucun utilisateur trouvé.
                                        </p>
                                    ) : (
                                        visibleUsers.map((user) => {
                                            const checked = selectedUserIds.includes(user.id);
                                            return (
                                                <label
                                                    key={user.id}
                                                    className="flex w-full min-w-0 cursor-pointer items-start gap-3 overflow-hidden p-3 hover:bg-muted/50"
                                                >
                                                    <Checkbox
                                                        checked={checked}
                                                        onCheckedChange={(nextChecked) =>
                                                            setSelectedUserIds((current) =>
                                                                nextChecked
                                                                    ? [...current, user.id]
                                                                    : current.filter(
                                                                        (id) => id !== user.id
                                                                    )
                                                            )
                                                        }
                                                    />
                                                    <span className="min-w-0 flex-1 overflow-hidden">
                                                        <span className="block truncate text-sm font-medium">
                                                            {user.name}
                                                        </span>
                                                        <span className="block truncate text-xs text-muted-foreground">
                                                            {roleLabels[user.role]}
                                                            {" · "}
                                                            {user.hospital?.name ?? user.email}
                                                        </span>
                                                    </span>
                                                </label>
                                            );
                                        })
                                    )}
                                </div>
                            </ScrollArea>
                        </div>

                        <div className="min-w-0 space-y-4">
                            <div className="space-y-2">
                                <Label>Type</Label>
                                <Select
                                    value={composerType}
                                    onValueChange={(value) =>
                                        setComposerType(value as ComposerType)
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="alert">Avertissement</SelectItem>
                                        <SelectItem value="message">Message</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="notification-title">Titre</Label>
                                <Input
                                    id="notification-title"
                                    value={title}
                                    maxLength={200}
                                    onChange={(event) => setTitle(event.target.value)}
                                    placeholder="Titre de la notification"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="notification-message">Message</Label>
                                <Textarea
                                    id="notification-message"
                                    value={message}
                                    maxLength={1000}
                                    rows={7}
                                    onChange={(event) => setMessage(event.target.value)}
                                    placeholder="Rédigez votre message"
                                />
                                <p className="text-right text-xs text-muted-foreground">
                                    {message.length}/1000
                                </p>
                            </div>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button
                            variant="outline"
                            disabled={sendNotifications.isPending}
                            onClick={() => setComposerOpen(false)}
                        >
                            Annuler
                        </Button>
                        <Button
                            disabled={
                                sendNotifications.isPending ||
                                selectedUserIds.length === 0 ||
                                !title.trim() ||
                                !message.trim()
                            }
                            onClick={submitNotification}
                        >
                            <Send className="mr-2 size-4" />
                            {sendNotifications.isPending
                                ? "Envoi..."
                                : `Envoyer (${selectedUserIds.length})`}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
