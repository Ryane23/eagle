"use client";

import { useState, useMemo } from "react";
import { toast } from "sonner";
import { DashboardHeader } from "@/components/layout/dashboard-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Building,
  Search,
  Filter,
  Wifi,
  WifiOff,
  MapPin,
  Users,
  Clock,
  Activity,
  TrendingUp,
  TrendingDown,
  Eye,
  MessageSquare,
  Settings,
  Star,
  StarOff,
  RefreshCw,
  Download,
  Network,
  Plus,
  List,
} from "lucide-react";
import { useHospitalsQuery } from "@/hooks/queries/use-hospitals-query";
import { useQueueStats } from "@/hooks/queries/use-queue-query";
import type { Hospital } from "@/types/api";

// Display type for centers
type CenterDisplay = {
  id: string;
  name: string;
  code: string;
  type: "Centre Principal" | "Centre Secondaire";
  status: "online" | "offline";
  bandwidth: number;
  waitingPatients: number;
  consultants: number;
  alertLevel: "normal" | "warning" | "issue";
  trend: "up" | "down" | "stable";
  lastUpdate: string;
  location: { lat: number; lng: number };
  region: string;
  address: string;
  phone: string;
  email: string;
};

// Map API Hospital to display type
function hospitalToCenterDisplay(hospital: Hospital): CenterDisplay {
  // Calculate time since last update
  const lastUpdateDate = new Date(hospital.updatedAt);
  const now = new Date();
  const diffMs = now.getTime() - lastUpdateDate.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const lastUpdate = diffMins < 60 ? `${diffMins} min` : `${Math.floor(diffMins / 60)}h`;
  
  // Determine status (assume online if updated within last hour)
  const status = diffMins < 60 ? "online" : "offline";
  
  // Determine alert level based on status
  const alertLevel: "normal" | "warning" | "issue" = status === "offline" 
    ? "issue" 
    : "normal";

  return {
    id: hospital.id,
    name: hospital.name,
    code: hospital.name.split(" ").map(w => w[0]).join("").toUpperCase(),
    type: hospital.type === "PRIMARY" ? "Centre Principal" : "Centre Secondaire",
    status,
    bandwidth: status === "online" ? Math.random() * 8 + 2 : 0, // Simulated
    waitingPatients: 0, // Will be updated from queue stats
    consultants: 0, // Will be updated from users query
    alertLevel,
    trend: "stable",
    lastUpdate,
    location: {
      lat: 0, // Coordinates not available in Hospital type
      lng: 0,
    },
    region: hospital.city || "N/A",
    address: hospital.address || "Adresse non renseignée",
    phone: hospital.contactPhone || "Non renseigné",
    email: hospital.contactEmail || `contact@${hospital.name.toLowerCase().replace(/\s/g, "")}.cm`,
  };
}

export default function CentersPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "online" | "offline">("all");
  const [filterType, setFilterType] = useState<"all" | "principal" | "secondaire">("all");
  const [selectedCenter, setSelectedCenter] = useState<CenterDisplay | null>(null);
  const [favoriteItems, setFavoriteItems] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<"list" | "map" | "stats">("list");

  // Fetch hospitals
  const { data: hospitals = [], isLoading, refetch } = useHospitalsQuery();
  const queueStats = useQueueStats();

  // Transform hospitals to display format
  const centers = useMemo(() => 
    hospitals.map(hospitalToCenterDisplay),
    [hospitals]
  );

  const filteredCenters = centers.filter((center) => {
    const matchesSearch =
      center.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      center.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      center.region.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      filterStatus === "all" ||
      (filterStatus === "online" && center.status === "online") ||
      (filterStatus === "offline" && center.status === "offline");
    const matchesType =
      filterType === "all" ||
      (filterType === "principal" && center.type === "Centre Principal") ||
      (filterType === "secondaire" && center.type === "Centre Secondaire");
    return matchesSearch && matchesStatus && matchesType;
  });

  const toggleFavorite = (centerId: string) => {
    setFavoriteItems((prev) =>
      prev.includes(centerId) ? prev.filter((id) => id !== centerId) : [...prev, centerId]
    );
  };

  const getAlertLevelClass = (level: string) => {
    const classes: Record<string, string> = {
      normal: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
      warning: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
      issue: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
    };
    return classes[level] || classes.normal;
  };

  const getAlertLevelText = (level: string) => {
    const texts: Record<string, string> = {
      normal: "Normal",
      warning: "Attention",
      issue: "Problème",
    };
    return texts[level] || level;
  };

  const renderTrendBadge = (trend: string) => {
    if (trend === "up") {
      return <TrendingUp className="size-3 text-red-500" />;
    } else if (trend === "down") {
      return <TrendingDown className="size-3 text-green-500" />;
    }
    return null;
  };

  const stats = {
    total: centers.length,
    online: centers.filter((c) => c.status === "online").length,
    offline: centers.filter((c) => c.status === "offline").length,
    totalWaiting: queueStats?.totalWaiting || 0,
    totalConsultants: centers.reduce((acc, c) => acc + c.consultants, 0),
  };

  if (isLoading) {
    return (
      <div className="flex flex-col h-full">
        <DashboardHeader breadcrumbs={[{ label: "Centres" }]} />
        <div className="flex-1 p-4 space-y-4">
          {/* Header skeleton */}
          <div className="flex items-center justify-between">
            <div>
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-64 mt-1" />
            </div>
            <div className="flex gap-2">
              <Skeleton className="h-8 w-24" />
              <Skeleton className="h-8 w-24" />
              <Skeleton className="h-8 w-32" />
            </div>
          </div>
          
          {/* Stats skeleton */}
          <div className="grid grid-cols-5 gap-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <Card key={i}>
                <CardContent className="p-3">
                  <Skeleton className="h-12 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
          
          {/* Filters skeleton */}
          <div className="flex gap-2">
            <Skeleton className="h-8 flex-1 min-w-[200px]" />
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-8 w-32" />
          </div>
          
          {/* Cards skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i}>
                <CardContent className="p-3">
                  <Skeleton className="h-32 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <DashboardHeader breadcrumbs={[{ label: "Centres" }]} />

      <div className="flex-1 p-4 space-y-2 overflow-y-auto">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold">Gestion des Centres</h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Suivi et gestion de tous les centres du réseau EAGLE
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-8 text-xs"
              onClick={() => {
                toast.success("Exportation des centres en cours...");
              }}
            >
              <Download className="size-3.5 mr-1.5" />
              Exporter
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-8 text-xs"
              onClick={() => {
                refetch();
                toast.success("Actualisation des centres...");
              }}
            >
              <RefreshCw className="size-3.5 mr-1.5" />
              Actualiser
            </Button>
            <Button
              size="sm"
              className="h-8 text-xs"
              onClick={() => {
                toast.info("Formulaire de création de centre");
                // In a real app, this would open a modal or navigate to a form
              }}
            >
              <Plus className="size-3.5 mr-1.5" />
              Nouveau Centre
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-5 gap-2">
          <Card>
            <CardContent className="p-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-full bg-blue-100 dark:bg-blue-900/30">
                  <Building className="size-4 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-lg font-bold">{stats.total}</p>
                  <p className="text-[10px] text-muted-foreground">Total centres</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-full bg-green-100 dark:bg-green-900/30">
                  <Wifi className="size-4 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-lg font-bold">{stats.online}</p>
                  <p className="text-[10px] text-muted-foreground">En ligne</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-full bg-red-100 dark:bg-red-900/30">
                  <WifiOff className="size-4 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <p className="text-lg font-bold">{stats.offline}</p>
                  <p className="text-[10px] text-muted-foreground">Hors ligne</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-full bg-purple-100 dark:bg-purple-900/30">
                  <Users className="size-4 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="text-lg font-bold">{stats.totalWaiting}</p>
                  <p className="text-[10px] text-muted-foreground">Patients en attente</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-full bg-yellow-100 dark:bg-yellow-900/30">
                  <Activity className="size-4 text-yellow-600 dark:text-yellow-400" />
                </div>
                <div>
                  <p className="text-lg font-bold">{stats.totalConsultants}</p>
                  <p className="text-[10px] text-muted-foreground">Consultants actifs</p>
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
              placeholder="Rechercher un centre..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 rounded-md text-xs bg-background border w-full h-8"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as "all" | "online" | "offline")}
            className="px-3 py-1.5 rounded-md text-xs bg-background border h-8"
          >
            <option value="all">Tous les statuts</option>
            <option value="online">En ligne</option>
            <option value="offline">Hors ligne</option>
          </select>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as "all" | "principal" | "secondaire")}
            className="px-3 py-1.5 rounded-md text-xs bg-background border h-8"
          >
            <option value="all">Tous les types</option>
            <option value="principal">Centre Principal</option>
            <option value="secondaire">Centre Secondaire</option>
          </select>
          <Button variant="outline" size="sm" className="h-8 text-xs">
            <Filter className="size-3.5 mr-1.5" />
            Filtres
          </Button>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
          <TabsList className="h-8">
            <TabsTrigger value="list" className="text-xs">
              <List className="size-3.5 mr-1.5" />
              Liste
            </TabsTrigger>
            <TabsTrigger value="map" className="text-xs">
              <MapPin className="size-3.5 mr-1.5" />
              Carte
            </TabsTrigger>
            <TabsTrigger value="stats" className="text-xs">
              <Activity className="size-3.5 mr-1.5" />
              Statistiques
            </TabsTrigger>
          </TabsList>

          <TabsContent value="list" className="mt-2">
            {filteredCenters.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Building className="size-12 mx-auto mb-2 text-muted-foreground opacity-50" />
                  <h3 className="text-base font-medium mb-2">Aucun centre trouvé</h3>
                  <p className="text-sm text-muted-foreground">
                    {searchQuery || filterStatus !== "all" || filterType !== "all"
                      ? "Aucun centre ne correspond à vos critères de recherche."
                      : "Aucun centre n'est enregistré dans le système."}
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                {filteredCenters.map((center) => (
                  <Card
                    key={center.id}
                    className={`cursor-pointer transition-colors ${selectedCenter?.id === center.id ? "border-primary bg-primary/5" : ""
                      }`}
                    onClick={() => setSelectedCenter(selectedCenter?.id === center.id ? null : center)}
                  >
                    <CardContent className="p-3">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 mb-1">
                            <h3 className="text-sm font-bold truncate">{center.name}</h3>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleFavorite(center.id);
                              }}
                              className="text-muted-foreground hover:text-yellow-500 shrink-0"
                            >
                              {favoriteItems.includes(center.id) ? (
                                <Star className="size-3 fill-yellow-500 text-yellow-500" />
                              ) : (
                                <StarOff className="size-3" />
                              )}
                            </button>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Badge variant="outline" className="text-[9px] px-1.5 py-0">
                              {center.code}
                            </Badge>
                            <Badge
                              variant="outline"
                              className={`text-[9px] px-1.5 py-0 ${getAlertLevelClass(
                                center.alertLevel
                              )}`}
                            >
                              {getAlertLevelText(center.alertLevel)}
                            </Badge>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <Badge
                            variant="outline"
                            className={`text-[9px] px-1.5 py-0 ${center.status === "online"
                              ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                              : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                              }`}
                          >
                            {center.status === "online" ? (
                              <>
                                <Wifi className="size-2.5 mr-0.5" /> En ligne
                              </>
                            ) : (
                              <>
                                <WifiOff className="size-2.5 mr-0.5" /> Hors ligne
                              </>
                            )}
                          </Badge>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 mb-2">
                        <div className="p-2 rounded bg-muted text-center">
                          <div className="text-[10px] text-muted-foreground">Patients</div>
                          <div className="font-bold text-sm flex items-center justify-center gap-1">
                            <span>{center.waitingPatients}</span>
                            {renderTrendBadge(center.trend)}
                          </div>
                        </div>
                        <div className="p-2 rounded bg-muted text-center">
                          <div className="text-[10px] text-muted-foreground">Consultants</div>
                          <div className="font-bold text-sm">{center.consultants}</div>
                        </div>
                      </div>

                      {center.status === "online" && (
                        <div className="mb-2">
                          <div className="flex items-center justify-between text-[10px] text-muted-foreground mb-1">
                            <span>Bande passante</span>
                            <span>{center.bandwidth.toFixed(1)} Mbps</span>
                          </div>
                          <div className="w-full bg-muted rounded-full h-1.5">
                            <div
                              className="bg-green-500 h-1.5 rounded-full"
                              style={{ width: `${(center.bandwidth / 10) * 100}%` }}
                            />
                          </div>
                        </div>
                      )}

                      <div className="flex justify-between items-center pt-2 border-t text-[10px] text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="size-3" />
                          {center.lastUpdate}
                        </div>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" className="size-6">
                            <Eye className="size-3" />
                          </Button>
                          <Button variant="ghost" size="icon" className="size-6">
                            <MessageSquare className="size-3" />
                          </Button>
                          <Button variant="ghost" size="icon" className="size-6">
                            <Settings className="size-3" />
                          </Button>
                        </div>
                      </div>

                      {selectedCenter?.id === center.id && (
                        <div className="mt-3 pt-3 border-t space-y-2">
                          <div className="text-xs space-y-1">
                            <div className="flex items-center gap-1">
                              <MapPin className="size-3 text-muted-foreground" />
                              <span>{center.address}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Network className="size-3 text-muted-foreground" />
                              <span>{center.region}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Activity className="size-3 text-muted-foreground" />
                              <span>{center.phone}</span>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" className="flex-1 h-7 text-xs">
                              <Eye className="size-3 mr-1" />
                              Détails
                            </Button>
                            <Button variant="outline" size="sm" className="flex-1 h-7 text-xs">
                              <MessageSquare className="size-3 mr-1" />
                              Contacter
                            </Button>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="map" className="mt-2">
            <Card>
              <CardContent className="p-4">
                <div className="h-96 flex items-center justify-center text-muted-foreground">
                  <div className="text-center">
                    <MapPin className="size-12 mx-auto mb-2 opacity-50" />
                    <p>Carte interactive des centres du réseau.</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Affiche l&apos;emplacement et l&apos;état de tous les centres.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="stats" className="mt-2">
            <div className="grid grid-cols-2 gap-2">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Répartition par région</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {Array.from(new Set(centers.map((c) => c.region))).map((region) => (
                      <div key={region} className="flex items-center justify-between">
                        <span className="text-xs">{region}</span>
                        <Badge variant="outline" className="text-[10px]">
                          {centers.filter((c) => c.region === region).length}
                        </Badge>
                      </div>
                    ))}
                    {centers.length === 0 && (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        Aucune donnée disponible
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Statut des connexions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span>En ligne</span>
                        <span className="font-medium">{stats.online}</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div
                          className="bg-green-500 h-2 rounded-full"
                          style={{ width: stats.total > 0 ? `${(stats.online / stats.total) * 100}%` : "0%" }}
                        />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span>Hors ligne</span>
                        <span className="font-medium">{stats.offline}</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div
                          className="bg-red-500 h-2 rounded-full"
                          style={{ width: stats.total > 0 ? `${(stats.offline / stats.total) * 100}%` : "0%" }}
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
