"use client";

import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface ErrorDisplayProps {
    error: Error | null;
    title?: string;
    onRetry?: () => void;
    className?: string;
}

export function ErrorDisplay({ error, title = "Erreur", onRetry, className }: ErrorDisplayProps) {
    if (!error) return null;

    return (
        <Alert variant="destructive" className={className}>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>{title}</AlertTitle>
            <AlertDescription className="flex items-center justify-between">
                <span>{error.message || "Une erreur est survenue"}</span>
                {onRetry && (
                    <Button variant="outline" size="sm" onClick={onRetry} className="ml-4 shrink-0">
                        <RefreshCw className="mr-2 size-3" />
                        Réessayer
                    </Button>
                )}
            </AlertDescription>
        </Alert>
    );
}
