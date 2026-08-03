"use client";

import { useState, useMemo } from "react";
import { EnhancedNurseDashboardHeader } from "@/components/nurse/enhanced-dashboard-header";
import { FloatingHelpButton } from "@/components/nurse/floating-help-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import {
    Calendar,
    Clock,
    User,
    Stethoscope,
    ChevronLeft,
    ChevronRight,
} from "lucide-react";
import { format, startOfDay, endOfDay } from "date-fns";
import { useDateRangeEventsQuery } from "@/hooks/queries";

type ScheduleItem = {
    id: string;
    patientName: string;
    patientCode: string;
    doctor: string;
    time: string;
    duration: number;
    type: "preparation" | "consultation" | "vitals";
    status: "scheduled" | "in-progress" | "completed";
    priority?: "normal" | "urgent";
};

export default function CalendarPage() {
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const startStr = format(startOfDay(selectedDate), "yyyy-MM-dd");
    const endStr = format(endOfDay(selectedDate), "yyyy-MM-dd");
    const { data: events = [], isLoading } = useDateRangeEventsQuery(startStr, endStr);

    const scheduleForDate = useMemo((): ScheduleItem[] => {
        return events
            .filter((e) => !e.isCancelled)
            .map((e) => ({
                id: e.id,
                patientName: e.title,
                patientCode: e.resourceId || "",
                doctor: e.organizer?.name || "N/A",
                time: format(new Date(e.startDate), "HH:mm"),
                duration: Math.round((new Date(e.endDate).getTime() - new Date(e.startDate).getTime()) / 60000),
                type: (e.type === "consultation" ? "consultation" : e.type === "followup" ? "vitals" : "preparation") as ScheduleItem["type"],
                status: "scheduled" as const,
                priority: "normal" as const,
            }));
    }, [events]);

    const getStatusBadge = (status: ScheduleItem["status"]) => {
        switch (status) {
            case "scheduled":
                return <Badge variant="secondary">Planifié</Badge>;
            case "in-progress":
                return <Badge variant="default" className="bg-blue-500">En cours</Badge>;
            case "completed":
                return <Badge variant="default" className="bg-green-500">Terminé</Badge>;
        }
    };

    const getTypeColor = (type: ScheduleItem["type"]) => {
        switch (type) {
            case "preparation":
                return "border-l-blue-500";
            case "consultation":
                return "border-l-green-500";
            case "vitals":
                return "border-l-purple-500";
        }
    };

    return (
        <div className="flex flex-col h-full">
            <EnhancedNurseDashboardHeader />

            <div className="flex-1 p-6 space-y-6 overflow-y-auto">
                {/* Header */}
                <div>
                    <h1 className="text-2xl font-bold text-primary">Calendrier</h1>
                    <p className="text-muted-foreground">
                        Consultez votre planning et vos rendez-vous
                    </p>
                </div>

                <div className="grid lg:grid-cols-3 gap-6">
                    {/* Calendar */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Calendrier</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <CalendarComponent
                                mode="single"
                                selected={selectedDate}
                                onSelect={(date) => date && setSelectedDate(date)}
                                className="rounded-md border"
                            />
                        </CardContent>
                    </Card>

                    {/* Schedule for Selected Date */}
                    <div className="lg:col-span-2 space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center justify-between">
                                    <span>Planning du {format(selectedDate, "d MMMM yyyy")}</span>
                                    <div className="flex gap-2">
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            onClick={() =>
                                                setSelectedDate(
                                                    (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate() - 1)
                                                )
                                            }
                                        >
                                            <ChevronLeft className="size-4" />
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            onClick={() =>
                                                setSelectedDate(
                                                    (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1)
                                                )
                                            }
                                        >
                                            <ChevronRight className="size-4" />
                                        </Button>
                                    </div>
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {isLoading ? (
                                    <div className="py-12 text-center text-muted-foreground">
                                        Chargement...
                                    </div>
                                ) : scheduleForDate.length === 0 ? (
                                    <div className="py-12 text-center">
                                        <Calendar className="size-12 mx-auto text-muted-foreground mb-4" />
                                        <p className="text-muted-foreground">
                                            Aucun rendez-vous prévu pour cette date
                                        </p>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {scheduleForDate
                                            .sort((a, b) => a.time.localeCompare(b.time))
                                            .map((item) => (
                                                <Card
                                                    key={item.id}
                                                    className={`border-l-4 ${getTypeColor(item.type)} hover:shadow-md transition-shadow`}
                                                >
                                                    <CardContent className="p-4">
                                                        <div className="flex items-start justify-between">
                                                            <div className="flex-1">
                                                                <div className="flex items-center gap-3 mb-2">
                                                                    <div className="flex items-center gap-2">
                                                                        <Clock className="size-4 text-muted-foreground" />
                                                                        <span className="font-semibold">{item.time}</span>
                                                                        <span className="text-sm text-muted-foreground">
                                                                            ({item.duration} min)
                                                                        </span>
                                                                    </div>
                                                                    {item.priority === "urgent" && (
                                                                        <Badge variant="destructive">Urgent</Badge>
                                                                    )}
                                                                    {getStatusBadge(item.status)}
                                                                </div>
                                                                <div className="flex items-center gap-2 mb-2">
                                                                    <User className="size-4 text-muted-foreground" />
                                                                    <span className="font-medium">{item.patientName}</span>
                                                                    <span className="text-sm text-muted-foreground">
                                                                        ({item.patientCode})
                                                                    </span>
                                                                </div>
                                                                <div className="flex items-center gap-2">
                                                                    <Stethoscope className="size-4 text-muted-foreground" />
                                                                    <span className="text-sm text-muted-foreground">
                                                                        {item.doctor}
                                                                    </span>
                                                                </div>
                                                                <div className="mt-2">
                                                                    <Badge variant="outline" className="text-xs">
                                                                        {item.type === "preparation" && "Préparation"}
                                                                        {item.type === "consultation" && "Consultation"}
                                                                        {item.type === "vitals" && "Signes vitaux"}
                                                                    </Badge>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Summary Stats */}
                        <div className="grid grid-cols-3 gap-4">
                            <Card>
                                <CardContent className="p-4 text-center">
                                    <p className="text-2xl font-bold">{scheduleForDate.length}</p>
                                    <p className="text-sm text-muted-foreground">Total</p>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardContent className="p-4 text-center">
                                    <p className="text-2xl font-bold text-blue-600">
                                        {scheduleForDate.filter(s => s.status === "in-progress").length}
                                    </p>
                                    <p className="text-sm text-muted-foreground">En cours</p>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardContent className="p-4 text-center">
                                    <p className="text-2xl font-bold text-green-600">
                                        {scheduleForDate.filter(s => s.status === "completed").length}
                                    </p>
                                    <p className="text-sm text-muted-foreground">Terminés</p>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>

            <FloatingHelpButton />
        </div>
    );
}
