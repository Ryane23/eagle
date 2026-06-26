"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { DashboardHeader } from "@/components/layout/dashboard-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Calendar,
  Clock,
  Video,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  CheckCircle,
  Play,
  RefreshCw,
  AlertCircle,
} from "lucide-react";
import { useScheduleQuery, useConsultationsQuery, useStartConsultation, useCancelConsultation, consultationKeys } from "@/hooks/queries";
import { useQueryClient } from "@tanstack/react-query";
import type { Consultation } from "@/types/api";
import { toast } from "sonner";

// Helper to get urgency level from consultation
function getUrgencyLevel(consultation: Consultation): number {
  if (!consultation.urgencyLevel) return 2;
  const level = parseInt(consultation.urgencyLevel, 10);
  return isNaN(level) ? 2 : level;
}

const statusConfig = {
  scheduled: { label: "Planifié", color: "bg-blue-100 text-blue-800" },
  in_progress: { label: "En cours", color: "bg-green-100 text-green-800" },
  completed: { label: "Terminé", color: "bg-gray-100 text-gray-800" },
  cancelled: { label: "Annulé", color: "bg-red-100 text-red-800" },
};

export default function SchedulePage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [view, setView] = useState("day");

  // TanStack Query
  const { data: schedule = [], isLoading: scheduleLoading, error: scheduleError } = useScheduleQuery();
  const { data: consultations = [], isLoading: consultationsLoading, error: consultationsError } = useConsultationsQuery();
  const startConsultationMutation = useStartConsultation();
  const cancelConsultationMutation = useCancelConsultation();

  const isLoading = scheduleLoading || consultationsLoading;
  const error = scheduleError || consultationsError;

  // Combine and filter consultations for selected date
  const dayAppointments = useMemo(() => {
    const allConsultations = [...schedule, ...consultations];
    const uniqueConsultations = allConsultations.filter(
      (c, idx, self) => idx === self.findIndex((t) => t.id === c.id)
    );

    // Format selected date as YYYY-MM-DD safely
    const selectedDateStr = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`;

    return uniqueConsultations
      .filter((c) => {
        const dateStr = c.scheduledAt || c.createdAt;
        if (!dateStr) return false;

        const consultDate = new Date(dateStr);
        // Check if date is valid
        if (isNaN(consultDate.getTime())) return false;

        // Format consultation date as YYYY-MM-DD
        const consultDateStr = `${consultDate.getFullYear()}-${String(consultDate.getMonth() + 1).padStart(2, '0')}-${String(consultDate.getDate()).padStart(2, '0')}`;
        return consultDateStr === selectedDateStr;
      })
      .sort((a, b) => {
        const timeA = a.scheduledAt || a.createdAt;
        const timeB = b.scheduledAt || b.createdAt;
        return new Date(timeA).getTime() - new Date(timeB).getTime();
      });
  }, [schedule, consultations, selectedDate]);

  // Stats
  const stats = useMemo(() => {
    return {
      total: dayAppointments.length,
      completed: dayAppointments.filter((a) => a.status === "completed").length,
      remaining: dayAppointments.filter(
        (a) => a.status === "scheduled" || a.status === "in_progress"
      ).length,
    };
  }, [dayAppointments]);

  const hours = Array.from({ length: 10 }, (_, i) => i + 8);

  // Date navigation
  const goToPreviousDay = () => {
    setSelectedDate((prev) => {
      const newDate = new Date(prev);
      newDate.setDate(newDate.getDate() - 1);
      return newDate;
    });
  };

  const goToNextDay = () => {
    setSelectedDate((prev) => {
      const newDate = new Date(prev);
      newDate.setDate(newDate.getDate() + 1);
      return newDate;
    });
  };

  const goToToday = () => {
    setSelectedDate(new Date());
  };

  // Handle start consultation
  const handleStartConsultation = useCallback(
    (consultation: Consultation) => {
      startConsultationMutation.mutate(consultation.id, {
        onSuccess: () => {
          const patient = consultation.patient;
          if (patient) {
            sessionStorage.setItem(
              "consultationPatient",
              JSON.stringify({
                id: consultation.id,
                name: `${patient.firstName} ${patient.lastName}`,
                patientId: patient.id,
                appointmentTime: consultation.scheduledAt
                  ? new Date(consultation.scheduledAt).toLocaleTimeString("fr-FR", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                  : "",
                urgencyLevel: getUrgencyLevel(consultation),
                type: consultation.type === "video" ? "new" : "followup",
                reason: consultation.symptoms || "Consultation",
              })
            );
          }
          router.push("/dashboard/doctor/consultation");
        },
      });
    },
    [startConsultationMutation, router]
  );

  const handleCancelConsultation = useCallback(
    (consultationId: string) => {
      cancelConsultationMutation.mutate(consultationId);
    },
    [cancelConsultationMutation]
  );

  const handleRefresh = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: consultationKeys.all });
    toast.success("Données actualisées");
  }, [queryClient]);

  // Format date for display
  const formatDate = (date: Date) => {
    return date.toLocaleDateString("fr-FR", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  // Get appointment time
  const getAppointmentTime = (consultation: Consultation) => {
    const date = consultation.scheduledAt
      ? new Date(consultation.scheduledAt)
      : new Date(consultation.createdAt);
    return date.toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Get appointment hour
  const getAppointmentHour = (consultation: Consultation) => {
    const date = consultation.scheduledAt
      ? new Date(consultation.scheduledAt)
      : new Date(consultation.createdAt);
    return date.getHours();
  };

  // Get appointment minute offset
  const getAppointmentMinuteOffset = (consultation: Consultation) => {
    const date = consultation.scheduledAt
      ? new Date(consultation.scheduledAt)
      : new Date(consultation.createdAt);
    return date.getMinutes();
  };

  if (error) {
    return (
      <div className="flex flex-col h-full">
        <DashboardHeader
          breadcrumbs={[
            { label: "Tableau de bord", href: "/dashboard/doctor" },
            { label: "Mon planning" },
          ]}
        />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <AlertCircle className="size-12 mx-auto text-destructive mb-4" />
            <h2 className="text-lg font-semibold mb-2">Erreur de chargement</h2>
            <p className="text-muted-foreground mb-4">{error.message}</p>
            <Button onClick={handleRefresh}>
              <RefreshCw className="size-4 mr-2" />
              Réessayer
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <DashboardHeader
        breadcrumbs={[
          { label: "Tableau de bord", href: "/dashboard/doctor" },
          { label: "Mon planning" },
        ]}
        actions={
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isLoading}
            className="h-8"
          >
            <RefreshCw className={`size-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
            Actualiser
          </Button>
        }
      />

      <div className="flex-1 p-4 space-y-4 overflow-y-auto">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-primary flex items-center gap-2">
              <Calendar className="size-5" />
              Mon planning
            </h1>
            <p className="text-xs text-muted-foreground">
              Gérez vos consultations et rendez-vous
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" className="size-8" onClick={goToPreviousDay}>
              <ChevronLeft className="size-4" />
            </Button>
            <Button variant="outline" size="sm" className="h-8" onClick={goToToday}>
              <Calendar className="size-4 mr-1.5" />
              Aujourd&apos;hui
            </Button>
            <Button variant="outline" size="icon" className="size-8" onClick={goToNextDay}>
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <Card>
            <CardContent className="p-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-full bg-blue-100">
                  <Calendar className="size-4 text-blue-600" />
                </div>
                <div>
                  {isLoading ? (
                    <Skeleton className="h-7 w-8" />
                  ) : (
                    <p className="text-xl font-bold">{stats.total}</p>
                  )}
                  <p className="text-[10px] text-muted-foreground">Consultations</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-full bg-green-100">
                  <CheckCircle className="size-4 text-green-600" />
                </div>
                <div>
                  {isLoading ? (
                    <Skeleton className="h-7 w-8" />
                  ) : (
                    <p className="text-xl font-bold">{stats.completed}</p>
                  )}
                  <p className="text-[10px] text-muted-foreground">Terminées</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-full bg-orange-100">
                  <Clock className="size-4 text-orange-600" />
                </div>
                <div>
                  {isLoading ? (
                    <Skeleton className="h-7 w-8" />
                  ) : (
                    <p className="text-xl font-bold">{stats.remaining}</p>
                  )}
                  <p className="text-[10px] text-muted-foreground">Restantes</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs value={view} onValueChange={setView}>
          <TabsList>
            <TabsTrigger value="day">Jour</TabsTrigger>
            <TabsTrigger value="week">Semaine</TabsTrigger>
            <TabsTrigger value="list">Liste</TabsTrigger>
          </TabsList>

          <TabsContent value="day" className="mt-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm capitalize">{formatDate(selectedDate)}</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {isLoading ? (
                  <div className="p-4 space-y-4">
                    {[1, 2, 3].map((i) => (
                      <Skeleton key={i} className="h-16 w-full" />
                    ))}
                  </div>
                ) : dayAppointments.length === 0 ? (
                  <div className="p-8 text-center">
                    <Calendar className="size-12 mx-auto mb-4 text-muted-foreground/50" />
                    <p className="text-muted-foreground">Aucune consultation pour cette date</p>
                  </div>
                ) : (
                  <ScrollArea className="h-[calc(100vh-420px)]">
                    <div className="relative">
                      {hours.map((hour) => (
                        <div key={hour} className="flex border-t">
                          <div className="w-16 p-2 text-xs text-muted-foreground text-right pr-3 shrink-0">
                            {hour}:00
                          </div>
                          <div className="flex-1 min-h-[60px] relative border-l">
                            {dayAppointments
                              .filter((a) => getAppointmentHour(a) === hour)
                              .map((appointment) => {
                                const patient = appointment.patient;
                                const patientName = patient
                                  ? `${patient.firstName} ${patient.lastName}`
                                  : "Patient";

                                return (
                                  <div
                                    key={appointment.id}
                                    className={`absolute left-1 right-1 p-2 rounded border-l-4 ${appointment.status === "completed"
                                      ? "bg-gray-50 border-gray-400"
                                      : appointment.status === "in_progress"
                                        ? "bg-green-50 border-green-500"
                                        : "bg-blue-50 border-blue-500"
                                      }`}
                                    style={{
                                      top: `${(getAppointmentMinuteOffset(appointment) / 60) * 60}px`,
                                      height: "45px",
                                    }}
                                  >
                                    <div className="flex items-start justify-between">
                                      <div className="min-w-0 flex-1">
                                        <p className="font-medium text-xs truncate">{patientName}</p>
                                        <p className="text-[10px] text-muted-foreground truncate">
                                          {appointment.symptoms || appointment.type}
                                        </p>
                                      </div>
                                      <div className="flex items-center gap-1">
                                        {getUrgencyLevel(appointment) >= 4 && (
                                          <AlertTriangle className="size-3 text-orange-500" />
                                        )}
                                        <Video className="size-3 text-blue-500" />
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="list" className="mt-4">
            <Card>
              <CardContent className="p-0">
                {isLoading ? (
                  <div className="p-4 space-y-4">
                    {[1, 2, 3, 4].map((i) => (
                      <Skeleton key={i} className="h-16 w-full" />
                    ))}
                  </div>
                ) : dayAppointments.length === 0 ? (
                  <div className="p-8 text-center">
                    <Calendar className="size-12 mx-auto mb-4 text-muted-foreground/50" />
                    <p className="text-muted-foreground">Aucune consultation pour cette date</p>
                  </div>
                ) : (
                  <ScrollArea className="h-[calc(100vh-380px)]">
                    <div className="divide-y">
                      {dayAppointments.map((appointment) => {
                        const patient = appointment.patient;
                        const patientName = patient
                          ? `${patient.firstName} ${patient.lastName}`
                          : "Patient";
                        const status = statusConfig[appointment.status as keyof typeof statusConfig] || statusConfig.scheduled;

                        return (
                          <div key={appointment.id} className="p-3 hover:bg-muted/50">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className="text-center">
                                  <p className="text-sm font-bold">
                                    {getAppointmentTime(appointment)}
                                  </p>
                                  <p className="text-[10px] text-muted-foreground">30 min</p>
                                </div>
                                <div className="h-10 w-px bg-border" />
                                <div>
                                  <div className="flex items-center gap-2">
                                    <p className="font-medium text-sm">{patientName}</p>
                                    <Badge
                                      className={`text-[10px] ${getUrgencyLevel(appointment) >= 4
                                        ? "bg-orange-500"
                                        : "bg-blue-500"
                                        }`}
                                    >
                                      U{getUrgencyLevel(appointment)}
                                    </Badge>
                                  </div>
                                  <p className="text-xs text-muted-foreground">
                                    {appointment.symptoms || appointment.type || "Consultation"}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge className={status.color}>{status.label}</Badge>
                                {appointment.status === "scheduled" && (
                                  <div className="flex gap-1">
                                    <Button
                                      size="sm"
                                      className="h-7"
                                      onClick={() => handleStartConsultation(appointment)}
                                    >
                                      <Play className="size-3 mr-1" />
                                      Démarrer
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-7 text-red-500 hover:text-red-600"
                                      onClick={() => handleCancelConsultation(appointment.id)}
                                      disabled={cancelConsultationMutation.isPending}
                                    >
                                      Annuler
                                    </Button>
                                  </div>
                                )}
                                {appointment.status === "in_progress" && (
                                  <Button
                                    size="sm"
                                    className="h-7"
                                    onClick={() => handleStartConsultation(appointment)}
                                  >
                                    <Video className="size-3 mr-1" />
                                    Rejoindre
                                  </Button>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </ScrollArea>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="week" className="mt-4">
            <Card>
              <CardContent className="p-4">
                <p className="text-center text-muted-foreground">
                  Vue semaine - Fonctionnalité à venir
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
