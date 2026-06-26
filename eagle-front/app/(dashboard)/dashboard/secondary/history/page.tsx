"use client";

import { useState, useMemo } from "react";
import { DashboardHeader } from "@/components/layout/dashboard-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  History,
  Search,
  Calendar,
  User,
  Stethoscope,
  FileText,
  Download,
  Eye,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
} from "lucide-react";
import { useConsultationsQuery } from "@/hooks/queries";
import type { Consultation } from "@/types/api";

type ConsultationRecord = {
  id: string;
  consultationId: string;
  patientName: string;
  patientId: string;
  doctor: string;
  specialty: string;
  date: string;
  time: string;
  duration: number;
  status: "completed" | "cancelled" | "no_show";
  urgencyLevel: number;
  diagnosis?: string;
  prescriptions?: number;
  notes?: string;
};

function mapConsultationToRecord(c: Consultation): ConsultationRecord {
  const dateObj = new Date(c.scheduledAt || c.createdAt);
  const durationMs = c.startedAt && c.endedAt ? new Date(c.endedAt).getTime() - new Date(c.startedAt).getTime() : 0;
  const statusMap: Record<string, ConsultationRecord["status"]> = {
    completed: "completed",
    cancelled: "cancelled",
    no_show: "no_show",
  };
  return {
    id: c.id,
    consultationId: c.id.substring(0, 16).toUpperCase(),
    patientName: c.patient ? `${c.patient.firstName} ${c.patient.lastName}` : c.patientId,
    patientId: c.patientId,
    doctor: c.doctor ? c.doctor.name : c.doctorId,
    specialty: c.specialtyId || "",
    date: dateObj.toISOString().split("T")[0],
    time: dateObj.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }),
    duration: Math.round(durationMs / 60000),
    status: statusMap[c.status] || "completed",
    urgencyLevel: c.urgencyLevel ? parseInt(c.urgencyLevel, 10) : 1,
    diagnosis: c.diagnosis || undefined,
    notes: c.notes || undefined,
  };
}

const statusConfig = {
  completed: { label: "Terminée", color: "bg-green-100 text-green-800", icon: CheckCircle },
  cancelled: { label: "Annulée", color: "bg-red-100 text-red-800", icon: XCircle },
  no_show: { label: "Absent", color: "bg-yellow-100 text-yellow-800", icon: AlertTriangle },
};

export default function HistoryPage() {
  const { data: apiConsultations = [], isLoading } = useConsultationsQuery();
  const history = useMemo(() => apiConsultations.map(mapConsultationToRecord), [apiConsultations]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterDate, setFilterDate] = useState<string>("all");
  const [selectedRecord, setSelectedRecord] = useState<ConsultationRecord | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  const filteredHistory = history.filter((record) => {
    const matchesSearch =
      record.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.consultationId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.doctor.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === "all" || record.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: history.length,
    completed: history.filter((r) => r.status === "completed").length,
    cancelled: history.filter((r) => r.status === "cancelled").length,
    noShow: history.filter((r) => r.status === "no_show").length,
  };

  const handleViewDetails = (record: ConsultationRecord) => {
    setSelectedRecord(record);
    setDetailsOpen(true);
  };

  return (
    <div className="flex flex-col h-full">
      <DashboardHeader
        breadcrumbs={[
          { label: "Tableau de bord", href: "/dashboard/secondary" },
          { label: "Historique" },
        ]}
      />

      <div className="flex-1 p-4 space-y-4 overflow-y-auto">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-primary flex items-center gap-2">
              <History className="size-5" />
              Historique des consultations
            </h1>
            <p className="text-xs text-muted-foreground">
              Consultez l&apos;historique des consultations du centre
            </p>
          </div>
          <Button variant="outline" size="sm" className="h-8 text-xs">
            <Download className="size-3.5 mr-1.5" />
            Exporter
          </Button>
        </div>

        <div className="grid grid-cols-4 gap-3">
          <Card>
            <CardContent className="p-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-full bg-blue-100">
                  <FileText className="size-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-xl font-bold">{stats.total}</p>
                  <p className="text-[10px] text-muted-foreground">Total</p>
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
                  <p className="text-xl font-bold">{stats.completed}</p>
                  <p className="text-[10px] text-muted-foreground">Terminées</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-full bg-red-100">
                  <XCircle className="size-4 text-red-600" />
                </div>
                <div>
                  <p className="text-xl font-bold">{stats.cancelled}</p>
                  <p className="text-[10px] text-muted-foreground">Annulées</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-full bg-yellow-100">
                  <AlertTriangle className="size-4 text-yellow-600" />
                </div>
                <div>
                  <p className="text-xl font-bold">{stats.noShow}</p>
                  <p className="text-[10px] text-muted-foreground">Absents</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardContent className="p-3">
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher par patient, ID ou médecin..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 h-9"
                />
              </div>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-[140px] h-9">
                  <SelectValue placeholder="Statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les statuts</SelectItem>
                  <SelectItem value="completed">Terminées</SelectItem>
                  <SelectItem value="cancelled">Annulées</SelectItem>
                  <SelectItem value="no_show">Absents</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterDate} onValueChange={setFilterDate}>
                <SelectTrigger className="w-[140px] h-9">
                  <SelectValue placeholder="Période" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes les dates</SelectItem>
                  <SelectItem value="today">Aujourd&apos;hui</SelectItem>
                  <SelectItem value="week">Cette semaine</SelectItem>
                  <SelectItem value="month">Ce mois</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Consultations récentes</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[calc(100vh-440px)]">
              <div className="divide-y">
                {filteredHistory.map((record) => {
                  const statusInfo = statusConfig[record.status];
                  return (
                    <div
                      key={record.id}
                      className="p-3 hover:bg-muted/50 transition-colors cursor-pointer"
                      onClick={() => handleViewDetails(record)}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-mono text-xs text-muted-foreground">
                              {record.consultationId}
                            </span>
                            <Badge className={statusInfo.color}>
                              <statusInfo.icon className="size-3 mr-1" />
                              {statusInfo.label}
                            </Badge>
                          </div>
                          <h3 className="font-medium text-sm">{record.patientName}</h3>
                          <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Stethoscope className="size-3" />
                              {record.doctor}
                            </span>
                            <span className="flex items-center gap-1">
                              <FileText className="size-3" />
                              {record.specialty}
                            </span>
                          </div>
                          {record.diagnosis && (
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                              Diagnostic: {record.diagnosis}
                            </p>
                          )}
                        </div>
                        <div className="text-right flex-shrink-0">
                          <div className="flex items-center gap-1 text-sm font-medium">
                            <Calendar className="size-3 text-muted-foreground" />
                            {record.date}
                          </div>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                            <Clock className="size-3" />
                            {record.time}
                            {record.duration > 0 && ` • ${record.duration} min`}
                          </div>
                          {(record.prescriptions ?? 0) > 0 && (
                            <Badge variant="outline" className="mt-1 text-[10px]">
                              {record.prescriptions} ordonnance(s)
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="size-5" />
              Détails de la consultation
            </DialogTitle>
            <DialogDescription>
              {selectedRecord?.consultationId}
            </DialogDescription>
          </DialogHeader>
          {selectedRecord && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="size-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="size-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-bold">{selectedRecord.patientName}</h3>
                    <p className="text-sm text-muted-foreground">
                      {selectedRecord.patientId}
                    </p>
                  </div>
                </div>
                <Badge className={statusConfig[selectedRecord.status].color}>
                  {statusConfig[selectedRecord.status].label}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground text-xs">Date</p>
                  <p className="font-medium">{selectedRecord.date}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Heure</p>
                  <p className="font-medium">{selectedRecord.time}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Médecin</p>
                  <p className="font-medium">{selectedRecord.doctor}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Spécialité</p>
                  <p className="font-medium">{selectedRecord.specialty}</p>
                </div>
                {selectedRecord.duration > 0 && (
                  <div>
                    <p className="text-muted-foreground text-xs">Durée</p>
                    <p className="font-medium">{selectedRecord.duration} minutes</p>
                  </div>
                )}
                <div>
                  <p className="text-muted-foreground text-xs">Urgence</p>
                  <Badge
                    className={
                      selectedRecord.urgencyLevel >= 4
                        ? "bg-orange-500"
                        : selectedRecord.urgencyLevel >= 3
                        ? "bg-yellow-500"
                        : "bg-green-500"
                    }
                  >
                    Niveau {selectedRecord.urgencyLevel}
                  </Badge>
                </div>
              </div>

              {selectedRecord.diagnosis && (
                <div>
                  <p className="text-muted-foreground text-xs mb-1">Diagnostic</p>
                  <p className="text-sm bg-muted p-2 rounded">{selectedRecord.diagnosis}</p>
                </div>
              )}

              {selectedRecord.notes && (
                <div>
                  <p className="text-muted-foreground text-xs mb-1">Notes</p>
                  <p className="text-sm bg-muted p-2 rounded">{selectedRecord.notes}</p>
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <Button className="flex-1" size="sm">
                  <Eye className="size-4 mr-1.5" />
                  Rapport complet
                </Button>
                <Button variant="outline" className="flex-1" size="sm">
                  <Download className="size-4 mr-1.5" />
                  Télécharger
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

