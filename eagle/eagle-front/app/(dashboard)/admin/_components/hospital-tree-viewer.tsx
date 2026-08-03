"use client";

import { useMemo, useState } from "react";
import { Building2, ChevronDown, ChevronRight, GitBranch, MapPin, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { BranchStatistics, Hospital } from "@/types/api";

type HospitalTreeViewerProps = {
    tree: Hospital[];
    isLoading: boolean;
    selectedHospitalId: string | null;
    onSelect: (hospitalId: string) => void;
    statistics?: BranchStatistics;
    isStatisticsLoading: boolean;
};

const TYPE_LABELS = {
    PRIMARY: "Centre Principal",
    SUB: "Centre Secondaire",
} as const;

function formatHospitalDate(value: unknown): string {
    if (!value) return "-";

    let date: Date;
    if (typeof value === "object") {
        const timestamp = value as {
            seconds?: number;
            nanoseconds?: number;
            _seconds?: number;
            _nanoseconds?: number;
        };
        const seconds = timestamp.seconds ?? timestamp._seconds;
        const nanoseconds = timestamp.nanoseconds ?? timestamp._nanoseconds ?? 0;

        if (typeof seconds !== "number") return "-";
        date = new Date(seconds * 1000 + Math.floor(nanoseconds / 1_000_000));
    } else {
        date = new Date(value as string | number);
    }

    if (Number.isNaN(date.getTime())) return "-";

    return new Intl.DateTimeFormat("fr-FR", {
        dateStyle: "medium",
    }).format(date);
}

export function HospitalTreeViewer({
    tree,
    isLoading,
    selectedHospitalId,
    onSelect,
    statistics,
    isStatisticsLoading,
}: HospitalTreeViewerProps) {
    const [collapsedIds, setCollapsedIds] = useState<Set<string>>(new Set());

    const hospitalsById = useMemo(() => {
        const entries = tree.flatMap((primary) => [
            [primary.id, primary] as const,
            ...(primary.children ?? []).map((child) => [child.id, child] as const),
        ]);
        return new Map(entries);
    }, [tree]);

    const selectedHospital = selectedHospitalId ? hospitalsById.get(selectedHospitalId) : undefined;
    const parentHospital = selectedHospital?.parentHospitalId
        ? hospitalsById.get(selectedHospital.parentHospitalId)
        : undefined;

    const toggleExpanded = (hospitalId: string) => {
        setCollapsedIds((current) => {
            const next = new Set(current);
            if (next.has(hospitalId)) {
                next.delete(hospitalId);
            } else {
                next.add(hospitalId);
            }
            return next;
        });
    };

    return (
        <Card>
            <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                    <GitBranch className="size-4" />
                    Arborescence hospitalière
                </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
                <div className="grid min-h-72 lg:grid-cols-[minmax(240px,0.8fr)_minmax(0,1.7fr)]">
                    <div className="border-b p-3 lg:border-b-0 lg:border-r">
                        {isLoading ? (
                            <div className="space-y-2">
                                <Skeleton className="h-9 w-full" />
                                <Skeleton className="ml-7 h-8 w-[calc(100%-1.75rem)]" />
                                <Skeleton className="ml-7 h-8 w-[calc(100%-1.75rem)]" />
                            </div>
                        ) : tree.length === 0 ? (
                            <div className="py-8 text-center text-sm text-muted-foreground">
                                Aucun centre dans la base de données
                            </div>
                        ) : (
                            <div className="space-y-1">
                                {tree.map((primary) => {
                                    const children = primary.children ?? [];
                                    const isExpanded = !collapsedIds.has(primary.id);

                                    return (
                                        <div key={primary.id}>
                                            <div className="flex items-center gap-1">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="size-8 shrink-0"
                                                    onClick={() => toggleExpanded(primary.id)}
                                                    aria-label={
                                                        isExpanded ? "Réduire le centre" : "Développer le centre"
                                                    }
                                                >
                                                    {isExpanded ? (
                                                        <ChevronDown className="size-4" />
                                                    ) : (
                                                        <ChevronRight className="size-4" />
                                                    )}
                                                </Button>
                                                <Button
                                                    variant={selectedHospitalId === primary.id ? "secondary" : "ghost"}
                                                    className="h-9 min-w-0 flex-1 justify-start px-2"
                                                    onClick={() => onSelect(primary.id)}
                                                >
                                                    <Building2 className="mr-2 size-4 shrink-0" />
                                                    <span className="truncate">{primary.name}</span>
                                                    <Badge variant="outline" className="ml-auto shrink-0">
                                                        {children.length}
                                                    </Badge>
                                                </Button>
                                            </div>

                                            {isExpanded && children.length > 0 && (
                                                <div className="ml-9 border-l pl-2">
                                                    {children.map((child) => (
                                                        <Button
                                                            key={child.id}
                                                            variant={
                                                                selectedHospitalId === child.id ? "secondary" : "ghost"
                                                            }
                                                            className="h-8 w-full min-w-0 justify-start px-2"
                                                            onClick={() => onSelect(child.id)}
                                                        >
                                                            <Building2 className="mr-2 size-3.5 shrink-0" />
                                                            <span className="truncate">{child.name}</span>
                                                        </Button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    <div className="p-4">
                        {!selectedHospital ? (
                            <div className="flex h-full min-h-48 items-center justify-center text-sm text-muted-foreground">
                                Sélectionnez un centre
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div className="flex flex-wrap items-start justify-between gap-3">
                                    <div>
                                        <h2 className="font-semibold">{selectedHospital.name}</h2>
                                        <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                                            <MapPin className="size-3" />
                                            <span>
                                                {[selectedHospital.address, selectedHospital.city]
                                                    .filter(Boolean)
                                                    .join(", ") || "-"}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <Badge variant="outline">{TYPE_LABELS[selectedHospital.type]}</Badge>
                                        <Badge variant={selectedHospital.isActive ? "default" : "secondary"}>
                                            {selectedHospital.isActive ? "Actif" : "Inactif"}
                                        </Badge>
                                    </div>
                                </div>

                                <dl className="grid gap-3 text-xs sm:grid-cols-2 xl:grid-cols-4">
                                    <div>
                                        <dt className="text-muted-foreground">Centre parent</dt>
                                        <dd className="mt-1 font-medium">{parentHospital?.name ?? "Aucun"}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-muted-foreground">Centres enfants</dt>
                                        <dd className="mt-1 font-medium">{selectedHospital.children?.length ?? 0}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-muted-foreground">Contact</dt>
                                        <dd className="mt-1 truncate font-medium">
                                            {selectedHospital.contactPhone || "-"}
                                        </dd>
                                    </div>
                                    <div>
                                        <dt className="text-muted-foreground">Enregistré le</dt>
                                        <dd className="mt-1 font-medium">
                                            {formatHospitalDate(selectedHospital.createdAt)}
                                        </dd>
                                    </div>
                                </dl>

                                {isStatisticsLoading ? (
                                    <div className="grid grid-cols-2 gap-2 xl:grid-cols-4">
                                        {Array.from({ length: 8 }).map((_, index) => (
                                            <Skeleton key={index} className="h-14" />
                                        ))}
                                    </div>
                                ) : statistics ? (
                                    <div className="grid grid-cols-2 gap-2 xl:grid-cols-4">
                                        {[
                                            ["Personnel", statistics.totalUsers],
                                            ["Médecins", statistics.usersByRole.doctor],
                                            ["Infirmiers", statistics.usersByRole.nurse],
                                            ["Spécialistes", statistics.usersByRole.specialist],
                                            ["Patients actifs", statistics.activePatients],
                                            ["Consultations actives", statistics.consultationsByStatus.in_progress],
                                            ["Références en attente", statistics.pendingReferrals],
                                            ["Consultations terminées", statistics.consultationsByStatus.completed],
                                        ].map(([label, value]) => (
                                            <div key={label} className="border-l-2 border-primary/30 px-3 py-2">
                                                <p className="text-lg font-semibold">{value}</p>
                                                <p className="text-[11px] text-muted-foreground">{label}</p>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="flex min-h-20 items-center justify-center text-sm text-muted-foreground">
                                        Statistiques indisponibles
                                    </div>
                                )}

                                {statistics && (
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                        <Users className="size-3.5" />
                                        {statistics.activeUsers} utilisateur
                                        {statistics.activeUsers !== 1 ? "s" : ""} actif
                                        {statistics.activeUsers !== 1 ? "s" : ""}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
