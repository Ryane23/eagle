"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, User, Clock, CheckCircle2, Stethoscope, AlertCircle } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useState, useMemo, useEffect } from "react";
import { useGlobalQueueQuery } from "@/hooks/queries";
import type { QueueEntry } from "@/types/api";

type PatientStatus = "waiting" | "in_progress" | "completed" | "cancelled";

type WaitingPatient = {
    id: string;
    name: string;
    age: number;
    gender: "Homme" | "Femme";
    urgencyLevel: number;
    waitTime: number;
    arrivalTime: string;
    doctor: string;
    specialty: string;
    status: PatientStatus;
    type: "new" | "followup";
    identityVerified: boolean;
    queuePosition: number;
};

function mapQueueEntryToPatient(entry: QueueEntry, position: number, currentTime: number): WaitingPatient {
    const patient = entry.patient;
    const consultation = entry.consultation;
    const waitTime = Math.floor((currentTime - new Date(entry.createdAt).getTime()) / 60000);

    return {
        id: entry.id,
        name: patient ? `${patient.firstName} ${patient.lastName}` : "Patient inconnu",
        age: patient?.dateOfBirth
            ? Math.floor((Date.now() - new Date(patient.dateOfBirth).getTime()) / (365.25 * 24 * 60 * 60 * 1000))
            : 0,
        gender: patient?.gender === "MALE" ? "Homme" : "Femme",
        urgencyLevel: consultation?.urgencyLevel ? parseInt(consultation.urgencyLevel) : 3,
        waitTime,
        arrivalTime: new Date(entry.createdAt).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }),
        doctor: consultation?.doctor?.name || "Non assigné",
        specialty: entry.hospitalId || "Général",
        status: entry.status as PatientStatus,
        type: consultation?.type === "video" ? "new" : "followup",
        identityVerified: true,
        queuePosition: position + 1,
    };
}

export function WaitingRoomsBySpecialty() {
    const [searchQuery, setSearchQuery] = useState("");
    const [activeSpecialty, setActiveSpecialty] = useState<string>("all");
    const [currentTime, setCurrentTime] = useState(new Date().getTime());

    // Update current time every minute for wait time calculations
    useEffect(() => {
        const interval = setInterval(() => setCurrentTime(Date.now()), 60000);
        return () => clearInterval(interval);
    }, []);

    const { data: queueEntries = [], isLoading, error } = useGlobalQueueQuery();

    // Map queue entries to waiting patients and group by specialty
    const { patientsBySpecialty, allSpecialties, allPatients } = useMemo(() => {
        const patients = queueEntries
            .filter(entry => entry.status === "waiting" || entry.status === "in_progress")
            .map((entry, idx) => mapQueueEntryToPatient(entry, idx, currentTime));

        const grouped: Record<string, WaitingPatient[]> = {};
        patients.forEach(patient => {
            if (!grouped[patient.specialty]) {
                grouped[patient.specialty] = [];
            }
            grouped[patient.specialty].push(patient);
        });

        return {
            patientsBySpecialty: grouped,
            allSpecialties: Object.keys(grouped),
            allPatients: patients,
        };
    }, [queueEntries, currentTime]);

    const patientsToShow = activeSpecialty === "all"
        ? allPatients
        : patientsBySpecialty[activeSpecialty] || [];

    const filteredPatients = patientsToShow.filter(patient =>
        patient.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const getUrgencyBadge = (level: number) => {
        const config: Record<number, { label: string; color: string }> = {
            5: { label: "5", color: "bg-red-600" },
            4: { label: "4", color: "bg-orange-500" },
            3: { label: "3", color: "bg-yellow-500" },
            2: { label: "2", color: "bg-blue-500" },
            1: { label: "1", color: "bg-green-500" },
        };
        const conf = config[level] || config[3];
        return <Badge className={conf.color}>{conf.label}</Badge>;
    };

    const getStatusBadge = (status: PatientStatus) => {
        switch (status) {
            case "waiting":
                return <Badge variant="secondary">En attente</Badge>;
            case "in_progress":
                return <Badge variant="default" className="bg-yellow-500">En cours</Badge>;
            case "completed":
                return <Badge variant="default" className="bg-green-500">Terminé</Badge>;
            case "cancelled":
                return <Badge variant="outline">Annulé</Badge>;
        }
    };

    if (error) {
        return (
            <Card>
                <CardContent className="p-6">
                    <div className="flex items-center gap-2 text-destructive">
                        <AlertCircle className="size-5" />
                        <p>Erreur lors du chargement des patients en attente</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Salles d&apos;Attente par Spécialité</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-2">
                    {/* Search */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                        <Input
                            placeholder="Rechercher un patient..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9"
                        />
                    </div>

                    {/* Specialty Tabs */}
                    <Tabs value={activeSpecialty} onValueChange={setActiveSpecialty}>
                        <TabsList>
                            <TabsTrigger value="all">
                                Toutes ({allPatients.length})
                            </TabsTrigger>
                            {allSpecialties.map((spec) => (
                                <TabsTrigger key={spec} value={spec}>
                                    {spec} ({patientsBySpecialty[spec].length})
                                </TabsTrigger>
                            ))}
                        </TabsList>

                        <TabsContent value={activeSpecialty} className="mt-2">
                            {isLoading ? (
                                <div className="space-y-2">
                                    {[...Array(3)].map((_, i) => (
                                        <Card key={i}>
                                            <CardContent className="p-3">
                                                <div className="flex items-start gap-2">
                                                    <Skeleton className="size-10 rounded-full" />
                                                    <div className="flex-1 space-y-2">
                                                        <Skeleton className="h-4 w-32" />
                                                        <Skeleton className="h-3 w-48" />
                                                        <Skeleton className="h-3 w-24" />
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            ) : filteredPatients.length === 0 ? (
                                <div className="text-center py-8 text-muted-foreground">
                                    <p>Aucun patient en attente</p>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {filteredPatients.map((patient) => (
                                        <Card key={patient.id} className="hover:shadow-md transition-shadow min-h-[100px] max-h-[140px]">
                                            <CardContent className="p-3">
                                                <div className="flex items-start justify-between">
                                                    <div className="flex items-start gap-2 flex-1 min-w-0">
                                                        <Avatar className="size-10 shrink-0">
                                                            <AvatarFallback className={patient.gender === "Homme" ? "bg-blue-500" : "bg-pink-500"}>
                                                                {patient.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                                                                <p className="font-semibold text-sm truncate">{patient.name}</p>
                                                                {getUrgencyBadge(patient.urgencyLevel)}
                                                                {getStatusBadge(patient.status)}
                                                                {!patient.identityVerified && (
                                                                    <Badge variant="outline" className="border-green-500 text-green-700 text-xs">
                                                                        <CheckCircle2 className="size-3 mr-1" />
                                                                        Vérifier identité
                                                                    </Badge>
                                                                )}
                                                            </div>
                                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-1.5 text-xs text-muted-foreground">
                                                                <div className="flex items-center gap-1 truncate">
                                                                    <User className="size-3 shrink-0" />
                                                                    <span className="truncate">{patient.age} ans, {patient.gender}</span>
                                                                </div>
                                                                <div className="flex items-center gap-1 truncate">
                                                                    <Clock className="size-3 shrink-0" />
                                                                    <span className="truncate">Attente: {patient.waitTime} min</span>
                                                                </div>
                                                                <div className="flex items-center gap-1 truncate">
                                                                    <Stethoscope className="size-3 shrink-0" />
                                                                    <span className="truncate">{patient.doctor}</span>
                                                                </div>
                                                                <div className="truncate">
                                                                    <span>Position: #{patient.queuePosition}</span>
                                                                </div>
                                                            </div>
                                                            <div className="mt-1">
                                                                <Badge variant="outline" className="text-xs">
                                                                    {patient.type === "new" ? "Nouveau patient" : "Suivi"}
                                                                </Badge>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            )}
                        </TabsContent>
                    </Tabs>
                </div>
            </CardContent>
        </Card>
    );
}
