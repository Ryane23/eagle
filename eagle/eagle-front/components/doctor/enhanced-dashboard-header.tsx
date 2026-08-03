"use client";

import Link from "next/link";
import { useState, useEffect, useSyncExternalStore } from "react";
import { Search, Bell, Moon, Sun, Power, PowerOff } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useTheme } from "next-themes";
import { useNotificationsQuery, useUnreadCountQuery } from "@/hooks/queries";

type EnhancedDashboardHeaderProps = {
    doctorName: string;
    specialty: string;
    clinic: string;
};

function formatTimeAgo(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    const diffH = Math.floor(diffMin / 60);
    const diffD = Math.floor(diffH / 24);
    if (diffMin < 1) return "À l'instant";
    if (diffMin < 60) return `Il y a ${diffMin} min`;
    if (diffH < 24) return `Il y a ${diffH}h`;
    if (diffD < 7) return `Il y a ${diffD}j`;
    return date.toLocaleDateString("fr-FR");
}

const emptySubscribe = () => () => {};

export function EnhancedDashboardHeader({ doctorName, specialty, clinic }: EnhancedDashboardHeaderProps) {
    const [currentTime, setCurrentTime] = useState(new Date());
    const mounted = useSyncExternalStore(emptySubscribe, () => true, () => false);
    const [isConnected, setIsConnected] = useState(true);
    const { theme, setTheme } = useTheme();
    const unreadCount = useUnreadCountQuery();
    const { data: notifications = [] } = useNotificationsQuery(undefined, { staleTime: 60 * 1000 });
    const recentNotifications = notifications.slice(0, 5);

    // Live clock
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    const formatDate = (date: Date) => {
        return new Intl.DateTimeFormat('fr-FR', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        }).format(date);
    };

    const formatTime = (date: Date) => {
        return new Intl.DateTimeFormat('fr-FR', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        }).format(date);
    };

    return (
        <header className="flex h-16 shrink-0 items-center gap-2 border-b bg-background px-4 font-sans">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />

            <div className="flex flex-col flex-1">
                <h1 className="text-sm font-semibold">Tableau de Bord - {doctorName}</h1>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span>{specialty}</span>
                    <Separator orientation="vertical" className="h-3" />
                    <span>{clinic}</span>
                    <Separator orientation="vertical" className="h-3" />
                    <span className="flex items-center gap-1">
                        <span className={`size-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-gray-400'}`} />
                        {isConnected ? 'Connecté' : 'Hors ligne'}
                    </span>
                </div>
            </div>

            <div className="ml-auto flex items-center gap-4">
                {/* Date and Time */}
                <div className="hidden lg:flex flex-col items-end text-xs">
                    {mounted ? (
                        <>
                            <span className="font-medium text-foreground">{formatTime(currentTime)}</span>
                            <span className="text-muted-foreground">{formatDate(currentTime)}</span>
                        </>
                    ) : (
                        <>
                            <span className="font-medium text-foreground">--:--:--</span>
                            <span className="text-muted-foreground">--</span>
                        </>
                    )}
                </div>

                <Separator orientation="vertical" className="h-8 hidden lg:block" />

                {/* Search */}
                <div className="relative hidden xl:block">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="Rechercher un patient..."
                        className="w-64 pl-9 bg-muted/50"
                    />
                </div>

                <Button variant="ghost" size="icon" className="xl:hidden">
                    <Search className="size-5" />
                </Button>

                {/* Connection Toggle */}
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsConnected(!isConnected)}
                    className="hidden md:inline-flex"
                >
                    {isConnected ? (
                        <Power className="size-5 text-green-500" />
                    ) : (
                        <PowerOff className="size-5 text-gray-400" />
                    )}
                </Button>

                {/* Dark/Light Mode Toggle */}
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                >
                    <Sun className="size-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                    <Moon className="absolute size-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                </Button>

                {/* Notifications */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="relative">
                            <Bell className="size-5" />
                            {unreadCount > 0 && (
                                <Badge className="absolute -top-1 -right-1 size-5 justify-center p-0 text-xs bg-red-500">
                                    {unreadCount}
                                </Badge>
                            )}
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-80">
                        <DropdownMenuLabel className="flex items-center justify-between">
                            Notifications
                            {unreadCount > 0 && (
                                <Badge variant="secondary" className="text-xs">
                                    {unreadCount} nouvelles
                                </Badge>
                            )}
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        {recentNotifications.length === 0 ? (
                            <DropdownMenuItem disabled className="text-muted-foreground">
                                Aucune notification
                            </DropdownMenuItem>
                        ) : (
                            recentNotifications.map((n) => (
                                <DropdownMenuItem key={n.id} asChild>
                                    <Link href="/dashboard/doctor/notifications" className="flex flex-col items-start gap-1 p-3">
                                        <div className="flex items-center gap-2">
                                            {!n.isRead && <span className="size-2 rounded-full bg-red-500 shrink-0" />}
                                            <span className="font-medium text-sm">{n.title}</span>
                                        </div>
                                        <span className="text-xs text-muted-foreground">{formatTimeAgo(n.createdAt)}</span>
                                    </Link>
                                </DropdownMenuItem>
                            ))
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                            <Link href="/dashboard/doctor/notifications" className="justify-center text-primary">
                                Voir toutes les notifications
                            </Link>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>

                {/* Doctor Avatar */}
                <Avatar className="size-9">
                    <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                        {doctorName.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                    </AvatarFallback>
                </Avatar>
            </div>
        </header>
    );
}


