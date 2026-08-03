"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { DashboardHeader } from "@/components/layout/dashboard-header";
import { ErrorDisplay } from "@/components/ui/error-display";
import { EmptyState } from "@/components/ui/empty-state";
import { LoadingSkeleton } from "@/components/ui/loading-skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { Skeleton } from "@/components/ui/skeleton";
import {
    FolderOpen,
    Search,
    Filter,
    User,
    Pill,
    Activity,
    AlertTriangle,
    Eye,
    Download,
    TrendingUp,
    Heart,
    ChevronUp,
    ChevronDown,
    RefreshCw,
    AlertCircle
} from "lucide-react";
import { usePatientsQuery, usePatientSearchQuery, usePatientConsultationsQuery, useDeactivatePatient, patientKeys } from "@/hooks/queries";
import { useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/stores/auth-store";
import type { Patient } from "@/types/api";
import { toast } from "sonner";

type PatientStatus = "active" | "inactive" | "chronic";

const statusConfig = {
    active: { label: "Actif", color: "bg-green-500" },
    chronic: { label: "Chronique", color: "bg-orange-500" },
    inactive: { label: "Inactif", color: "bg-gray-400" }
};

// Helper to determine patient status
function getPatientStatus(patient: Patient): PatientStatus {
    if (!patient.isActive) return "inactive";
    if (patient.medicalHistory && patient.medicalHistory.length > 0) return "chronic";
    return "active";
}

// Helper to calculate age
function getAge(dateOfBirth: string): number {
    const birth = new Date(dateOfBirth);
    const today = new Date();
    return Math.floor((today.getTime() - birth.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
}

export default function PatientsPage() {
    const queryClient = useQueryClient();
    const [searchQuery, setSearchQuery] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [filterStatus, setFilterStatus] = useState("all");
    const [sortBy, setSortBy] = useState("lastVisit");
    const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
    const [patientDetailOpen, setPatientDetailOpen] = useState(false);
    const [statsHidden, setStatsHidden] = useState(false);

    // TanStack Query
    const { data: patients = [], isLoading: patientsLoading, error: patientsError, refetch } = usePatientsQuery();
    const { data: searchResults = [] } = usePatientSearchQuery(debouncedSearch);
    const { data: patientConsultations = [] } = usePatientConsultationsQuery(selectedPatient?.id || "");
    const deactivatePatientMutation = useDeactivatePatient();
    const userRole = useAuthStore((s) => s.user?.role);
    const canDeactivatePatient = userRole === "admin" || userRole === "primary_secretary";

    const isLoading = patientsLoading;
    const error = patientsError;

    // Debounced search
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchQuery);
        }, 300);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    // Use search results or all patients
    const displayedPatients = debouncedSearch.trim() ? searchResults : patients;

    // Statistics
    const stats = useMemo(() => {
        const total = patients.length;
        const active = patients.filter(p => p.isActive).length;
        const chronic = patients.filter(p => p.medicalHistory && p.medicalHistory.length > 0).length;
        return { total, active, chronic };
    }, [patients]);

    // Filtering and sorting
    const filteredPatients = useMemo(() => {
        let result = displayedPatients.filter(patient => {
            const status = getPatientStatus(patient);
            const matchesStatus = filterStatus === "all" || status === filterStatus;
            return matchesStatus;
        });

        // Sorting
        result = [...result].sort((a, b) => {
            switch (sortBy) {
                case "name":
                    return `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`);
                case "lastVisit":
                    return new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime();
                case "consultations":
                    // Will need to track consultation count per patient
                    return 0;
                default:
                    return 0;
            }
        });

        return result;
    }, [displayedPatients, filterStatus, sortBy]);

    const handleViewPatient = useCallback((patient: Patient) => {
        setSelectedPatient(patient);
        setPatientDetailOpen(true);
    }, []);

    const handleRefresh = useCallback(() => {
        queryClient.invalidateQueries({ queryKey: patientKeys.all });
        toast.success("Données actualisées");
    }, [queryClient]);

    if (error) {
        return (
            <div className="flex flex-col h-full">
                <DashboardHeader
                    breadcrumbs={[
                        { label: "Tableau de bord", href: "/dashboard/doctor" },
                        { label: "Dossiers Patients" }
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
                    { label: "Dossiers Patients" }
                ]}
                actions={
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleRefresh}
                        disabled={isLoading}
                        className="h-8"
                    >
                        <RefreshCw className={`size-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                        Actualiser
                    </Button>
                }
            />

            <div className="flex-1 p-4 space-y-2 overflow-y-auto">
                {/* Page Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-lg font-bold text-primary flex items-center gap-1.5">
                            <FolderOpen className="size-5 text-indigo-600" />
                            Dossiers Patients
                        </h1>
                        <p className="text-xs text-muted-foreground">
                            Gestion des dossiers médicaux électroniques (DPI)
                        </p>
                    </div>
                </div>

                {/* Quick Stats with Toggle */}
                <div className="flex items-center gap-2">
                    <div className="flex-1">
                        {!statsHidden && (
                            <div className="grid gap-2 md:grid-cols-4">
                                <Card className="min-h-[100px] max-h-[120px]">
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-xs text-muted-foreground flex items-center gap-1.5">
                                            <FolderOpen className="size-3.5" />
                                            Total Patients
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        {isLoading ? (
                                            <Skeleton className="h-8 w-16" />
                                        ) : (
                                            <>
                                                <p className="text-2xl font-bold">{stats.total}</p>
                                                <p className="text-[10px] text-muted-foreground mt-0.5">Dossiers enregistrés</p>
                                            </>
                                        )}
                                    </CardContent>
                                </Card>

                                <Card className="min-h-[100px] max-h-[120px]">
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-xs text-muted-foreground flex items-center gap-1.5">
                                            <Activity className="size-3.5" />
                                            Patients Actifs
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        {isLoading ? (
                                            <Skeleton className="h-8 w-16" />
                                        ) : (
                                            <>
                                                <p className="text-2xl font-bold text-green-600">{stats.active}</p>
                                                <p className="text-[10px] text-muted-foreground mt-0.5">Dossiers actifs</p>
                                            </>
                                        )}
                                    </CardContent>
                                </Card>

                                <Card className="min-h-[100px] max-h-[120px]">
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-xs text-muted-foreground flex items-center gap-1.5">
                                            <Heart className="size-3.5" />
                                            Maladies Chroniques
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        {isLoading ? (
                                            <Skeleton className="h-8 w-16" />
                                        ) : (
                                            <>
                                                <p className="text-2xl font-bold text-orange-600">{stats.chronic}</p>
                                                <p className="text-[10px] text-muted-foreground mt-0.5">Suivi régulier</p>
                                            </>
                                        )}
                                    </CardContent>
                                </Card>

                                <Card className="min-h-[100px] max-h-[120px]">
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-xs text-muted-foreground flex items-center gap-1.5">
                                            <TrendingUp className="size-3.5" />
                                            Résultats
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        {isLoading ? (
                                            <Skeleton className="h-8 w-16" />
                                        ) : (
                                            <>
                                                <p className="text-2xl font-bold">{filteredPatients.length}</p>
                                                <p className="text-[10px] text-muted-foreground mt-0.5">Patients affichés</p>
                                            </>
                                        )}
                                    </CardContent>
                                </Card>
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

                {/* Filters and Search */}
                <Card>
                    <CardContent className="pt-2">
                        <div className="flex flex-wrap gap-1.5">
                            <div className="flex-1 min-w-[180px]">
                                <div className="relative">
                                    <Search className="absolute left-2 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
                                    <Input
                                        type="search"
                                        placeholder="Rechercher par nom, ID, téléphone..."
                                        className="pl-8 h-8 text-xs"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                </div>
                            </div>

                            <Select value={sortBy} onValueChange={setSortBy}>
                                <SelectTrigger className="w-[160px] h-8 text-xs">
                                    <SelectValue placeholder="Trier par" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="lastVisit">Dernière visite</SelectItem>
                                    <SelectItem value="name">Nom</SelectItem>
                                </SelectContent>
                            </Select>

                            <Select value={filterStatus} onValueChange={setFilterStatus}>
                                <SelectTrigger className="w-[150px] h-8 text-xs">
                                    <Filter className="size-3.5 mr-1.5" />
                                    <SelectValue placeholder="Statut" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Tous statuts</SelectItem>
                                    <SelectItem value="active">Actifs</SelectItem>
                                    <SelectItem value="chronic">Chroniques</SelectItem>
                                    <SelectItem value="inactive">Inactifs</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent>
                </Card>

                {/* Patient List */}
                {isLoading ? (
                    <div className="grid md:grid-cols-2 gap-2">
                        {[1, 2, 3, 4].map((i) => (
                            <Card key={i}>
                                <CardContent className="p-2.5">
                                    <Skeleton className="h-32 w-full" />
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                ) : filteredPatients.length === 0 ? (
                    <Card>
                        <CardContent className="py-8 text-center">
                            <User className="size-12 mx-auto mb-4 text-muted-foreground/50" />
                            <p className="text-muted-foreground">
                                {searchQuery ? "Aucun patient trouvé pour cette recherche" : "Aucun patient enregistré"}
                            </p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid md:grid-cols-2 gap-2">
                        {filteredPatients.map((patient) => {
                            const status = getPatientStatus(patient);
                            const statusInfo = statusConfig[status];
                            const age = getAge(patient.dateOfBirth);

                            return (
                                <Card
                                    key={patient.id}
                                    className="hover:shadow-lg transition-shadow cursor-pointer flex flex-col"
                                    onClick={() => handleViewPatient(patient)}
                                >
                                    <CardContent className="p-2.5 flex flex-col flex-1 min-h-0">
                                        {/* Header Section */}
                                        <div className="flex items-start justify-between mb-2 shrink-0">
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <div className="size-8 rounded-full bg-indigo-100 flex items-center justify-center shrink-0">
                                                        <User className="size-4 text-indigo-600" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <h3 className="font-bold text-sm truncate">
                                                            {patient.firstName} {patient.lastName}
                                                        </h3>
                                                        <p className="text-[10px] text-muted-foreground truncate">
                                                            {patient.idNumber}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                            <Badge className={`${statusInfo.color} text-white text-xs shrink-0 ml-2`}>
                                                {statusInfo.label}
                                            </Badge>
                                        </div>

                                        {/* Info Grid */}
                                        <div className="grid grid-cols-2 gap-2 mb-2 shrink-0">
                                            <div className="min-w-0">
                                                <p className="text-[10px] text-muted-foreground mb-0.5">Âge / Genre</p>
                                                <p className="font-semibold text-xs truncate">
                                                    {age} ans • {patient.gender === "MALE" ? "Homme" : "Femme"}
                                                </p>
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-[10px] text-muted-foreground mb-0.5">Téléphone</p>
                                                <p className="font-semibold text-xs truncate">{patient.phone || "N/A"}</p>
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-[10px] text-muted-foreground mb-0.5">Dernière mise à jour</p>
                                                <p className="font-semibold text-xs truncate">
                                                    {new Date(patient.updatedAt || patient.createdAt).toLocaleDateString('fr-FR')}
                                                </p>
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-[10px] text-muted-foreground mb-0.5">Adresse</p>
                                                <p className="font-semibold text-xs truncate">{patient.address || "N/A"}</p>
                                            </div>
                                        </div>

                                        {/* Scrollable Content Area */}
                                        <div className="flex-1 min-h-0 space-y-1.5 overflow-hidden">
                                            {patient.medicalHistory && (Array.isArray(patient.medicalHistory) ? patient.medicalHistory.length > 0 : patient.medicalHistory) && (
                                                <div className="shrink-0">
                                                    <p className="text-[10px] text-muted-foreground mb-0.5">Antécédents</p>
                                                    <div className="flex flex-wrap gap-0.5">
                                                        {Array.isArray(patient.medicalHistory) ? (
                                                            <>
                                                                {patient.medicalHistory.slice(0, 3).map((condition, idx) => (
                                                                    <Badge key={idx} variant="outline" className="text-[10px]">
                                                                        {condition}
                                                                    </Badge>
                                                                ))}
                                                                {patient.medicalHistory.length > 3 && (
                                                                    <Badge variant="outline" className="text-[10px]">
                                                                        +{patient.medicalHistory.length - 3}
                                                                    </Badge>
                                                                )}
                                                            </>
                                                        ) : (
                                                            <Badge variant="outline" className="text-[10px]">
                                                                {patient.medicalHistory}
                                                            </Badge>
                                                        )}
                                                    </div>
                                                </div>
                                            )}

                                            {patient.allergies && (Array.isArray(patient.allergies) ? patient.allergies.length > 0 : patient.allergies) && (
                                                <div className="shrink-0 p-1.5 bg-red-50 rounded-lg border border-red-200">
                                                    <p className="text-[10px] font-semibold text-red-700 mb-0.5 flex items-center gap-0.5">
                                                        <AlertTriangle className="size-2.5" />
                                                        Allergies
                                                    </p>
                                                    <div className="flex flex-wrap gap-0.5">
                                                        {Array.isArray(patient.allergies) ? (
                                                            patient.allergies.map((allergy, idx) => (
                                                                <Badge key={idx} variant="destructive" className="text-[10px]">
                                                                    {allergy}
                                                                </Badge>
                                                            ))
                                                        ) : (
                                                            <Badge variant="destructive" className="text-[10px]">
                                                                {patient.allergies}
                                                            </Badge>
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {/* Action Buttons - Always at bottom */}
                                        <div className="flex gap-1.5 pt-2 mt-auto shrink-0 border-t">
                                            <Button variant="default" className="flex-1 gap-1 h-7 text-xs" size="sm">
                                                <Eye className="size-3" />
                                                Voir dossier
                                            </Button>
                                            <Button variant="outline" size="sm" className="h-7 px-2 shrink-0">
                                                <Download className="size-3" />
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Patient Detail Dialog */}
            <Dialog open={patientDetailOpen} onOpenChange={setPatientDetailOpen}>
                <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col p-4">
                    {selectedPatient && (
                        <>
                            <DialogHeader className="shrink-0 mb-2">
                                <DialogTitle className="flex items-center gap-1.5 text-base">
                                    <User className="size-4" />
                                    <span className="truncate">
                                        Dossier Médical - {selectedPatient.firstName} {selectedPatient.lastName}
                                    </span>
                                </DialogTitle>
                                <DialogDescription className="text-xs">
                                    {selectedPatient.idNumber}
                                </DialogDescription>
                            </DialogHeader>

                            <Tabs defaultValue="info" className="w-full flex flex-col flex-1 min-h-0">
                                <TabsList className="grid w-full grid-cols-4 h-8 shrink-0 mb-2">
                                    <TabsTrigger value="info" className="text-xs">Informations</TabsTrigger>
                                    <TabsTrigger value="history" className="text-xs">Historique</TabsTrigger>
                                    <TabsTrigger value="medications" className="text-xs">Médicaments</TabsTrigger>
                                    <TabsTrigger value="documents" className="text-xs">Documents</TabsTrigger>
                                </TabsList>

                                <TabsContent value="info" className="space-y-2 mt-2 flex-1 min-h-0 overflow-y-auto">
                                    <Card>
                                        <CardHeader className="pb-2">
                                            <CardTitle className="text-sm">Informations Personnelles</CardTitle>
                                        </CardHeader>
                                        <CardContent className="grid md:grid-cols-2 gap-2">
                                            <div className="min-w-0">
                                                <p className="text-xs text-muted-foreground mb-0.5">Nom complet</p>
                                                <p className="font-semibold text-sm truncate">
                                                    {selectedPatient.firstName} {selectedPatient.lastName}
                                                </p>
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-xs text-muted-foreground mb-0.5">Âge / Genre</p>
                                                <p className="font-semibold text-sm">
                                                    {getAge(selectedPatient.dateOfBirth)} ans • {selectedPatient.gender === "MALE" ? "Homme" : "Femme"}
                                                </p>
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-xs text-muted-foreground mb-0.5">Téléphone</p>
                                                <p className="font-semibold text-sm truncate">{selectedPatient.phone || "N/A"}</p>
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-xs text-muted-foreground mb-0.5">Email</p>
                                                <p className="font-semibold text-sm truncate">{selectedPatient.email || "N/A"}</p>
                                            </div>
                                            <div className="md:col-span-2 min-w-0">
                                                <p className="text-xs text-muted-foreground mb-0.5">Adresse</p>
                                                <p className="font-semibold text-sm truncate">{selectedPatient.address || "N/A"}</p>
                                            </div>
                                        </CardContent>
                                    </Card>

                                    <Card className="border-red-200">
                                        <CardHeader className="pb-2">
                                            <CardTitle className="text-sm flex items-center gap-1.5 text-red-600">
                                                <AlertTriangle className="size-3.5" />
                                                Allergies et Alertes
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            {selectedPatient.allergies && selectedPatient.allergies.length > 0 ? (
                                                <div className="flex flex-wrap gap-1">
                                                    {selectedPatient.allergies.map((allergy, idx) => (
                                                        <Badge key={idx} variant="destructive" className="text-xs">
                                                            {allergy}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            ) : (
                                                <p className="text-xs text-muted-foreground">Aucune allergie connue</p>
                                            )}
                                        </CardContent>
                                    </Card>

                                    <Card>
                                        <CardHeader className="pb-2">
                                            <CardTitle className="text-sm">Antécédents Médicaux</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            {selectedPatient.medicalHistory && selectedPatient.medicalHistory.length > 0 ? (
                                                <div className="space-y-1">
                                                    {selectedPatient.medicalHistory.map((condition, idx) => (
                                                        <div key={idx} className="p-1.5 bg-orange-50 rounded border border-orange-200">
                                                            <p className="font-semibold text-xs">{condition}</p>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <p className="text-xs text-muted-foreground">Aucun antécédent enregistré</p>
                                            )}
                                        </CardContent>
                                    </Card>
                                </TabsContent>

                                <TabsContent value="history" className="space-y-2 mt-2 flex-1 min-h-0 overflow-y-auto">
                                    <Card>
                                        <CardHeader className="pb-2">
                                            <CardTitle className="text-sm flex items-center justify-between gap-2">
                                                <span className="truncate">Historique des Consultations</span>
                                                <Badge className="text-xs shrink-0">{patientConsultations.length} consultations</Badge>
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-1.5">
                                            {patientConsultations.length > 0 ? (
                                                patientConsultations.map((consult) => (
                                                    <div key={consult.id} className="p-2 border rounded-lg hover:bg-muted/50 cursor-pointer">
                                                        <div className="flex items-center justify-between mb-1 gap-2">
                                                            <span className="font-semibold text-xs truncate">
                                                                {new Date(consult.createdAt).toLocaleDateString('fr-FR', {
                                                                    day: 'numeric',
                                                                    month: 'short',
                                                                    year: 'numeric'
                                                                })}
                                                            </span>
                                                            <Badge variant="outline" className="text-[10px] shrink-0">
                                                                {consult.doctor
                                                                    ? `Dr. ${consult.doctor.name}`
                                                                    : 'Médecin'}
                                                            </Badge>
                                                        </div>
                                                        <p className="text-xs text-muted-foreground truncate">
                                                            {consult.diagnosis || consult.notes || 'Consultation'}
                                                        </p>
                                                        <Badge variant="secondary" className="mt-1 text-[10px]">
                                                            {consult.status === 'completed' ? 'Terminée' : consult.status}
                                                        </Badge>
                                                    </div>
                                                ))
                                            ) : (
                                                <p className="text-xs text-muted-foreground text-center py-4">
                                                    Aucune consultation enregistrée
                                                </p>
                                            )}
                                        </CardContent>
                                    </Card>
                                </TabsContent>

                                <TabsContent value="medications" className="space-y-2 mt-2 flex-1 min-h-0 overflow-y-auto">
                                    <Card>
                                        <CardHeader className="pb-2">
                                            <CardTitle className="text-sm flex items-center gap-1.5">
                                                <Pill className="size-3.5" />
                                                Traitement Actuel
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-1.5">
                                            {selectedPatient.currentMedications && selectedPatient.currentMedications.length > 0 ? (
                                                selectedPatient.currentMedications.map((med, idx) => (
                                                    <div key={idx} className="p-2 bg-blue-50 rounded-lg border border-blue-200">
                                                        <p className="font-semibold text-xs truncate">{med}</p>
                                                    </div>
                                                ))
                                            ) : (
                                                <p className="text-xs text-muted-foreground">Aucun traitement en cours</p>
                                            )}
                                        </CardContent>
                                    </Card>
                                </TabsContent>

                                <TabsContent value="documents" className="space-y-2 mt-2 flex-1 min-h-0 overflow-y-auto">
                                    <Card>
                                        <CardHeader className="pb-2">
                                            <CardTitle className="text-sm">Documents Médicaux</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <p className="text-xs text-muted-foreground text-center py-4">
                                                Fonctionnalité à venir - Les documents seront disponibles prochainement
                                            </p>
                                        </CardContent>
                                    </Card>
                                </TabsContent>
                            </Tabs>

                            {/* Action buttons */}
                            <div className="shrink-0 pt-2 border-t flex gap-2">
                                <Button variant="outline" size="sm" className="flex-1" onClick={() => setPatientDetailOpen(false)}>
                                    Fermer
                                </Button>
                                {selectedPatient.isActive && canDeactivatePatient && (
                                    <Button
                                        variant="destructive"
                                        size="sm"
                                        onClick={() => {
                                            deactivatePatientMutation.mutate(selectedPatient.id, {
                                                onSuccess: () => setPatientDetailOpen(false),
                                            });
                                        }}
                                        disabled={deactivatePatientMutation.isPending}
                                    >
                                        {deactivatePatientMutation.isPending ? "En cours..." : "Désactiver le patient"}
                                    </Button>
                                )}
                            </div>
                        </>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
