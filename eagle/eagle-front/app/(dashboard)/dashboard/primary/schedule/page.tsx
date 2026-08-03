"use client";

import { useState, useMemo } from "react";
import { DashboardHeader } from "@/components/layout/dashboard-header";
import { toast } from "sonner";
import { useUsersQuery } from "@/hooks/queries";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Calendar,
  Search,
  Filter,
  Plus,
  Edit,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  Copy,
  Download,
  AlertTriangle,
  CheckCircle,
  X,
} from "lucide-react";

const COLORS = ["bg-blue-600", "bg-green-600", "bg-purple-600", "bg-pink-600", "bg-yellow-600", "bg-indigo-600", "bg-red-600", "bg-teal-600"];

function buildConsultants(users: Array<{ id: string; name: string; specialization?: string | null; isActive?: boolean }>) {
  return users
    .filter((u) => u.isActive !== false)
    .map((u, i) => ({
      id: i + 1,
      name: u.name,
      specialty: u.specialization || "Médecine Générale",
      avatar: u.name.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase(),
      color: COLORS[i % COLORS.length],
      availability: 80,
      patients: 0,
      avgConsultation: 20,
      workDays: [1, 2, 3, 4, 5],
    }));
}

const weekDays = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"];
const timeSlots = Array.from({ length: 12 }, (_, i) => `${i + 8}:00`);

// Schedule data
const scheduleData = [
  { consultantId: 1, day: 0, startTime: 8, endTime: 12, specialty: "Cardiologie", type: "récurrent" },
  { consultantId: 1, day: 2, startTime: 9, endTime: 15, specialty: "Cardiologie", type: "récurrent" },
  { consultantId: 1, day: 4, startTime: 13, endTime: 17, specialty: "Cardiologie", type: "exceptionnel" },
  { consultantId: 2, day: 0, startTime: 14, endTime: 17, specialty: "Pédiatrie", type: "récurrent" },
  { consultantId: 2, day: 2, startTime: 8, endTime: 12, specialty: "Pédiatrie", type: "récurrent" },
  { consultantId: 2, day: 4, startTime: 9, endTime: 15, specialty: "Pédiatrie", type: "récurrent" },
  { consultantId: 3, day: 1, startTime: 8, endTime: 12, specialty: "Dermatologie", type: "récurrent" },
  { consultantId: 3, day: 3, startTime: 13, endTime: 17, specialty: "Dermatologie", type: "récurrent" },
  { consultantId: 4, day: 1, startTime: 9, endTime: 15, specialty: "Gynécologie", type: "récurrent" },
  { consultantId: 4, day: 3, startTime: 9, endTime: 15, specialty: "Gynécologie", type: "récurrent" },
  { consultantId: 5, day: 0, startTime: 9, endTime: 17, specialty: "Neurologie", type: "exceptionnel" },
  { consultantId: 5, day: 2, startTime: 13, endTime: 17, specialty: "Neurologie", type: "récurrent" },
  { consultantId: 6, day: 0, startTime: 13, endTime: 17, specialty: "Ophtalmologie", type: "récurrent" },
  { consultantId: 6, day: 2, startTime: 8, endTime: 12, specialty: "Ophtalmologie", type: "récurrent" },
  { consultantId: 6, day: 4, startTime: 8, endTime: 12, specialty: "Ophtalmologie", type: "exceptionnel" },
];

// Conflicts
const conflicts = [
  {
    id: 1,
    consultants: ["Dr. Nana", "Dr. Fouda"],
    day: "Mercredi",
    reason: "Même plage horaire (09:00-11:00)",
    severity: "high",
    status: "nouveau",
  },
  {
    id: 2,
    consultants: ["Dr. Tamo", "Dr. Sob"],
    day: "Vendredi",
    reason: "Spécialités requérant même équipement",
    severity: "medium",
    status: "en_cours",
  },
  {
    id: 3,
    consultants: ["Dr. Meka"],
    day: "Jeudi",
    reason: "Dépassement heures contractuelles",
    severity: "low",
    status: "résolu",
  },
];

export default function SchedulePage() {
  const { data: allUsers = [] } = useUsersQuery();
  const consultants = useMemo(() =>
    buildConsultants(allUsers.filter((u) => u.role === "doctor")),
    [allUsers]
  );
  const [currentView, setCurrentView] = useState<"week" | "month">("week");
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>("all");
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [currentTab, setCurrentTab] = useState<"planning" | "consultants" | "conflicts">("planning");
  const [showAvailabilityModal, setShowAvailabilityModal] = useState(false);

  const goToNextWeek = () => {
    const nextWeek = new Date(currentWeek);
    nextWeek.setDate(nextWeek.getDate() + 7);
    setCurrentWeek(nextWeek);
  };

  const goToPrevWeek = () => {
    const prevWeek = new Date(currentWeek);
    prevWeek.setDate(prevWeek.getDate() - 7);
    setCurrentWeek(prevWeek);
  };

  const goToCurrentWeek = () => {
    setCurrentWeek(new Date());
  };

  const formatWeekRange = (date: Date) => {
    const start = new Date(date);
    start.setDate(start.getDate() - start.getDay() + 1);
    const end = new Date(start);
    end.setDate(end.getDate() + 6);
    const formatDate = (d: Date) =>
      `${d.getDate().toString().padStart(2, "0")}/${(d.getMonth() + 1).toString().padStart(2, "0")}`;
    return `${formatDate(start)} - ${formatDate(end)}`;
  };

  const getScheduleItemForCell = (consultantId: number, day: number, hour: number) => {
    return scheduleData.find(
      (item) =>
        item.consultantId === consultantId &&
        item.day === day &&
        hour >= item.startTime &&
        hour < item.endTime
    );
  };

  const getSpecialtyColor = (specialty: string) => {
    const colors: Record<string, string> = {
      Cardiologie: "bg-blue-500",
      Pédiatrie: "bg-green-500",
      Dermatologie: "bg-purple-500",
      Gynécologie: "bg-pink-500",
      Neurologie: "bg-yellow-500",
      Ophtalmologie: "bg-indigo-500",
    };
    return colors[specialty] || "bg-gray-500";
  };

  const getConflictSeverityClass = (severity: string) => {
    const classes: Record<string, string> = {
      high: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
      medium: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
      low: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
    };
    return classes[severity] || "bg-gray-100 text-gray-800";
  };

  const specialties = [
    "Toutes les spécialités",
    "Cardiologie",
    "Pédiatrie",
    "Dermatologie",
    "Gynécologie",
    "Neurologie",
    "Ophtalmologie",
  ];

  return (
    <div className="flex flex-col h-full">
      <DashboardHeader breadcrumbs={[{ label: "Planning Médecins" }]} />

      <div className="flex-1 p-4 space-y-2 overflow-y-auto">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold">Gestion du Planning des Médecins</h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Planification et suivi des disponibilités des consultants
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="h-8 text-xs"
              onClick={() => {
                toast.success("Exportation du planning en cours...");
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
                toast.info("Modèles de planning disponibles");
              }}
            >
              <Copy className="size-3.5 mr-1.5" />
              Modèles
            </Button>
            <Button size="sm" className="h-8 text-xs" onClick={() => setShowAvailabilityModal(true)}>
              <Plus className="size-3.5 mr-1.5" />
              Ajouter Disponibilité
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b">
          <Button
            variant="ghost"
            size="sm"
            className={`h-8 text-xs rounded-none border-b-2 -mb-px ${
              currentTab === "planning"
                ? "border-primary text-primary"
                : "border-transparent"
            }`}
            onClick={() => setCurrentTab("planning")}
          >
            Planning
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className={`h-8 text-xs rounded-none border-b-2 -mb-px ${
              currentTab === "consultants"
                ? "border-primary text-primary"
                : "border-transparent"
            }`}
            onClick={() => setCurrentTab("consultants")}
          >
            Consultants
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className={`h-8 text-xs rounded-none border-b-2 -mb-px ${
              currentTab === "conflicts"
                ? "border-primary text-primary"
                : "border-transparent"
            }`}
            onClick={() => setCurrentTab("conflicts")}
          >
            Conflits
            {conflicts.filter((c) => c.status === "nouveau").length > 0 && (
              <Badge variant="destructive" className="ml-1 size-4 p-0 text-[9px]">
                {conflicts.filter((c) => c.status === "nouveau").length}
              </Badge>
            )}
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 size-3.5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Rechercher un consultant..."
              className="pl-8 pr-3 py-1.5 rounded-md text-xs bg-background border w-full h-8"
            />
          </div>
          <select
            value={selectedSpecialty}
            onChange={(e) => setSelectedSpecialty(e.target.value)}
            className="px-3 py-1.5 rounded-md text-xs bg-background border h-8"
          >
            {specialties.map((specialty) => (
              <option key={specialty} value={specialty === "Toutes les spécialités" ? "all" : specialty}>
                {specialty}
              </option>
            ))}
          </select>
          <div className="flex rounded-md overflow-hidden border">
            <Button
              variant={currentView === "week" ? "default" : "ghost"}
              size="sm"
              className="h-8 text-xs rounded-none"
              onClick={() => setCurrentView("week")}
            >
              Semaine
            </Button>
            <Button
              variant={currentView === "month" ? "default" : "ghost"}
              size="sm"
              className="h-8 text-xs rounded-none"
              onClick={() => setCurrentView("month")}
            >
              Mois
            </Button>
          </div>
          <Button variant="outline" size="sm" className="h-8 text-xs">
            <Filter className="size-3.5 mr-1.5" />
            Filtres
          </Button>
        </div>

        {currentTab === "planning" && (
          <Card>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-center">
                <CardTitle className="text-sm">Planning Hebdomadaire</CardTitle>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" className="size-7" onClick={goToPrevWeek}>
                    <ChevronLeft className="size-3.5" />
                  </Button>
                  <Button variant="outline" size="sm" className="h-7 text-xs" onClick={goToCurrentWeek}>
                    Semaine actuelle
                  </Button>
                  <Button variant="ghost" size="icon" className="size-7" onClick={goToNextWeek}>
                    <ChevronRight className="size-3.5" />
                  </Button>
                  <span className="text-sm font-medium ml-2">{formatWeekRange(currentWeek)}</span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-2">
              <ScrollArea className="h-[calc(100vh-400px)]">
                <div className="min-w-max">
                  {/* Day headers */}
                  <div className="flex">
                    <div className="w-32 p-2 border-r border-b bg-muted font-medium text-xs flex-shrink-0">
                      Consultants
                    </div>
                    {weekDays.slice(0, 5).map((day) => (
                      <div
                        key={day}
                        className="w-24 p-2 border-r border-b bg-muted font-medium text-xs text-center flex-shrink-0"
                      >
                        {day}
                      </div>
                    ))}
                  </div>

                  {/* Consultant rows */}
                  {consultants
                    .filter((consultant) => selectedSpecialty === "all" || consultant.specialty === selectedSpecialty)
                    .map((consultant) => (
                      <div key={consultant.id} className="flex">
                        {/* Consultant name cell */}
                        <div className="w-32 p-2 border-r border-b flex items-center flex-shrink-0">
                          <div className={`${consultant.color} size-6 rounded-full flex items-center justify-center text-white text-xs mr-2`}>
                            {consultant.avatar}
                          </div>
                          <div className="min-w-0">
                            <div className="text-xs font-medium truncate">{consultant.name}</div>
                            <div className="text-[10px] text-muted-foreground truncate">
                              {consultant.specialty}
                            </div>
                          </div>
                        </div>

                        {/* Schedule cells for each day */}
                        {Array.from({ length: 5 }, (_, dayIndex) => (
                          <div
                            key={dayIndex}
                            className={`w-24 border-r border-b relative ${
                              consultant.workDays.includes(dayIndex + 1) ? "" : "bg-muted/30"
                            } flex-shrink-0`}
                          >
                            {/* Time slots */}
                            {timeSlots.map((_, hourIndex) => {
                              const scheduleItem = getScheduleItemForCell(
                                consultant.id,
                                dayIndex,
                                hourIndex + 8
                              );
                              const cellStyle = scheduleItem
                                ? `${getSpecialtyColor(scheduleItem.specialty)} ${
                                    scheduleItem.type === "exceptionnel"
                                      ? "border-2 border-dashed border-white"
                                      : ""
                                  }`
                                : "";

                              return (
                                <div
                                  key={hourIndex}
                                  className={`h-6 border-t border-border/50 ${cellStyle} relative`}
                                >
                                  {scheduleItem && hourIndex + 8 === scheduleItem.startTime && (
                                    <div className="text-white text-[10px] p-0.5 truncate">
                                      {scheduleItem.startTime}:00 - {scheduleItem.endTime}:00
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        ))}
                      </div>
                    ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        )}

        {currentTab === "consultants" && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-2">
            {consultants
              .filter((consultant) => selectedSpecialty === "all" || consultant.specialty === selectedSpecialty)
              .map((consultant) => (
                <Card key={consultant.id}>
                  <CardContent className="p-3">
                    <div className="flex items-start gap-3 mb-3">
                      <div className={`${consultant.color} size-10 rounded-full flex items-center justify-center text-white text-sm`}>
                        {consultant.avatar}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                          <h3 className="font-medium text-sm truncate">{consultant.name}</h3>
                          <Button variant="ghost" size="icon" className="size-6">
                            <MoreVertical className="size-3.5" />
                          </Button>
                        </div>
                        <div className="text-xs text-muted-foreground">{consultant.specialty}</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 mb-3">
                      <div className="p-2 rounded bg-muted text-center">
                        <div className="text-[10px] text-muted-foreground">Patients</div>
                        <div className="font-bold text-sm">{consultant.patients}</div>
                      </div>
                      <div className="p-2 rounded bg-muted text-center">
                        <div className="text-[10px] text-muted-foreground">Disponibilité</div>
                        <div className="font-bold text-sm">{consultant.availability}%</div>
                      </div>
                    </div>

                    <div className="flex justify-between pt-2 border-t">
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" className="size-6">
                          <Edit className="size-3" />
                        </Button>
                        <Button variant="ghost" size="icon" className="size-6">
                          <Calendar className="size-3" />
                        </Button>
                      </div>
                      <div className="text-[10px] text-muted-foreground">
                        {consultant.workDays.length} jours/semaine
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        )}

        {currentTab === "conflicts" && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center justify-between">
                <span>Conflits de Planning Détectés</span>
                <Button variant="outline" size="sm" className="h-7 text-xs">
                  <AlertTriangle className="size-3.5 mr-1" />
                  Résolution auto
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-2">
              <div className="space-y-2">
                {conflicts.map((conflict) => (
                  <div
                    key={conflict.id}
                    className={`p-3 rounded-md border ${getConflictSeverityClass(
                      conflict.severity
                    )} ${conflict.status === "résolu" ? "opacity-60" : ""}`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-medium text-sm flex items-center gap-1">
                          {conflict.severity === "high" && (
                            <AlertTriangle className="size-3.5 text-red-600" />
                          )}
                          Conflit: {conflict.day}
                        </h4>
                        <p className="text-xs mt-1">{conflict.reason}</p>
                      </div>
                      <Badge variant="outline" className="text-[9px]">
                        {conflict.status}
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between mt-2">
                      <div className="flex gap-1">
                        {conflict.consultants.map((name, idx) => {
                          const consultant = consultants.find((c) => c.name === name);
                          return consultant ? (
                            <Badge key={idx} variant="outline" className="text-[9px]">
                              <div className={`${consultant.color} size-3 rounded-full mr-1`} />
                              {name}
                            </Badge>
                          ) : null;
                        })}
                      </div>
                      {conflict.status !== "résolu" && (
                        <div className="flex gap-1">
                          <Button variant="outline" size="sm" className="h-7 text-xs">
                            <Edit className="size-3 mr-1" />
                            Modifier
                          </Button>
                          <Button size="sm" className="h-7 text-xs">
                            <CheckCircle className="size-3 mr-1" />
                            Résoudre
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Add Availability Modal */}
      {showAvailabilityModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-96">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-sm">Ajouter une Disponibilité</CardTitle>
              <Button
                variant="ghost"
                size="icon"
                className="size-7"
                onClick={() => setShowAvailabilityModal(false)}
              >
                <X className="size-3.5" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <label className="block text-xs mb-1">Consultant</label>
                <select className="w-full p-2 rounded-md text-sm bg-background border">
                  {consultants.map((consultant) => (
                    <option key={consultant.id} value={consultant.id}>
                      {consultant.name} ({consultant.specialty})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs mb-1">Jour</label>
                <select className="w-full p-2 rounded-md text-sm bg-background border">
                  {weekDays.map((day, index) => (
                    <option key={index} value={index}>
                      {day}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs mb-1">Heure de début</label>
                  <select className="w-full p-2 rounded-md text-sm bg-background border">
                    {Array.from({ length: 10 }, (_, i) => (
                      <option key={i} value={i + 8}>
                        {i + 8}:00
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs mb-1">Heure de fin</label>
                  <select className="w-full p-2 rounded-md text-sm bg-background border">
                    {Array.from({ length: 10 }, (_, i) => (
                      <option key={i} value={i + 9}>
                        {i + 9}:00
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-3">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 text-xs"
                  onClick={() => setShowAvailabilityModal(false)}
                >
                  Annuler
                </Button>
                <Button size="sm" className="h-8 text-xs">
                  Ajouter
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

