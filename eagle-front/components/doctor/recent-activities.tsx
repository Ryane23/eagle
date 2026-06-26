"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    Video,
    FileText,
    TestTube,
    AlertTriangle,
    Clock,
    Pill,
    ArrowRight,
} from "lucide-react";
import { useMyActivitiesQuery } from "@/hooks/queries";
import type { Activity as ApiActivity } from "@/actions/activities";

type Activity = {
    id: string;
    type: "consultation" | "prescription" | "lab_request" | "urgency_change" | "report";
    patientName: string;
    time: string;
    details?: string;
};

const resourceToType: Record<string, Activity["type"]> = {
    consultation: "consultation",
    prescription: "prescription",
    urgency: "urgency_change",
    report: "report",
    patient: "consultation",
};
const defaultType: Activity["type"] = "consultation";

function formatTimeAgo(createdAt: string): string {
    const date = new Date(createdAt);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    const diffH = Math.floor(diffMin / 60);
    const diffD = Math.floor(diffH / 24);
    if (diffMin < 1) return "À l'instant";
    if (diffMin < 60) return `Il y a ${diffMin} min`;
    if (diffH < 24) return `Il y a ${diffH}h`;
    if (diffD < 7) return `Il y a ${diffD}j`;
    return date.toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
}

function mapApiToDisplay(api: ApiActivity): Activity {
    const type = resourceToType[api.resource] ?? defaultType;
    return {
        id: api.id,
        type,
        patientName: api.description?.slice(0, 40) || "—",
        time: formatTimeAgo(api.createdAt),
        details: api.description,
    };
}

const activityConfig = {
    consultation: {
        icon: Video,
        color: "text-blue-600",
        bgColor: "bg-blue-100"
    },
    prescription: {
        icon: Pill,
        color: "text-green-600",
        bgColor: "bg-green-100"
    },
    lab_request: {
        icon: TestTube,
        color: "text-purple-600",
        bgColor: "bg-purple-100"
    },
    urgency_change: {
        icon: AlertTriangle,
        color: "text-orange-600",
        bgColor: "bg-orange-100"
    },
    report: {
        icon: FileText,
        color: "text-cyan-600",
        bgColor: "bg-cyan-100"
    }
};

export function RecentActivities() {
    const { data: apiActivities = [], isLoading } = useMyActivitiesQuery(10);
    const activities = apiActivities.map(mapApiToDisplay);

    return (
        <Card>
            <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-sm flex items-center gap-1.5">
                        <Clock className="size-3.5" />
                        Activités Récentes
                    </CardTitle>
                    <Button variant="ghost" size="sm" className="h-6 text-[10px] px-2" asChild>
                        <Link href="/dashboard/doctor/statistics">
                            Tout voir
                            <ArrowRight className="size-3 ml-1" />
                        </Link>
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="p-0">
                <ScrollArea className="h-[160px]">
                    <div className="px-4 pb-3 space-y-2">
                        {isLoading ? (
                            <p className="text-xs text-muted-foreground py-4 text-center">Chargement...</p>
                        ) : activities.length === 0 ? (
                            <p className="text-xs text-muted-foreground py-4 text-center">Aucune activité récente</p>
                        ) : (
                        activities.map((activity) => {
                            const config = activityConfig[activity.type];
                            const Icon = config.icon;
                            
                            return (
                                <div 
                                    key={activity.id}
                                    className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                                >
                                    <div className={`p-1.5 rounded-lg ${config.bgColor} flex-shrink-0`}>
                                        <Icon className={`size-3 ${config.color}`} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between gap-2">
                                            <p className="text-xs font-medium truncate">
                                                {activity.patientName}
                                            </p>
                                            <span className="text-[9px] text-muted-foreground flex-shrink-0">
                                                {activity.time}
                                            </span>
                                        </div>
                                        <p className="text-[10px] text-muted-foreground truncate">
                                            {activity.details}
                                        </p>
                                    </div>
                                </div>
                            );
                        })
                        )}
                    </div>
                </ScrollArea>
            </CardContent>
        </Card>
    );
}
