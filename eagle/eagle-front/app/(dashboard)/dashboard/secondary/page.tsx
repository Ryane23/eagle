"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { DashboardHeader } from "@/components/layout/dashboard-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Users,
  Clock,
  CheckCircle,
  AlertTriangle,
  ChevronUp,
  ChevronDown,
  UserPlus,
  ClipboardList,
  Search,
  History,
  Bell,
  ArrowRight,
  Activity,
  Calendar,
  Stethoscope,
} from "lucide-react";
import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  useHospitalQueueQuery,
  useQueueStats,
  useConsultationsQuery,
  useConsultationStats,
  useUrgencyStats,
  useNotificationsQuery,
  usePatientsQuery,
  useSpecialtiesQuery,
} from "@/hooks/queries";
import { useCreateUrgency } from "@/hooks/queries/use-urgencies-query";
import type { QueueEntry, Consultation } from "@/types/api";

const quickActions = [
  { title: "Nouveau patient", href: "/dashboard/secondary/register", icon: UserPlus, color: "bg-blue-500" },
  { title: "File d'attente", href: "/dashboard/secondary/queue", icon: ClipboardList, color: "bg-orange-500" },
  { title: "Rechercher", href: "/dashboard/secondary/patients", icon: Search, color: "bg-purple-500" },
  { title: "Historique", href: "/dashboard/secondary/history", icon: History, color: "bg-green-500" },
];

const getUrgencyColor = (level: number) => {
  if (level >= 5) return "bg-red-500";
  if (level >= 4) return "bg-orange-500";
  if (level >= 3) return "bg-yellow-500";
  return "bg-green-500";
};

function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 60) return `Il y a ${diffMins} min`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `Il y a ${diffHours}h`;
  return `Il y a ${Math.floor(diffHours / 24)}j`;
}

export default function SecondarySecretaryDashboard() {
  const router = useRouter();
  const [statsHidden, setStatsHidden] = useState(false);
  const [currentTime, setCurrentTime] = useState(() => Date.now());

  // Urgency creation state
  const [urgencyOpen, setUrgencyOpen] = useState(false);
  const [urgencyPatientId, setUrgencyPatientId] = useState("");
  const [urgencySpecialtyId, setUrgencySpecialtyId] = useState("");
  const [urgencyReason, setUrgencyReason] = useState("");
  const [urgencyDescription, setUrgencyDescription] = useState("");
  const [urgencyLevel, setUrgencyLevel] = useState(3);

  // Update time every minute for wait time calculations
  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(Date.now()), 60000);
    return () => clearInterval(interval);
  }, []);

  // TanStack Query hooks (patients + specialties only when urgency modal is open to speed up initial load)
  const { data: queueEntries = [], isLoading: queueLoading } = useHospitalQueueQuery();
  const { data: consultations = [], isLoading: consultationsLoading } = useConsultationsQuery();
  const { data: notifications = [] } = useNotificationsQuery();
  const { data: patients = [], isLoading: patientsLoading } = usePatientsQuery(undefined, { enabled: urgencyOpen });
  const { data: specialties = [], isLoading: specialtiesLoading } = useSpecialtiesQuery(true, { enabled: urgencyOpen });
  const queueStats = useQueueStats();
  const consultationStats = useConsultationStats();
  const urgencyStats = useUrgencyStats();
  const createUrgencyMutation = useCreateUrgency();

  const handleCreateUrgency = () => {
    if (!urgencyPatientId) {
      return;
    }
    if (!urgencyReason.trim()) {
      return;
    }
    const requestedSpecialty = specialties.find((s) => s.id === urgencySpecialtyId)?.name ?? "Médecine générale";
    createUrgencyMutation.mutate(
      {
        patientId: urgencyPatientId,
        specialtyId: urgencySpecialtyId || undefined,
        reason: urgencyReason,
        description: urgencyDescription || undefined,
        urgencyLevel,
        requestedSpecialty,
      },
      {
        onSuccess: () => {
          setUrgencyOpen(false);
          setUrgencyPatientId("");
          setUrgencySpecialtyId("");
          setUrgencyReason("");
          setUrgencyDescription("");
          setUrgencyLevel(3);
        },
      }
    );
  };

  // Derived stats
  const stats = useMemo(() => [
    {
      title: "Patients en attente",
      value: String(queueStats.totalWaiting),
      icon: Users,
      trend: `${queueStats.inProgress} en cours`,
      color: "text-blue-500"
    },
    {
      title: "Temps moyen",
      value: `${queueStats.averageWaitTime} min`,
      icon: Clock,
      trend: queueStats.averageWaitTime < 30 ? "Bon" : "À surveiller",
      color: "text-orange-500"
    },
    {
      title: "Consultations",
      value: String(consultationStats.todayCompleted),
      icon: CheckCircle,
      trend: `${consultationStats.todayTotal} total`,
      color: "text-green-500"
    },
    {
      title: "Urgences",
      value: String(urgencyStats.inProgress + urgencyStats.pending),
      icon: AlertTriangle,
      trend: `${urgencyStats.critical} critiques`,
      color: "text-red-500"
    },
  ], [queueStats, consultationStats, urgencyStats]);

  // Queue patients for display
  const queuePatients = useMemo(() => {
    return queueEntries
      .filter((e: QueueEntry) => e.status === "waiting" || e.status === "in_progress")
      .slice(0, 4)
      .map((entry: QueueEntry, idx: number) => {
        const patient = entry.patient;
        const consultation = entry.consultation;
        const waitTime = Math.floor((currentTime - new Date(entry.createdAt).getTime()) / 60000);

        return {
          id: idx + 1,
          name: patient ? `${patient.firstName} ${patient.lastName}` : "Patient",
          specialty: consultation?.specialtyId || "Général",
          urgency: consultation?.urgencyLevel ? parseInt(consultation.urgencyLevel) : 3,
          waitTime,
          ticket: entry.id.slice(0, 14).toUpperCase(),
        };
      });
  }, [queueEntries, currentTime]);

  // Recent consultations
  const recentConsultations = useMemo(() => {
    return consultations
      .filter((c: Consultation) => c.status === "completed")
      .slice(0, 3)
      .map((consultation: Consultation) => ({
        id: consultation.id,
        patient: consultation.patient
          ? `${consultation.patient.firstName} ${consultation.patient.lastName}`
          : "Patient",
        doctor: consultation.doctor?.name || "Médecin",
        specialty: consultation.type === "video" ? "Vidéo" : "Consultation",
        time: formatTimeAgo(consultation.updatedAt),
        status: "completed",
      }));
  }, [consultations]);

  // Unread notifications count
  const unreadCount = useMemo(() =>
    notifications.filter(n => !n.isRead).length,
    [notifications]
  );

  // Only block stats on queue (consultations/urgency can fill in when ready)
  const isLoading = queueLoading;

  return (
    <div className="flex flex-col h-full">
      <DashboardHeader breadcrumbs={[{ label: "Tableau de bord" }]} />

      <div className="flex-1 p-4 space-y-4 overflow-y-auto">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-primary">Tableau de bord</h1>
            <p className="text-xs text-muted-foreground">
              Centre Secondaire • {new Date().toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
            </p>
          </div>
          <Button variant="outline" size="sm" className="h-8" asChild>
            <Link href="/dashboard/secondary/notifications">
              <Bell className="size-4 mr-1.5" />
              <span className="text-xs">Notifications</span>
              {unreadCount > 0 && (
                <Badge className="ml-1.5 h-5 px-1.5">{unreadCount}</Badge>
              )}
            </Link>
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex-1">
            {!statsHidden && (
              <div className="flex gap-2 overflow-x-auto">
                {isLoading ? (
                  [...Array(4)].map((_, i) => (
                    <Card key={i} className="rounded-xl shrink-0 min-w-[180px]">
                      <CardContent className="p-3">
                        <div className="flex items-center gap-3">
                          <Skeleton className="size-10 rounded-lg" />
                          <div className="flex-1 space-y-1">
                            <Skeleton className="h-5 w-12" />
                            <Skeleton className="h-3 w-20" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  stats.map((stat) => {
                    const Icon = stat.icon;
                    return (
                      <Card key={stat.title} className="hover:shadow-md transition-shadow rounded-xl shrink-0 min-w-[180px]">
                        <CardContent className="p-3">
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg bg-muted/50 ${stat.color} shrink-0`}>
                              <Icon className="size-4" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-lg font-bold leading-tight">{stat.value}</p>
                              <p className="text-[11px] text-muted-foreground leading-tight truncate">
                                {stat.title}
                              </p>
                              {stat.trend && (
                                <div className="flex items-center gap-0.5 text-[10px] mt-0.5 text-orange-600">
                                  <span className="font-medium">{stat.trend}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })
                )}
              </div>
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

        <div className="grid grid-cols-4 gap-2">
          {quickActions.map((action) => (
            <Card
              key={action.href}
              role="button"
              tabIndex={0}
              className="hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => router.push(action.href)}
              onKeyDown={(e) => e.key === "Enter" && router.push(action.href)}
            >
              <CardContent className="p-3">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${action.color} text-white`}>
                    <action.icon className="size-4" />
                  </div>
                  <span className="text-sm font-medium">{action.title}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Urgency alert button */}
        <Button
          variant="destructive"
          className="w-full"
          size="sm"
          onClick={() => setUrgencyOpen(true)}
        >
          <AlertTriangle className="size-4 mr-2" />
          Signaler une urgence
        </Button>

        <div className="grid lg:grid-cols-2 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm flex items-center gap-2">
                  <ClipboardList className="size-4" />
                  File d&apos;attente
                </CardTitle>
                <Button variant="ghost" size="sm" className="h-7 text-xs" asChild>
                  <Link href="/dashboard/secondary/queue">
                    Voir tout
                    <ArrowRight className="size-3 ml-1" />
                  </Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[250px]">
                {queueLoading ? (
                  <div className="divide-y">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="p-3">
                        <div className="flex items-center gap-3">
                          <Skeleton className="size-8 rounded-full" />
                          <div className="flex-1 space-y-1">
                            <Skeleton className="h-4 w-32" />
                            <Skeleton className="h-3 w-20" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : queuePatients.length === 0 ? (
                  <div className="p-8 text-center text-muted-foreground">
                    <p>Aucun patient en attente</p>
                  </div>
                ) : (
                  <div className="divide-y">
                    {queuePatients.map((patient) => (
                      <div key={patient.id} className="p-3 hover:bg-muted/50">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="size-8 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
                              <span className="text-xs font-bold text-primary">{patient.id}</span>
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <p className="font-medium text-sm">{patient.name}</p>
                                <Badge className={`${getUrgencyColor(patient.urgency)} text-[10px] h-4`}>
                                  U{patient.urgency}
                                </Badge>
                              </div>
                              <p className="text-xs text-muted-foreground">{patient.specialty}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-xs font-mono text-muted-foreground">{patient.ticket}</p>
                            <p className="text-xs text-orange-600">~{patient.waitTime} min</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm flex items-center gap-2">
                  <History className="size-4" />
                  Consultations récentes
                </CardTitle>
                <Button variant="ghost" size="sm" className="h-7 text-xs" asChild>
                  <Link href="/dashboard/secondary/history">
                    Voir tout
                    <ArrowRight className="size-3 ml-1" />
                  </Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[250px]">
                {consultationsLoading ? (
                  <div className="divide-y">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="p-3">
                        <div className="flex items-center gap-3">
                          <div className="flex-1 space-y-1">
                            <Skeleton className="h-4 w-32" />
                            <Skeleton className="h-3 w-20" />
                          </div>
                          <Skeleton className="h-5 w-16" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : recentConsultations.length === 0 ? (
                  <div className="p-8 text-center text-muted-foreground">
                    <p>Aucune consultation récente</p>
                  </div>
                ) : (
                  <div className="divide-y">
                    {recentConsultations.map((consultation) => (
                      <div key={consultation.id} className="p-3 hover:bg-muted/50">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="flex items-center gap-2 mb-0.5">
                              <p className="font-medium text-sm">{consultation.patient}</p>
                              <Badge variant="outline" className="text-[10px] h-4">
                                {consultation.specialty}
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                              <Stethoscope className="size-3" />
                              {consultation.doctor}
                            </p>
                          </div>
                          <div className="text-right">
                            <Badge className="bg-green-100 text-green-800 text-[10px]">
                              <CheckCircle className="size-3 mr-1" />
                              Terminée
                            </Badge>
                            <p className="text-[10px] text-muted-foreground mt-0.5">
                              {consultation.time}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-4">
          <Card className="lg:col-span-2">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Activity className="size-4" />
                Activité du jour
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  {isLoading ? (
                    <Skeleton className="h-8 w-12 mx-auto mb-1" />
                  ) : (
                    <p className="text-2xl font-bold text-blue-600">{consultationStats.total}</p>
                  )}
                  <p className="text-xs text-muted-foreground">Patients enregistrés</p>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  {isLoading ? (
                    <Skeleton className="h-8 w-12 mx-auto mb-1" />
                  ) : (
                    <p className="text-2xl font-bold text-green-600">{consultationStats.todayCompleted}</p>
                  )}
                  <p className="text-xs text-muted-foreground">Consultations terminées</p>
                </div>
                <div className="text-center p-4 bg-orange-50 rounded-lg">
                  {isLoading ? (
                    <Skeleton className="h-8 w-12 mx-auto mb-1" />
                  ) : (
                    <p className="text-2xl font-bold text-orange-600">{urgencyStats.completed}</p>
                  )}
                  <p className="text-xs text-muted-foreground">Urgences traitées</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Calendar className="size-4" />
                Prochains RDV
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {consultationsLoading ? (
                  [...Array(3)].map((_, i) => (
                    <div key={i} className="flex items-center justify-between p-2 bg-muted/50 rounded">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-5 w-16" />
                    </div>
                  ))
                ) : consultations
                  .filter((c: Consultation) => c.status === "scheduled")
                  .slice(0, 3)
                  .map((consultation: Consultation) => (
                    <div key={consultation.id} className="flex items-center justify-between p-2 bg-muted/50 rounded">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold">
                          {new Date(consultation.scheduledAt).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
                        </span>
                        <span className="text-sm">
                          {consultation.patient
                            ? `${consultation.patient.firstName} ${consultation.patient.lastName}`
                            : "Patient"}
                        </span>
                      </div>
                      <Badge variant="outline" className="text-[10px]">
                        {consultation.type === "video" ? "Vidéo" : "Présentiel"}
                      </Badge>
                    </div>
                  ))}
                {!consultationsLoading && consultations.filter((c: Consultation) => c.status === "scheduled").length === 0 && (
                  <div className="text-center py-4 text-muted-foreground text-sm">
                    Aucun RDV prévu
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Create Urgency Dialog */}
      <Dialog open={urgencyOpen} onOpenChange={setUrgencyOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="size-5 text-red-500" />
              Signaler une urgence
            </DialogTitle>
            <DialogDescription>
              Signalez un cas urgent pour une prise en charge prioritaire.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="urgency-patient">Patient *</Label>
              <select
                id="urgency-patient"
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                value={urgencyPatientId}
                onChange={(e) => setUrgencyPatientId(e.target.value)}
                disabled={patientsLoading}
              >
                <option value="">
                  {patientsLoading ? "Chargement..." : "Sélectionnez un patient..."}
                </option>
                {patients.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.firstName} {p.lastName}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="urgency-specialty">Spécialité</Label>
              <select
                id="urgency-specialty"
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                value={urgencySpecialtyId}
                onChange={(e) => setUrgencySpecialtyId(e.target.value)}
                disabled={specialtiesLoading}
              >
                <option value="">
                  {specialtiesLoading ? "Chargement..." : "Aucune spécialité particulière"}
                </option>
                {specialties.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="urgency-level">Niveau d&apos;urgence (1-5) *</Label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((level) => (
                  <Button
                    key={level}
                    type="button"
                    variant={urgencyLevel === level ? "default" : "outline"}
                    size="sm"
                    className={`flex-1 ${
                      urgencyLevel === level
                        ? level >= 4
                          ? "bg-red-500 hover:bg-red-600"
                          : level >= 3
                            ? "bg-orange-500 hover:bg-orange-600"
                            : ""
                        : ""
                    }`}
                    onClick={() => setUrgencyLevel(level)}
                  >
                    {level}
                  </Button>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">
                1 = faible, 5 = critique
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="urgency-reason">Motif * (min. 5 caractères)</Label>
              <Input
                id="urgency-reason"
                placeholder="Ex: Douleur thoracique depuis 2 jours..."
                value={urgencyReason}
                onChange={(e) => setUrgencyReason(e.target.value)}
                minLength={5}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="urgency-description">Description</Label>
              <Textarea
                id="urgency-description"
                placeholder="Description détaillée..."
                value={urgencyDescription}
                onChange={(e) => setUrgencyDescription(e.target.value)}
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setUrgencyOpen(false)}>
              Annuler
            </Button>
            <Button
              variant="destructive"
              onClick={handleCreateUrgency}
              disabled={
                createUrgencyMutation.isPending ||
                !urgencyPatientId ||
                !urgencyReason.trim() ||
                urgencyReason.trim().length < 5
              }
            >
              {createUrgencyMutation.isPending ? "En cours..." : "Signaler l'urgence"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
