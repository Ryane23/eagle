"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { DashboardHeader } from "@/components/layout/dashboard-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, ChevronUp, ChevronDown, RefreshCw, AlertCircle } from "lucide-react";
import { PatientDetailsModal } from "@/components/doctor/patient-details-modal";
import { toast } from "sonner";
import {
  WaitingStats,
  WaitingFilters,
  WaitingRoomKanban,
  AssignDoctorDialog,
} from "./_components";
import { useGlobalQueueQuery, useUpdateQueueStatus, useAssignConsultationDoctor, queueKeys } from "@/hooks/queries";
import { useDoctors } from "@/hooks/use-doctors";
import { useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/stores/auth-store";
import type { QueueEntry } from "@/types/api";
import type { WaitingPatient, WaitingSortOption, WaitingFilterStatus, WaitingViewMode } from "@/types/waiting-room";

// Stable numeric id from string (for patient lookup in handlers)
function stableIdFromString(s: string): number {
  return Math.abs(s.split("").reduce((acc, c) => ((acc << 5) - acc + c.charCodeAt(0)) | 0, 0));
}

// Convert queue entry to waiting patient for display
function queueEntryToWaitingPatient(entry: QueueEntry, currentTime: number): WaitingPatient {
  const patient = entry.patient;
  const consultation = entry.consultation;
  const patientName = (entry as { patientName?: string }).patientName;
  const createdAt = new Date(entry.createdAt);
  const waitMinutes = Math.round((currentTime - createdAt.getTime()) / 60000);

  // Map queue status to waiting patient status
  let status: WaitingPatient["status"] = "waiting";
  if (entry.status === "in_progress") status = "in_consultation";
  else if (entry.status === "waiting") status = patient || patientName ? "ready" : "waiting";
  else if (entry.status === "completed") status = "in_consultation";

  const appointmentTime = consultation?.scheduledAt
    ? new Date(consultation.scheduledAt).toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
    })
    : createdAt.toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
    });

  // Get doctor name and ids from consultation
  const doctorName = consultation?.doctor?.name;
  const doctorId = consultation?.doctorId ?? null;
  const specialtyId = consultation?.specialtyId ?? null;
  const hasScheduledAt = !!(consultation?.scheduledAt);
  const rawScheduledAt = consultation?.scheduledAt;
  let _scheduledAt: string | null = null;
  if (rawScheduledAt != null) {
    if (typeof rawScheduledAt === "string") _scheduledAt = rawScheduledAt;
    else if (typeof (rawScheduledAt as { toISOString?: () => string }).toISOString === "function") _scheduledAt = (rawScheduledAt as Date).toISOString();
    else if (typeof (rawScheduledAt as { seconds?: number }).seconds === "number") _scheduledAt = new Date((rawScheduledAt as { seconds: number }).seconds * 1000).toISOString();
  }

  return {
    id: stableIdFromString(entry.id),
    name: patient ? `${patient.firstName} ${patient.lastName}` : patientName || "Patient",
    age: patient ? calculateAge(patient.dateOfBirth) : 0,
    gender: patient?.gender === "MALE" ? "M" : patient?.gender === "FEMALE" ? "F" : "F",
    urgencyLevel: entry.priority,
    reason: consultation?.symptoms || "Consultation",
    specialty: specialtyId || "Médecine Générale",
    subCenter: "Centre",
    subCenterCode: "Centre",
    appointmentTime,
    waitTime: waitMinutes,
    status,
    assignedDoctor: doctorName ? `Dr. ${doctorName}` : undefined,
    _queueId: entry.id,
    _patientId: patient?.id ?? entry.patientId,
    _consultationId: consultation?.id ?? entry.consultationId,
    _doctorId: doctorId,
    _specialtyId: specialtyId,
    _hasScheduledAt: hasScheduledAt,
    _scheduledAt,
    position: entry.position,
  };
}

function calculateAge(dateOfBirth: string | Date | { seconds?: number; nanoseconds?: number }): number {
  const birth = dateOfBirth && typeof dateOfBirth === "object" && "seconds" in dateOfBirth
    ? new Date((dateOfBirth as { seconds: number }).seconds * 1000)
    : new Date(dateOfBirth as string);
  const today = new Date();
  return Math.floor((today.getTime() - birth.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
}

// Use WaitingPatient directly (includes _queueId, _patientId, _consultationId)
type ExtendedWaitingPatient = WaitingPatient;

export default function WaitingRoomPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user: currentUser } = useAuthStore();

  // TanStack Query
  const { data: hospitalQueue = [], isLoading, error, refetch } = useGlobalQueueQuery();
  const updateQueueStatusMutation = useUpdateQueueStatus();
  const assignDoctorMutation = useAssignConsultationDoctor();
  const { doctors: doctorsList } = useDoctors();
  const doctors = useMemo(
    () => doctorsList.map((u) => ({ id: u.id, name: u.name, specialty: u.specialtyId || "" })),
    [doctorsList]
  );

  const currentDoctorId = currentUser?.id ?? null;
  const currentDoctorSpecialtyId = currentUser?.specialtyId ?? null;

  // Local state
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<WaitingSortOption>("urgency");
  const [filterUrgency, setFilterUrgency] = useState("all");
  const [filterStatus, setFilterStatus] = useState<WaitingFilterStatus>("all");
  const [filterSpecialty, setFilterSpecialty] = useState("all");
  const [viewMode, setViewMode] = useState<WaitingViewMode>("grid");
  const [statsHidden, setStatsHidden] = useState(false);
  const [currentTime, setCurrentTime] = useState(() => Date.now());

  // Modal states
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [assignDoctorOpen, setAssignDoctorOpen] = useState(false);
  const [patientToAssign, setPatientToAssign] = useState<ExtendedWaitingPatient | null>(null);
  const [selectedDoctor, setSelectedDoctor] = useState("");

  // Update current time for wait calculations
  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(Date.now()), 60000);
    return () => clearInterval(interval);
  }, []);

  // Convert queue entries to waiting patients, then restrict to current doctor's specialty
  const patients = useMemo<ExtendedWaitingPatient[]>(() => {
    const list = hospitalQueue
      .filter((entry) => entry.status === "waiting" || entry.status === "in_progress")
      .map((entry) => queueEntryToWaitingPatient(entry, currentTime));
    // Only show patients whose consultation matches the doctor's specialty
    if (currentDoctorSpecialtyId) {
      return list.filter((p) => p._specialtyId === currentDoctorSpecialtyId);
    }
    return list;
  }, [hospitalQueue, currentTime, currentDoctorSpecialtyId]);

  // Get unique specialties (for filter dropdown)
  const specialties = useMemo(
    () => Array.from(new Set(patients.map((p) => p.specialty))),
    [patients]
  );

  // Stats
  const stats = useMemo(() => {
    const totalWaiting = patients.length;
    const readyPatients = patients.filter((p) => p.status === "ready").length;
    const urgentPatients = patients.filter((p) => p.urgencyLevel >= 4).length;
    const avgWaitTime = patients.length > 0
      ? Math.round(patients.reduce((sum, p) => sum + p.waitTime, 0) / patients.length)
      : 0;
    return { totalWaiting, readyPatients, urgentPatients, avgWaitTime };
  }, [patients]);

  // Apply search/urgency/status/specialty filters and sort (single list for reuse)
  const filteredAndSorted = useMemo(() => {
    const filtered = patients.filter((patient) => {
      const matchesSearch =
        patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        patient.reason.toLowerCase().includes(searchQuery.toLowerCase()) ||
        patient.subCenter.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesUrgency =
        filterUrgency === "all" || patient.urgencyLevel.toString() === filterUrgency;
      const matchesStatus = filterStatus === "all" || patient.status === filterStatus;
      const matchesSpecialty =
        filterSpecialty === "all" || patient.specialty === filterSpecialty;
      return matchesSearch && matchesUrgency && matchesStatus && matchesSpecialty;
    });

    return [...filtered].sort((a, b) => {
      switch (sortBy) {
        case "waitTime":
          return b.waitTime - a.waitTime;
        case "urgency":
          return b.urgencyLevel - a.urgencyLevel;
        case "appointment":
          return a.appointmentTime.localeCompare(b.appointmentTime);
        case "name":
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });
  }, [patients, searchQuery, sortBy, filterUrgency, filterStatus, filterSpecialty]);

  // Today's date boundaries (local) for splitting "today" vs "rendez-vous (other days)"
  const todayStart = useMemo(() => {
    const d = new Date(currentTime);
    d.setHours(0, 0, 0, 0);
    return d.getTime();
  }, [currentTime]);
  const todayEnd = useMemo(() => {
    const d = new Date(currentTime);
    d.setHours(23, 59, 59, 999);
    return d.getTime();
  }, [currentTime]);

  const isScheduledForToday = useCallback(
    (p: ExtendedWaitingPatient) => {
      if (!p._scheduledAt) return true; // no date = treat as today (in queue now)
      const t = new Date(p._scheduledAt).getTime();
      return t >= todayStart && t <= todayEnd;
    },
    [todayStart, todayEnd]
  );

  const isScheduledNotToday = useCallback(
    (p: ExtendedWaitingPatient) => {
      return !!(p._hasScheduledAt && p._scheduledAt && !isScheduledForToday(p));
    },
    [isScheduledForToday]
  );

  // Kanban: Tous / Mes patients / Non assignés = today only; Rendez-vous = scheduled for another day
  const kanbanColumns = useMemo(() => {
    const todayList = filteredAndSorted.filter(isScheduledForToday);
    const all = todayList;
    const myPatients = currentDoctorId
      ? todayList.filter((p) => p._doctorId === currentDoctorId)
      : [];
    const unassigned = todayList.filter((p) => !p._doctorId || p._doctorId === "");
    const rendezVous = filteredAndSorted.filter(isScheduledNotToday);

    return {
      all,
      myPatients,
      unassigned,
      rendezVous,
    };
  }, [filteredAndSorted, currentDoctorId, isScheduledForToday, isScheduledNotToday]);

  // Handlers
  const handleStartConsultation = useCallback(
    (patientId: number) => {
      const patient = patients.find((p) => p.id === patientId);
      if (!patient) return;

      const consultationId = patient._consultationId;
      if (!consultationId) {
        toast.error("Aucune consultation associée. Assignez un médecin d'abord.");
        return;
      }

      // Update queue status to in_progress
      if (patient._queueId) {
        updateQueueStatusMutation.mutate({
          id: patient._queueId,
          data: { status: "in_progress" },
        });
      }

      sessionStorage.setItem(
        "consultationPatient",
        JSON.stringify({
          id: consultationId,
          name: patient.name,
          patientId: patient._patientId,
          appointmentTime: patient.appointmentTime,
          urgencyLevel: patient.urgencyLevel,
          type: "queue",
          reason: patient.reason,
        })
      );
      router.push("/dashboard/doctor/consultation");
    },
    [patients, router, updateQueueStatusMutation]
  );

  const handleAssignDoctor = useCallback((patientId: number) => {
    const patient = patients.find((p) => p.id === patientId);
    if (patient) {
      setPatientToAssign(patient);
      setAssignDoctorOpen(true);
    }
  }, [patients]);

  const handleConfirmAssignment = useCallback(() => {
    const consultationId = patientToAssign?._consultationId;
    if (!consultationId || !selectedDoctor) return;

    assignDoctorMutation.mutate(
      { consultationId, doctorId: selectedDoctor },
      {
        onSuccess: () => {
          setAssignDoctorOpen(false);
          setPatientToAssign(null);
          setSelectedDoctor("");
        },
      }
    );
  }, [patientToAssign, selectedDoctor, assignDoctorMutation]);

  const handleQueueBySeverity = useCallback((patientId: number) => {
    const patient = patients.find((p) => p.id === patientId);
    if (patient) {
      // In a real implementation, this would call an API to reorder the queue
      toast.success(`Patient ${patient.name} réorganisé selon la sévérité`);
    }
  }, [patients]);

  const handleViewDetails = useCallback(
    (patientId: number) => {
      const patient = patients.find((p) => p.id === patientId);
      if (patient?._patientId) {
        setSelectedPatientId(patient._patientId);
      }
    },
    [patients]
  );

  const handleRefresh = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: queueKeys.all });
    toast.success("Données actualisées");
  }, [queryClient]);

  if (error) {
    return (
      <div className="flex flex-col h-full">
        <DashboardHeader
          breadcrumbs={[
            { label: "Tableau de bord", href: "/dashboard/doctor" },
            { label: "Salle d'attente" },
          ]}
        />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <AlertCircle className="size-12 mx-auto text-destructive mb-4" />
            <h2 className="text-lg font-semibold mb-2">Erreur de chargement</h2>
            <p className="text-muted-foreground mb-4">{error.message}</p>
            <Button onClick={() => refetch()}>
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
          { label: "Salle d'attente" },
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

      <div className="flex-1 p-4 space-y-2 overflow-y-auto">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-primary flex items-center gap-2">
              <Users className="size-7" />
              Salle d&apos;Attente
            </h1>
            <p className="text-muted-foreground">
              Patients de différents sous-centres par spécialité
            </p>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="flex items-center gap-2">
          <div className="flex-1">
            {!statsHidden && (
              isLoading ? (
                <div className="grid gap-2 md:grid-cols-4">
                  {[1, 2, 3, 4].map((i) => (
                    <Card key={i}>
                      <CardContent className="p-3">
                        <Skeleton className="h-12 w-full" />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <WaitingStats
                  totalWaiting={stats.totalWaiting}
                  readyPatients={stats.readyPatients}
                  urgentPatients={stats.urgentPatients}
                  avgWaitTime={stats.avgWaitTime}
                />
              )
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-2 gap-1 shrink-0"
            onClick={() => setStatsHidden(!statsHidden)}
          >
            {statsHidden ? (
              <>
                <ChevronDown className="size-3" />
                <span className="text-[10px]">Afficher stats</span>
              </>
            ) : (
              <>
                <ChevronUp className="size-3" />
                <span className="text-[10px]">Masquer stats</span>
              </>
            )}
          </Button>
        </div>

        {/* Filters */}
        <WaitingFilters
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          sortBy={sortBy}
          onSortChange={setSortBy}
          filterUrgency={filterUrgency}
          onUrgencyChange={setFilterUrgency}
          filterStatus={filterStatus}
          onStatusChange={setFilterStatus}
          filterSpecialty={filterSpecialty}
          onSpecialtyChange={setFilterSpecialty}
          specialties={specialties}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
        />

        {/* Kanban: All | My patients | Unassigned | Rendez-vous */}
        <div className="flex-1 min-h-0">
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2].map((i) => (
                <Card key={i}>
                  <CardContent className="p-4">
                    <Skeleton className="h-32 w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : patients.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center">
                <Users className="size-12 mx-auto mb-4 text-muted-foreground/50" />
                <p className="text-muted-foreground">
                  Aucun patient en attente pour votre spécialité
                </p>
              </CardContent>
            </Card>
          ) : (
            <WaitingRoomKanban
              columns={kanbanColumns}
              viewMode={viewMode}
              onStartConsultation={handleStartConsultation}
              onQueueBySeverity={handleQueueBySeverity}
              onAssignDoctor={handleAssignDoctor}
              onViewDetails={handleViewDetails}
            />
          )}
        </div>
      </div>

      {/* Assign Doctor Dialog */}
      <AssignDoctorDialog
        open={assignDoctorOpen}
        onOpenChange={(open) => {
          if (!open) {
            setPatientToAssign(null);
            setSelectedDoctor("");
          }
          setAssignDoctorOpen(open);
        }}
        doctors={doctors}
        selectedDoctor={selectedDoctor}
        onDoctorChange={setSelectedDoctor}
        onConfirm={handleConfirmAssignment}
        patientSpecialty={patientToAssign?.specialty}
        isPending={assignDoctorMutation.isPending}
        hasConsultation={!!patientToAssign?._consultationId}
      />

      {/* Patient Details Modal */}
      <PatientDetailsModal
        open={selectedPatientId !== null}
        onOpenChange={(open) => !open && setSelectedPatientId(null)}
        patientId={selectedPatientId}
        onStartConsultation={(patientId) => {
          const patient = patients.find((p) => p._patientId === patientId);
          if (patient) handleStartConsultation(patient.id);
          setSelectedPatientId(null);
        }}
      />
    </div>
  );
}
