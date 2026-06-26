"use client";

import { memo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle, RefreshCw, Home, ArrowLeft } from "lucide-react";
import Link from "next/link";

export type ErrorFallbackProps = {
    title?: string;
    description?: string;
    errorCode?: string;
    onRetry?: () => void;
    showHomeButton?: boolean;
    showBackButton?: boolean;
    homeHref?: string;
    className?: string;
};

function ErrorFallbackComponent({
    title = "Une erreur s'est produite",
    description = "Impossible de charger cette page. Veuillez réessayer ou contacter le support.",
    errorCode,
    onRetry,
    showHomeButton = true,
    showBackButton = false,
    homeHref = "/dashboard",
    className,
}: ErrorFallbackProps) {
    return (
        <div className={`flex flex-col items-center justify-center p-8 ${className}`}>
            <Card className="max-w-md w-full">
                <CardContent className="pt-6 text-center">
                    <div className="size-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-4">
                        <AlertTriangle className="size-8 text-red-600 dark:text-red-400" />
                    </div>

                    <h2 className="text-xl font-bold mb-2">{title}</h2>

                    <p className="text-muted-foreground text-sm mb-6">{description}</p>

                    {errorCode && (
                        <p className="text-xs text-muted-foreground mb-4 font-mono">
                            Code erreur: {errorCode}
                        </p>
                    )}

                    <div className="flex gap-3 justify-center">
                        {showBackButton && (
                            <Button variant="outline" onClick={() => window.history.back()}>
                                <ArrowLeft className="size-4 mr-2" />
                                Retour
                            </Button>
                        )}
                        {onRetry && (
                            <Button onClick={onRetry} variant="default">
                                <RefreshCw className="size-4 mr-2" />
                                Réessayer
                            </Button>
                        )}
                        {showHomeButton && (
                            <Button variant="outline" asChild>
                                <Link href={homeHref}>
                                    <Home className="size-4 mr-2" />
                                    Accueil
                                </Link>
                            </Button>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

export const ErrorFallback = memo(ErrorFallbackComponent);

// Generic error boundary fallback for use with error.tsx
export function GenericErrorBoundary({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    return (
        <ErrorFallback
            title="Une erreur s'est produite"
            description={
                error.message ||
                "Impossible de charger cette page. Veuillez réessayer ou contacter le support."
            }
            errorCode={error.digest}
            onRetry={reset}
            className="h-full"
        />
    );
}

