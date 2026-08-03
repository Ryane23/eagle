"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PaginationControlsProps {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    onNextPage: () => void;
    onPreviousPage: () => void;
    className?: string;
}

export function PaginationControls({
    currentPage,
    totalPages,
    totalItems,
    hasNextPage,
    hasPreviousPage,
    onNextPage,
    onPreviousPage,
    className,
}: PaginationControlsProps) {
    if (totalPages <= 1) return null;

    return (
        <div className={`flex items-center justify-between pt-4 ${className || ""}`}>
            <p className="text-sm text-muted-foreground">
                Page {currentPage} sur {totalPages} ({totalItems} éléments)
            </p>
            <div className="flex items-center gap-2">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={onPreviousPage}
                    disabled={!hasPreviousPage}
                    aria-label="Page précédente"
                >
                    <ChevronLeft className="size-4" />
                    Précédent
                </Button>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={onNextPage}
                    disabled={!hasNextPage}
                    aria-label="Page suivante"
                >
                    Suivant
                    <ChevronRight className="size-4" />
                </Button>
            </div>
        </div>
    );
}
