"use client";

import { useState, useEffect, useSyncExternalStore } from "react";
import { Search, Bell, Moon, Sun, Power, PowerOff, Wifi, WifiOff, Settings } from "lucide-react";
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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useWorkflowContextQuery, useUnreadNotificationsQuery } from "@/hooks/queries";
import { useAuthStore } from "@/stores/auth-store";

type EnhancedNurseDashboardHeaderProps = {
    nurseName?: string;
    clinic?: string;
    clinicCode?: string;
    clinicType?: string;
};

const emptySubscribe = () => () => {};

export function EnhancedNurseDashboardHeader({ 
    nurseName, 
    clinic, 
    clinicCode,
    clinicType 
}: EnhancedNurseDashboardHeaderProps) {
    const [currentTime, setCurrentTime] = useState(new Date());
    const [isConnected, setIsConnected] = useState(true);
    const mounted = useSyncExternalStore(emptySubscribe, () => true, () => false);
    const { theme, setTheme } = useTheme();
    const authUser = useAuthStore((state) => state.user);
    const { data: context, isLoading: contextLoading } = useWorkflowContextQuery();
    const { data: unreadNotifications = [] } = useUnreadNotificationsQuery();
    const displayName =
        context?.user.name || authUser?.name || nurseName || "Infirmier(ère)";
    const displayClinic =
        context?.hospital?.name ||
        clinic ||
        (contextLoading ? "Chargement du centre..." : "Centre non assigné");
    const displayCode = context?.hospital?.code || clinicCode;
    const displayType = context?.hospital?.type || clinicType;
    const unreadCount = unreadNotifications.length;

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
        <>
            {!isConnected && (
                <Alert className="border-orange-500 bg-orange-50 dark:bg-orange-950/20 m-4">
                    <WifiOff className="h-4 w-4 text-orange-500" />
                    <AlertDescription className="text-orange-900 dark:text-orange-100">
                        Vous êtes hors ligne. Certaines fonctionnalités peuvent être limitées.
                    </AlertDescription>
                </Alert>
            )}
            <header className="flex h-16 shrink-0 items-center gap-2 border-b bg-background px-4 font-sans">
                <SidebarTrigger className="-ml-1" />
                <Separator orientation="vertical" className="mr-2 h-4" />

                <div className="flex flex-col flex-1">
                    <h1 className="text-sm font-semibold">Tableau de Bord - {displayName}</h1>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span>{displayClinic}</span>
                        {displayCode && (
                            <>
                                <Separator orientation="vertical" className="h-3" />
                                <span>Code: {displayCode}</span>
                            </>
                        )}
                        {displayType && (
                            <>
                                <Separator orientation="vertical" className="h-3" />
                                <span>{displayType}</span>
                            </>
                        )}
                        <Separator orientation="vertical" className="h-3" />
                        <span className="flex items-center gap-1">
                            {isConnected ? (
                                <Wifi className="size-3 text-green-500" />
                            ) : (
                                <WifiOff className="size-3 text-gray-400" />
                            )}
                            {isConnected ? 'En ligne' : 'Hors ligne'}
                        </span>
                    </div>
                </div>

                <div className="ml-auto flex items-center gap-4">
                    {/* Date and Time */}
                    {mounted && (
                        <div className="hidden lg:flex flex-col items-end text-xs">
                            <span className="font-medium text-foreground">{formatTime(currentTime)}</span>
                            <span className="text-muted-foreground">{formatDate(currentTime)}</span>
                        </div>
                    )}
                    {!mounted && (
                        <div className="hidden lg:flex flex-col items-end text-xs">
                            <span className="font-medium text-foreground">--:--:--</span>
                            <span className="text-muted-foreground">--</span>
                        </div>
                    )}

                    <Separator orientation="vertical" className="h-8 hidden lg:block" />

                    {/* Search */}
                    <div className="relative hidden xl:block">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                        <Input
                            type="search"
                            placeholder="Rechercher un patient, consultation..."
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
                        title={isConnected ? "Déconnecter" : "Connecter"}
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
                        title={theme === "dark" ? "Mode clair" : "Mode sombre"}
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
                            {unreadNotifications.slice(0, 4).map((notification) => (
                                <DropdownMenuItem key={notification.id} className="flex flex-col items-start gap-1 p-3">
                                    <div className="flex items-center gap-2">
                                        <span className="size-2 rounded-full bg-red-500" />
                                        <span className="font-medium text-sm">{notification.title}</span>
                                    </div>
                                    <span className="text-xs text-muted-foreground">{notification.message}</span>
                                </DropdownMenuItem>
                            ))}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="justify-center text-primary">
                                Voir toutes les notifications
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    {/* Settings */}
                    <Button variant="ghost" size="icon" asChild>
                        <a href="/dashboard/nurse/settings">
                            <Settings className="size-5" />
                        </a>
                    </Button>

                    {/* Nurse Avatar */}
                    <Avatar className="size-9">
                        <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                            {displayName.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                        </AvatarFallback>
                    </Avatar>
                </div>
            </header>
        </>
    );
}
