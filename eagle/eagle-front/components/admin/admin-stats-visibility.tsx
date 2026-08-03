"use client";

import {
    createContext,
    useCallback,
    useContext,
    useMemo,
    useState,
    type ReactNode,
} from "react";

type AdminStatsVisibilityValue = {
    hasQuickStats: boolean;
    statsHidden: boolean;
    registerQuickStats: () => () => void;
    toggleQuickStats: () => void;
};

const AdminStatsVisibilityContext =
    createContext<AdminStatsVisibilityValue | null>(null);

export function AdminStatsVisibilityProvider({
    children,
}: {
    children: ReactNode;
}) {
    const [registeredStats, setRegisteredStats] = useState(0);
    const [statsHidden, setStatsHidden] = useState(false);

    const registerQuickStats = useCallback(() => {
        setRegisteredStats((current) => current + 1);
        return () => {
            setRegisteredStats((current) => Math.max(0, current - 1));
        };
    }, []);

    const toggleQuickStats = useCallback(() => {
        setStatsHidden((current) => !current);
    }, []);

    const value = useMemo(
        () => ({
            hasQuickStats: registeredStats > 0,
            statsHidden,
            registerQuickStats,
            toggleQuickStats,
        }),
        [registerQuickStats, registeredStats, statsHidden, toggleQuickStats]
    );

    return (
        <AdminStatsVisibilityContext.Provider value={value}>
            {children}
        </AdminStatsVisibilityContext.Provider>
    );
}

export function useAdminStatsVisibility() {
    return useContext(AdminStatsVisibilityContext);
}
