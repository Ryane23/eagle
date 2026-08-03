"use client";

import { useState, useMemo } from "react";
import { DashboardHeader } from "@/components/layout/dashboard-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Users,
  Search,
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  FileText,
  MoreVertical,
  Eye,
  Edit,
  History,
  UserPlus,
  Filter,
  AlertTriangle,
  Pill,
  Heart,
  RefreshCw,
} from "lucide-react";
import { usePatientsQuery } from "@/hooks/queries";
import { useDebounce } from "@/hooks";
import { parseApiDate, formatApiDate } from "@/lib/utils";
import type { Patient as ApiPatient } from "@/types/api";

type Patient = {
  id: string;
  patientId: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  age: number;
  gender: "M" | "F";
  phone: string;
  email?: string;
  address?: string;
  idNumber: string;
  bloodType?: string;
  allergies: string[];
  chronicConditions: string[];
  lastVisit?: string;
  totalVisits: number;
  status: "active" | "inactive";
};

function mapApiPatient(patient: ApiPatient): Patient {
  const dob = parseApiDate(patient.dateOfBirth);
  const age = dob
    ? Math.floor((Date.now() - dob.getTime()) / (365.25 * 24 * 60 * 60 * 1000))
    : 0;
  const dateOfBirthStr = formatApiDate(patient.dateOfBirth) ?? (typeof patient.dateOfBirth === "string" ? patient.dateOfBirth : "");
  const lastVisitStr = parseApiDate(patient.updatedAt)?.toLocaleDateString("fr-FR");

  return {
    id: patient.id,
    patientId: patient.id.slice(0, 12).toUpperCase(),
    firstName: patient.firstName,
    lastName: patient.lastName,
    dateOfBirth: dateOfBirthStr,
    age,
    gender: patient.gender === "MALE" ? "M" : "F",
    phone: patient.phone || "N/A",
    email: patient.email ?? undefined,
    address: patient.address ?? undefined,
    idNumber: patient.idNumber || patient.id.slice(0, 9),
    bloodType: patient.bloodType ?? undefined,
    allergies: patient.allergies || [],
    chronicConditions: patient.medicalHistory || [],
    lastVisit: lastVisitStr ?? undefined,
    totalVisits: 0,
    status: patient.isActive ? "active" : "inactive",
  };
}

export default function PatientsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebounce(searchQuery, 300);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  // TanStack Query
  const { data: apiPatients = [], isLoading, refetch } = usePatientsQuery();

  // Map and filter patients
  const patients = useMemo(() => apiPatients.map(mapApiPatient), [apiPatients]);

  const filteredPatients = useMemo(() => {
    const query = debouncedSearch.toLowerCase();
    return patients.filter(
      (patient) =>
        patient.firstName.toLowerCase().includes(query) ||
        patient.lastName.toLowerCase().includes(query) ||
        patient.patientId.toLowerCase().includes(query) ||
        patient.idNumber.includes(query)
    );
  }, [patients, debouncedSearch]);

  const handleViewDetails = (patient: Patient) => {
    setSelectedPatient(patient);
    setDetailsOpen(true);
  };

  return (
    <div className="flex flex-col h-full">
      <DashboardHeader
        breadcrumbs={[
          { label: "Tableau de bord", href: "/dashboard/secondary" },
          { label: "Patients" },
        ]}
      />

      <div className="flex-1 p-4 space-y-4 overflow-y-auto">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-primary flex items-center gap-2">
              <Users className="size-5" />
              Recherche de patients
            </h1>
            <p className="text-xs text-muted-foreground">
              Recherchez et consultez les dossiers patients
            </p>
          </div>
          <Button size="sm" className="h-8 text-xs" asChild>
            <a href="/dashboard/secondary/register">
              <UserPlus className="size-3.5 mr-1.5" />
              Nouveau patient
            </a>
          </Button>
        </div>

        <Card>
          <CardContent className="p-3">
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher par nom, ID patient ou numéro CNI..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 h-9"
                />
              </div>
              <Button variant="outline" size="sm" className="h-9">
                <Filter className="size-4 mr-1.5" />
                Filtres
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center justify-between">
              <span>Résultats ({filteredPatients.length})</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[calc(100vh-320px)]">
              <div className="divide-y">
                {filteredPatients.map((patient) => (
                  <div
                    key={patient.id}
                    className="p-3 hover:bg-muted/50 transition-colors cursor-pointer"
                    onClick={() => handleViewDetails(patient)}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                          <User className="size-5 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <h3 className="font-medium text-sm">
                              {patient.lastName} {patient.firstName}
                            </h3>
                            <span className="text-xs text-muted-foreground font-mono">
                              {patient.patientId}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 text-xs text-muted-foreground">
                            <span>{patient.age} ans</span>
                            <span>{patient.gender === "M" ? "Homme" : "Femme"}</span>
                            <span className="flex items-center gap-1">
                              <Phone className="size-3" />
                              {patient.phone}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 mt-1.5">
                            {patient.allergies.length > 0 && (
                              <Badge variant="destructive" className="text-[10px] h-5">
                                <AlertTriangle className="size-3 mr-1" />
                                {patient.allergies.length} allergie(s)
                              </Badge>
                            )}
                            {patient.chronicConditions.length > 0 && (
                              <Badge variant="outline" className="text-[10px] h-5">
                                <Heart className="size-3 mr-1" />
                                {patient.chronicConditions.length} condition(s)
                              </Badge>
                            )}
                            {patient.lastVisit && (
                              <span className="text-[10px] text-muted-foreground">
                                Dernière visite: {patient.lastVisit}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-7"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <MoreVertical className="size-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleViewDetails(patient)}>
                            <Eye className="size-4 mr-2" />
                            Voir dossier
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Edit className="size-4 mr-2" />
                            Modifier
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <History className="size-4 mr-2" />
                            Historique
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem>
                            <UserPlus className="size-4 mr-2" />
                            Nouvelle consultation
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <User className="size-5" />
              Dossier Patient
            </DialogTitle>
            <DialogDescription>
              {selectedPatient?.patientId}
            </DialogDescription>
          </DialogHeader>
          {selectedPatient && (
            <Tabs defaultValue="info" className="flex-1 overflow-hidden flex flex-col">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="info">Informations</TabsTrigger>
                <TabsTrigger value="medical">Médical</TabsTrigger>
                <TabsTrigger value="history">Historique</TabsTrigger>
                <TabsTrigger value="documents">Documents</TabsTrigger>
              </TabsList>

              <ScrollArea className="flex-1 mt-4">
                <TabsContent value="info" className="space-y-4 m-0">
                  <div className="flex items-center gap-4">
                    <div className="size-16 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="size-8 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold">
                        {selectedPatient.lastName} {selectedPatient.firstName}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {selectedPatient.age} ans • {selectedPatient.gender === "M" ? "Homme" : "Femme"}
                      </p>
                      {selectedPatient.bloodType && (
                        <Badge variant="outline" className="mt-1">
                          Groupe sanguin: {selectedPatient.bloodType}
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-start gap-2">
                      <Calendar className="size-4 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-muted-foreground text-xs">Date de naissance</p>
                        <p className="font-medium">
                          {selectedPatient.dateOfBirth
                            ? new Date(selectedPatient.dateOfBirth).toLocaleDateString("fr-FR")
                            : "—"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <FileText className="size-4 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-muted-foreground text-xs">Numéro CNI</p>
                        <p className="font-medium">{selectedPatient.idNumber}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Phone className="size-4 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-muted-foreground text-xs">Téléphone</p>
                        <p className="font-medium">{selectedPatient.phone}</p>
                      </div>
                    </div>
                    {selectedPatient.email && (
                      <div className="flex items-start gap-2">
                        <Mail className="size-4 text-muted-foreground mt-0.5" />
                        <div>
                          <p className="text-muted-foreground text-xs">Email</p>
                          <p className="font-medium">{selectedPatient.email}</p>
                        </div>
                      </div>
                    )}
                    {selectedPatient.address && (
                      <div className="flex items-start gap-2 col-span-2">
                        <MapPin className="size-4 text-muted-foreground mt-0.5" />
                        <div>
                          <p className="text-muted-foreground text-xs">Adresse</p>
                          <p className="font-medium">{selectedPatient.address}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="medical" className="space-y-4 m-0">
                  {selectedPatient.allergies.length > 0 && (
                    <Card className="border-red-200">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm flex items-center gap-2 text-red-600">
                          <AlertTriangle className="size-4" />
                          Allergies
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-wrap gap-1">
                          {selectedPatient.allergies.map((allergy, idx) => (
                            <Badge key={idx} variant="destructive">
                              {allergy}
                            </Badge>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {selectedPatient.chronicConditions.length > 0 && (
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm flex items-center gap-2">
                          <Heart className="size-4" />
                          Conditions chroniques
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-wrap gap-1">
                          {selectedPatient.chronicConditions.map((condition, idx) => (
                            <Badge key={idx} variant="outline">
                              {condition}
                            </Badge>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <Pill className="size-4" />
                        Traitements en cours
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        Aucun traitement enregistré
                      </p>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="history" className="space-y-4 m-0">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">
                        Consultations ({selectedPatient.totalVisits})
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {[1, 2, 3].map((i) => (
                        <div
                          key={i}
                          className="p-2 border rounded-lg hover:bg-muted/50 cursor-pointer"
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-medium text-sm">Consultation #{i}</span>
                            <Badge variant="outline" className="text-[10px]">
                              Cardiologie
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Dr. Nana Pierre • 2025-01-{10 - i * 3}
                          </p>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="documents" className="space-y-4 m-0">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Documents médicaux</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground text-center py-4">
                        Aucun document disponible
                      </p>
                    </CardContent>
                  </Card>
                </TabsContent>
              </ScrollArea>

              <div className="flex gap-2 pt-4 border-t mt-4">
                <Button className="flex-1" size="sm">
                  <UserPlus className="size-4 mr-1.5" />
                  Nouvelle consultation
                </Button>
                <Button variant="outline" className="flex-1" size="sm">
                  <Edit className="size-4 mr-1.5" />
                  Modifier
                </Button>
              </div>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

