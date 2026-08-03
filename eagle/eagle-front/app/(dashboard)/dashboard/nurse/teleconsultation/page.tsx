"use client";

import {
    useState,
    useMemo,
    useRef,
    useEffect,
    useCallback,
    useSyncExternalStore,
} from "react";
import { useQueryClient } from "@tanstack/react-query";
import { EnhancedNurseDashboardHeader } from "@/components/nurse/enhanced-dashboard-header";
import { FloatingHelpButton } from "@/components/nurse/floating-help-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Video,
    VideoOff,
    Mic,
    MicOff,
    Monitor,
    PhoneOff,
    Users,
    Clock,
    User,
    Stethoscope,
    HeartPulse,
    FileText,
    MessageSquare,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import {
    useNurseTeleconsultationConsultationsQuery,
    useEndRoomByConsultation,
    consultationKeys,
} from "@/hooks/queries";
import { useWebcam } from "@/hooks/use-webcam";
import { useWebRTCSocket } from "@/hooks/use-webrtc-socket";
import { useWebRTCPeer } from "@/hooks/use-webrtc-peer";
import { toast } from "sonner";
import type { Consultation } from "@/types/api";

type Teleconsultation = {
    id: string;
    patientName: string;
    patientCode: string;
    patientAge: number;
    patientGender: string;
    doctor: string;
    specialty: string;
    status: "scheduled" | "active" | "completed";
    scheduledTime: string;
    scheduledDate: string;
    duration?: number;
    connectionStatus?: "connected" | "connecting" | "disconnected";
    videoEnabled?: boolean;
    audioEnabled?: boolean;
    vitalSigns?: {
        bloodPressure: string;
        heartRate: number;
        temperature: number;
        oxygenSaturation: number;
    };
    reason?: string;
    room?: string;
};

const emptySubscribe = () => () => {};

function toDate(value: unknown): Date {
    if (!value) return new Date();
    if (value instanceof Date) return value;
    if (typeof value === "string") return new Date(value);
    const obj = value as { seconds?: number; _seconds?: number };
    const sec = obj.seconds ?? obj._seconds;
    if (typeof sec === "number") return new Date(sec * 1000);
    return new Date();
}

function mapConsultationToTeleconsultation(c: Consultation): Teleconsultation {
    const dateObj = toDate(c.scheduledAt);
    const isValid = !Number.isNaN(dateObj.getTime());
    const statusMap: Record<string, Teleconsultation["status"]> = {
        in_progress: "active",
        scheduled: "scheduled",
        completed: "completed",
    };
    return {
        id: c.id,
        patientName: c.patient ? `${c.patient.firstName} ${c.patient.lastName}` : c.patientId,
        patientCode: c.patientId,
        patientAge: 0,
        patientGender: "Inconnu",
        doctor: c.doctor ? c.doctor.name : c.doctorId,
        specialty: c.specialtyId || "Généraliste",
        status: statusMap[c.status] || "scheduled",
        scheduledTime: isValid ? dateObj.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }) : "--:--",
        scheduledDate: isValid ? dateObj.toISOString().split("T")[0] : "",
        reason: c.symptoms || undefined,
    };
}

export default function TeleconsultationPage() {
    const queryClient = useQueryClient();
    const { data: apiConsultations = [] } = useNurseTeleconsultationConsultationsQuery();
    const endRoomMutation = useEndRoomByConsultation();
    const requestedConsultationId = useSyncExternalStore(
        emptySubscribe,
        () => new URLSearchParams(window.location.search).get("consultation"),
        () => null,
    );
    const requestedBoxId = useSyncExternalStore(
        emptySubscribe,
        () => new URLSearchParams(window.location.search).get("box"),
        () => null,
    );

    const teleconsultations = useMemo(
        () =>
            apiConsultations
                .filter(
                    (consultation) =>
                        consultation.type === "video" &&
                        (!requestedBoxId || consultation.boxId === requestedBoxId),
                )
                .map(mapConsultationToTeleconsultation),
        [apiConsultations, requestedBoxId]
    );
    const [searchQuery, setSearchQuery] = useState("");
    const [activeTab, setActiveTab] = useState<"all" | "scheduled" | "active" | "monitoring">("all");
    const [videoEnabled, setVideoEnabled] = useState(true);
    const [audioEnabled, setAudioEnabled] = useState(true);
    const [selectedConsultation, setSelectedConsultation] = useState<Teleconsultation | null>(null);
    const [joinedConsultationId, setJoinedConsultationId] = useState<string | null>(null);
    const [endingConsultationId, setEndingConsultationId] = useState<string | null>(null);

    const doctorVideoRef = useRef<HTMLVideoElement>(null);

    const webrtcSocket = useWebRTCSocket({
        consultationId: joinedConsultationId,
        enabled: !!joinedConsultationId,
    });

    const { videoRef: nurseVideoRef, streamRef: nurseStreamRef, start: startWebcam, stop: stopWebcam, toggle: toggleWebcam, toggleAudio } = useWebcam({ audioEnabled });

    const webrtcPeer = useWebRTCPeer({
        getLocalStream: () => nurseStreamRef.current,
        remoteVideoRef: doctorVideoRef,
        sendOffer: webrtcSocket.sendOffer,
        sendAnswer: webrtcSocket.sendAnswer,
        sendIceCandidate: webrtcSocket.sendIceCandidate,
        onOffer: (cb) => webrtcSocket.onOffer((offer) => cb(offer)),
        onAnswer: (cb) => webrtcSocket.onAnswer((answer) => cb(answer)),
        onIceCandidate: (cb) => webrtcSocket.onIceCandidate((candidate) => cb(candidate)),
    });

    useEffect(() => {
        if (!joinedConsultationId || !webrtcSocket.isConnected || webrtcSocket.isJoined) return;
        webrtcSocket.joinRoom();
    }, [joinedConsultationId, webrtcSocket.isConnected, webrtcSocket.isJoined, webrtcSocket.joinRoom]);

    const handleJoinConsultation = useCallback(() => {
        if (!selectedConsultation) return;
        setJoinedConsultationId(selectedConsultation.id);
        startWebcam();
        toast.info("Connexion à la consultation en cours...");
    }, [selectedConsultation, startWebcam]);

    const handleLeaveConsultation = useCallback(() => {
        webrtcPeer.close();
        webrtcSocket.leaveRoom();
        stopWebcam();
        setJoinedConsultationId(null);
        toast.info("Vous avez quitté la consultation");
    }, [webrtcPeer, webrtcSocket, stopWebcam]);

    const handleTerminerConsultation = useCallback(
        (consultationId: string) => {
            setEndingConsultationId(consultationId);
            endRoomMutation.mutate(consultationId, {
                onSuccess: () => {
                    setEndingConsultationId(null);
                    if (joinedConsultationId === consultationId) {
                        handleLeaveConsultation();
                    }
                    queryClient.invalidateQueries({ queryKey: consultationKeys.nurseTeleconsultation() });
                },
                onError: (err) => {
                    setEndingConsultationId(null);
                    toast.error(err instanceof Error ? err.message : "Erreur lors de la fin de la consultation");
                },
            });
        },
        [endRoomMutation, joinedConsultationId, handleLeaveConsultation, queryClient]
    );

    const connectionStatus = joinedConsultationId
        ? webrtcPeer.isReady
            ? "connected"
            : "connecting"
        : undefined;

    useEffect(() => {
        if (webrtcSocket.error) {
            toast.error(webrtcSocket.error);
        }
    }, [webrtcSocket.error]);

    useEffect(() => {
        const requested = requestedConsultationId
            ? teleconsultations.find((item) => item.id === requestedConsultationId)
            : undefined;
        if (requested && selectedConsultation?.id !== requested.id) {
            queueMicrotask(() => setSelectedConsultation(requested));
            return;
        }
        if (!selectedConsultation) {
            const active = teleconsultations.find((item) => item.status === "active");
            if (active) queueMicrotask(() => setSelectedConsultation(active));
        }
    }, [requestedConsultationId, teleconsultations, selectedConsultation]);

    const filteredConsultations = teleconsultations.filter(tel => {
        const matchesSearch = tel.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            tel.patientCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            tel.doctor.toLowerCase().includes(searchQuery.toLowerCase());
        
        if (activeTab === "scheduled") return matchesSearch && tel.status === "scheduled";
        if (activeTab === "active") return matchesSearch && tel.status === "active";
        if (activeTab === "monitoring") return matchesSearch && tel.status === "active";
        return matchesSearch;
    });

    const activeConsultations = teleconsultations.filter(t => t.status === "active");
    const scheduledConsultations = teleconsultations.filter(t => t.status === "scheduled");

    const getConnectionStatusBadge = (status?: string) => {
        switch (status) {
            case "connected":
                return <Badge variant="default" className="bg-green-500">Connecté</Badge>;
            case "connecting":
                return <Badge variant="secondary" className="bg-yellow-500">Connexion...</Badge>;
            case "disconnected":
                return <Badge variant="destructive">Déconnecté</Badge>;
            default:
                return null;
        }
    };

    return (
        <div className="flex flex-col h-full">
            <EnhancedNurseDashboardHeader />

            <div className="flex-1 p-6 space-y-6 overflow-hidden flex flex-col">
                {/* Header */}
                <div>
                    <h1 className="text-2xl font-bold text-primary flex items-center gap-2">
                        <Video className="size-6" />
                        Téléconsultation
                    </h1>
                    <p className="text-muted-foreground">
                        Gestion et monitoring des téléconsultations
                    </p>
                </div>

                {/* Search */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                    <Input
                        placeholder="Rechercher une téléconsultation..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9"
                    />
                </div>

                {/* Tabs */}
                <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
                    <TabsList>
                        <TabsTrigger value="all">
                            Toutes
                            <Badge variant="secondary" className="ml-2">
                                {teleconsultations.length}
                            </Badge>
                        </TabsTrigger>
                        <TabsTrigger value="active">
                            Actives
                            <Badge variant="destructive" className="ml-2">
                                {activeConsultations.length}
                            </Badge>
                        </TabsTrigger>
                        <TabsTrigger value="scheduled">
                            Planifiées
                            <Badge variant="secondary" className="ml-2">
                                {scheduledConsultations.length}
                            </Badge>
                        </TabsTrigger>
                        <TabsTrigger value="monitoring">
                            Monitoring
                            <Monitor className="size-4 ml-2" />
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value={activeTab} className="flex-1 overflow-hidden mt-6">
                        {activeTab === "monitoring" && selectedConsultation ? (
                            /* Monitoring View - Full Screen */
                            <div className="grid lg:grid-cols-3 gap-6 h-full">
                                {/* Video/Consultation Area - Main */}
                                <div className="lg:col-span-2 space-y-4">
                                    {/* Video Display */}
                                    <Card>
                                        <CardContent className="p-6">
                                            <div className="aspect-video bg-black rounded-lg flex items-center justify-center mb-4 relative overflow-hidden">
                                                {!joinedConsultationId ? (
                                                    <div className="text-center text-white">
                                                        <Video className="size-16 mx-auto mb-4 opacity-50" />
                                                        <p className="text-sm opacity-75 mb-4">Rejoignez la consultation pour voir la vidéo</p>
                                                        <Button size="lg" onClick={handleJoinConsultation} className="gap-2">
                                                            <Video className="size-5" />
                                                            Rejoindre la consultation
                                                        </Button>
                                                    </div>
                                                ) : (
                                                    <>
                                                        <video
                                                            ref={doctorVideoRef}
                                                            className="w-full h-full object-cover hidden"
                                                            autoPlay
                                                            playsInline
                                                            muted
                                                        />
                                                        <div className="absolute bottom-4 right-4 w-40 h-[90px] bg-gray-800 rounded-lg overflow-hidden border-2 border-primary z-10">
                                                            <video
                                                                ref={nurseVideoRef}
                                                                className="w-full h-full object-cover"
                                                                autoPlay
                                                                playsInline
                                                                muted
                                                                style={{ transform: "scaleX(-1)" }}
                                                            />
                                                        </div>
                                                        {!webrtcPeer.isReady && (
                                                            <div className="absolute inset-0 flex items-center justify-center bg-black/70 z-0">
                                                                <div className="text-center text-white">
                                                                    <div className="size-8 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                                                                    <p className="text-sm">Connexion au médecin...</p>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </>
                                                )}
                                                <div className="absolute top-4 right-4">
                                                    {getConnectionStatusBadge(connectionStatus)}
                                                </div>
                                            </div>

                                            {/* Controls - only when joined */}
                                            {joinedConsultationId && (
                                                <div className="flex items-center justify-center gap-4">
                                                    <Button
                                                        variant={videoEnabled ? "default" : "destructive"}
                                                        size="lg"
                                                        onClick={() => { setVideoEnabled(!videoEnabled); toggleWebcam(); }}
                                                    >
                                                        {videoEnabled ? <Video className="size-5" /> : <VideoOff className="size-5" />}
                                                    </Button>
                                                    <Button
                                                        variant={audioEnabled ? "default" : "destructive"}
                                                        size="lg"
                                                        onClick={() => { setAudioEnabled(!audioEnabled); toggleAudio(!audioEnabled); }}
                                                    >
                                                        {audioEnabled ? <Mic className="size-5" /> : <MicOff className="size-5" />}
                                                    </Button>
                                                    <Button variant="outline" size="lg" onClick={handleLeaveConsultation}>
                                                        <PhoneOff className="size-5 mr-2" />
                                                        Quitter
                                                    </Button>
                                                    <Button
                                                        variant="destructive"
                                                        size="lg"
                                                        onClick={() =>
                                                            selectedConsultation &&
                                                            handleTerminerConsultation(selectedConsultation.id)
                                                        }
                                                        disabled={!!endingConsultationId}
                                                    >
                                                        <PhoneOff className="size-5 mr-2" />
                                                        {endingConsultationId ? "..." : "Terminer"}
                                                    </Button>
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>

                                    {/* Consultation Info */}
                                    <Card>
                                        <CardHeader>
                                            <CardTitle>Informations de la téléconsultation</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <Tabs defaultValue="info" className="w-full">
                                                <TabsList>
                                                    <TabsTrigger value="info">Informations</TabsTrigger>
                                                    {selectedConsultation.vitalSigns && (
                                                        <TabsTrigger value="vitals">Signes vitaux</TabsTrigger>
                                                    )}
                                                    <TabsTrigger value="notes">Notes</TabsTrigger>
                                                </TabsList>
                                                <TabsContent value="info" className="space-y-4 mt-4">
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <div>
                                                            <p className="text-sm text-muted-foreground">Patient</p>
                                                            <p className="font-semibold">{selectedConsultation.patientName}</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-sm text-muted-foreground">Code</p>
                                                            <p className="font-semibold">{selectedConsultation.patientCode}</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-sm text-muted-foreground">Médecin</p>
                                                            <p className="font-semibold">{selectedConsultation.doctor}</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-sm text-muted-foreground">Spécialité</p>
                                                            <p className="font-semibold">{selectedConsultation.specialty}</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-sm text-muted-foreground">Heure</p>
                                                            <p className="font-semibold">{selectedConsultation.scheduledTime}</p>
                                                        </div>
                                                        {selectedConsultation.duration && (
                                                            <div>
                                                                <p className="text-sm text-muted-foreground">Durée</p>
                                                                <p className="font-semibold">{selectedConsultation.duration} min</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                    {selectedConsultation.reason && (
                                                        <div>
                                                            <p className="text-sm text-muted-foreground">Motif</p>
                                                            <p className="font-semibold">{selectedConsultation.reason}</p>
                                                        </div>
                                                    )}
                                                </TabsContent>
                                                {selectedConsultation.vitalSigns && (
                                                    <TabsContent value="vitals" className="space-y-4 mt-4">
                                                        <div className="grid grid-cols-2 gap-4">
                                                            <div className="flex items-center gap-3 p-4 border rounded-lg">
                                                                <HeartPulse className="size-8 text-red-500" />
                                                                <div>
                                                                    <p className="text-sm text-muted-foreground">Tension</p>
                                                                    <p className="text-lg font-semibold">
                                                                        {selectedConsultation.vitalSigns.bloodPressure} mmHg
                                                                    </p>
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center gap-3 p-4 border rounded-lg">
                                                                <HeartPulse className="size-8 text-red-500" />
                                                                <div>
                                                                    <p className="text-sm text-muted-foreground">Pouls</p>
                                                                    <p className="text-lg font-semibold">
                                                                        {selectedConsultation.vitalSigns.heartRate} bpm
                                                                    </p>
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center gap-3 p-4 border rounded-lg">
                                                                <HeartPulse className="size-8 text-orange-500" />
                                                                <div>
                                                                    <p className="text-sm text-muted-foreground">Température</p>
                                                                    <p className="text-lg font-semibold">
                                                                        {selectedConsultation.vitalSigns.temperature}°C
                                                                    </p>
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center gap-3 p-4 border rounded-lg">
                                                                <HeartPulse className="size-8 text-green-500" />
                                                                <div>
                                                                    <p className="text-sm text-muted-foreground">SpO2</p>
                                                                    <p className="text-lg font-semibold">
                                                                        {selectedConsultation.vitalSigns.oxygenSaturation}%
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </TabsContent>
                                                )}
                                                <TabsContent value="notes" className="mt-4">
                                                    <div className="border rounded-lg p-4 min-h-[200px]">
                                                        <p className="text-sm text-muted-foreground">
                                                            Les notes de téléconsultation seront affichées ici...
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
                                                        {selectedConsultation.patientName.split(" ").map(n => n[0]).join("").slice(0, 2)}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <p className="font-semibold text-lg">{selectedConsultation.patientName}</p>
                                                    <p className="text-sm text-muted-foreground">{selectedConsultation.patientCode}</p>
                                                    <p className="text-sm text-muted-foreground">
                                                        {selectedConsultation.patientAge} ans, {selectedConsultation.patientGender}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="pt-4 border-t space-y-2">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-sm text-muted-foreground">Médecin</span>
                                                    <span className="font-medium">{selectedConsultation.doctor}</span>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <span className="text-sm text-muted-foreground">Spécialité</span>
                                                    <span className="font-medium">{selectedConsultation.specialty}</span>
                                                </div>
                                                {selectedConsultation.room && (
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-sm text-muted-foreground">Salle</span>
                                                        <Badge>{selectedConsultation.room}</Badge>
                                                    </div>
                                                )}
                                                <div className="flex items-center justify-between">
                                                    <span className="text-sm text-muted-foreground">Heure prévue</span>
                                                    <div className="flex items-center gap-1">
                                                        <Clock className="size-4 text-muted-foreground" />
                                                        <span className="font-medium">{selectedConsultation.scheduledTime}</span>
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
                                            <CardTitle>Statut de la téléconsultation</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="flex items-center gap-2">
                                                <div className="size-3 rounded-full bg-green-500 animate-pulse" />
                                                <span className="font-medium">En cours</span>
                                            </div>
                                            {selectedConsultation.duration && (
                                                <p className="text-sm text-muted-foreground mt-2">
                                                    Téléconsultation active depuis {selectedConsultation.duration} minutes
                                                </p>
                                            )}
                                        </CardContent>
                                    </Card>
                                </div>
                            </div>
                        ) : (
                            /* List View */
                            <div className="grid lg:grid-cols-2 gap-6">
                                {filteredConsultations.map((tel) => (
                                    <Card
                                        key={tel.id}
                                        className={`cursor-pointer hover:shadow-lg transition-all ${
                                            tel.status === "active" ? "border-l-4 border-l-green-500" : ""
                                        }`}
                                        onClick={() => {
                                            if (tel.status === "active") {
                                                setSelectedConsultation(tel);
                                                setActiveTab("monitoring");
                                            }
                                        }}
                                    >
                                        <CardHeader>
                                            <CardTitle className="flex items-center justify-between">
                                                <span>{tel.patientName}</span>
                                                <div className="flex gap-2">
                                                    {getConnectionStatusBadge(tel.connectionStatus)}
                                                    <Badge variant={tel.status === "active" ? "default" : "secondary"}>
                                                        {tel.status === "active" ? "Active" : "Planifiée"}
                                                    </Badge>
                                                </div>
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <div className="aspect-video bg-black rounded-lg flex items-center justify-center">
                                                <Video className="size-16 text-white opacity-50" />
                                            </div>

                                            <div className="space-y-2">
                                                <div className="flex items-center gap-2">
                                                    <Users className="size-4 text-muted-foreground" />
                                                    <span>{tel.doctor}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Stethoscope className="size-4 text-muted-foreground" />
                                                    <span className="text-sm text-muted-foreground">{tel.specialty}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Clock className="size-4 text-muted-foreground" />
                                                    <span>{tel.scheduledTime}</span>
                                                    {tel.duration && (
                                                        <span className="text-muted-foreground">({tel.duration} min)</span>
                                                    )}
                                                </div>
                                            </div>

                                            {tel.status === "active" && (
                                                <div className="flex gap-2">
                                                    <Button
                                                        variant={videoEnabled ? "default" : "destructive"}
                                                        size="sm"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setVideoEnabled(!videoEnabled);
                                                        }}
                                                    >
                                                        {videoEnabled ? <Video className="size-4" /> : <VideoOff className="size-4" />}
                                                    </Button>
                                                    <Button
                                                        variant={audioEnabled ? "default" : "destructive"}
                                                        size="sm"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setAudioEnabled(!audioEnabled);
                                                        }}
                                                    >
                                                        {audioEnabled ? <Mic className="size-4" /> : <MicOff className="size-4" />}
                                                    </Button>
                                                    <Button
                                                        variant="destructive"
                                                        size="sm"
                                                        className="flex-1"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleTerminerConsultation(tel.id);
                                                        }}
                                                        disabled={endingConsultationId === tel.id}
                                                    >
                                                        <PhoneOff className="size-4 mr-2" />
                                                        {endingConsultationId === tel.id ? "..." : "Terminer"}
                                                    </Button>
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </TabsContent>
                </Tabs>
            </div>

            <FloatingHelpButton />
        </div>
    );
}
