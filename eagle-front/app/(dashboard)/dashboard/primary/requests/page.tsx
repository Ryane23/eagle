"use client";

import { useState, useMemo } from "react";
import { DashboardHeader } from "@/components/layout/dashboard-header";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  ClipboardList,
  Search,
  Filter,
  Clock,
  User,
  Building,
  CheckCircle,
  XCircle,
  Eye,
  MoreVertical,
  Calendar,
  FileText,
  ChevronRight,
  Download,
  RefreshCw,
  Activity,
} from "lucide-react";
import {
  useReferralsQuery,
  useReferralStatsQuery,
  useAcceptReferral,
  useRejectReferral,
  referralKeys,
} from "@/hooks/queries";
import { useQueryClient } from "@tanstack/react-query";
import type { Referral } from "@/actions/referrals";

const requestTypes: Record<string, { label: string; color: string }> = {
  consultation: { label: "Consultation", color: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400" },
  transfer: { label: "Transfert", color: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400" },
  document: { label: "Document", color: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" },
  equipment: { label: "Équipement", color: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400" },
};

const statusMap: Record<string, string> = {
  pending: "pending",
  accepted: "approved",
  rejected: "rejected",
  in_transit: "in_progress",
  completed: "approved",
  cancelled: "rejected",
};

const statusTypes: Record<string, { label: string; color: string }> = {
  pending: { label: "En attente", color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400" },
  approved: { label: "Approuvé", color: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" },
  rejected: { label: "Rejeté", color: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400" },
  in_progress: { label: "En cours", color: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400" },
};

const priorityToUrgency: Record<string, number> = {
  low: 1,
  medium: 2,
  high: 4,
  urgent: 5,
};

function mapReferralToRequest(r: Referral) {
  const patientName = r.patient
    ? `${r.patient.firstName} ${r.patient.lastName}`
    : r.patientId;
  const centerName = r.fromHospital?.name || r.fromHospitalId;
  const centerCode = r.fromHospital?.id?.slice(0, 8) || r.fromHospitalId?.slice(0, 8) || "—";
  return {
    id: r.id,
    type: "transfer" as const,
    patient: patientName,
    age: 0,
    center: centerCode,
    centerName,
    specialty: r.specialtyNeeded || "—",
    urgency: priorityToUrgency[r.priority] ?? 3,
    requestedBy: r.referredBy?.name || "—",
    requestedAt: r.createdAt,
    status: statusMap[r.status] || r.status,
    description: r.reason,
    notes: r.medicalSummary,
    referral: r,
  };
}

const getUrgencyClass = (level: number) => {
  const classes: Record<number, string> = {
    1: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
    2: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
    3: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
    4: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
    5: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  };
  return classes[level] || classes[1];
};

export default function RequestsPage() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterType, setFilterType] = useState<string>("all");
  const [selectedRequest, setSelectedRequest] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  const { data: referrals = [], isLoading } = useReferralsQuery();
  const { data: statsData } = useReferralStatsQuery();
  const acceptMutation = useAcceptReferral();
  const rejectMutation = useRejectReferral();

  const requests = useMemo(() => referrals.map(mapReferralToRequest), [referrals]);

  const filteredRequests = useMemo(() => {
    return requests.filter((req) => {
      const matchesSearch =
        req.patient.toLowerCase().includes(searchQuery.toLowerCase()) ||
        req.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        req.centerName.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = filterStatus === "all" || req.status === filterStatus;
      const matchesType = filterType === "all" || req.type === filterType;
      return matchesSearch && matchesStatus && matchesType;
    });
  }, [requests, searchQuery, filterStatus, filterType]);

  const stats = useMemo(() => ({
    total: statsData?.total ?? requests.length,
    pending: statsData?.pending ?? requests.filter((r) => r.status === "pending").length,
    approved: statsData
      ? (statsData.accepted ?? 0) + (statsData.completed ?? 0)
      : requests.filter((r) => r.status === "approved").length,
    inProgress: requests.filter((r) => r.status === "in_progress").length,
  }), [statsData, requests]);

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: referralKeys.all });
    toast.success("Demandes actualisées");
  };

  const handleAccept = (id: string) => {
    acceptMutation.mutate({ id }, { onSuccess: () => setSelectedRequest(null) });
  };

  const handleReject = (id: string) => {
    if (!rejectReason.trim()) {
      toast.error("Veuillez indiquer la raison du rejet");
      return;
    }
    rejectMutation.mutate(
      { id, data: { rejectionReason: rejectReason } },
      { onSuccess: () => { setSelectedRequest(null); setRejectReason(""); } }
    );
  };

  return (
    <div className="flex flex-col h-full">
      <DashboardHeader breadcrumbs={[{ label: "Demandes" }]} />

      <div className="flex-1 p-4 space-y-2 overflow-y-auto">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold">Gestion des Demandes</h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Suivi et traitement de toutes les demandes du réseau
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="h-8 text-xs"
              onClick={() => {
                toast.success("Exportation des demandes en cours...");
                // In a real app, this would trigger a download
              }}
            >
              <Download className="size-3.5 mr-1.5" />
              Exporter
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="h-8 text-xs"
              onClick={handleRefresh}
              disabled={isLoading}
            >
              <RefreshCw className={`size-3.5 mr-1.5 ${isLoading ? "animate-spin" : ""}`} />
              Actualiser
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-4 gap-2">
          <Card>
            <CardContent className="p-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-full bg-blue-100 dark:bg-blue-900/30">
                  <ClipboardList className="size-4 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-lg font-bold">{stats.total}</p>
                  <p className="text-[10px] text-muted-foreground">Total demandes</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-full bg-yellow-100 dark:bg-yellow-900/30">
                  <Clock className="size-4 text-yellow-600 dark:text-yellow-400" />
                </div>
                <div>
                  <p className="text-lg font-bold">{stats.pending}</p>
                  <p className="text-[10px] text-muted-foreground">En attente</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-full bg-green-100 dark:bg-green-900/30">
                  <CheckCircle className="size-4 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-lg font-bold">{stats.approved}</p>
                  <p className="text-[10px] text-muted-foreground">Approuvées</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-full bg-blue-100 dark:bg-blue-900/30">
                  <Activity className="size-4 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-lg font-bold">{stats.inProgress}</p>
                  <p className="text-[10px] text-muted-foreground">En cours</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 size-3.5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Rechercher par patient, ID, centre..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 rounded-md text-xs bg-background border w-full h-8"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-1.5 rounded-md text-xs bg-background border h-8"
          >
            <option value="all">Tous les statuts</option>
            <option value="pending">En attente</option>
            <option value="approved">Approuvé</option>
            <option value="rejected">Rejeté</option>
            <option value="in_progress">En cours</option>
          </select>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-1.5 rounded-md text-xs bg-background border h-8"
          >
            <option value="all">Tous les types</option>
            <option value="consultation">Consultation</option>
            <option value="transfer">Transfert</option>
            <option value="document">Document</option>
            <option value="equipment">Équipement</option>
          </select>
          <Button variant="outline" size="sm" className="h-8 text-xs">
            <Filter className="size-3.5 mr-1.5" />
            Filtres
          </Button>
        </div>

        {/* Requests List */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Liste des Demandes</CardTitle>
          </CardHeader>
          <CardContent className="p-2">
            <ScrollArea className="h-[calc(100vh-400px)]">
              <div className="space-y-2">
                {isLoading ? (
                  <div className="py-8 text-center text-sm text-muted-foreground">
                    Chargement des demandes...
                  </div>
                ) : filteredRequests.length === 0 ? (
                  <div className="py-8 text-center text-sm text-muted-foreground">
                    Aucune demande trouvée
                  </div>
                ) : filteredRequests.map((request) => (
                  <div
                    key={request.id}
                    className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                      selectedRequest === request.id
                        ? "border-primary bg-primary/5"
                        : "hover:bg-muted/50"
                    }`}
                    onClick={() =>
                      setSelectedRequest(selectedRequest === request.id ? null : request.id)
                    }
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1.5">
                          <Badge
                            variant="outline"
                            className={`text-[9px] px-1.5 py-0 ${
                              requestTypes[request.type as keyof typeof requestTypes].color
                            }`}
                          >
                            {requestTypes[request.type as keyof typeof requestTypes].label}
                          </Badge>
                          <Badge
                            variant="outline"
                            className={`text-[9px] px-1.5 py-0 ${getUrgencyClass(request.urgency)}`}
                          >
                            Urgence {request.urgency}
                          </Badge>
                          <Badge
                            variant="outline"
                            className={`text-[9px] px-1.5 py-0 ${
                              statusTypes[request.status as keyof typeof statusTypes].color
                            }`}
                          >
                            {statusTypes[request.status as keyof typeof statusTypes].label}
                          </Badge>
                          <span className="text-[10px] text-muted-foreground font-mono">
                            {request.id}
                          </span>
                        </div>

                        <div className="flex items-center gap-3 mb-1.5">
                          <h3 className="text-sm font-medium">{request.patient}</h3>
                          {request.age > 0 && (
                            <span className="text-[10px] text-muted-foreground">
                              {request.age} ans
                            </span>
                          )}
                          <span className="text-[10px] text-muted-foreground">•</span>
                          <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                            <Building className="size-3" />
                            {request.center}
                          </div>
                        </div>

                        <p className="text-xs text-muted-foreground mb-2 line-clamp-1">
                          {request.description}
                        </p>

                        <div className="flex items-center gap-4 text-[10px] text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <User className="size-3" />
                            {request.requestedBy}
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="size-3" />
                            {new Date(request.requestedAt).toLocaleString("fr-FR", {
                              day: "2-digit",
                              month: "2-digit",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </div>
                          <div className="flex items-center gap-1">
                            <FileText className="size-3" />
                            {request.specialty}
                          </div>
                        </div>

                        {selectedRequest === request.id && request.referral?.status === "pending" && (
                          <div className="mt-3 pt-3 border-t space-y-2">
                            <div>
                              <p className="text-[10px] font-medium text-muted-foreground mb-1">
                                Notes:
                              </p>
                              <p className="text-xs">{request.notes || "Aucune note"}</p>
                            </div>
                            <div className="space-y-2">
                              <input
                                type="text"
                                placeholder="Raison du rejet (si rejet)"
                                value={rejectReason}
                                onChange={(e) => setRejectReason(e.target.value)}
                                className="w-full px-2 py-1.5 text-xs rounded border"
                              />
                              <div className="flex items-center gap-2">
                                <Button
                                  size="sm"
                                  className="h-7 text-xs flex-1"
                                  onClick={() => handleAccept(request.id)}
                                  disabled={acceptMutation.isPending}
                                >
                                  <CheckCircle className="size-3 mr-1" />
                                  Approuver
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-7 text-xs flex-1"
                                  onClick={() => handleReject(request.id)}
                                  disabled={rejectMutation.isPending}
                                >
                                  <XCircle className="size-3 mr-1" />
                                  Rejeter
                                </Button>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col items-end gap-2">
                        <Button variant="ghost" size="icon" className="size-7">
                          <MoreVertical className="size-3.5" />
                        </Button>
                        {selectedRequest !== request.id && (
                          <ChevronRight className="size-4 text-muted-foreground" />
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

