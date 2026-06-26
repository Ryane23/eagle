import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth-store";
import type { UserRole } from "@/types/api";

// Selectors for optimized re-renders
const selectUser = (state: ReturnType<typeof useAuthStore.getState>) => state.user;
const selectIsAuthenticated = (state: ReturnType<typeof useAuthStore.getState>) =>
    state.isAuthenticated;
const selectIsLoading = (state: ReturnType<typeof useAuthStore.getState>) =>
    state.isLoading;
const selectError = (state: ReturnType<typeof useAuthStore.getState>) => state.error;

/**
 * Hook for authentication state and actions
 */
export function useAuth() {
    const user = useAuthStore(selectUser);
    const isAuthenticated = useAuthStore(selectIsAuthenticated);
    const isLoading = useAuthStore(selectIsLoading);
    const error = useAuthStore(selectError);

    const login = useAuthStore((state) => state.login);
    const logout = useAuthStore((state) => state.logout);
    const fetchProfile = useAuthStore((state) => state.fetchProfile);
    const clearError = useAuthStore((state) => state.clearError);
    const hasRole = useAuthStore((state) => state.hasRole);

    return {
        user,
        isAuthenticated,
        isLoading,
        error,
        login,
        logout,
        fetchProfile,
        clearError,
        hasRole,
    };
}

/**
 * Hook for checking user role
 */
export function useUserRole() {
    const user = useAuthStore(selectUser);
    const hasRole = useAuthStore((state) => state.hasRole);

    return {
        role: user?.role,
        hasRole,
        isAdmin: user?.role === "admin",
        isDoctor: user?.role === "doctor",
        isNurse: user?.role === "nurse",
        isPrimarySecretary: user?.role === "primary_secretary",
        isSecondarySecretary: user?.role === "secondary_secretary",
    };
}

/**
 * Hook for protected routes
 */
export function useRequireAuth(allowedRoles?: UserRole[]) {
    const router = useRouter();
    const { user, isAuthenticated, isLoading, hasRole } = useAuth();

    const checkAuth = useCallback(() => {
        if (!isLoading && !isAuthenticated) {
            router.push("/login");
            return false;
        }

        if (allowedRoles && allowedRoles.length > 0) {
            if (!hasRole(allowedRoles)) {
                router.push("/unauthorized");
                return false;
            }
        }

        return true;
    }, [isAuthenticated, isLoading, allowedRoles, hasRole, router]);

    return {
        user,
        isAuthenticated,
        isLoading,
        isAuthorized: !allowedRoles || hasRole(allowedRoles),
        checkAuth,
    };
}

/**
 * Hook for logout with redirect
 */
export function useLogout() {
    const router = useRouter();
    const logoutAction = useAuthStore((state) => state.logout);

    const logout = useCallback(async () => {
        await logoutAction();
        router.push("/login");
    }, [logoutAction, router]);

    return logout;
}

