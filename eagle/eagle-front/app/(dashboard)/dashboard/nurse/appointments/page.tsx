"use client";

import { useState, useMemo } from "react";
import { EnhancedNurseDashboardHeader } from "@/components/nurse/enhanced-dashboard-header";
import { FloatingHelpButton } from "@/components/nurse/floating-help-button";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
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
    Search,
    Calendar,
    Plus,
    Clock,
    AlertTriangle,
    CheckCircle2,
    Edit,
    Eye,
    ChevronRight,
    ChevronLeft,
    ChevronUp,
    ChevronDown,
    RefreshCw,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { toast } from "sonner";
import {
    useFollowupsQuery,
    useCreateFollowup,
    useCompleteFollowup,
    useCancelFollowup,
    useMarkFollowupAsMissed,
    useFollowupStats,
} from "@/hooks/queries/use-followups-query";
import { usePatientsQuery } from "@/hooks/queries/use-patients-query";
import { useSpecialtiesQuery } from "@/hooks/queries/use-specialties-query";
import { useUsersQuery } from "@/hooks/queries/use-users-query";
import type { Appointment, Followup, FollowupStatus, Patient, User } from "@/types/api";
import {
    useAppointmentsQuery,
    useAppointmentStatus,
    useCareTeamQuery,
    useCreateAppointment,
} from "@/hooks/queries";

type AppointmentUrgency = 1 | 2 | 3 | 4 | 5;
type AppointmentType = "new" | "followup";

// Display type for appointments (from followups)
type AppointmentDisplay = {
    id: string;
    patientName: string;
    patientCode: string;
    patientAge: number;
    patientGender: "Homme" | "Femme";
    doctor: string;
    specialty: string;
    date: string;
    time: string;
    urgencyLevel: AppointmentUrgency;
    status: "confirmed" | "pending" | "cancelled" | "completed";
    type: AppointmentType;
    reason?: string;
};

// Map Followup to display type
function followupToAppointment(followup: Followup, patients: Patient[], doctors: User[]): AppointmentDisplay {
    const patient = followup.patient || patients.find(p => p.id === followup.patientId);
    const doctor = followup.doctor || doctors.find(d => d.id === followup.doctorId);
    
    // Calculate age
    const dob = patient?.dateOfBirth ? new Date(patient.dateOfBirth) : null;
    const age = dob 
        ? Math.floor((Date.now() - dob.getTime()) / (365.25 * 24 * 60 * 60 * 1000))
        : 0;
    
    // Parse date and time
    const scheduledDate = new Date(followup.scheduledDate);
    const date = scheduledDate.toISOString().split("T")[0];
    const time = scheduledDate.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
    
    // Map status
    const mapStatus = (status: FollowupStatus): "confirmed" | "pending" | "cancelled" | "completed" => {
        switch (status) {
            case "scheduled": return "confirmed";
            case "completed": return "completed";
            case "cancelled": return "cancelled";
            case "missed": return "cancelled";
            default: return "pending";
        }
    };
    
    return {
        id: followup.id,
        patientName: patient ? `${patient.firstName} ${patient.lastName}` : "Patient inconnu",
        patientCode: patient?.idNumber || `PAT-${followup.patientId.slice(0, 8)}`,
        patientAge: age,
        patientGender: patient?.gender === "MALE" ? "Homme" : "Femme",
        doctor: doctor?.name || "Médecin non assigné",
        specialty: "Généraliste", // Would need specialty info from doctor
        date,
        time,
        urgencyLevel: 1, // Followups don't have urgency levels
        status: mapStatus(followup.status),
        type: "followup",
        reason: followup.reason,
    };
}

function apiAppointmentToDisplay(
    appointment: Appointment,
    patients: Patient[],
    doctors: User[],
): AppointmentDisplay {
    const patient = patients.find((item) => item.id === appointment.patientId);
    const doctor = doctors.find((item) => item.id === appointment.selectedDoctorId);
    const scheduledAt = new Date(appointment.scheduledAt);
    const age = patient
        ? Math.floor(
            (Date.now() - new Date(patient.dateOfBirth).getTime()) /
                (365.25 * 24 * 60 * 60 * 1000),
        )
        : 0;
    const statusMap: Record<Appointment["status"], AppointmentDisplay["status"]> = {
        BOOKED: "pending",
        CONFIRMED: "confirmed",
        CHECKED_IN: "confirmed",
        MISSED: "cancelled",
        CANCELLED: "cancelled",
        COMPLETED: "completed",
    };
    return {
        id: appointment.id,
        patientName: patient ? `${patient.firstName} ${patient.lastName}` : "Patient",
        patientCode: patient?.idNumber || appointment.patientId,
        patientAge: age,
        patientGender: patient?.gender === "MALE" ? "Homme" : "Femme",
        doctor: doctor?.name || "À assigner",
        specialty: appointment.specialtyId,
        date: scheduledAt.toISOString().split("T")[0],
        time: scheduledAt.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }),
        urgencyLevel: 3,
        status: statusMap[appointment.status],
        type: "new",
        reason: appointment.reason || undefined,
    };
}

export default function AppointmentsPage() {
    const [searchQuery, setSearchQuery] = useState("");
    const [activeTab, setActiveTab] = useState<"upcoming" | "today" | "past" | "cancelled">("today");
    const [newAppointmentOpen, setNewAppointmentOpen] = useState(false);
    const [appointmentStep, setAppointmentStep] = useState(1);
    const [statsHidden, setStatsHidden] = useState(false);
    
    const [appointmentData, setAppointmentData] = useState({
        patientType: "existing" as "existing" | "new",
        patientId: "",
        newPatient: {
            firstName: "",
            lastName: "",
            age: "",
            gender: "",
        },
        specialty: "",
        doctor: "",
        type: "new" as AppointmentType,
        urgency: "1" as string,
        notes: "",
        date: new Date(),
        time: "",
    });

    // Fetch data
    const { data: apiAppointments = [], isLoading, refetch } = useAppointmentsQuery();
    const { data: patients = [] } = usePatientsQuery();
    const { data: specialties = [] } = useSpecialtiesQuery();
    const { data: users = [] } = useCareTeamQuery();
    const followupStats = useFollowupStats();
    const createFollowupMutation = useCreateAppointment();
    const completeFollowupMutation = useAppointmentStatus("complete");
    const cancelFollowupMutation = useAppointmentStatus("cancel");
    const markMissedMutation = useAppointmentStatus("missed");
    
    // Filter doctors from users
    const doctors = users.filter(u => u.role === "doctor");
    
    // Get today's date
    const today = useMemo(() => new Date().toISOString().split("T")[0], []);
    
    // Transform followups to appointments
    const appointments = useMemo(() => 
        apiAppointments.map((appointment) =>
            apiAppointmentToDisplay(appointment, patients, doctors),
        ),
        [apiAppointments, patients, doctors]
    );

    const getUrgencyBadge = (level: AppointmentUrgency) => {
        const config = {
            5: { label: "Niveau 5", variant: "destructive" as const, color: "bg-red-600" },
            4: { label: "Niveau 4", variant: "destructive" as const, color: "bg-orange-500" },
            3: { label: "Niveau 3", variant: "default" as const, color: "bg-yellow-500" },
            2: { label: "Niveau 2", variant: "secondary" as const, color: "bg-blue-500" },
            1: { label: "Niveau 1", variant: "secondary" as const, color: "bg-green-500" },
        };
        const conf = config[level];
        return <Badge variant={conf.variant} className={conf.color}>{conf.label}</Badge>;
    };

    const getStatusBadge = (status: "confirmed" | "pending" | "cancelled" | "completed") => {
        switch (status) {
            case "confirmed":
                return <Badge variant="default" className="bg-green-500">Confirmé</Badge>;
            case "pending":
                return <Badge variant="secondary">En attente</Badge>;
            case "cancelled":
                return <Badge variant="destructive">Annulé</Badge>;
            case "completed":
                return <Badge variant="outline">Terminé</Badge>;
        }
    };

    const filteredAppointments = appointments.filter(apt => {
        const matchesSearch = apt.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            apt.patientCode.toLowerCase().includes(searchQuery.toLowerCase());
        
        if (activeTab === "today") return matchesSearch && apt.date === today && apt.status !== "cancelled";
        if (activeTab === "upcoming") return matchesSearch && apt.date > today && apt.status !== "cancelled";
        if (activeTab === "past") return matchesSearch && apt.date < today && apt.status === "completed";
        if (activeTab === "cancelled") return matchesSearch && apt.status === "cancelled";
        
        return matchesSearch;
    });

    const stats = {
        total: appointments.length,
        today: appointments.filter(a => a.date === today).length,
        upcoming: appointments.filter(a => a.date > today && a.status !== "cancelled").length,
        urgent: appointments.filter(a => a.urgencyLevel >= 4).length,
    };

    const handleCreateAppointment = () => {
        if (!appointmentData.patientId || !appointmentData.time) {
            toast.error("Veuillez remplir tous les champs obligatoires");
            return;
        }
        
        if (!appointmentData.specialty) {
            toast.error("Veuillez sélectionner une spécialité");
            return;
        }
        const scheduledAt = new Date(appointmentData.date);
        const [hours, minutes] = appointmentData.time.split(":").map(Number);
        scheduledAt.setHours(hours, minutes, 0, 0);
        createFollowupMutation.mutate({
            patientId: appointmentData.patientId,
            specialtyId: appointmentData.specialty,
            selectedDoctorId: appointmentData.doctor || undefined,
            scheduledAt: scheduledAt.toISOString(),
            reason: appointmentData.notes || undefined,
        }, {
            onSuccess: () => {
                toast.success("Rendez-vous créé");
                setNewAppointmentOpen(false);
                setAppointmentStep(1);
                setAppointmentData({
                    patientType: "existing",
                    patientId: "",
                    newPatient: { firstName: "", lastName: "", age: "", gender: "" },
                    specialty: "",
                    doctor: "",
                    type: "new",
                    urgency: "1",
                    notes: "",
                    date: new Date(),
                    time: "",
                });
            },
        });
    };

    const availableTimes = ["08:00", "08:30", "09:00", "09:30", "10:00", "10:30", "11:00", "14:00", "14:30", "15:00"];

    if (isLoading) {
        return (
            <div className="flex flex-col h-full">
                <EnhancedNurseDashboardHeader />
                <div className="flex-1 p-6 space-y-6 overflow-y-auto">
                    <div className="flex items-center justify-between">
                        <div>
                            <Skeleton className="h-8 w-48" />
                            <Skeleton className="h-4 w-72 mt-1" />
                        </div>
                        <Skeleton className="h-10 w-40" />
                    </div>
                    <div className="flex gap-2">
                        {[1, 2, 3, 4].map((i) => (
                            <Card key={i} className="shrink-0 min-w-[180px]">
                                <CardContent className="p-3">
                                    <Skeleton className="h-12 w-full" />
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                    <Card>
                        <CardContent className="p-4">
                            <Skeleton className="h-10 w-full" />
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-0">
                            <div className="p-4 space-y-3">
                                {[1, 2, 3, 4].map((i) => (
                                    <Skeleton key={i} className="h-16 w-full" />
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full">
            <EnhancedNurseDashboardHeader />

            <div className="flex-1 p-6 space-y-6 overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-primary">Rendez-vous</h1>
                        <p className="text-muted-foreground">
                            Gestion des rendez-vous (planification, modification, annulation)
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="icon" onClick={() => refetch()}>
                            <RefreshCw className="size-4" />
                        </Button>
                        <Button onClick={() => setNewAppointmentOpen(true)}>
                            <Plus className="size-4 mr-2" />
                            Nouveau rendez-vous
                        </Button>
                    </div>
                </div>

                {/* Statistics */}
                {!statsHidden && (
                    <div className="flex gap-2 overflow-x-auto">
                        <Card className="hover:shadow-md transition-shadow rounded-xl shrink-0 min-w-[180px]">
                            <CardContent className="p-3">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-lg bg-muted/50 text-muted-foreground shrink-0">
                                        <Calendar className="size-4" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-lg font-bold leading-tight">{stats.total}</p>
                                        <p className="text-[11px] text-muted-foreground leading-tight truncate">Total</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="hover:shadow-md transition-shadow rounded-xl shrink-0 min-w-[180px]">
                            <CardContent className="p-3">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-lg bg-muted/50 text-blue-500 shrink-0">
                                        <Clock className="size-4" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-lg font-bold leading-tight">{stats.today}</p>
                                        <p className="text-[11px] text-muted-foreground leading-tight truncate">Aujourd&apos;hui</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="hover:shadow-md transition-shadow rounded-xl shrink-0 min-w-[180px]">
                            <CardContent className="p-3">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-lg bg-muted/50 text-green-500 shrink-0">
                                        <ChevronRight className="size-4" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-lg font-bold leading-tight">{stats.upcoming}</p>
                                        <p className="text-[11px] text-muted-foreground leading-tight truncate">À venir</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="hover:shadow-md transition-shadow rounded-xl shrink-0 min-w-[180px]">
                            <CardContent className="p-3">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-lg bg-muted/50 text-red-500 shrink-0">
                                        <AlertTriangle className="size-4" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-lg font-bold leading-tight">{stats.urgent}</p>
                                        <p className="text-[11px] text-muted-foreground leading-tight truncate">Urgents</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}
                {/* Toggle Stats Button */}
                <div className="flex items-center gap-2">
                    <div className="flex-1"></div>
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

                {/* Search */}
                <Card>
                    <CardContent className="p-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                            <Input
                                placeholder="Rechercher un rendez-vous..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-9"
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Tabs */}
                <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
                    <TabsList>
                        <TabsTrigger value="today">Aujourd&apos;hui</TabsTrigger>
                        <TabsTrigger value="upcoming">À venir</TabsTrigger>
                        <TabsTrigger value="past">Passés</TabsTrigger>
                        <TabsTrigger value="cancelled">Annulés</TabsTrigger>
                    </TabsList>

                    <TabsContent value={activeTab} className="mt-6">
                        <Card>
                            <CardContent className="p-0">
                                {filteredAppointments.length === 0 ? (
                                    <div className="text-center py-12">
                                        <Calendar className="size-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                                        <h3 className="text-lg font-medium mb-2">Aucun rendez-vous</h3>
                                        <p className="text-sm text-muted-foreground">
                                            {activeTab === "today"
                                                ? "Aucun rendez-vous prévu pour aujourd'hui"
                                                : activeTab === "upcoming"
                                                ? "Aucun rendez-vous à venir"
                                                : activeTab === "past"
                                                ? "Aucun rendez-vous passé"
                                                : "Aucun rendez-vous annulé"}
                                        </p>
                                    </div>
                                ) : (
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Date/Heure</TableHead>
                                                <TableHead>Patient</TableHead>
                                                <TableHead>Médecin</TableHead>
                                                <TableHead>Spécialité</TableHead>
                                                <TableHead>Urgence</TableHead>
                                                <TableHead>Statut</TableHead>
                                                <TableHead className="text-right">Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {filteredAppointments.map((appt) => (
                                                <TableRow key={appt.id}>
                                                    <TableCell>
                                                        <div>
                                                            <p className="font-medium">{appt.date}</p>
                                                            <p className="text-sm text-muted-foreground">{appt.time}</p>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center gap-3">
                                                            <Avatar className="size-8">
                                                                <AvatarFallback className={appt.patientGender === "Homme" ? "bg-blue-500" : "bg-pink-500"}>
                                                                    {appt.patientName.split(" ").map(n => n[0]).join("").slice(0, 2)}
                                                                </AvatarFallback>
                                                            </Avatar>
                                                            <div>
                                                                <p className="font-medium">{appt.patientName}</p>
                                                                <p className="text-xs text-muted-foreground">
                                                                    {appt.patientAge} ans, {appt.patientGender}
                                                                </p>
                                                                <p className="text-xs text-muted-foreground">{appt.patientCode}</p>
                                                            </div>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>{appt.doctor}</TableCell>
                                                    <TableCell>{appt.specialty}</TableCell>
                                                    <TableCell>{getUrgencyBadge(appt.urgencyLevel)}</TableCell>
                                                    <TableCell>{getStatusBadge(appt.status)}</TableCell>
                                                    <TableCell className="text-right">
                                                        <div className="flex items-center justify-end gap-1">
                                                            {(appt.status === "confirmed" || appt.status === "pending") && (
                                                                <>
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="sm"
                                                                        className="h-7 text-xs text-green-600"
                                                                        onClick={() => completeFollowupMutation.mutate(appt.id)}
                                                                        disabled={completeFollowupMutation.isPending}
                                                                    >
                                                                        <CheckCircle2 className="size-3 mr-1" />
                                                                        Terminer
                                                                    </Button>
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="sm"
                                                                        className="h-7 text-xs text-orange-600"
                                                                        onClick={() => markMissedMutation.mutate(appt.id)}
                                                                        disabled={markMissedMutation.isPending}
                                                                    >
                                                                        <AlertTriangle className="size-3 mr-1" />
                                                                        Manqué
                                                                    </Button>
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="sm"
                                                                        className="h-7 text-xs text-red-600"
                                                                        onClick={() => cancelFollowupMutation.mutate(appt.id)}
                                                                        disabled={cancelFollowupMutation.isPending}
                                                                    >
                                                                        Annuler
                                                                    </Button>
                                                                </>
                                                            )}
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>

            {/* New Appointment Modal */}
            <Dialog open={newAppointmentOpen} onOpenChange={setNewAppointmentOpen}>
                <DialogContent className="max-w-3xl max-h-[90vh]">
                    <DialogHeader>
                        <DialogTitle>Nouveau rendez-vous</DialogTitle>
                        <DialogDescription>
                            Étape {appointmentStep} sur 3
                        </DialogDescription>
                    </DialogHeader>

                    {/* Step Indicator */}
                    <div className="flex items-center justify-between mb-6">
                        {[1, 2, 3].map((step) => (
                            <div key={step} className="flex items-center flex-1">
                                <div className={`flex items-center justify-center size-8 rounded-full ${
                                    step === appointmentStep ? "bg-primary text-primary-foreground" :
                                    step < appointmentStep ? "bg-green-500 text-white" :
                                    "bg-muted text-muted-foreground"
                                }`}>
                                    {step < appointmentStep ? <CheckCircle2 className="size-5" /> : step}
                                </div>
                                {step < 3 && (
                                    <div className={`flex-1 h-1 mx-2 ${step < appointmentStep ? "bg-green-500" : "bg-muted"}`} />
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Step 1: Patient Selection */}
                    {appointmentStep === 1 && (
                        <div className="space-y-4">
                            <div>
                                <Label>Type de patient</Label>
                                <Select
                                    value={appointmentData.patientType}
                                    onValueChange={(value: "existing" | "new") =>
                                        setAppointmentData({ ...appointmentData, patientType: value })
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="existing">Patient existant</SelectItem>
                                        <SelectItem value="new">Nouveau patient</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {appointmentData.patientType === "existing" ? (
                                <div>
                                    <Label>Rechercher un patient</Label>
                                    <Select value={appointmentData.patientId} onValueChange={(value) => setAppointmentData({ ...appointmentData, patientId: value })}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Sélectionner un patient" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {patients.map((patient) => (
                                                <SelectItem key={patient.id} value={patient.id}>
                                                    {patient.firstName} {patient.lastName} ({patient.idNumber || patient.id.slice(0, 8)})
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label>Prénom *</Label>
                                        <Input
                                            value={appointmentData.newPatient.firstName}
                                            onChange={(e) => setAppointmentData({
                                                ...appointmentData,
                                                newPatient: { ...appointmentData.newPatient, firstName: e.target.value }
                                            })}
                                        />
                                    </div>
                                    <div>
                                        <Label>Nom *</Label>
                                        <Input
                                            value={appointmentData.newPatient.lastName}
                                            onChange={(e) => setAppointmentData({
                                                ...appointmentData,
                                                newPatient: { ...appointmentData.newPatient, lastName: e.target.value }
                                            })}
                                        />
                                    </div>
                                    <div>
                                        <Label>Âge *</Label>
                                        <Input
                                            type="number"
                                            value={appointmentData.newPatient.age}
                                            onChange={(e) => setAppointmentData({
                                                ...appointmentData,
                                                newPatient: { ...appointmentData.newPatient, age: e.target.value }
                                            })}
                                        />
                                    </div>
                                    <div>
                                        <Label>Genre *</Label>
                                        <Select
                                            value={appointmentData.newPatient.gender}
                                            onValueChange={(value) => setAppointmentData({
                                                ...appointmentData,
                                                newPatient: { ...appointmentData.newPatient, gender: value }
                                            })}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Sélectionner" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Homme">Homme</SelectItem>
                                                <SelectItem value="Femme">Femme</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            )}

                            <div className="flex gap-2 pt-4 border-t">
                                <Button variant="outline" onClick={() => setNewAppointmentOpen(false)} className="flex-1">
                                    Annuler
                                </Button>
                                <Button onClick={() => setAppointmentStep(2)} className="flex-1">
                                    Suivant
                                    <ChevronRight className="size-4 ml-2" />
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* Step 2: Consultation Details */}
                    {appointmentStep === 2 && (
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label>Spécialité *</Label>
                                    <Select
                                        value={appointmentData.specialty}
                                        onValueChange={(value) => setAppointmentData({ ...appointmentData, specialty: value })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Sélectionner" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {specialties.map((spec) => (
                                                <SelectItem key={spec.id} value={spec.id}>{spec.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <Label>Médecin *</Label>
                                    <Select
                                        value={appointmentData.doctor}
                                        onValueChange={(value) => setAppointmentData({ ...appointmentData, doctor: value })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Sélectionner" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {doctors.map((doc) => (
                                                <SelectItem key={doc.id} value={doc.id}>{doc.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label>Type de consultation</Label>
                                    <Select
                                        value={appointmentData.type}
                                        onValueChange={(value: AppointmentType) => setAppointmentData({ ...appointmentData, type: value })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="new">Nouveau patient</SelectItem>
                                            <SelectItem value="followup">Suivi</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <Label>Niveau d&apos;urgence (1-5)</Label>
                                    <Select
                                        value={appointmentData.urgency}
                                        onValueChange={(value) => setAppointmentData({ ...appointmentData, urgency: value })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {[1, 2, 3, 4, 5].map((level) => (
                                                <SelectItem key={level} value={level.toString()}>
                                                    Niveau {level}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                                    <div>
                                        <Label>Problème / Raison de consultation *</Label>
                                        <Textarea
                                            value={appointmentData.notes}
                                            onChange={(e) => setAppointmentData({ ...appointmentData, notes: e.target.value })}
                                            placeholder="Décrivez le problème du patient, les symptômes, ou la raison de consultation..."
                                            className="min-h-[100px]"
                                        />
                                    </div>

                            <div className="flex gap-2 pt-4 border-t">
                                <Button variant="outline" onClick={() => setAppointmentStep(1)} className="flex-1">
                                    <ChevronLeft className="size-4 mr-2" />
                                    Précédent
                                </Button>
                                <Button onClick={() => setAppointmentStep(3)} className="flex-1">
                                    Suivant
                                    <ChevronRight className="size-4 ml-2" />
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* Step 3: Date and Time */}
                    {appointmentStep === 3 && (
                        <div className="space-y-4">
                            <div>
                                <Label>Date *</Label>
                                <CalendarComponent
                                    mode="single"
                                    selected={appointmentData.date}
                                    onSelect={(date) => date && setAppointmentData({ ...appointmentData, date })}
                                    className="rounded-md border mt-2"
                                />
                            </div>

                            <div>
                                <Label>Heure *</Label>
                                <Select
                                    value={appointmentData.time}
                                    onValueChange={(value) => setAppointmentData({ ...appointmentData, time: value })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Sélectionner une heure" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {availableTimes.map((time) => (
                                            <SelectItem key={time} value={time}>{time}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="flex gap-2 pt-4 border-t">
                                <Button variant="outline" onClick={() => setAppointmentStep(2)} className="flex-1">
                                    <ChevronLeft className="size-4 mr-2" />
                                    Précédent
                                </Button>
                                <Button 
                                    onClick={handleCreateAppointment} 
                                    className="flex-1"
                                    disabled={createFollowupMutation.isPending}
                                >
                                    <CheckCircle2 className="size-4 mr-2" />
                                    {createFollowupMutation.isPending ? "Création..." : "Créer le rendez-vous"}
                                </Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            <FloatingHelpButton />
        </div>
    );
}
