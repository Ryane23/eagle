"use client";

import { useEffect, useState, createContext, useContext, ReactNode } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/stores/auth-store";
import { Loader2 } from "lucide-react";

// Role to dashboard path mapping
const ROLE_DASHBOARDS: Record<string, string> = {
    admin: "/admin",
    primary_secretary: "/dashboard/primary",
    secondary_secretary: "/dashboard/secondary",
    nurse: "/dashboard/nurse",
    doctor: "/dashboard/doctor",
};

// Public routes that don't require authentication
const PUBLIC_ROUTES = ["/login", "/signup", "/forgot-password", "/reset-password", "/"];

type AuthContextType = {
    isInitialized: boolean;
};

const AuthContext = createContext<AuthContextType>({ isInitialized: false });

export function useAuthContext() {
    return useContext(AuthContext);
}

type AuthProviderProps = {
    children: ReactNode;
};

export function AuthProvider({ children }: AuthProviderProps) {
    const [isInitialized, setIsInitialized] = useState(false);
    const router = useRouter();
    const pathname = usePathname();

    const { user, isAuthenticated, fetchProfile, isLoading } = useAuthStore();

    // Check authentication on mount
    useEffect(() => {
        const initAuth = async () => {
            const accessToken = localStorage.getItem("accessToken");

            if (accessToken && !isAuthenticated) {
                try {
                    await fetchProfile();
                } catch {
                    // Token invalid, will be handled by redirect logic
                }
            }

            setIsInitialized(true);
        };

        initAuth();
    }, [fetchProfile, isAuthenticated]);

    // Handle route protection and role-based access
    useEffect(() => {
        if (!isInitialized || isLoading) return;

        const isPublicRoute = PUBLIC_ROUTES.some(
            (route) => pathname === route || pathname.startsWith(`${route}?`)
        );

        // If not authenticated and on protected route
        if (!isAuthenticated && !isPublicRoute) {
            router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
            return;
        }

        // Role-based access control for dashboard routes
        if (isAuthenticated && user && pathname.startsWith("/dashboard")) {
            const allowedPaths = getRoleAllowedPaths(user.role);
            const hasAccess = allowedPaths.some((path) => pathname.startsWith(path));

            if (!hasAccess && user.role !== "admin") {
                // Redirect to user's default dashboard
                const defaultDashboard = ROLE_DASHBOARDS[user.role];
                if (defaultDashboard) {
                    router.push(defaultDashboard);
                }
            }
        }

        // Admin-only routes
        if (pathname.startsWith("/admin") && user?.role !== "admin") {
            const defaultDashboard = user
                ? ROLE_DASHBOARDS[user.role] || "/dashboard/secondary"
                : "/login";
            router.push(defaultDashboard);
        }
    }, [isInitialized, isAuthenticated, user, pathname, router, isLoading]);

    // Show loading while initializing
    if (!isInitialized) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className="text-sm text-muted-foreground">Chargement...</p>
                </div>
            </div>
        );
    }

    return (
        <AuthContext.Provider value={{ isInitialized }}>
            {children}
        </AuthContext.Provider>
    );
}

// Helper function to get allowed paths for a role
function getRoleAllowedPaths(role: string): string[] {
    switch (role) {
        case "admin":
            return ["/admin", "/dashboard"]; // Admin has access to everything
        case "primary_secretary":
            return ["/dashboard/primary"];
        case "secondary_secretary":
            return ["/dashboard/secondary"];
        case "nurse":
            return ["/dashboard/nurse"];
        case "doctor":
            return ["/dashboard/doctor"];
        default:
            return [];
    }
}

