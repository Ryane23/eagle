"use client";

import { useState, useMemo, useEffect } from "react";
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
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    ClipboardList,
    Search,
    Clock,
    User,
    Phone,
    MoreVertical,
    CheckCircle,
    XCircle,
    Eye,
    UserPlus,
    RefreshCw,
    Filter,
    Timer,
    Activity,
    Stethoscope,
    AlertCircle,
} from "lucide-react";
import { useHospitalQueueQuery, useQueueStats, useRemoveFromQueue, useTicketByNumberQuery } from "@/hooks/queries";
import { useDebounce } from "@/hooks/use-debounce";
import { useQueryClient } from "@tanstack/react-query";
import { queueKeys } from "@/hooks/queries";
import { toast } from "sonner";
import type { QueueEntry } from "@/types/api";

type QueuePatient = {
    id: string;
    ticketNumber: string;
    patientName: string;
    patientId: string;
    age: number;
    gender: "M" | "F";
    phone: string;
    specialty: string;
    urgencyLevel: number;
    reason: string;
    status: "waiting" | "in_progress" | "completed" | "cancelled";
    arrivalTime: string;
    estimatedWaitTime: number;
    position: number;
};

function mapQueueEntry(entry: QueueEntry, position: number, currentTime: number): QueuePatient {
    const patient = entry.patient;
    const consultation = entry.consultation;
    const waitTime = Math.floor((currentTime - new Date(entry.createdAt).getTime()) / 60000);
    const age = patient?.dateOfBirth
        ? Math.floor((Date.now() - new Date(patient.dateOfBirth).getTime()) / (365.25 * 24 * 60 * 60 * 1000))
        : 0;

    return {
        id: entry.id,
        ticketNumber: entry.id.slice(0, 14).toUpperCase(),
        patientName: patient ? `${patient.firstName} ${patient.lastName}` : "Patient inconnu",
        patientId: patient?.id || "",
        age,
        gender: patient?.gender === "MALE" ? "M" : "F",
        phone: patient?.phone || "N/A",
        specialty: consultation?.specialtyId || "Général",
        urgencyLevel: consultation?.urgencyLevel ? parseInt(consultation.urgencyLevel) : 3,
        reason: consultation?.symptoms || "Consultation",
        status: entry.status as QueuePatient["status"],
        arrivalTime: new Date(entry.createdAt).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }),
        estimatedWaitTime: waitTime,
        position: position + 1,
    };
}

const statusConfig = {
    waiting: { label: "En attente", color: "bg-yellow-500", icon: Clock },
    in_progress: { label: "En cours", color: "bg-blue-500", icon: Activity },
    completed: { label: "Terminé", color: "bg-green-500", icon: CheckCircle },
    cancelled: { label: "Annulé", color: "bg-red-500", icon: XCircle },
};

const getUrgencyColor = (level: number) => {
    const colors: Record<number, string> = {
        1: "bg-green-100 text-green-800",
        2: "bg-blue-100 text-blue-800",
        3: "bg-yellow-100 text-yellow-800",
        4: "bg-orange-100 text-orange-800",
        5: "bg-red-100 text-red-800",
    };
    return colors[level] || colors[1];
};

export default function QueuePage() {
    const queryClient = useQueryClient();
    const [searchQuery, setSearchQuery] = useState("");
    const debouncedSearch = useDebounce(searchQuery, 300);
    const [ticketSearch, setTicketSearch] = useState("");
    const [filterStatus, setFilterStatus] = useState<string>("all");
    // Ticket lookup by number
    const { data: foundTicket } = useTicketByNumberQuery(ticketSearch);
    const [selectedPatient, setSelectedPatient] = useState<QueuePatient | null>(null);
    const [detailsOpen, setDetailsOpen] = useState(false);
    const [currentTime, setCurrentTime] = useState(() => Date.now());

    // Update time every minute
    useEffect(() => {
        const interval = setInterval(() => setCurrentTime(Date.now()), 60000);
        return () => clearInterval(interval);
    }, []);

    // TanStack Query
    const { data: queueEntries = [], isLoading, error, refetch } = useHospitalQueueQuery();
    const queueStats = useQueueStats();
    const removeFromQueueMutation = useRemoveFromQueue();

    // Map queue entries to display format
    const queuePatients = useMemo(() =>
        queueEntries.map((entry, idx) => mapQueueEntry(entry, idx, currentTime)),
        [queueEntries, currentTime]
    );

    const stats = useMemo(() => ({
        totalWaiting: queueStats.totalWaiting,
        inProgress: queueStats.inProgress,
        avgWaitTime: queueStats.averageWaitTime,
    }), [queueStats]);

    const filteredQueue = useMemo(() => {
        return queuePatients.filter((patient) => {
            const matchesSearch =
                patient.patientName.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
                patient.ticketNumber.toLowerCase().includes(debouncedSearch.toLowerCase());
            const matchesStatus = filterStatus === "all" || patient.status === filterStatus;
            return matchesSearch && matchesStatus;
        });
    }, [queuePatients, debouncedSearch, filterStatus]);

    const handleViewDetails = (patient: QueuePatient) => {
        setSelectedPatient(patient);
        setDetailsOpen(true);
    };

    const handleRefresh = () => {
        queryClient.invalidateQueries({ queryKey: queueKeys.all });
        toast.success("File d'attente actualisée");
    };

    const handleCancelPatient = (patientId: string) => {
        removeFromQueueMutation.mutate(patientId, {
            onSuccess: () => {
                toast.success("Patient retiré de la file d'attente");
                setDetailsOpen(false);
            },
        });
    };

    if (error) {
        return (
            <div className="flex flex-col h-full">
                <DashboardHeader
                    breadcrumbs={[
                        { label: "Tableau de bord", href: "/dashboard/secondary" },
                        { label: "File d'attente" },
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
                    { label: "Tableau de bord", href: "/dashboard/secondary" },
                    { label: "File d'attente" },
                ]}
            />

            <div className="flex-1 p-4 space-y-4 overflow-y-auto">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-xl font-bold text-primary flex items-center gap-2">
                            <ClipboardList className="size-5" />
                            File d&apos;attente
                        </h1>
                        <p className="text-xs text-muted-foreground">
                            Gestion de la file d&apos;attente du centre
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
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
                        <Button size="sm" className="h-8 text-xs" asChild>
                            <a href="/dashboard/secondary/register">
                                <UserPlus className="size-3.5 mr-1.5" />
                                Nouveau patient
                            </a>
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-4 gap-3">
                    <Card>
                        <CardContent className="p-3">
                            <div className="flex items-center gap-2">
                                <div className="p-2 rounded-full bg-yellow-100">
                                    <Clock className="size-4 text-yellow-600" />
                                </div>
                                <div>
                                    {isLoading ? (
                                        <Skeleton className="h-7 w-8" />
                                    ) : (
                                        <p className="text-xl font-bold">{stats.totalWaiting}</p>
                                    )}
                                    <p className="text-[10px] text-muted-foreground">En attente</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-3">
                            <div className="flex items-center gap-2">
                                <div className="p-2 rounded-full bg-blue-100">
                                    <Activity className="size-4 text-blue-600" />
                                </div>
                                <div>
                                    {isLoading ? (
                                        <Skeleton className="h-7 w-8" />
                                    ) : (
                                        <p className="text-xl font-bold">{stats.inProgress}</p>
                                    )}
                                    <p className="text-[10px] text-muted-foreground">En cours</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-3">
                            <div className="flex items-center gap-2">
                                <div className="p-2 rounded-full bg-green-100">
                                    <Stethoscope className="size-4 text-green-600" />
                                </div>
                                <div>
                                    {isLoading ? (
                                        <Skeleton className="h-7 w-8" />
                                    ) : (
                                        <p className="text-xl font-bold">{queuePatients.filter(p => p.status === "completed").length}</p>
                                    )}
                                    <p className="text-[10px] text-muted-foreground">Terminés</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-3">
                            <div className="flex items-center gap-2">
                                <div className="p-2 rounded-full bg-purple-100">
                                    <Timer className="size-4 text-purple-600" />
                                </div>
                                <div>
                                    {isLoading ? (
                                        <Skeleton className="h-7 w-12" />
                                    ) : (
                                        <p className="text-xl font-bold">{stats.avgWaitTime} min</p>
                                    )}
                                    <p className="text-[10px] text-muted-foreground">Temps moyen</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                        <Input
                            placeholder="Rechercher par nom ou numéro de ticket..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9 h-9"
                        />
                    </div>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm" className="h-9">
                                <Filter className="size-4 mr-1.5" />
                                Filtrer
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setFilterStatus("all")}>
                                Tous
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setFilterStatus("waiting")}>
                                En attente
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setFilterStatus("in_progress")}>
                                En cours
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setFilterStatus("completed")}>
                                Terminés
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm">Patients en file d&apos;attente</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <ScrollArea className="h-[calc(100vh-420px)]">
                            {isLoading ? (
                                <div className="divide-y">
                                    {[...Array(4)].map((_, i) => (
                                        <div key={i} className="p-3">
                                            <div className="flex items-start gap-3">
                                                <Skeleton className="size-10 rounded-full" />
                                                <div className="flex-1 space-y-2">
                                                    <Skeleton className="h-4 w-32" />
                                                    <Skeleton className="h-3 w-full" />
                                                    <Skeleton className="h-3 w-24" />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : filteredQueue.length === 0 ? (
                                <div className="p-8 text-center text-muted-foreground">
                                    <ClipboardList className="size-12 mx-auto mb-4 opacity-50" />
                                    <p>Aucun patient dans la file d&apos;attente</p>
                                </div>
                            ) : (
                                <div className="divide-y">
                                    {filteredQueue.map((patient) => {
                                        const statusInfo = statusConfig[patient.status] || statusConfig.waiting;
                                        return (
                                            <div
                                                key={patient.id}
                                                className="p-3 hover:bg-muted/50 transition-colors cursor-pointer"
                                                onClick={() => handleViewDetails(patient)}
                                            >
                                                <div className="flex items-start justify-between gap-3">
                                                    <div className="flex items-start gap-3">
                                                        {patient.status === "waiting" ? (
                                                            <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                                                <span className="text-sm font-bold text-primary">
                                                                    {patient.position}
                                                                </span>
                                                            </div>
                                                        ) : (
                                                            <div className={`size-10 rounded-full ${statusInfo.color} flex items-center justify-center shrink-0`}>
                                                                <statusInfo.icon className="size-4 text-white" />
                                                            </div>
                                                        )}
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <span className="font-mono text-xs text-muted-foreground">
                                                                    {patient.ticketNumber}
                                                                </span>
                                                                <Badge className={getUrgencyColor(patient.urgencyLevel)}>
                                                                    Urgence {patient.urgencyLevel}
                                                                </Badge>
                                                                <Badge variant="outline" className="text-[10px]">
                                                                    {patient.specialty}
                                                                </Badge>
                                                            </div>
                                                            <h3 className="font-medium text-sm">{patient.patientName}</h3>
                                                            <p className="text-xs text-muted-foreground line-clamp-1">
                                                                {patient.reason}
                                                            </p>
                                                            <div className="flex items-center gap-3 mt-1 text-[10px] text-muted-foreground">
                                                                <span className="flex items-center gap-1">
                                                                    <User className="size-3" />
                                                                    {patient.age} ans, {patient.gender === "M" ? "Homme" : "Femme"}
                                                                </span>
                                                                <span className="flex items-center gap-1">
                                                                    <Clock className="size-3" />
                                                                    Arrivée: {patient.arrivalTime}
                                                                </span>
                                                                {patient.status === "waiting" && (
                                                                    <span className="flex items-center gap-1 text-orange-600">
                                                                        <Timer className="size-3" />
                                                                        ~{patient.estimatedWaitTime} min
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <Badge
                                                            variant="outline"
                                                            className={`${statusInfo.color} text-white border-0 text-[10px]`}
                                                        >
                                                            {statusInfo.label}
                                                        </Badge>
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
                                                                    Voir détails
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem>
                                                                    <Phone className="size-4 mr-2" />
                                                                    Appeler le patient
                                                                </DropdownMenuItem>
                                                                {patient.status === "waiting" && (
                                                                    <DropdownMenuItem
                                                                        className="text-red-600"
                                                                        onClick={() => handleCancelPatient(patient.id)}
                                                                    >
                                                                        <XCircle className="size-4 mr-2" />
                                                                        Annuler
                                                                    </DropdownMenuItem>
                                                                )}
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </ScrollArea>
                    </CardContent>
                </Card>
            </div>

            <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <ClipboardList className="size-5" />
                            Détails du patient
                        </DialogTitle>
                        <DialogDescription>
                            Ticket: {selectedPatient?.ticketNumber}
                        </DialogDescription>
                    </DialogHeader>
                    {selectedPatient && (
                        <div className="space-y-4">
                            <div className="flex items-center gap-4">
                                <div className="size-16 rounded-full bg-primary/10 flex items-center justify-center">
                                    <User className="size-8 text-primary" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold">{selectedPatient.patientName}</h3>
                                    <p className="text-sm text-muted-foreground">
                                        {selectedPatient.patientId}
                                    </p>
                                    <div className="flex gap-2 mt-1">
                                        <Badge className={getUrgencyColor(selectedPatient.urgencyLevel)}>
                                            Urgence {selectedPatient.urgencyLevel}
                                        </Badge>
                                        <Badge variant="outline">{selectedPatient.specialty}</Badge>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <p className="text-muted-foreground text-xs">Âge / Genre</p>
                                    <p className="font-medium">
                                        {selectedPatient.age} ans • {selectedPatient.gender === "M" ? "Homme" : "Femme"}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-muted-foreground text-xs">Téléphone</p>
                                    <p className="font-medium">{selectedPatient.phone}</p>
                                </div>
                                <div>
                                    <p className="text-muted-foreground text-xs">Heure d&apos;arrivée</p>
                                    <p className="font-medium">{selectedPatient.arrivalTime}</p>
                                </div>
                                <div>
                                    <p className="text-muted-foreground text-xs">Temps d&apos;attente</p>
                                    <p className="font-medium">{selectedPatient.estimatedWaitTime} min</p>
                                </div>
                            </div>

                            <div>
                                <p className="text-muted-foreground text-xs mb-1">Motif de consultation</p>
                                <p className="text-sm bg-muted p-2 rounded">{selectedPatient.reason}</p>
                            </div>

                            <div className="flex gap-2 pt-2">
                                <Button className="flex-1" size="sm">
                                    <Phone className="size-4 mr-1.5" />
                                    Appeler
                                </Button>
                                <Button variant="outline" className="flex-1" size="sm">
                                    <Eye className="size-4 mr-1.5" />
                                    Dossier complet
                                </Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
