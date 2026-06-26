"use client";

import { Skeleton } from "@/components/ui/skeleton";

interface LoadingSkeletonProps {
    variant?: "table" | "cards" | "list" | "detail";
    rows?: number;
    className?: string;
}

function TableSkeleton({ rows = 5 }: { rows: number }) {
    return (
        <div className="space-y-3">
            <div className="flex gap-4">
                <Skeleton className="h-8 w-1/4" />
                <Skeleton className="h-8 w-1/4" />
                <Skeleton className="h-8 w-1/4" />
                <Skeleton className="h-8 w-1/4" />
            </div>
            {Array.from({ length: rows }).map((_, i) => (
                <div key={i} className="flex gap-4">
                    <Skeleton className="h-10 w-1/4" />
                    <Skeleton className="h-10 w-1/4" />
                    <Skeleton className="h-10 w-1/4" />
                    <Skeleton className="h-10 w-1/4" />
                </div>
            ))}
        </div>
    );
}

function CardsSkeleton({ rows = 3 }: { rows: number }) {
    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: rows }).map((_, i) => (
                <div key={i} className="rounded-lg border p-4 space-y-3">
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-2/3" />
                    <div className="flex gap-2 pt-2">
                        <Skeleton className="h-6 w-16" />
                        <Skeleton className="h-6 w-20" />
                    </div>
                </div>
            ))}
        </div>
    );
}

function ListSkeleton({ rows = 5 }: { rows: number }) {
    return (
        <div className="space-y-3">
            {Array.from({ length: rows }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-lg border">
                    <Skeleton className="size-10 rounded-full" />
                    <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-1/3" />
                        <Skeleton className="h-3 w-2/3" />
                    </div>
                    <Skeleton className="h-6 w-16" />
                </div>
            ))}
        </div>
    );
}

function DetailSkeleton() {
    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Skeleton className="size-16 rounded-full" />
                <div className="space-y-2">
                    <Skeleton className="h-6 w-48" />
                    <Skeleton className="h-4 w-32" />
                </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
                {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="space-y-1">
                        <Skeleton className="h-3 w-20" />
                        <Skeleton className="h-5 w-full" />
                    </div>
                ))}
            </div>
        </div>
    );
}

export function LoadingSkeleton({ variant = "list", rows = 5, className }: LoadingSkeletonProps) {
    return (
        <div className={className}>
            {variant === "table" && <TableSkeleton rows={rows} />}
            {variant === "cards" && <CardsSkeleton rows={rows} />}
            {variant === "list" && <ListSkeleton rows={rows} />}
            {variant === "detail" && <DetailSkeleton />}
        </div>
    );
}
