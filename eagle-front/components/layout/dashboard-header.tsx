"use client";

import { Search, Bell, CheckCheck } from "lucide-react";
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
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { useNotificationBell } from "@/hooks/queries";
import { SyncStatusIndicator } from "@/components/layout/sync-status-indicator";

type BreadcrumbItem = {
    label: string;
    href?: string;
};

type DashboardHeaderProps = {
    breadcrumbs: BreadcrumbItem[];
    actions?: React.ReactNode;
};

export function DashboardHeader({ breadcrumbs, actions }: DashboardHeaderProps) {
    const { unreadCount, unreadNotifications, isLoading, markAsRead, markAllAsRead } = useNotificationBell();

    return (
        <header className="flex h-16 shrink-0 items-center gap-2 border-b bg-background px-4 font-sans">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />

            <Breadcrumb className="hidden md:flex">
                <BreadcrumbList>
                    {breadcrumbs.map((item, index) => (
                        <BreadcrumbItem key={index}>
                            {index > 0 && <BreadcrumbSeparator />}
                            {item.href ? (
                                <BreadcrumbLink href={item.href}>{item.label}</BreadcrumbLink>
                            ) : (
                                <BreadcrumbPage>{item.label}</BreadcrumbPage>
                            )}
                        </BreadcrumbItem>
                    ))}
                </BreadcrumbList>
            </Breadcrumb>

            <div className="ml-auto flex items-center gap-4">
                {actions && (
                    <div className="hidden md:flex items-center gap-2">
                        {actions}
                    </div>
                )}
                <div className="relative hidden lg:block">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="Rechercher un patient, consultation..."
                        className="w-72 pl-9 bg-muted/50"
                    />
                </div>

                <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Rechercher">
                    <Search className="size-5" />
                </Button>

                <SyncStatusIndicator />

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="relative" aria-label="Notifications">
                            <Bell className="size-5" />
                            {unreadCount > 0 && (
                                <Badge className="absolute -top-1 -right-1 size-5 justify-center p-0 text-xs bg-accent">
                                    {unreadCount}
                                </Badge>
                            )}
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-80">
                        <DropdownMenuLabel className="flex items-center justify-between">
                            Notifications
                            {unreadCount > 0 && (
                                <span className="flex items-center gap-2">
                                    <Badge variant="secondary" className="text-xs">
                                        {unreadCount} nouvelles
                                    </Badge>
                                    <Button variant="ghost" size="sm" className="h-6 text-xs px-2" onClick={() => markAllAsRead()}>
                                        <CheckCheck className="size-3 mr-1" />
                                        Tout lire
                                    </Button>
                                </span>
                            )}
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        {isLoading ? (
                            <DropdownMenuItem disabled className="justify-center text-muted-foreground py-4">
                                Chargement...
                            </DropdownMenuItem>
                        ) : unreadNotifications.length === 0 ? (
                            <DropdownMenuItem disabled className="justify-center text-muted-foreground py-4">
                                Aucune notification
                            </DropdownMenuItem>
                        ) : (
                            unreadNotifications.map((notification) => (
                                <DropdownMenuItem
                                    key={notification.id}
                                    className="flex flex-col items-start gap-1 p-3"
                                    onClick={() => markAsRead(notification.id)}
                                >
                                    <div className="flex items-center gap-2">
                                        <span className="size-2 rounded-full bg-accent" />
                                        <span className="font-medium text-sm">{notification.title}</span>
                                    </div>
                                    <span className="text-xs text-muted-foreground">{notification.message}</span>
                                </DropdownMenuItem>
                            ))
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="justify-center text-accent">
                            Voir toutes les notifications
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    );
}

