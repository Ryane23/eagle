"use client";

import { Inbox } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
    icon?: React.ElementType;
    title: string;
    description?: string;
    actionLabel?: string;
    onAction?: () => void;
    className?: string;
}

export function EmptyState({
    icon: Icon = Inbox,
    title,
    description,
    actionLabel,
    onAction,
    className,
}: EmptyStateProps) {
    return (
        <div className={`flex flex-col items-center justify-center py-12 text-center ${className || ""}`}>
            <div className="rounded-full bg-muted p-4 mb-4">
                <Icon className="size-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium">{title}</h3>
            {description && (
                <p className="mt-1 text-sm text-muted-foreground max-w-sm">{description}</p>
            )}
            {actionLabel && onAction && (
                <Button onClick={onAction} className="mt-4" size="sm">
                    {actionLabel}
                </Button>
            )}
        </div>
    );
}
