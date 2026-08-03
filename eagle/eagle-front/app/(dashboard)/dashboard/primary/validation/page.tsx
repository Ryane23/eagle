"use client";

import { useState, useMemo, useEffect } from "react";
import { toast } from "sonner";
import { DashboardHeader } from "@/components/layout/dashboard-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ShieldAlert,
  Search,
  CheckCircle,
  X,
  ArrowUp,
  ArrowDown,
  AlertTriangle,
  User,
  Heart,
  Thermometer,
  FileText,
  History,
  MessageCircle,
  Eye,
  MapPin,
  TrendingUp,
  TrendingDown,
  RefreshCw,
} from "lucide-react";
import {
  usePendingUrgenciesQuery,
  useValidateUrgency,
  useAssignUrgency,
  useRejectUrgency,
} from "@/hooks/queries/use-urgencies-query";
import { numberToLevel } from "@/actions/urgencies";
import { useDoctors } from "@/hooks/use-doctors";
import { useHospitalsQuery } from "@/hooks/queries";
import { useQueries } from "@tanstack/react-query";
import { getPatientById } from "@/actions/patients";
import { parseApiDate } from "@/lib/utils";
import type { Urgency, UrgencyStatus, Patient, Hospital } from "@/types/api";

// Display type for the validation page
type ValidationPatient = {
  id: string;
  name: string;
  age: number;
  gender: "M" | "F";
  assignedUrgency: number;
  adjustedUrgency?: number;
  centerId: string;
  centerName: string;
  centerCode: string;
  secretaryId: string;
  secretaryName: string;
  time: string;
  status: "pending" | "validated" | "adjusted";
  reason: string;
  vitalSigns: {
    bp: string;
    hr: number;
    temp: number;
    spo2: number;
    pain: number;
  };
  notes: string;
  medicalHistory: string[];
  originalUrgency: Urgency;
};

// Map API urgency to display type (patientMap/hospitalMap enrich when backend does not populate)
function urgencyToValidationPatient(
  urgency: Urgency,
  patientMap?: Record<string, Patient>,
  hospitalMap?: Record<string, Hospital>
): ValidationPatient {
  const patient = urgency.patient ?? (urgency.patientId ? patientMap?.[urgency.patientId] : undefined);
  const hospital = urgency.hospital ?? (urgency.hospitalId ? hospitalMap?.[urgency.hospitalId] : undefined);

  // Calculate age from dateOfBirth (handle Firebase Timestamp)
  const dob = patient?.dateOfBirth ? parseApiDate(patient.dateOfBirth) : null;
  const age = dob
    ? Math.floor((Date.now() - dob.getTime()) / (365.25 * 24 * 60 * 60 * 1000))
    : 0;

  // Parse vital signs
  const vitals = urgency.vitalSigns || {};

  // Map urgency status to validation status
  const mapStatus = (status: UrgencyStatus): "pending" | "validated" | "adjusted" => {
    if (status === "validated" || status === "assigned" || status === "in_progress" || status === "completed") {
      return urgency.validatedUrgencyLevel && urgency.validatedUrgencyLevel !== urgency.urgencyLevel
        ? "adjusted"
        : "validated";
    }
    return "pending";
  };

  // Format time from createdAt (handle Firebase Timestamp)
  const createdDate = parseApiDate(urgency.createdAt);
  const time = createdDate
    ? createdDate.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })
    : "--:--";

  return {
    id: urgency.id,
    name: patient ? `${patient.firstName} ${patient.lastName}` : "Patient inconnu",
    age,
    gender: (patient?.gender === "MALE" ? "M" : "F") as "M" | "F",
    assignedUrgency: urgency.urgencyLevel,
    adjustedUrgency: urgency.validatedUrgencyLevel,
    centerId: hospital?.id || "",
    centerName: hospital?.name || "Centre inconnu",
    centerCode: hospital?.name?.split(" ").map(w => w[0]).join("").toUpperCase() || "UNK",
    secretaryId: urgency.createdBy,
    secretaryName: "Secrétaire", // Would need to fetch user details
    time,
    status: mapStatus(urgency.status),
    reason: urgency.reason || urgency.description || "",
    vitalSigns: {
      bp: vitals.bloodPressure || "N/A",
      hr: vitals.heartRate || 0,
      temp: vitals.temperature || 37,
      spo2: vitals.oxygenSaturation || 98,
      pain: 0, // Not in VitalSigns type
    },
    notes: urgency.description || "",
    medicalHistory: patient?.medicalHistory || [],
    originalUrgency: urgency,
  };
}

export default function UrgencyValidationPage() {
  const [filterStatus, setFilterStatus] = useState<"pending" | "validated" | "adjusted" | "all">(
    "pending"
  );
  const [selectedPatient, setSelectedPatient] = useState<ValidationPatient | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"time" | "urgency" | "center">("time");
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [commentText, setCommentText] = useState("");

  const [rejectReason, setRejectReason] = useState("");
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedDoctorId, setSelectedDoctorId] = useState("");
  const [scheduledAt, setScheduledAt] = useState(() => {
    const d = new Date();
    d.setMinutes(d.getMinutes() + 30);
    d.setMinutes(0, 0, 0);
    return d.toISOString().slice(0, 16);
  });

  // Fetch urgencies and doctors
  const { data: urgencies = [], isLoading, refetch } = usePendingUrgenciesQuery();
  const { doctors = [], error: doctorsError } = useDoctors();
  const { data: hospitals = [] } = useHospitalsQuery();

  useEffect(() => {
    if (doctorsError) toast.error(doctorsError);
  }, [doctorsError]);
  const validateMutation = useValidateUrgency();
  const assignMutation = useAssignUrgency();
  const rejectMutation = useRejectUrgency();

  // Fetch patients by ID when backend does not populate urgency.patient (avoids "Patient inconnu")
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

  // Build hospital map from fetched hospitals
  const hospitalMap = useMemo(
    () => Object.fromEntries(hospitals.map((h) => [h.id, h])),
    [hospitals]
  );

  // Transform urgencies to display format (with patient/hospital enrichment)
  const patients = useMemo(
    () => urgencies.map((u) => urgencyToValidationPatient(u, patientMap, hospitalMap)),
    [urgencies, patientMap, hospitalMap]
  );

  const filteredPatients = patients
    .filter((patient) => {
      if (filterStatus === "all") return true;
      return patient.status === filterStatus;
    })
    .filter((patient) => {
      if (!searchQuery) return true;
      return (
        patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        patient.reason.toLowerCase().includes(searchQuery.toLowerCase())
      );
    });

  const sortedPatients = [...filteredPatients].sort((a, b) => {
    if (sortBy === "time") {
      return a.time.localeCompare(b.time);
    } else if (sortBy === "urgency") {
      const urgencyA = a.adjustedUrgency || a.assignedUrgency;
      const urgencyB = b.adjustedUrgency || b.assignedUrgency;
      return urgencyB - urgencyA;
    } else if (sortBy === "center") {
      return a.centerName.localeCompare(b.centerName);
    }
    return 0;
  });

  const pendingCount = patients.filter((p) => p.status === "pending").length;

  const getUrgencyColor = (level: number) => {
    const colors: Record<number, string> = {
      1: "bg-green-500",
      2: "bg-blue-500",
      3: "bg-yellow-500",
      4: "bg-orange-500",
      5: "bg-red-500",
    };
    return colors[level] || "bg-gray-500";
  };

  const getUrgencyText = (level: number) => {
    const texts: Record<number, string> = {
      1: "Non urgent",
      2: "Peu urgent",
      3: "Urgent",
      4: "Très urgent",
      5: "Critique",
    };
    return texts[level] || "Inconnu";
  };

  const getStatusText = (status: string) => {
    const statuses: Record<string, string> = {
      pending: "En attente",
      validated: "Validé",
      adjusted: "Ajusté",
    };
    return statuses[status] || status;
  };

  const getStatusClass = (status: string) => {
    const classes: Record<string, string> = {
      pending: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
      validated: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
      adjusted: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
    };
    return classes[status] || "bg-gray-100 text-gray-800";
  };

  const handleValidateUrgency = () => {
    if (!selectedPatient) return;
    
    const urgencyLevel = selectedPatient.adjustedUrgency || selectedPatient.assignedUrgency;
    
    validateMutation.mutate(
      {
        id: selectedPatient.id,
        data: {
          newLevel: numberToLevel(urgencyLevel),
          justification: commentText?.trim() || "Validé par le secrétariat principal",
        },
      },
      {
        onSuccess: () => {
          setSelectedPatient({
            ...selectedPatient,
            status: selectedPatient.adjustedUrgency ? "adjusted" : "validated",
          });
          setCommentText("");
        },
      }
    );
  };

  const handleAdjustUrgency = (adjustment: number) => {
    if (!selectedPatient) return;
    const currentLevel = selectedPatient.adjustedUrgency || selectedPatient.assignedUrgency;
    let newLevel = currentLevel + adjustment;
    newLevel = Math.max(1, Math.min(5, newLevel));
    toast.info(`Urgence ajustée de ${currentLevel} à ${newLevel} pour ${selectedPatient.name}`);
    setSelectedPatient({ ...selectedPatient, adjustedUrgency: newLevel, status: "adjusted" });
  };

  const handleForcePriority = () => {
    if (!selectedPatient) return;
    // Set to maximum urgency level and validate
    setSelectedPatient({ ...selectedPatient, adjustedUrgency: 5, status: "adjusted" });
    toast.info(`Priorisation forcée appliquée pour ${selectedPatient.name}`);
  };

  const handleSendComment = () => {
    if (!selectedPatient || !commentText) return;
    toast.success(`Commentaire envoyé`);
    setCommentText("");
    setShowCommentModal(false);
  };

  const handleRejectUrgency = () => {
    if (!selectedPatient) return;
    if (!rejectReason.trim()) {
      toast.error("Veuillez indiquer le motif du rejet.");
      return;
    }
    rejectMutation.mutate(
      {
        id: selectedPatient.id,
        data: { rejectionReason: rejectReason },
      },
      {
        onSuccess: () => {
          setShowRejectModal(false);
          setRejectReason("");
        },
      }
    );
  };

  const handleAssignDoctor = () => {
    if (!selectedPatient) return;
    if (!selectedDoctorId) {
      toast.error("Veuillez sélectionner un médecin.");
      return;
    }
    if (!scheduledAt) {
      toast.error("Veuillez sélectionner une date et heure.");
      return;
    }
    assignMutation.mutate(
      {
        id: selectedPatient.id,
        data: {
          assignedDoctorId: selectedDoctorId,
          scheduledAt: new Date(scheduledAt).toISOString(),
        },
      },
      {
        onSuccess: () => {
          setShowAssignModal(false);
          setSelectedDoctorId("");
          setScheduledAt(() => {
            const d = new Date();
            d.setMinutes(d.getMinutes() + 30);
            d.setMinutes(0, 0, 0);
            return d.toISOString().slice(0, 16);
          });
        },
      }
    );
  };

  const handleOpenAssignModal = () => {
    if (selectedPatient?.status === "pending") {
      toast.error("Validez d'abord l'urgence avant d'assigner un médecin.");
      return;
    }
    const d = new Date();
    d.setMinutes(d.getMinutes() + 30);
    d.setMinutes(0, 0, 0);
    setScheduledAt(d.toISOString().slice(0, 16));
    setShowAssignModal(true);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col h-full">
        <DashboardHeader breadcrumbs={[{ label: "Validation des Urgences" }]} />
        <div className="flex-1 p-4 space-y-2 overflow-hidden flex">
          <div className="w-2/5 pr-2 flex flex-col min-h-0">
            <div className="mb-2 flex flex-wrap gap-2">
              <Skeleton className="h-8 flex-1 min-w-[200px]" />
              <Skeleton className="h-8 w-32" />
              <Skeleton className="h-8 w-32" />
            </div>
            <Card className="flex-1">
              <CardHeader className="pb-3">
                <Skeleton className="h-5 w-40" />
              </CardHeader>
              <CardContent className="space-y-2">
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} className="h-24 w-full" />
                ))}
              </CardContent>
            </Card>
          </div>
          <div className="w-3/5 pl-2">
            <Card className="h-full flex items-center justify-center">
              <CardContent className="text-center p-6">
                <Skeleton className="h-12 w-12 mx-auto mb-4 rounded-full" />
                <Skeleton className="h-6 w-48 mx-auto mb-2" />
                <Skeleton className="h-4 w-64 mx-auto" />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <DashboardHeader breadcrumbs={[{ label: "Validation des Urgences" }]} />

      <div className="flex-1 p-4 space-y-2 overflow-hidden flex">
        {/* Left Panel - Patient List */}
        <div className="w-2/5 pr-2 flex flex-col min-h-0">
          {/* Filters */}
          <div className="mb-2 flex flex-wrap gap-2">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 size-3.5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Rechercher un patient..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 rounded-md text-xs bg-background border w-full h-8"
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) =>
                setFilterStatus(
                  e.target.value as "pending" | "validated" | "adjusted" | "all"
                )
              }
              className="px-3 py-1.5 rounded-md text-xs bg-background border h-8"
            >
              <option value="pending">En attente</option>
              <option value="validated">Validés</option>
              <option value="adjusted">Ajustés</option>
              <option value="all">Tous</option>
            </select>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as "time" | "urgency" | "center")}
              className="px-3 py-1.5 rounded-md text-xs bg-background border h-8"
            >
              <option value="time">Tri par heure</option>
              <option value="urgency">Tri par urgence</option>
              <option value="center">Tri par centre</option>
            </select>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => refetch()}
            >
              <RefreshCw className="size-3.5" />
            </Button>
          </div>

          {/* Patient List */}
          <Card className="flex-1 flex flex-col min-h-0">
            <CardHeader className="pb-3 shrink-0">
              <CardTitle className="text-sm flex items-center justify-between">
                <span>Patients à évaluer</span>
                <Badge variant="outline" className="text-[10px]">
                  {filteredPatients.length}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-2 flex-1 min-h-0 overflow-hidden">
              <ScrollArea className="h-full">
                <div className="space-y-2">
                  {sortedPatients.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground text-sm">
                      Aucun patient à afficher
                    </div>
                  ) : (
                    sortedPatients.map((patient) => (
                      <div
                        key={patient.id}
                        className={`p-2 rounded-lg border cursor-pointer transition-colors ${selectedPatient && selectedPatient.id === patient.id
                            ? "border-primary bg-primary/5"
                            : "hover:bg-muted/50"
                          }`}
                        onClick={() => setSelectedPatient(patient)}
                      >
                        <div className="flex justify-between items-start mb-1">
                          <div className="flex items-start gap-2">
                            <div
                              className={`${getUrgencyColor(
                                patient.adjustedUrgency || patient.assignedUrgency
                              )} size-6 rounded-full flex items-center justify-center text-white font-bold text-xs shrink-0`}
                            >
                              {patient.adjustedUrgency || patient.assignedUrgency}
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="font-medium text-sm truncate">{patient.name}</div>
                              <div className="text-[10px] text-muted-foreground">
                                {patient.age} ans, {patient.gender}
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-1">
                            <Badge variant="outline" className={`text-[9px] ${getStatusClass(patient.status)}`}>
                              {getStatusText(patient.status)}
                            </Badge>
                            <span className="text-[10px] text-muted-foreground">{patient.time}</span>
                          </div>
                        </div>
                        <div className="mt-1 text-xs">
                          <p className="line-clamp-1 text-muted-foreground">{patient.reason}</p>
                          <div className="flex items-center gap-1 mt-1">
                            {patient.vitalSigns.temp > 0 && (
                              <Badge variant="outline" className="text-[9px] px-1 py-0">
                                <Thermometer className="size-2.5 mr-0.5" />
                                {patient.vitalSigns.temp}°C
                              </Badge>
                            )}
                            {patient.vitalSigns.hr > 0 && (
                              <Badge variant="outline" className="text-[9px] px-1 py-0">
                                <Heart className="size-2.5 mr-0.5" />
                                {patient.vitalSigns.hr} bpm
                              </Badge>
                            )}
                            {patient.vitalSigns.bp !== "N/A" && (
                              <Badge variant="outline" className="text-[9px] px-1 py-0">
                                {patient.vitalSigns.bp}
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="mt-1 flex justify-between items-center text-[10px] text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <span className="bg-muted px-1 py-0.5 rounded">{patient.centerCode}</span>
                            <span>•</span>
                            <div className="flex items-center gap-1">
                              <div className="size-4 rounded-full bg-muted flex items-center justify-center text-xs">
                                S
                              </div>
                              <span>{patient.secretaryName}</span>
                            </div>
                          </div>
                          {patient.status === "adjusted" && patient.adjustedUrgency && (
                            <div className="flex items-center gap-1 text-xs">
                              {patient.adjustedUrgency > patient.assignedUrgency ? (
                                <TrendingUp className="size-3 text-red-500" />
                              ) : (
                                <TrendingDown className="size-3 text-green-500" />
                              )}
                              <span
                                className={
                                  patient.adjustedUrgency > patient.assignedUrgency
                                    ? "text-red-500"
                                    : "text-green-500"
                                }
                              >
                                {patient.assignedUrgency} → {patient.adjustedUrgency}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Right Panel - Patient Details */}
        <div className="w-3/5 pl-2 flex flex-col min-h-0">
          {selectedPatient ? (
            <Card className="flex-1 flex flex-col min-h-0">
              <CardHeader className="pb-3 shrink-0">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-sm">Validation de l&apos;urgence</CardTitle>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-muted-foreground">
                      Enregistré à {selectedPatient.time}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-7"
                      onClick={() => setSelectedPatient(null)}
                    >
                      <X className="size-3.5" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex-1 min-h-0 overflow-y-auto p-3">
                {/* Patient Header */}
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-start gap-2">
                    <div
                      className={`${getUrgencyColor(
                        selectedPatient.adjustedUrgency || selectedPatient.assignedUrgency
                      )} p-2 rounded-full`}
                    >
                      <User className="size-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-base">{selectedPatient.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {selectedPatient.age} ans, {selectedPatient.gender}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge
                      variant="outline"
                      className={`text-xs px-2 py-1 ${getUrgencyColor(
                        selectedPatient.adjustedUrgency || selectedPatient.assignedUrgency
                      )} text-white`}
                    >
                      {getUrgencyText(
                        selectedPatient.adjustedUrgency || selectedPatient.assignedUrgency
                      )}
                    </Badge>
                    <p className="text-sm text-muted-foreground mt-1">
                      Enregistré à {selectedPatient.time}
                    </p>
                  </div>
                </div>

                {/* Center & Secretary Info */}
                <div className="p-2 rounded-md bg-muted mb-3 flex justify-between">
                  <div>
                    <p className="text-[10px] text-muted-foreground">Centre</p>
                    <p className="font-medium text-sm flex items-center gap-1">
                      <MapPin className="size-3.5 text-blue-600" />
                      {selectedPatient.centerName}
                      <Badge variant="outline" className="text-[9px] px-1 py-0 ml-1">
                        {selectedPatient.centerCode}
                      </Badge>
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground">Enregistré par</p>
                    <p className="font-medium text-sm flex items-center gap-1">
                      <span className="size-5 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center text-xs">
                        S
                      </span>
                      {selectedPatient.secretaryName}
                    </p>
                  </div>
                </div>

                {/* Urgency Validation Block */}
                <div className="mb-3 flex items-stretch">
                  <div className="flex-grow p-3 rounded-l-md bg-muted">
                    <h4 className="font-medium text-sm flex items-center gap-1 mb-2">
                      <ShieldAlert className="size-4 text-orange-500" />
                      Niveau d&apos;urgence assigné
                    </h4>
                    <div className="flex items-center text-center">
                      {[1, 2, 3, 4, 5].map((level) => (
                        <div key={level} className="flex-1">
                          <div
                            className={`size-10 rounded-full ${getUrgencyColor(
                              level
                            )} mx-auto flex items-center justify-center ${selectedPatient.assignedUrgency === level
                                ? "ring-2 ring-offset-2 ring-blue-500"
                                : ""
                              }`}
                          >
                            <span className="text-white font-bold">{level}</span>
                          </div>
                          <p className="text-[10px] mt-1">{getUrgencyText(level)}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="w-44 p-3 rounded-r-md bg-primary flex flex-col justify-between">
                    <h4 className="font-medium text-sm text-primary-foreground mb-2 text-center">
                      Actions
                    </h4>
                    <div className="space-y-2">
                      <Button
                        onClick={handleValidateUrgency}
                        disabled={validateMutation.isPending}
                        className="w-full h-8 rounded bg-background text-foreground text-xs"
                      >
                        <CheckCircle className="size-3.5 mr-1" />
                        {validateMutation.isPending ? "..." : "Valider"}
                      </Button>
                      <div className="flex justify-between gap-1">
                        <Button
                          onClick={() => handleAdjustUrgency(-1)}
                          className="flex-1 h-8 rounded bg-primary-foreground/20 text-primary-foreground text-xs"
                        >
                          <ArrowDown className="size-3.5" />
                        </Button>
                        <Button
                          onClick={() => handleAdjustUrgency(1)}
                          className="flex-1 h-8 rounded bg-primary-foreground/20 text-primary-foreground text-xs"
                        >
                          <ArrowUp className="size-3.5" />
                        </Button>
                      </div>
                      <Button
                        onClick={handleForcePriority}
                        className="w-full h-8 rounded bg-destructive/20 text-destructive-foreground text-xs"
                      >
                        <AlertTriangle className="size-3.5 mr-1" />
                        Priorisation forcée
                      </Button>
                      <Button
                        onClick={handleOpenAssignModal}
                        disabled={assignMutation.isPending || selectedPatient.status === "pending"}
                        className="w-full h-8 rounded bg-primary-foreground/20 text-primary-foreground text-xs"
                        title={selectedPatient.status === "pending" ? "Validez d'abord l'urgence avant d'assigner un médecin" : undefined}
                      >
                        <User className="size-3.5 mr-1" />
                        {assignMutation.isPending ? "..." : "Assigner médecin"}
                      </Button>
                      <Button
                        onClick={() => setShowRejectModal(true)}
                        disabled={rejectMutation.isPending}
                        className="w-full h-8 rounded bg-destructive text-destructive-foreground text-xs"
                      >
                        <X className="size-3.5 mr-1" />
                        {rejectMutation.isPending ? "..." : "Rejeter"}
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Medical Justification */}
                <div className="mb-3">
                  <h4 className="font-medium text-sm flex items-center gap-1 mb-2">
                    <FileText className="size-4 text-blue-600" />
                    Justificatifs médicaux
                  </h4>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-2 rounded-md bg-muted">
                      <p className="text-[10px] text-muted-foreground">Motif de consultation</p>
                      <p className="font-medium text-sm">{selectedPatient.reason || "Non renseigné"}</p>
                    </div>
                    <div className="p-2 rounded-md bg-muted">
                      <p className="text-[10px] text-muted-foreground">Notes</p>
                      <p className="font-medium text-sm">{selectedPatient.notes || "Aucune note"}</p>
                    </div>
                  </div>
                </div>

                {/* Vital Signs */}
                <div className="mb-3">
                  <h4 className="font-medium text-sm flex items-center gap-1 mb-2">
                    <Heart className="size-4 text-red-600" />
                    Paramètres vitaux
                  </h4>
                  <div className="p-2 rounded-md bg-muted flex flex-wrap">
                    <div className="w-1/5 p-1">
                      <p className="text-[10px] text-muted-foreground">Temp.</p>
                      <p
                        className={`font-medium text-sm ${selectedPatient.vitalSigns.temp > 38 ? "text-red-600" : ""
                          }`}
                      >
                        {selectedPatient.vitalSigns.temp > 0 ? `${selectedPatient.vitalSigns.temp}°C` : "N/A"}
                      </p>
                    </div>
                    <div className="w-1/5 p-1">
                      <p className="text-[10px] text-muted-foreground">FC</p>
                      <p
                        className={`font-medium text-sm ${selectedPatient.vitalSigns.hr > 100 ? "text-red-600" : ""
                          }`}
                      >
                        {selectedPatient.vitalSigns.hr > 0 ? `${selectedPatient.vitalSigns.hr} bpm` : "N/A"}
                      </p>
                    </div>
                    <div className="w-1/5 p-1">
                      <p className="text-[10px] text-muted-foreground">TA</p>
                      <p className="font-medium text-sm">
                        {selectedPatient.vitalSigns.bp}
                      </p>
                    </div>
                    <div className="w-1/5 p-1">
                      <p className="text-[10px] text-muted-foreground">SpO2</p>
                      <p
                        className={`font-medium text-sm ${selectedPatient.vitalSigns.spo2 < 95 ? "text-red-600" : ""
                          }`}
                      >
                        {selectedPatient.vitalSigns.spo2 > 0 ? `${selectedPatient.vitalSigns.spo2}%` : "N/A"}
                      </p>
                    </div>
                    <div className="w-1/5 p-1">
                      <p className="text-[10px] text-muted-foreground">Douleur</p>
                      <p className="font-medium text-sm">
                        {selectedPatient.vitalSigns.pain > 0 ? `${selectedPatient.vitalSigns.pain}/10` : "N/A"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Medical History */}
                <div className="mb-3">
                  <h4 className="font-medium text-sm flex items-center gap-1 mb-2">
                    <History className="size-4 text-purple-600" />
                    Antécédents médicaux
                  </h4>
                  <div className="p-2 rounded-md bg-muted">
                    <div className="flex flex-wrap gap-1">
                      {selectedPatient.medicalHistory.length > 0 ? (
                        selectedPatient.medicalHistory.map((item, index) => (
                          <Badge key={index} variant="outline" className="text-[10px] px-2 py-0.5">
                            {item}
                          </Badge>
                        ))
                      ) : (
                        <span className="text-sm text-muted-foreground">Aucun antécédent renseigné</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 h-8 text-xs"
                    onClick={() => setShowCommentModal(true)}
                  >
                    <MessageCircle className="size-3.5 mr-1" />
                    Commenter
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1 h-8 text-xs">
                    <Eye className="size-3.5 mr-1" />
                    Voir DPI complet
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="flex-1 flex items-center justify-center">
              <CardContent className="text-center p-6">
                <ShieldAlert className="size-12 mx-auto mb-2 text-muted-foreground opacity-50" />
                <h3 className="text-base font-medium mb-2">Validation des niveaux d&apos;urgence</h3>
                <p className="text-sm text-muted-foreground max-w-md mx-auto mb-4">
                  Sélectionnez un patient dans la liste pour vérifier et valider son niveau
                  d&apos;urgence. Vous pouvez ajuster le niveau si nécessaire ou appliquer une
                  priorisation forcée.
                </p>
                <Badge variant="outline" className="text-xs">
                  {pendingCount} patients en attente de validation
                </Badge>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Comment Modal */}
      {showCommentModal && selectedPatient && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-96">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-sm">
                Commentaire pour {selectedPatient.secretaryName}
              </CardTitle>
              <Button
                variant="ghost"
                size="icon"
                className="size-7"
                onClick={() => setShowCommentModal(false)}
              >
                <X className="size-3.5" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              <textarea
                className="w-full p-2 rounded-md text-sm bg-background border min-h-32 resize-none"
                placeholder="Saisissez votre commentaire ici..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
              />
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                  <CheckCircle className="size-3" />
                  Une notification sera envoyée au secrétaire
                </div>
                <Button
                  size="sm"
                  className="h-8 text-xs"
                  onClick={handleSendComment}
                  disabled={!commentText}
                >
                  <MessageCircle className="size-3.5 mr-1" />
                  Envoyer
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <Card className="w-full max-w-md mx-4">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <X className="size-4 text-red-500" />
                Rejeter l&apos;urgence
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Indiquez le motif du rejet pour{" "}
                <span className="font-medium">{selectedPatient?.name}</span>.
              </p>
              <textarea
                className="w-full p-2 rounded-md text-sm bg-background border min-h-24 resize-none"
                placeholder="Motif du rejet..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
              />
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setShowRejectModal(false);
                    setRejectReason("");
                  }}
                >
                  Annuler
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleRejectUrgency}
                  disabled={rejectMutation.isPending || !rejectReason.trim()}
                >
                  {rejectMutation.isPending ? "En cours..." : "Confirmer le rejet"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Assign Doctor Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <Card className="w-full max-w-md mx-4">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <User className="size-4 text-blue-500" />
                Assigner un médecin
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Sélectionnez le médecin à assigner pour{" "}
                <span className="font-medium">{selectedPatient?.name}</span>.
              </p>
              <select
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                value={selectedDoctorId}
                onChange={(e) => setSelectedDoctorId(e.target.value)}
              >
                <option value="">Sélectionnez un médecin...</option>
                {doctors
                  .filter((d) => d.isActive)
                  .map((doctor) => (
                    <option key={doctor.id} value={doctor.id}>
                      Dr. {doctor.name}
                    </option>
                  ))}
              </select>
              <div className="space-y-1">
                <label className="text-sm font-medium">Date et heure de consultation</label>
                <Input
                  type="datetime-local"
                  value={scheduledAt}
                  onChange={(e) => setScheduledAt(e.target.value)}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setShowAssignModal(false);
                    setSelectedDoctorId("");
                  }}
                >
                  Annuler
                </Button>
                <Button
                  size="sm"
                  onClick={handleAssignDoctor}
                  disabled={assignMutation.isPending || !selectedDoctorId || !scheduledAt}
                >
                  {assignMutation.isPending ? "En cours..." : "Assigner"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
