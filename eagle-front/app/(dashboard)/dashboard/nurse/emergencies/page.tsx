"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { EnhancedNurseDashboardHeader } from "@/components/nurse/enhanced-dashboard-header";
import { FloatingHelpButton } from "@/components/nurse/floating-help-button";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Search,
    AlertTriangle,
    Clock,
    User,
    Stethoscope,
    HeartPulse,
    RefreshCw,
    AlertCircle,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useUrgenciesQuery, useUrgencyStats, urgencyKeys } from "@/hooks/queries";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { Urgency } from "@/types/api";

type EmergencyStatus = "waiting" | "in-preparation" | "ready";

type EmergencyPatient = {
    id: string;
    name: string;
    age: number;
    gender: "Homme" | "Femme";
    patientCode: string;
    urgencyLevel: number;
    waitTime: number;
    reason: string;
    doctor?: string;
    specialty?: string;
    arrivalTime: string;
    status: EmergencyStatus;
    _urgencyId: string;
};

// Map API Urgency to EmergencyPatient for display
function mapUrgencyToEmergency(urgency: Urgency, currentTime: number): EmergencyPatient {
    const patient = urgency.patient;
    const createdAt = new Date(urgency.createdAt);
    const waitMinutes = Math.floor((currentTime - createdAt.getTime()) / 60000);

    // Map status
    let status: EmergencyStatus = "waiting";
    if (urgency.status === "in_progress") status = "in-preparation";
    else if (urgency.status === "validated" || urgency.status === "assigned") status = "ready";

    // Calculate age
    const age = patient?.dateOfBirth
        ? Math.floor((Date.now() - new Date(patient.dateOfBirth).getTime()) / (365.25 * 24 * 60 * 60 * 1000))
        : 0;

    return {
        id: urgency.id,
        name: patient ? `${patient.firstName} ${patient.lastName}` : "Patient inconnu",
        age,
        gender: patient?.gender === "MALE" ? "Homme" : "Femme",
        patientCode: patient?.idNumber || "N/A",
        urgencyLevel: urgency.urgencyLevel,
        waitTime: waitMinutes,
        reason: urgency.reason,
        doctor: urgency.doctor?.name ? `Dr. ${urgency.doctor.name}` : undefined,
        specialty: urgency.hospital?.name,
        arrivalTime: createdAt.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }),
        status,
        _urgencyId: urgency.id,
    };
}

export default function EmergenciesPage() {
    const queryClient = useQueryClient();
    const [searchQuery, setSearchQuery] = useState("");
    const [currentTime, setCurrentTime] = useState(Date.now());

    // Update current time every minute
    useEffect(() => {
        const interval = setInterval(() => setCurrentTime(Date.now()), 60000);
        return () => clearInterval(interval);
    }, []);

    // TanStack Query
    const { data: urgencies = [], isLoading, error, refetch } = useUrgenciesQuery();
    const stats = useUrgencyStats();

    // Filter only high-priority urgencies (level 4 and 5)
    const emergencies = useMemo<EmergencyPatient[]>(() => {
        return urgencies
            .filter((u) => u.urgencyLevel >= 4 && u.status !== "completed" && u.status !== "rejected")
            .map((u) => mapUrgencyToEmergency(u, currentTime))
            .sort((a, b) => {
                // Sort by urgency level (5 first), then by wait time
                if (a.urgencyLevel !== b.urgencyLevel) {
                    return b.urgencyLevel - a.urgencyLevel;
                }
                return a.waitTime - b.waitTime;
            });
    }, [urgencies, currentTime]);

    // Filtered emergencies
    const filteredEmergencies = useMemo(() => {
        return emergencies.filter(
            (patient) =>
                patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                patient.patientCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
                patient.reason.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [emergencies, searchQuery]);

    // Stats
    const level5Count = emergencies.filter((e) => e.urgencyLevel === 5).length;
    const level4Count = emergencies.filter((e) => e.urgencyLevel === 4).length;

    const getUrgencyBadge = (level: number) => {
        if (level === 5) {
            return (
                <Badge variant="destructive" className="bg-red-600 animate-pulse">
                    <AlertTriangle className="size-3 mr-1" />
                    Niveau 5 - Urgence vitale
                </Badge>
            );
        }
        return (
            <Badge variant="destructive" className="bg-orange-500">
                <AlertTriangle className="size-3 mr-1" />
                Niveau 4 - Très urgent
            </Badge>
        );
    };

    const handleRefresh = useCallback(() => {
        queryClient.invalidateQueries({ queryKey: urgencyKeys.all });
        toast.success("Données actualisées");
    }, [queryClient]);

    const handlePrepare = useCallback((emergencyId: string) => {
        toast.info(`Préparation du patient ${emergencyId} en cours...`);
        // TODO: Call API to start preparation
    }, []);

    if (error) {
        return (
            <div className="flex flex-col h-full">
                <EnhancedNurseDashboardHeader
                    nurseName="Sophie Ateba"
                    clinic="Centre Principal - Yaoundé"
                    clinicCode="CPY-001"
                    clinicType="Centre Principal"
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
            <EnhancedNurseDashboardHeader
                nurseName="Sophie Ateba"
                clinic="Centre Principal - Yaoundé"
                clinicCode="CPY-001"
                clinicType="Centre Principal"
            />

            <div className="flex-1 p-6 space-y-6 overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-primary flex items-center gap-2">
                            <AlertTriangle className="size-6 text-red-500" />
                            Gestion des Urgences
                        </h1>
                        <p className="text-muted-foreground">
                            Cas urgents nécessitant une attention immédiate
                        </p>
                    </div>
                    <Button variant="outline" onClick={handleRefresh} disabled={isLoading}>
                        <RefreshCw className={`size-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
                        Actualiser
                    </Button>
                </div>

                {/* Statistics */}
                <div className="grid gap-4 md:grid-cols-3">
                    <Card className="border-red-500 border-2">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Urgences Niveau 5</p>
                                    {isLoading ? (
                                        <Skeleton className="h-8 w-12 mt-1" />
                                    ) : (
                                        <p className="text-2xl font-bold text-red-600">{level5Count}</p>
                                    )}
                                    <p className="text-xs text-red-600 mt-1">Urgence vitale</p>
                                </div>
                                <AlertTriangle className="size-10 text-red-500 animate-pulse" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="border-orange-500 border-2">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Urgences Niveau 4</p>
                                    {isLoading ? (
                                        <Skeleton className="h-8 w-12 mt-1" />
                                    ) : (
                                        <p className="text-2xl font-bold text-orange-600">{level4Count}</p>
                                    )}
                                    <p className="text-xs text-orange-600 mt-1">Très urgent</p>
                                </div>
                                <AlertTriangle className="size-10 text-orange-500" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Total urgences</p>
                                    {isLoading ? (
                                        <Skeleton className="h-8 w-12 mt-1" />
                                    ) : (
                                        <p className="text-2xl font-bold">{emergencies.length}</p>
                                    )}
                                </div>
                                <AlertTriangle className="size-10 text-muted-foreground" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Search */}
                <Card>
                    <CardContent className="p-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                            <Input
                                placeholder="Rechercher un patient urgent..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-9"
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Emergency Patients List */}
                {isLoading ? (
                    <div className="space-y-4">
                        {[1, 2, 3].map((i) => (
                            <Card key={i}>
                                <CardContent className="p-6">
                                    <div className="flex items-start gap-4">
                                        <Skeleton className="size-14 rounded-full" />
                                        <div className="flex-1 space-y-2">
                                            <Skeleton className="h-6 w-48" />
                                            <Skeleton className="h-4 w-full" />
                                            <Skeleton className="h-4 w-3/4" />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <div className="space-y-4">
                        {filteredEmergencies.map((patient) => (
                            <Card
                                key={patient.id}
                                className={`border-l-4 transition-all hover:shadow-lg ${
                                    patient.urgencyLevel === 5
                                        ? "border-l-red-600 bg-red-50/50 dark:bg-red-950/20"
                                        : "border-l-orange-500 bg-orange-50/50 dark:bg-orange-950/20"
                                }`}
                            >
                                <CardContent className="p-6">
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-start gap-4 flex-1">
                                            <Avatar className="size-14 border-2 border-current">
                                                <AvatarFallback
                                                    className={`${
                                                        patient.urgencyLevel === 5 ? "bg-red-600" : "bg-orange-500"
                                                    } text-white text-lg`}
                                                >
                                                    {patient.name
                                                        .split(" ")
                                                        .map((n) => n[0])
                                                        .join("")
                                                        .slice(0, 2)}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <h3 className="text-xl font-bold">{patient.name}</h3>
                                                    {getUrgencyBadge(patient.urgencyLevel)}
                                                </div>
                                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-3">
                                                    <div className="flex items-center gap-2">
                                                        <User className="size-4 text-muted-foreground" />
                                                        <span>
                                                            {patient.age} ans, {patient.gender}
                                                        </span>
                                                    </div>
                                                    <div>
                                                        <span className="text-muted-foreground">Code: </span>
                                                        <span className="font-medium">{patient.patientCode}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <Clock className="size-4 text-muted-foreground" />
                                                        <span>Arrivée: {patient.arrivalTime}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <AlertTriangle className="size-4 text-orange-500" />
                                                        <span className="font-semibold text-orange-600">
                                                            Attente: {patient.waitTime} min
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="bg-white dark:bg-gray-800 p-3 rounded-lg mb-3">
                                                    <p className="text-sm font-medium text-muted-foreground mb-1">
                                                        Raison
                                                    </p>
                                                    <p className="font-medium">{patient.reason}</p>
                                                </div>
                                                {patient.doctor && patient.specialty && (
                                                    <div className="flex items-center gap-2 text-sm">
                                                        <Stethoscope className="size-4 text-muted-foreground" />
                                                        <span>
                                                            {patient.doctor} - {patient.specialty}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex flex-col gap-2 ml-4">
                                            {patient.status === "waiting" && (
                                                <Button
                                                    className="bg-orange-600 hover:bg-orange-700"
                                                    onClick={() => handlePrepare(patient._urgencyId)}
                                                >
                                                    <HeartPulse className="size-4 mr-2" />
                                                    Préparation rapide
                                                </Button>
                                            )}
                                            {patient.status === "in-preparation" && (
                                                <Button className="bg-blue-600 hover:bg-blue-700">
                                                    Préparation en cours
                                                </Button>
                                            )}
                                            {patient.status === "ready" && (
                                                <Button
                                                    variant="outline"
                                                    className="border-green-500 text-green-700"
                                                >
                                                    Prêt pour consultation
                                                </Button>
                                            )}
                                            <Button variant="outline" size="sm">
                                                Voir détails
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}

                {!isLoading && filteredEmergencies.length === 0 && (
                    <Card>
                        <CardContent className="py-12 text-center">
                            <AlertTriangle className="size-12 mx-auto text-muted-foreground mb-4" />
                            <p className="text-lg font-medium text-muted-foreground">
                                Aucun cas urgent pour le moment
                            </p>
                        </CardContent>
                    </Card>
                )}
            </div>

            <FloatingHelpButton />
        </div>
    );
}
