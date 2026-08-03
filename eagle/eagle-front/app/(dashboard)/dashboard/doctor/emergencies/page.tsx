"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { DashboardHeader } from "@/components/layout/dashboard-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertTriangle,
  Search,
  Phone,
  CheckCircle2,
  ChevronUp,
  ChevronDown,
  RefreshCw,
  AlertCircle,
} from "lucide-react";
import { PatientDetailsModal } from "@/components/doctor/patient-details-modal";
import { EmergencyStats, EmergencyCard, UrgencyDialog } from "./_components";
import {
  useUrgenciesQuery,
  useUrgencyStats,
  useStartUrgencyConsultation,
  useCompleteUrgency,
  urgencyKeys,
} from "@/hooks/queries";
import { useQueryClient, useQueries } from "@tanstack/react-query";
import { getPatientById } from "@/actions/patients";
import type { Urgency, Patient } from "@/types/api";
import type { EmergencyPatient, EmergencyStatus } from "@/types/emergencies";
import { toast } from "sonner";

// Convert API Urgency to EmergencyPatient for component display (optional patientMap enriches when backend does not populate patient)
function urgencyToEmergencyPatient(
  urgency: Urgency,
  currentTime: number,
  patientMap?: Record<string, Patient>
): EmergencyPatient {
  const patient = urgency.patient ?? (urgency.patientId ? patientMap?.[urgency.patientId] : undefined);
  const createdAt = new Date(urgency.createdAt);
  const waitMinutes = Math.round((currentTime - createdAt.getTime()) / 60000);

  // Map API status to component status
  let status: EmergencyStatus = "urgent";
  if (urgency.status === "completed") status = "resolved";
  else if (urgency.status === "in_progress") status = "in_consultation";
  else if (urgency.urgencyLevel === 5) status = "critical";
  else if (urgency.urgencyLevel === 4) status = "urgent";
  else if (urgency.urgencyLevel <= 3) status = "stable";

  // Get assigned doctor name
  const doctorName = urgency.doctor?.name;

  // Use original ID or create a unique hash from the string ID
  const numericId = parseInt(urgency.id, 10);
  const uniqueId = !isNaN(numericId) ? numericId : Math.abs(urgency.id.split('').reduce((a, b) => ((a << 5) - a) + b.charCodeAt(0), 0));

  return {
    id: uniqueId,
    name: patient ? `${patient.firstName} ${patient.lastName}` : "Patient inconnu",
    age: patient ? calculateAge(patient.dateOfBirth) : 0,
    gender: patient?.gender === "MALE" ? "M" : "F",
    urgencyLevel: urgency.urgencyLevel,
    reason: urgency.reason,
    symptoms: urgency.description ? [urgency.description] : [],
    waitTime: waitMinutes,
    status,
    assignedDoctor: doctorName ? `Dr. ${doctorName}` : undefined,
    center: urgency.hospital?.name || "Centre non spécifié",
    vitalSigns: urgency.vitalSigns || {
      temperature: 0,
      bloodPressure: "-",
      heartRate: 0,
      oxygenSaturation: 0,
    },
    // Store original urgency ID for API calls
    _urgencyId: urgency.id,
  };
}

function calculateAge(dateOfBirth: string): number {
  const birth = new Date(dateOfBirth);
  const today = new Date();
  return Math.floor((today.getTime() - birth.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
}

// Extend EmergencyPatient to include original urgency ID
type ExtendedEmergencyPatient = EmergencyPatient & { _urgencyId?: string };

export default function EmergenciesPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  // TanStack Query
  const { data: urgencies = [], isLoading, error, refetch } = useUrgenciesQuery();
  const urgencyStats = useUrgencyStats();
  const startUrgencyMutation = useStartUrgencyConsultation();
  const completeUrgencyMutation = useCompleteUrgency();

  // Optional: fetch patients by id when backend does not populate urgency.patient (avoids "Patient inconnu")
  const patientIdsToFetch = useMemo(
    () => [...new Set(urgencies.filter((u) => !u.patient && u.patientId).map((u) => u.patientId))],
    [urgencies]
  );
  const patientQueries = useQueries({
    queries: patientIdsToFetch.map((id) => ({
      queryKey: ["patient", id],
      queryFn: () => getPatientById(id),
      staleTime: 60 * 1000,
    })),
  });
  const patientMap = useMemo(() => {
    const map: Record<string, Patient> = {};
    patientQueries.forEach((q, i) => {
      if (q.data && patientIdsToFetch[i]) map[patientIdsToFetch[i]] = q.data;
    });
    return map;
  }, [patientQueries, patientIdsToFetch]);

  // Local state
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<EmergencyStatus | "all">("all");
  const [activeTab, setActiveTab] = useState("all");
  const [statsHidden, setStatsHidden] = useState(false);
  const [currentTime, setCurrentTime] = useState(() => Date.now());

  // Modal states
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [urgencyDialogOpen, setUrgencyDialogOpen] = useState(false);
  const [, setSelectedUrgencyForModify] = useState<string | null>(null);

  // Update current time for wait calculations
  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(Date.now()), 60000);
    return () => clearInterval(interval);
  }, []);

  // Convert urgencies to display format (use patientMap when backend does not populate patient)
  const patients = useMemo<ExtendedEmergencyPatient[]>(() => {
    return urgencies.map((u) => urgencyToEmergencyPatient(u, currentTime, patientMap));
  }, [urgencies, currentTime, patientMap]);

  // Statistics
  const stats = useMemo(() => {
    const criticalCount = urgencies.filter((u) => u.urgencyLevel === 5).length;
    const urgentCount = urgencies.filter((u) => u.urgencyLevel === 4).length;
    const moderateCount = urgencies.filter((u) => u.urgencyLevel === 3).length;
    const inConsultationCount = urgencies.filter((u) => u.status === "in_progress").length;
    const activeUrgencies = urgencies.filter(
      (u) => u.status !== "completed" && u.status !== "rejected"
    );
    const avgWaitTime =
      activeUrgencies.length > 0
        ? Math.round(
          activeUrgencies.reduce((sum, u) => {
            const createdAt = new Date(u.createdAt);
            return sum + (currentTime - createdAt.getTime()) / 60000;
          }, 0) / activeUrgencies.length
        )
        : 0;
    return { criticalCount, urgentCount, moderateCount, inConsultationCount, avgWaitTime };
  }, [urgencies, currentTime]);

  // Filtering and sorting
  const filteredPatients = useMemo(() => {
    const filtered = patients.filter((patient) => {
      const matchesSearch =
        patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        patient.reason.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = filterStatus === "all" || patient.status === filterStatus;

      let matchesTab = true;
      if (activeTab === "critical") matchesTab = patient.urgencyLevel === 5;
      else if (activeTab === "urgent") matchesTab = patient.urgencyLevel === 4;
      else if (activeTab === "moderate") matchesTab = patient.urgencyLevel === 3;

      return matchesSearch && matchesStatus && matchesTab;
    });

    // Sort by urgency and wait time
    return filtered.sort((a, b) => {
      if (b.urgencyLevel !== a.urgencyLevel) {
        return b.urgencyLevel - a.urgencyLevel;
      }
      return b.waitTime - a.waitTime;
    });
  }, [patients, searchQuery, filterStatus, activeTab]);

  // Handlers
  const handleStartConsultation = useCallback(
    async (patientId: number) => {
      const patient = patients.find((p) => p.id === patientId);
      if (!patient?._urgencyId) return;

      startUrgencyMutation.mutate(patient._urgencyId, {
        onSuccess: () => {
          const urgency = urgencies.find((u) => u.id === patient._urgencyId);
          // Use consultation id when assigned (backend sets it); fallback to urgency id for backwards compatibility
          const consultationId = urgency?.consultationId ?? patient._urgencyId;
          sessionStorage.setItem(
            "consultationPatient",
            JSON.stringify({
              id: consultationId,
              name: patient.name,
              patientId: urgency?.patient?.id ?? urgency?.patientId ?? "",
              urgencyLevel: patient.urgencyLevel,
              type: "urgency",
              reason: patient.reason,
            })
          );
          if (!urgency?.consultationId) {
            toast.warning(
              "La consultation n'est pas encore liée. Si la page ne charge pas, revenez aux urgences."
            );
          }
          router.push("/dashboard/doctor/consultation");
        },
      });
    },
    [patients, urgencies, startUrgencyMutation, router]
  );

  const handleResolveEmergency = useCallback(
    async (patientId: number) => {
      const patient = patients.find((p) => p.id === patientId);
      if (!patient?._urgencyId) return;

      completeUrgencyMutation.mutate(patient._urgencyId);
    },
    [patients, completeUrgencyMutation]
  );

  const handleViewDetails = useCallback(
    (patientId: number) => {
      const patient = patients.find((p) => p.id === patientId);
      if (patient) {
        const urgency = urgencies.find((u) => u.id === patient._urgencyId);
        if (urgency?.patient?.id) {
          setSelectedPatientId(urgency.patient.id);
        }
      }
    },
    [patients, urgencies]
  );

  const handleOpenUrgencyDialog = useCallback(
    (patientId: number) => {
      const patient = patients.find((p) => p.id === patientId);
      if (patient?._urgencyId) {
        setSelectedUrgencyForModify(patient._urgencyId);
        setUrgencyDialogOpen(true);
      }
    },
    [patients]
  );

  const handleModifyUrgency = useCallback(
    async () => {
      // Note: The API might not support modifying urgency level directly
      // This would need a validateUrgency or similar endpoint
      toast.info("Modification de l'urgence - Fonctionnalité à implémenter");
      setUrgencyDialogOpen(false);
      setSelectedUrgencyForModify(null);
    },
    []
  );

  const handleRefresh = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: urgencyKeys.all });
    toast.success("Données actualisées");
  }, [queryClient]);

  if (error) {
    return (
      <div className="flex flex-col h-full">
        <DashboardHeader
          breadcrumbs={[
            { label: "Tableau de bord", href: "/dashboard/doctor" },
            { label: "Gestion des Urgences" },
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
          { label: "Gestion des Urgences" },
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
              <AlertTriangle className="size-7 text-red-600" />
              Gestion des Urgences
            </h1>
            <p className="text-muted-foreground">
              Suivi et prise en charge des cas urgents
            </p>
          </div>
          <Button className="gap-2 bg-red-600 hover:bg-red-700">
            <Phone className="size-4" />
            Appeler SAMU
          </Button>
        </div>

        {/* Quick Stats with Toggle */}
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
                <EmergencyStats
                  criticalCount={stats.criticalCount}
                  urgentCount={stats.urgentCount}
                  inConsultationCount={stats.inConsultationCount}
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

        {/* Tabs for Urgency Levels */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4 max-w-2xl">
            <TabsTrigger value="all">Tous ({patients.length})</TabsTrigger>
            <TabsTrigger value="critical" className="text-red-600">
              Critiques ({stats.criticalCount})
            </TabsTrigger>
            <TabsTrigger value="urgent" className="text-orange-600">
              Urgents ({stats.urgentCount})
            </TabsTrigger>
            <TabsTrigger value="moderate">
              Modérés ({stats.moderateCount})
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="space-y-2 mt-2">
            {/* Filters */}
            <Card>
              <CardContent className="pt-2">
                <div className="flex flex-wrap gap-1.5">
                  <div className="flex-1 min-w-[180px]">
                    <div className="relative">
                      <Search className="absolute left-2 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
                      <Input
                        type="search"
                        placeholder="Rechercher..."
                        className="pl-8 h-8 text-xs"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                  </div>

                  <Select
                    value={filterStatus}
                    onValueChange={(v) => setFilterStatus(v as EmergencyStatus | "all")}
                  >
                    <SelectTrigger className="w-[150px] h-8 text-xs">
                      <SelectValue placeholder="Statut" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous statuts</SelectItem>
                      <SelectItem value="critical">Critique</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                      <SelectItem value="stable">Stable</SelectItem>
                      <SelectItem value="in_consultation">En consultation</SelectItem>
                      <SelectItem value="resolved">Résolu</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Emergency Patient List */}
            <div className="space-y-2">
              {isLoading ? (
                <div className="space-y-2">
                  {[1, 2, 3].map((i) => (
                    <Card key={i}>
                      <CardContent className="p-4">
                        <Skeleton className="h-24 w-full" />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : filteredPatients.length === 0 ? (
                <Card>
                  <CardContent className="py-8 text-center">
                    <CheckCircle2 className="size-10 mx-auto text-green-500 mb-3" />
                    <p className="text-sm font-medium text-muted-foreground">
                      Aucune urgence en attente
                    </p>
                  </CardContent>
                </Card>
              ) : (
                filteredPatients.map((patient) => (
                  <EmergencyCard
                    key={patient.id}
                    patient={patient}
                    onStartConsultation={handleStartConsultation}
                    onResolve={handleResolveEmergency}
                    onViewDetails={handleViewDetails}
                    onModifyUrgency={handleOpenUrgencyDialog}
                  />
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Patient Details Modal */}
      <PatientDetailsModal
        open={selectedPatientId !== null}
        onOpenChange={(open) => !open && setSelectedPatientId(null)}
        patientId={selectedPatientId}
        onStartConsultation={(patientId) => {
          const patient = patients.find(
            (p) => urgencies.find((u) => u.id === p._urgencyId)?.patient?.id === patientId
          );
          if (patient) handleStartConsultation(patient.id);
          setSelectedPatientId(null);
        }}
      />

      {/* Urgency Modification Dialog */}
      <UrgencyDialog
        open={urgencyDialogOpen}
        onOpenChange={setUrgencyDialogOpen}
        onSelect={handleModifyUrgency}
      />
    </div>
  );
}
