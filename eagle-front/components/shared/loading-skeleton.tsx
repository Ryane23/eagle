"use client";

import { memo } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

// Generic page loading skeleton
export function PageLoadingSkeleton() {
    return (
        <div className="flex flex-col h-full">
            {/* Header */}
            <div className="border-b p-4">
                <Skeleton className="h-6 w-48" />
            </div>

            <div className="flex-1 p-4 space-y-4 overflow-y-auto">
                {/* Page Title */}
                <div className="flex items-center justify-between">
                    <div>
                        <Skeleton className="h-7 w-64 mb-2" />
                        <Skeleton className="h-4 w-48" />
                    </div>
                    <Skeleton className="h-8 w-32" />
                </div>

                {/* Content Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[...Array(6)].map((_, i) => (
                        <Card key={i}>
                            <CardContent className="p-4">
                                <Skeleton className="h-24 w-full" />
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    );
}

// Stats row loading skeleton
export function StatsLoadingSkeleton({ count = 4 }: { count?: number }) {
    return (
        <div className="flex gap-2 overflow-x-auto">
            {[...Array(count)].map((_, i) => (
                <Card key={i} className="rounded-xl shrink-0 min-w-[180px]">
                    <CardContent className="p-3">
                        <div className="flex items-center gap-3">
                            <Skeleton className="size-10 rounded-lg" />
                            <div className="flex-1">
                                <Skeleton className="h-6 w-12 mb-1" />
                                <Skeleton className="h-3 w-24" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}

// Table loading skeleton
export function TableLoadingSkeleton({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) {
    return (
        <Card>
            <CardHeader>
                <Skeleton className="h-6 w-48" />
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {/* Table header */}
                    <div className="flex gap-4 pb-2 border-b">
                        {[...Array(cols)].map((_, i) => (
                            <Skeleton key={i} className="h-4 flex-1" />
                        ))}
                    </div>
                    {/* Table rows */}
                    {[...Array(rows)].map((_, i) => (
                        <div key={i} className="flex gap-4 py-2">
                            {[...Array(cols)].map((_, j) => (
                                <Skeleton key={j} className="h-5 flex-1" />
                            ))}
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}

// Card grid loading skeleton
export function CardGridSkeleton({ count = 4 }: { count?: number }) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[...Array(count)].map((_, i) => (
                <Card key={i}>
                    <CardContent className="p-4">
                        <div className="flex justify-between mb-3">
                            <div className="flex items-center gap-3">
                                <Skeleton className="size-10 rounded-full" />
                                <div>
                                    <Skeleton className="h-5 w-32 mb-1" />
                                    <Skeleton className="h-3 w-24" />
                                </div>
                            </div>
                            <Skeleton className="h-6 w-16" />
                        </div>
                        <div className="grid grid-cols-2 gap-2 mb-3">
                            <Skeleton className="h-12 rounded" />
                            <Skeleton className="h-12 rounded" />
                        </div>
                        <Skeleton className="h-8 w-full" />
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}

// List loading skeleton
export function ListLoadingSkeleton({ count = 5 }: { count?: number }) {
    return (
        <Card>
            <CardHeader>
                <Skeleton className="h-6 w-36" />
            </CardHeader>
            <CardContent>
                <div className="space-y-3">
                    {[...Array(count)].map((_, i) => (
                        <div key={i} className="flex items-center gap-3 p-2">
                            <Skeleton className="size-10 rounded-full" />
                            <div className="flex-1">
                                <Skeleton className="h-4 w-32 mb-1" />
                                <Skeleton className="h-3 w-24" />
                            </div>
                            <Skeleton className="h-6 w-16" />
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}

// Dialog/Modal loading skeleton
export function DialogLoadingSkeleton() {
    return (
        <div className="space-y-4 p-4">
            <div className="text-center mb-6">
                <Skeleton className="h-16 w-16 rounded-full mx-auto mb-4" />
                <Skeleton className="h-6 w-48 mx-auto mb-2" />
                <Skeleton className="h-4 w-64 mx-auto" />
            </div>
            <div className="space-y-3">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
            </div>
            <div className="flex gap-2 pt-4">
                <Skeleton className="h-10 flex-1" />
                <Skeleton className="h-10 flex-1" />
            </div>
        </div>
    );
}

// Inline loading spinner
export const InlineSpinner = memo(function InlineSpinner({
    size = "sm",
    className = "",
}: {
    size?: "xs" | "sm" | "md" | "lg";
    className?: string;
}) {
    const sizeClasses = {
        xs: "size-3",
        sm: "size-4",
        md: "size-6",
        lg: "size-8",
    };

    return (
        <div className={`flex items-center justify-center ${className}`}>
            <div
                className={`${sizeClasses[size]} border-2 border-muted border-t-primary rounded-full animate-spin`}
            />
        </div>
    );
});

