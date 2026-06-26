"use client";

import { useState } from "react";
import { EnhancedNurseDashboardHeader } from "@/components/nurse/enhanced-dashboard-header";
import { FloatingHelpButton } from "@/components/nurse/floating-help-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
    Video,
    VideoOff,
    Mic,
    MicOff,
    User,
    Clock,
    HeartPulse,
    FileText,
    PhoneOff,
    MessageSquare,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type Consultation = {
    id: string;
    patientName: string;
    patientCode: string;
    patientAge: number;
    patientGender: string;
    doctor: string;
    specialty: string;
    scheduledTime: string;
    status: "waiting" | "active" | "completed";
    vitalSigns: {
        bloodPressure: string;
        heartRate: number;
        temperature: number;
        oxygenSaturation: number;
    };
    reason: string;
    room: string;
};

const currentConsultation: Consultation = {
    id: "consult-1",
    patientName: "Kamga Jean",
    patientCode: "PAT-2024-001",
    patientAge: 45,
    patientGender: "Homme",
    doctor: "Dr. Nana Pierre",
    specialty: "Généraliste",
    scheduledTime: "09:00",
    status: "active",
    vitalSigns: {
        bloodPressure: "145/90",
        heartRate: 98,
        temperature: 39.2,
        oxygenSaturation: 98,
    },
    reason: "Fièvre persistante depuis 3 jours",
    room: "Salle 2",
};

export default function ConsultationRoomPage() {
    const [videoEnabled, setVideoEnabled] = useState(true);
    const [audioEnabled, setAudioEnabled] = useState(true);
    const [consultationActive] = useState(true);

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
                <div>
                    <h1 className="text-2xl font-bold text-primary">Salle de Consultation</h1>
                    <p className="text-muted-foreground">
                        Assister les consultations en cours
                    </p>
                </div>

                {consultationActive ? (
                    <div className="grid lg:grid-cols-3 gap-6">
                        {/* Video/Consultation Area - Main */}
                        <div className="lg:col-span-2 space-y-4">
                            {/* Video Display */}
                            <Card>
                                <CardContent className="p-6">
                                    <div className="aspect-video bg-black rounded-lg flex items-center justify-center mb-4">
                                        <div className="text-center text-white">
                                            <Video className="size-16 mx-auto mb-4 opacity-50" />
                                            <p className="text-sm opacity-75">Vidéo de consultation</p>
                                        </div>
                                    </div>

                                    {/* Controls */}
                                    <div className="flex items-center justify-center gap-4">
                                        <Button
                                            variant={videoEnabled ? "default" : "destructive"}
                                            size="lg"
                                            onClick={() => setVideoEnabled(!videoEnabled)}
                                        >
                                            {videoEnabled ? (
                                                <Video className="size-5" />
                                            ) : (
                                                <VideoOff className="size-5" />
                                            )}
                                        </Button>
                                        <Button
                                            variant={audioEnabled ? "default" : "destructive"}
                                            size="lg"
                                            onClick={() => setAudioEnabled(!audioEnabled)}
                                        >
                                            {audioEnabled ? (
                                                <Mic className="size-5" />
                                            ) : (
                                                <MicOff className="size-5" />
                                            )}
                                        </Button>
                                        <Button variant="destructive" size="lg">
                                            <PhoneOff className="size-5 mr-2" />
                                            Quitter
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Consultation Notes */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Notes de consultation</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <Tabs defaultValue="info" className="w-full">
                                        <TabsList>
                                            <TabsTrigger value="info">Informations</TabsTrigger>
                                            <TabsTrigger value="vitals">Signes vitaux</TabsTrigger>
                                            <TabsTrigger value="notes">Notes</TabsTrigger>
                                        </TabsList>
                                        <TabsContent value="info" className="space-y-4 mt-4">
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <p className="text-sm text-muted-foreground">Patient</p>
                                                    <p className="font-semibold">{currentConsultation.patientName}</p>
                                                </div>
                                                <div>
                                                    <p className="text-sm text-muted-foreground">Code</p>
                                                    <p className="font-semibold">{currentConsultation.patientCode}</p>
                                                </div>
                                                <div>
                                                    <p className="text-sm text-muted-foreground">Âge / Genre</p>
                                                    <p className="font-semibold">
                                                        {currentConsultation.patientAge} ans, {currentConsultation.patientGender}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-sm text-muted-foreground">Médecin</p>
                                                    <p className="font-semibold">{currentConsultation.doctor}</p>
                                                </div>
                                            </div>
                                            <div>
                                                <p className="text-sm text-muted-foreground">Motif de consultation</p>
                                                <p className="font-semibold">{currentConsultation.reason}</p>
                                            </div>
                                        </TabsContent>
                                        <TabsContent value="vitals" className="space-y-4 mt-4">
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="flex items-center gap-3 p-4 border rounded-lg">
                                                    <HeartPulse className="size-8 text-red-500" />
                                                    <div>
                                                        <p className="text-sm text-muted-foreground">Tension</p>
                                                        <p className="text-lg font-semibold">
                                                            {currentConsultation.vitalSigns.bloodPressure} mmHg
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3 p-4 border rounded-lg">
                                                    <HeartPulse className="size-8 text-red-500" />
                                                    <div>
                                                        <p className="text-sm text-muted-foreground">Pouls</p>
                                                        <p className="text-lg font-semibold">
                                                            {currentConsultation.vitalSigns.heartRate} bpm
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3 p-4 border rounded-lg">
                                                    <HeartPulse className="size-8 text-orange-500" />
                                                    <div>
                                                        <p className="text-sm text-muted-foreground">Température</p>
                                                        <p className="text-lg font-semibold">
                                                            {currentConsultation.vitalSigns.temperature}°C
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3 p-4 border rounded-lg">
                                                    <HeartPulse className="size-8 text-green-500" />
                                                    <div>
                                                        <p className="text-sm text-muted-foreground">SpO2</p>
                                                        <p className="text-lg font-semibold">
                                                            {currentConsultation.vitalSigns.oxygenSaturation}%
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </TabsContent>
                                        <TabsContent value="notes" className="mt-4">
                                            <div className="border rounded-lg p-4 min-h-[200px]">
                                                <p className="text-sm text-muted-foreground">
                                                    Les notes de consultation seront affichées ici...
                                                </p>
                                            </div>
                                        </TabsContent>
                                    </Tabs>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-4">
                            {/* Patient Info Card */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <User className="size-5" />
                                        Patient
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex items-center gap-4">
                                        <Avatar className="size-16">
                                            <AvatarFallback className="bg-primary text-primary-foreground text-lg">
                                                {currentConsultation.patientName.split(" ").map(n => n[0]).join("").slice(0, 2)}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <p className="font-semibold text-lg">{currentConsultation.patientName}</p>
                                            <p className="text-sm text-muted-foreground">{currentConsultation.patientCode}</p>
                                            <p className="text-sm text-muted-foreground">
                                                {currentConsultation.patientAge} ans, {currentConsultation.patientGender}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="pt-4 border-t space-y-2">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-muted-foreground">Médecin</span>
                                            <span className="font-medium">{currentConsultation.doctor}</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-muted-foreground">Spécialité</span>
                                            <span className="font-medium">{currentConsultation.specialty}</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-muted-foreground">Salle</span>
                                            <Badge>{currentConsultation.room}</Badge>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-muted-foreground">Heure prévue</span>
                                            <div className="flex items-center gap-1">
                                                <Clock className="size-4 text-muted-foreground" />
                                                <span className="font-medium">{currentConsultation.scheduledTime}</span>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Quick Actions */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Actions rapides</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-2">
                                    <Button variant="outline" className="w-full justify-start">
                                        <HeartPulse className="size-4 mr-2" />
                                        Relever les signes vitaux
                                    </Button>
                                    <Button variant="outline" className="w-full justify-start">
                                        <FileText className="size-4 mr-2" />
                                        Préparer les documents
                                    </Button>
                                    <Button variant="outline" className="w-full justify-start">
                                        <MessageSquare className="size-4 mr-2" />
                                        Envoyer un message
                                    </Button>
                                </CardContent>
                            </Card>

                            {/* Status */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Statut de la consultation</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex items-center gap-2">
                                        <div className="size-3 rounded-full bg-green-500 animate-pulse" />
                                        <span className="font-medium">En cours</span>
                                    </div>
                                    <p className="text-sm text-muted-foreground mt-2">
                                        Consultation active depuis 15 minutes
                                    </p>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                ) : (
                    <Card>
                        <CardContent className="py-12 text-center">
                            <Video className="size-16 mx-auto text-muted-foreground mb-4" />
                            <p className="text-lg font-medium text-muted-foreground mb-2">
                                Aucune consultation active
                            </p>
                            <p className="text-sm text-muted-foreground">
                                Attendez qu&apos;une consultation démarre pour l&apos;assister
                            </p>
                        </CardContent>
                    </Card>
                )}
            </div>

            <FloatingHelpButton />
        </div>
    );
}













