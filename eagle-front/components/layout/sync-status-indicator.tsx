"use client";

import { RefreshCw, AlertTriangle, CheckCircle, Cloud } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { useSyncStats, useSyncPending } from "@/hooks/queries";

export function SyncStatusIndicator() {
    const stats = useSyncStats();
    const syncMutation = useSyncPending();

    const hasIssues = stats.failed > 0 || stats.conflict > 0;
    const hasPending = stats.pending > 0;

    if (stats.total === 0) {
        return (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <CheckCircle className="size-3.5 text-green-500" />
                <span className="hidden sm:inline">Synchronisé</span>
            </div>
        );
    }

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button variant="ghost" size="sm" className="h-7 gap-1.5 px-2 text-xs">
                    {hasIssues ? (
                        <AlertTriangle className="size-3.5 text-yellow-500" />
                    ) : hasPending ? (
                        <Cloud className="size-3.5 text-blue-500" />
                    ) : (
                        <CheckCircle className="size-3.5 text-green-500" />
                    )}
                    {hasPending && <Badge variant="secondary" className="h-4 px-1 text-[10px]">{stats.pending}</Badge>}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-56" align="end">
                <div className="space-y-3">
                    <p className="text-sm font-medium">État de la synchronisation</p>
                    <div className="space-y-1.5 text-xs">
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">En attente</span>
                            <span className="font-medium">{stats.pending}</span>
                        </div>
                        {stats.failed > 0 && (
                            <div className="flex justify-between text-destructive">
                                <span>Échouées</span>
                                <span className="font-medium">{stats.failed}</span>
                            </div>
                        )}
                        {stats.conflict > 0 && (
                            <div className="flex justify-between text-yellow-600">
                                <span>Conflits</span>
                                <span className="font-medium">{stats.conflict}</span>
                            </div>
                        )}
                    </div>
                    {hasPending && (
                        <Button
                            size="sm"
                            className="w-full h-7 text-xs"
                            onClick={() => syncMutation.mutate()}
                            disabled={syncMutation.isPending}
                        >
                            <RefreshCw className={`mr-1.5 size-3 ${syncMutation.isPending ? "animate-spin" : ""}`} />
                            Synchroniser maintenant
                        </Button>
                    )}
                </div>
            </PopoverContent>
        </Popover>
    );
}
