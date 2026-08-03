"use client";

import { useState, useMemo } from "react";
import { EnhancedNurseDashboardHeader } from "@/components/nurse/enhanced-dashboard-header";
import { FloatingHelpButton } from "@/components/nurse/floating-help-button";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Search,
    Activity,
    ClipboardList,
    FileText,
    User,
    Clock,
    Calendar,
    RefreshCw,
} from "lucide-react";
import { useMyActivitiesQuery } from "@/hooks/queries";
import { useQueryClient } from "@tanstack/react-query";
import { activityKeys } from "@/hooks/queries";
import { toast } from "sonner";
import { parseApiDate } from "@/lib/utils";

const resourceToDisplayType = (resource: string): string => {
    const map: Record<string, string> = {
        patient: "patient",
        consultation: "consultation",
        prescription: "document",
        urgency: "urgency",
        file: "document",
        queue: "preparation",
    };
    return map[resource] || resource;
};

const getActivityIcon = (resource: string) => {
    switch (resource) {
        case "patient":
        case "queue":
            return <ClipboardList className="size-5" />;
        case "prescription":
        case "file":
            return <FileText className="size-5" />;
        case "consultation":
            return <Activity className="size-5" />;
        default:
            return <Activity className="size-5" />;
    }
};

const getActivityColor = (type: string) => {
    switch (type) {
        case "create":
        case "approve":
        case "complete":
            return "text-green-600 bg-green-100 dark:bg-green-900/20";
        case "reject":
        case "delete":
            return "text-orange-600 bg-orange-100 dark:bg-orange-900/20";
        default:
            return "text-blue-600 bg-blue-100 dark:bg-blue-900/20";
    }
};

export default function ActivitiesPage() {
    const queryClient = useQueryClient();
    const { data: activities = [], isLoading } = useMyActivitiesQuery(100);
    const [searchQuery, setSearchQuery] = useState("");
    const [typeFilter, setTypeFilter] = useState<string>("all");
    const [dateFilter, setDateFilter] = useState("today");

    const filteredActivities = useMemo(() => {
        const today = new Date().toISOString().split("T")[0];
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        const monthAgo = new Date();
        monthAgo.setMonth(monthAgo.getMonth() - 1);

        return activities.filter((activity) => {
            const matchesSearch =
                !searchQuery ||
                activity.description.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesType =
                typeFilter === "all" || resourceToDisplayType(activity.resource) === typeFilter;

            const actDate = parseApiDate(activity.createdAt) ?? new Date();
            if (dateFilter === "today") {
                return matchesSearch && matchesType && actDate.toISOString().split("T")[0] === today;
            }
            if (dateFilter === "week") {
                return matchesSearch && matchesType && actDate >= weekAgo;
            }
            if (dateFilter === "month") {
                return matchesSearch && matchesType && actDate >= monthAgo;
            }
            return matchesSearch && matchesType;
        });
    }, [activities, searchQuery, typeFilter, dateFilter]);

    return (
        <div className="flex flex-col h-full">
            <EnhancedNurseDashboardHeader />

            <div className="flex-1 p-6 space-y-6 overflow-y-auto">
                {/* Header */}
                <div>
                    <h1 className="text-2xl font-bold text-primary">Activités récentes</h1>
                    <p className="text-muted-foreground">
                        Consultez l&apos;historique de vos activités
                    </p>
                </div>

                {/* Filters */}
                <Card>
                    <CardContent className="p-4">
                        <div className="flex flex-col md:flex-row gap-4">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                                <Input
                                    placeholder="Rechercher une activité..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-9"
                                />
                            </div>
                            <Select value={typeFilter} onValueChange={setTypeFilter}>
                                <SelectTrigger className="w-full md:w-[200px]">
                                    <SelectValue placeholder="Type d&apos;activité" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Tous les types</SelectItem>
                                    <SelectItem value="preparation">Préparations</SelectItem>
                                    <SelectItem value="patient">Patients</SelectItem>
                                    <SelectItem value="document">Documents</SelectItem>
                                    <SelectItem value="consultation">Consultations</SelectItem>
                                    <SelectItem value="urgency">Urgences</SelectItem>
                                </SelectContent>
                            </Select>
                            <Select value={dateFilter} onValueChange={setDateFilter}>
                                <SelectTrigger className="w-full md:w-[180px]">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="today">Aujourd&apos;hui</SelectItem>
                                    <SelectItem value="week">Cette semaine</SelectItem>
                                    <SelectItem value="month">Ce mois</SelectItem>
                                    <SelectItem value="all">Tout</SelectItem>
                                </SelectContent>
                            </Select>
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={() => {
                                    queryClient.invalidateQueries({ queryKey: activityKeys.all });
                                    toast.success("Actualisé");
                                }}
                            >
                                <RefreshCw className="size-4" />
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Activities Timeline */}
                {isLoading ? (
                    <div className="space-y-4">
                        {[1, 2, 3].map((i) => (
                            <Card key={i}>
                                <CardContent className="p-6">
                                    <div className="animate-pulse flex gap-4">
                                        <div className="size-12 bg-muted rounded-lg" />
                                        <div className="flex-1 space-y-2">
                                            <div className="h-4 bg-muted rounded w-3/4" />
                                            <div className="h-3 bg-muted rounded w-1/2" />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <div className="space-y-4">
                        {filteredActivities.map((activity) => {
                            const actDate = parseApiDate(activity.createdAt) ?? new Date();
                            const timeStr = actDate.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
                            const dateStr = actDate.toLocaleDateString("fr-FR");
                            return (
                                <Card key={activity.id} className="hover:shadow-md transition-shadow">
                                    <CardContent className="p-6">
                                        <div className="flex items-start gap-4">
                                            <div className={`p-3 rounded-lg ${getActivityColor(activity.type)}`}>
                                                {getActivityIcon(activity.resource)}
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-start justify-between mb-2">
                                                    <div>
                                                        <h3 className="font-semibold text-lg capitalize">
                                                            {activity.type} - {activity.resource}
                                                        </h3>
                                                        <p className="text-sm text-muted-foreground mt-1">
                                                            {activity.description}
                                                        </p>
                                                    </div>
                                                    <div className="text-right">
                                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                            <Clock className="size-4" />
                                                            <span>{timeStr}</span>
                                                        </div>
                                                        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                                                            <Calendar className="size-3" />
                                                            <span>{dateStr}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                {activity.user?.name && (
                                                    <div className="flex items-center gap-2 mt-3">
                                                        <User className="size-4 text-muted-foreground" />
                                                        <span className="text-sm font-medium">{activity.user.name}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                )}

                {!isLoading && filteredActivities.length === 0 && (
                    <Card>
                        <CardContent className="py-12 text-center">
                            <Activity className="size-12 mx-auto text-muted-foreground mb-4" />
                            <p className="text-lg font-medium text-muted-foreground">
                                Aucune activité trouvée
                            </p>
                        </CardContent>
                    </Card>
                )}
            </div>

            <FloatingHelpButton />
        </div>
    );
}










