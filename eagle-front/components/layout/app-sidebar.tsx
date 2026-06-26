"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogOut, ChevronRight, Loader2 } from "lucide-react";
import { useState } from "react";
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarRail,
    useSidebar,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { NavIcon } from "./nav-icon";
import { type NavGroup, type UserRole, roleTitles } from "@/lib/constants/navigation";
import { useAuthStore } from "@/stores/auth-store";

type AppSidebarProps = {
    navigation: NavGroup[];
    user?: {
        name: string;
        email: string;
        role: UserRole;
        center?: string;
    };
};

export function AppSidebar({ navigation, user: propUser }: AppSidebarProps) {
    const pathname = usePathname();
    const router = useRouter();
    const { state } = useSidebar();
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    // Get user from auth store if not passed as prop
    const storeUser = useAuthStore((state) => state.user);
    const logout = useAuthStore((state) => state.logout);

    // Use prop user or store user
    const user = propUser || (storeUser ? {
        name: storeUser.name,
        email: storeUser.email,
        role: storeUser.role as UserRole,
        center: storeUser.hospitalId || undefined,
    } : {
        name: "Utilisateur",
        email: "",
        role: "secondary_secretary" as UserRole,
    });

    const handleLogout = async () => {
        setIsLoggingOut(true);
        try {
            await logout();
            router.push("/login");
        } catch (error) {
            console.error("Logout error:", error);
        } finally {
            setIsLoggingOut(false);
        }
    };

    return (
        <Sidebar collapsible="icon">
            <SidebarHeader className="border-b border-sidebar-border">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href="/">
                                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                                    <span className="font-bold">E</span>
                                </div>
                                <div className="grid flex-1 text-left text-sm leading-tight">
                                    <span className="truncate font-semibold">EAGLE</span>
                                    <span className="truncate text-xs text-sidebar-foreground/70">
                                        Télémédecine
                                    </span>
                                </div>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                {navigation.map((group) => (
                    <SidebarGroup key={group.label}>
                        <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
                        <SidebarGroupContent>
                            <SidebarMenu>
                                {group.items.map((item) => {
                                    const isActive = pathname === item.url || pathname.startsWith(item.url + "/");
                                    return (
                                        <SidebarMenuItem key={item.url}>
                                            <SidebarMenuButton asChild isActive={isActive} tooltip={item.title}>
                                                <Link href={item.url}>
                                                    <NavIcon name={item.icon} className="size-4" />
                                                    <span className="flex-1">{item.title}</span>
                                                    {item.badge && (
                                                        <Badge variant="secondary" className="ml-auto size-5 justify-center p-0 text-xs">
                                                            {item.badge}
                                                        </Badge>
                                                    )}
                                                </Link>
                                            </SidebarMenuButton>
                                        </SidebarMenuItem>
                                    );
                                })}
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>
                ))}
            </SidebarContent>

            <SidebarFooter className="border-t border-sidebar-border">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <SidebarMenuButton size="lg">
                                    <Avatar className="size-8">
                                        <AvatarFallback className="bg-sidebar-primary text-sidebar-primary-foreground text-xs">
                                            {user.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="grid flex-1 text-left text-sm leading-tight">
                                        <span className="truncate font-medium">{user.name}</span>
                                        <span className="truncate text-xs text-sidebar-foreground/70">
                                            {roleTitles[user.role]}
                                        </span>
                                    </div>
                                    <ChevronRight className="ml-auto size-4" />
                                </SidebarMenuButton>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                                className="w-56"
                                align="end"
                                side={state === "collapsed" ? "right" : "top"}
                            >
                                <div className="px-2 py-1.5">
                                    <p className="text-sm font-medium">{user.name}</p>
                                    <p className="text-xs text-muted-foreground">{user.email}</p>
                                    {user.center && (
                                        <p className="text-xs text-muted-foreground mt-1">{user.center}</p>
                                    )}
                                </div>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                    onClick={handleLogout}
                                    disabled={isLoggingOut}
                                    className="text-destructive focus:text-destructive cursor-pointer"
                                >
                                    {isLoggingOut ? (
                                        <>
                                            <Loader2 className="mr-2 size-4 animate-spin" />
                                            Déconnexion...
                                        </>
                                    ) : (
                                        <>
                                            <LogOut className="mr-2 size-4" />
                                            Déconnexion
                                        </>
                                    )}
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>

            <SidebarRail />
        </Sidebar>
    );
}
