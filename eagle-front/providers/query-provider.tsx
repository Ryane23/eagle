"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useState, type ReactNode } from "react";

// Default options for all queries
const defaultQueryOptions = {
    queries: {
        // Data is fresh for 30 seconds
        staleTime: 30 * 1000,
        // Cache is kept for 5 minutes
        gcTime: 5 * 60 * 1000,
        // Retry failed requests 2 times
        retry: 2,
        // Refetch on window focus (great for real-time data)
        refetchOnWindowFocus: true,
        // Don't refetch on mount if data is fresh
        refetchOnMount: "always" as const,
    },
    mutations: {
        // Retry mutations once
        retry: 1,
    },
};

type QueryProviderProps = {
    children: ReactNode;
};

export function QueryProvider({ children }: QueryProviderProps) {
    // Create client inside component to avoid sharing state between requests (SSR safety)
    const [queryClient] = useState(
        () =>
            new QueryClient({
                defaultOptions: defaultQueryOptions,
            })
    );

    return (
        <QueryClientProvider client={queryClient}>
            {children}
            {/* DevTools only in development */}
            {process.env.NODE_ENV === "development" && (
                <ReactQueryDevtools initialIsOpen={false} buttonPosition="bottom-left" />
            )}
        </QueryClientProvider>
    );
}

