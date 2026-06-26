"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import { DashboardHeader } from "@/components/layout/dashboard-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { MapPin, Search, Filter, RefreshCw } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

// Local components
import {
  NetworkStats,
  QuickActions,
  CentersList,
  PendingUrgencies,
  ActiveConsultants,
  RecentActivity,
} from "./_components";

// TanStack Query hooks
import {
  useHospitalsQuery,
  useUrgenciesQuery,
  useUsersQuery,
  useQueueStats,
  useConsultationStats,
  useUrgencyStats,
  useMyActivitiesQuery,
  hospitalKeys,
  urgencyKeys,
  queueKeys,
  consultationKeys,
} from "@/hooks/queries";

import type {
  CenterDisplay,
  PendingUrgencyValidation,
  ConsultantDisplay,
  ActivityItem,
  NetworkStatsData,
} from "@/types/dashboard";
import type { Hospital, Urgency, User } from "@/types/api";

// Map Hospital to CenterDisplay
function mapHospitalToCenter(hospital: Hospital): CenterDisplay {
  return {
    id: hospital.id,
    name: hospital.name,
    code: hospital.id.slice(0, 6).toUpperCase(),
    type: hospital.type === "PRIMARY" ? "Centre Principal" : "Centre Secondaire",
    status: hospital.isActive ? "online" : "offline",
    bandwidth: Math.random() * 10, // This would come from a real monitoring API
    waitingPatients: 0, // Would need to aggregate from queue
    consultants: 0, // Would need to count from users
    alertLevel: hospital.isActive ? "normal" : "issue",
    trend: "stable",
    lastUpdate: "1 min",
    // Location not available on Hospital type yet
    location: undefined,
  };
}

// Map Urgency to PendingUrgencyValidation
function mapUrgencyToValidation(urgency: Urgency): PendingUrgencyValidation {
  const patient = urgency.patient;
  const age = patient?.dateOfBirth
    ? Math.floor((Date.now() - new Date(patient.dateOfBirth).getTime()) / (365.25 * 24 * 60 * 60 * 1000))
    : 0;

  return {
    id: urgency.id,
    name: patient ? `${patient.firstName} ${patient.lastName}` : "Patient inconnu",
    age,
    center: urgency.hospital?.name || "N/A",
    requestedLevel: urgency.urgencyLevel || 3,
    motif: urgency.description || "Non spécifié",
    symptoms: urgency.description || "",
    vital: urgency.vitalSigns
      ? `TA: ${urgency.vitalSigns.bloodPressure || "N/A"}, FC: ${urgency.vitalSigns.heartRate || "N/A"}`
      : "N/A",
    requestTime: new Date(urgency.createdAt).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }),
    requestedBy: "Infirmier(e)", // nurse property not available on Urgency type
    trend: "stable",
  };
}

// Urgency level helper
const getUrgencyLevelText = (level: number) => {
  const texts: Record<number, string> = {
    1: "Non urgent",
    2: "Peu urgent",
    3: "Urgent",
    4: "Très urgent",
    5: "Critique",
  };
  return texts[level] || `Niveau ${level}`;
};

// Map User to ConsultantDisplay
function mapUserToConsultant(user: User): ConsultantDisplay {
  return {
    id: user.id,
    name: user.name,
    specialty: "Médecine Générale", // specialtyId available but not populated
    patients: 0, // Would need queue count per doctor
    status: user.isActive ? "Disponible" : "Absent",
    center: "N/A", // hospitalId available but not populated
    since: new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }),
    photo: user.name.split(" ").map(n => n[0]).join("").slice(0, 2),
    trend: "stable",
  };
}

// Map API activities to dashboard display format
function mapApiActivities(activities: Array<{ id: string; description: string; userId: string; resource?: string; createdAt: string }>): ActivityItem[] {
  return activities.slice(0, 10).map((a) => ({
    id: a.id,
    type: "validation" as const,
    action: a.description,
    user: a.userId,
    details: a.resource || "",
    time: new Date(a.createdAt).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }),
    center: "N/A",
  }));
}

export default function PrimarySecretaryDashboard() {
  const queryClient = useQueryClient();

  // UI State
  const [activeCenterTab, setActiveCenterTab] = useState<"all" | "online" | "offline">("all");
  const [selectedCenter, setSelectedCenter] = useState<string | number | null>(null);
  const [favoriteItems, setFavoriteItems] = useState<(string | number)[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showFilterDialog, setShowFilterDialog] = useState(false);

  // TanStack Query hooks
  const { data: hospitals = [], isLoading: hospitalsLoading } = useHospitalsQuery();
  const { data: urgencies = [], isLoading: urgenciesLoading } = useUrgenciesQuery();
  const { data: users = [], isLoading: usersLoading } = useUsersQuery();
  const queueStats = useQueueStats();
  const consultationStats = useConsultationStats();
  const urgencyStats = useUrgencyStats();
  const { data: apiActivities = [] } = useMyActivitiesQuery();

  // Derived data
  const centers = useMemo(() => hospitals.map(mapHospitalToCenter), [hospitals]);

  // Filter users to get only active doctors
  const activeConsultants = useMemo(() =>
    users
      .filter((u: User) => u.role === "doctor" && u.isActive)
      .map(mapUserToConsultant),
    [users]
  );

  const pendingUrgencyValidations = useMemo(() =>
    urgencies
      .filter((u: Urgency) => u.status === "pending" || u.status === "validated")
      .map(mapUrgencyToValidation),
    [urgencies]
  );

  const networkStats: NetworkStatsData = useMemo(() => ({
    totalPatients: consultationStats.total,
    waitingPatients: queueStats.totalWaiting,
    inConsultationPatients: queueStats.inProgress,
    completedConsultations: consultationStats.todayCompleted,
    avgWaitTime: queueStats.averageWaitTime,
    urgentPatients: urgencyStats.critical + urgencyStats.highPriority,
    pendingValidation: urgencyStats.pending,
    centersOnline: centers.filter(c => c.status === "online").length,
    centersOffline: centers.filter(c => c.status === "offline").length,
    totalCenters: centers.length,
  }), [consultationStats, queueStats, urgencyStats, centers]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSelectedCenter(null);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Handlers
  const handleToggleFavorite = useCallback((itemId: string | number) => {
    setFavoriteItems((prev) =>
      prev.includes(itemId) ? prev.filter((id) => id !== itemId) : [...prev, itemId]
    );
  }, []);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: hospitalKeys.all }),
      queryClient.invalidateQueries({ queryKey: urgencyKeys.all }),
      queryClient.invalidateQueries({ queryKey: queueKeys.all }),
      queryClient.invalidateQueries({ queryKey: consultationKeys.all }),
    ]);
    setIsRefreshing(false);
    toast.success("Données actualisées avec succès");
  }, [queryClient]);

  const handleClearSearch = useCallback(() => {
    setSearchQuery("");
  }, []);

  const isLoading = hospitalsLoading || urgenciesLoading || usersLoading;

  return (
    <div className="flex flex-col h-full">
      <DashboardHeader breadcrumbs={[{ label: "Tableau de bord" }]} />

      <div className="flex-1 p-4 space-y-3 overflow-y-auto">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">Tableau de Bord Principal</h1>
            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
              <MapPin className="size-3.5 text-blue-600" />
              <span>Réseau de Cliniques EAGLE</span>
              <Badge variant="outline" className="text-[10px] px-2 py-0.5">
                {networkStats.centersOnline}/{networkStats.totalCenters} centres en ligne
              </Badge>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 size-3.5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Rechercher centres, consultants, urgences..."
                className="pl-8 pr-3 py-2 text-xs h-8 w-56"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="size-8"
              onClick={() => setShowFilterDialog(true)}
              title="Filtres"
            >
              <Filter className="size-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-8 text-xs"
              onClick={handleRefresh}
              disabled={isRefreshing || isLoading}
            >
              <RefreshCw className={`size-3.5 mr-1.5 ${isRefreshing ? "animate-spin" : ""}`} />
              {isRefreshing ? "Actualisation..." : "Actualiser"}
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        <NetworkStats stats={networkStats} isLoading={isLoading} />

        {/* Quick Actions */}
        <QuickActions pendingValidationCount={networkStats.pendingValidation} />

        {/* Main Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Centers List - Left Column */}
          <div className="lg:col-span-2">
            <CentersList
              centers={centers}
              activeTab={activeCenterTab}
              onTabChange={setActiveCenterTab}
              searchQuery={searchQuery}
              onClearSearch={handleClearSearch}
              selectedCenter={selectedCenter}
              onSelectCenter={setSelectedCenter}
              favoriteIds={favoriteItems}
              onToggleFavorite={handleToggleFavorite}
              centersOnline={networkStats.centersOnline}
              centersOffline={networkStats.centersOffline}
              isLoading={hospitalsLoading}
            />
          </div>

          {/* Right Sidebar */}
          <div className="space-y-4">
            <PendingUrgencies
              urgencies={pendingUrgencyValidations}
              searchQuery={searchQuery}
              isLoading={urgenciesLoading}
            />
            <ActiveConsultants
              consultants={activeConsultants}
              searchQuery={searchQuery}
              isLoading={usersLoading}
            />
            <RecentActivity activities={mapApiActivities(apiActivities)} />
          </div>
        </div>
      </div>

      {/* Filter Dialog */}
      <Dialog open={showFilterDialog} onOpenChange={setShowFilterDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Filtres</DialogTitle>
            <DialogDescription>
              Filtrer les centres, consultants et urgences selon vos critères
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Statut des centres</Label>
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="filter-online" className="text-sm font-normal">
                    Centres en ligne uniquement
                  </Label>
                  <Switch
                    id="filter-online"
                    checked={activeCenterTab === "online"}
                    onCheckedChange={(checked) => {
                      setActiveCenterTab(checked ? "online" : "all");
                    }}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="filter-offline" className="text-sm font-normal">
                    Centres hors ligne uniquement
                  </Label>
                  <Switch
                    id="filter-offline"
                    checked={activeCenterTab === "offline"}
                    onCheckedChange={(checked) => {
                      setActiveCenterTab(checked ? "offline" : "all");
                    }}
                  />
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Niveau d&apos;alerte</Label>
              <div className="flex flex-col gap-2">
                {["Normal", "Attention", "Problème"].map((label, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <Label htmlFor={`filter-${label.toLowerCase()}`} className="text-sm font-normal">
                      {label}
                    </Label>
                    <Switch id={`filter-${label.toLowerCase()}`} defaultChecked />
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label>Niveau d&apos;urgence</Label>
              <div className="flex flex-col gap-2">
                {[1, 2, 3, 4, 5].map((level) => (
                  <div key={level} className="flex items-center justify-between">
                    <Label htmlFor={`filter-urgency-${level}`} className="text-sm font-normal">
                      Niveau {level} - {getUrgencyLevelText(level)}
                    </Label>
                    <Switch id={`filter-urgency-${level}`} defaultChecked />
                  </div>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setSearchQuery("");
                setActiveCenterTab("all");
                setShowFilterDialog(false);
              }}
            >
              Réinitialiser
            </Button>
            <Button onClick={() => setShowFilterDialog(false)}>Appliquer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
