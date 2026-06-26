"use client";

import { useState } from "react";
import { toast } from "sonner";
import { DashboardHeader } from "@/components/layout/dashboard-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChart2,
  BarChart,
  PieChart,
  TrendingUp,
  TrendingDown,
  Download,
  RefreshCw,
  Filter,
  Users,
  Clock,
  Activity,
  AlertTriangle,
  CheckCircle,
  Building,
} from "lucide-react";

const urgencyBySpecialty = [
  { name: "Cardiologie", urgence1: 5, urgence2: 8, urgence3: 12, urgence4: 15, urgence5: 4 },
  { name: "Pédiatrie", urgence1: 8, urgence2: 12, urgence3: 15, urgence4: 6, urgence5: 2 },
  { name: "Dermatologie", urgence1: 12, urgence2: 15, urgence3: 8, urgence4: 3, urgence5: 1 },
  { name: "Gynécologie", urgence1: 7, urgence2: 10, urgence3: 14, urgence4: 5, urgence5: 2 },
  { name: "Neurologie", urgence1: 4, urgence2: 7, urgence3: 9, urgence4: 11, urgence5: 3 },
];

const stats = [
  { id: "patients", label: "Patients aujourd&apos;hui", value: 148, trend: 12, status: "up", icon: Users, color: "blue" },
  { id: "waitTime", label: "Temps d&apos;attente moyen", value: 22, unit: "min", trend: -3, status: "down", icon: Clock, color: "yellow" },
  { id: "urgencies", label: "Urgences critiques", value: 12, trend: 4, status: "up", icon: AlertTriangle, color: "red" },
  { id: "completed", label: "Consultations terminées", value: 87, trend: 9, status: "up", icon: CheckCircle, color: "green" },
  { id: "satisfaction", label: "Satisfaction patients", value: 92, unit: "%", trend: 2, status: "up", icon: Activity, color: "indigo" },
];

export default function StatisticsPage() {
  const [periodFilter, setPeriodFilter] = useState<"24h" | "7j" | "30j">("24h");
  const [centerFilter, setCenterFilter] = useState<string>("all");
  const [activeTab, setActiveTab] = useState<"overview" | "centers" | "specialties">("overview");

  const centers = [
    { id: "CSJ-YDE", name: "Clinique Saint Jean - Yaoundé" },
    { id: "CHM-DLA", name: "Centre Hospitalier Moderne - Douala" },
    { id: "HSP-BAF", name: "Hôpital Sainte Pauline - Bafoussam" },
    { id: "CML-GAR", name: "Centre Médical Lumière - Garoua" },
    { id: "CCS-BUE", name: "Clinique Coeur Sacré - Buea" },
  ];

  const getColorClass = (color: string) => {
    const colorMap: Record<string, string> = {
      blue: "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
      yellow: "bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400",
      red: "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400",
      green: "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400",
      indigo: "bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400",
    };
    return colorMap[color] || "bg-gray-100 text-gray-600";
  };

  return (
    <div className="flex flex-col h-full">
      <DashboardHeader breadcrumbs={[{ label: "Statistiques" }]} />

      <div className="flex-1 p-4 space-y-2 overflow-y-auto">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold">Statistiques du Réseau</h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Analyse de performance et indicateurs clés du réseau EAGLE
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="h-8 text-xs"
              onClick={() => {
                toast.success("Exportation des statistiques en cours...");
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
                toast.success("Actualisation des statistiques...");
              }}
            >
              <RefreshCw className="size-3.5 mr-1.5" />
              Actualiser
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-5 gap-2">
          {stats.map((stat) => (
            <Card key={stat.id}>
              <CardContent className="p-3">
                <div className="flex items-start justify-between">
                  <div className={`p-1.5 rounded-full ${getColorClass(stat.color)}`}>
                    <stat.icon className="size-4" />
                  </div>
                  <div className={`flex items-center text-[10px] ${stat.status === "up" ? "text-green-500" : "text-red-500"}`}>
                    {stat.status === "up" ? (
                      <TrendingUp className="size-3" />
                    ) : (
                      <TrendingDown className="size-3" />
                    )}
                    <span className="ml-0.5">{Math.abs(stat.trend)}%</span>
                  </div>
                </div>
                <div className="mt-2">
                  <p className="text-[10px] text-muted-foreground">{stat.label}</p>
                  <p className="text-xl font-bold mt-1">
                    {stat.value}
                    {stat.unit}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-primary/10 text-primary px-3 py-1.5 rounded-md">
            <PieChart className="size-4 mr-2" />
            <span className="font-medium text-xs">Analyse de Performance</span>
          </div>
          <select
            value={centerFilter}
            onChange={(e) => setCenterFilter(e.target.value)}
            className="px-3 py-1.5 rounded-md text-xs bg-background border h-8"
          >
            <option value="all">Tous les centres</option>
            {centers.map((center) => (
              <option key={center.id} value={center.id}>
                {center.name}
              </option>
            ))}
          </select>
          <div className="flex rounded-md overflow-hidden border">
            <Button
              variant={periodFilter === "24h" ? "default" : "ghost"}
              size="sm"
              className="h-8 text-xs rounded-none"
              onClick={() => setPeriodFilter("24h")}
            >
              24h
            </Button>
            <Button
              variant={periodFilter === "7j" ? "default" : "ghost"}
              size="sm"
              className="h-8 text-xs rounded-none"
              onClick={() => setPeriodFilter("7j")}
            >
              7 jours
            </Button>
            <Button
              variant={periodFilter === "30j" ? "default" : "ghost"}
              size="sm"
              className="h-8 text-xs rounded-none"
              onClick={() => setPeriodFilter("30j")}
            >
              30 jours
            </Button>
          </div>
          <Button variant="outline" size="sm" className="h-8 text-xs">
            <Filter className="size-3.5 mr-1.5" />
            Filtres
          </Button>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
          <TabsList className="h-8">
            <TabsTrigger value="overview" className="text-xs">Vue d&apos;ensemble</TabsTrigger>
            <TabsTrigger value="centers" className="text-xs">Par centre</TabsTrigger>
            <TabsTrigger value="specialties" className="text-xs">Par spécialité</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-2 space-y-2">
            <div className="grid grid-cols-2 gap-2">
              {/* Waiting Time per Center */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Temps d&apos;attente par centre</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-center justify-center text-muted-foreground">
                    <div className="text-center">
                      <BarChart className="size-12 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">Graphique de barres</p>
                      <p className="text-xs mt-1">Temps d&apos;attente moyen par centre</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Patient Flow */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Flux de patients par heure</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-center justify-center text-muted-foreground">
                    <div className="text-center">
                      <Activity className="size-12 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">Graphique de flux</p>
                      <p className="text-xs mt-1">Distribution horaire des patients</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {/* Urgency by Specialty */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Urgences par spécialité</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-center justify-center text-muted-foreground">
                    <div className="text-center">
                      <BarChart2 className="size-12 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">Graphique empilé</p>
                      <p className="text-xs mt-1">Répartition des urgences par niveau</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Weekly Trends */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Tendances hebdomadaires</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-center justify-center text-muted-foreground">
                    <div className="text-center">
                      <TrendingUp className="size-12 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">Graphique linéaire</p>
                      <p className="text-xs mt-1">Évolution sur 7 jours</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="centers" className="mt-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {centers.map((center) => (
                <Card key={center.id}>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Building className="size-4 text-blue-600" />
                      {center.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span>Performance</span>
                          <span className="font-medium">78%</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div className="bg-green-500 h-2 rounded-full" style={{ width: "78%" }} />
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-center">
                        <div>
                          <p className="text-[10px] text-muted-foreground">Patients</p>
                          <p className="text-base font-bold">42</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-muted-foreground">Temps moyen</p>
                          <p className="text-base font-bold">22 min</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-muted-foreground">Consultations</p>
                          <p className="text-base font-bold">18</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="specialties" className="mt-2">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Performance par spécialité</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {urgencyBySpecialty.map((specialty) => (
                    <div key={specialty.name} className="p-3 rounded-lg border">
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="text-sm font-medium">{specialty.name}</h4>
                        <Badge variant="outline" className="text-[10px]">
                          Total:{" "}
                          {specialty.urgence1 +
                            specialty.urgence2 +
                            specialty.urgence3 +
                            specialty.urgence4 +
                            specialty.urgence5}
                        </Badge>
                      </div>
                      <div className="flex gap-1">
                        <div
                          className="h-4 bg-green-500 rounded"
                          style={{
                            width: `${(specialty.urgence1 / 50) * 100}%`,
                          }}
                          title="Niveau 1"
                        />
                        <div
                          className="h-4 bg-blue-500 rounded"
                          style={{
                            width: `${(specialty.urgence2 / 50) * 100}%`,
                          }}
                          title="Niveau 2"
                        />
                        <div
                          className="h-4 bg-yellow-500 rounded"
                          style={{
                            width: `${(specialty.urgence3 / 50) * 100}%`,
                          }}
                          title="Niveau 3"
                        />
                        <div
                          className="h-4 bg-orange-500 rounded"
                          style={{
                            width: `${(specialty.urgence4 / 50) * 100}%`,
                          }}
                          title="Niveau 4"
                        />
                        <div
                          className="h-4 bg-red-500 rounded"
                          style={{
                            width: `${(specialty.urgence5 / 50) * 100}%`,
                          }}
                          title="Niveau 5"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}



