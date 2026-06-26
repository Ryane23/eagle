"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { DashboardHeader } from "@/components/layout/dashboard-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Video, Clock, RefreshCw } from "lucide-react";
import { useWebcam } from "@/hooks/use-webcam";
import { useWebRTCSocket } from "@/hooks/use-webrtc-socket";
import { useWebRTCPeer } from "@/hooks/use-webrtc-peer";
import {
    useConsultationQuery,
    usePatientQuery,
    useStartConsultation,
    useAddConsultationNote,
    useCompleteConsultation,
    useCreateRoom,
    useEndRoomByConsultation,
} from "@/hooks/queries";
import { toast } from "sonner";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
    VideoControls,
    VideoArea,
    ConsultationWorkspace,
    PatientInfoSidebar,
} from "./_components";
import type {
    ConsultationPatient,
    ConsultationTab,
    ConsultationNotes,
} from "@/types/consultation";
import { DEFAULT_CONSULTATION_PATIENT } from "@/types/consultation";
import type { CompleteConsultationDto } from "@/types/api";

// Helper to get initial patient from sessionStorage
function getInitialPatient(): ConsultationPatient {
    if (typeof window === "undefined") return DEFAULT_CONSULTATION_PATIENT;

    const stored = sessionStorage.getItem("consultationPatient");
    if (!stored) return DEFAULT_CONSULTATION_PATIENT;

    try {
        const patientData = JSON.parse(stored);
        return {
            ...DEFAULT_CONSULTATION_PATIENT,
            ...patientData,
            vitalSigns: {
                ...DEFAULT_CONSULTATION_PATIENT.vitalSigns,
                ...patientData.vitalSigns,
            },
        };
    } catch {
        return DEFAULT_CONSULTATION_PATIENT;
    }
}

// Get consultation ID from session storage
function getConsultationId(): string | null {
    if (typeof window === "undefined") return null;
    const stored = sessionStorage.getItem("consultationPatient");
    if (!stored) return null;
    try {
        const data = JSON.parse(stored);
        return data.id || null;
    } catch {
        return null;
    }
}

export default function ConsultationRoomPage() {
    const router = useRouter();
    const videoContainerRef = useRef<HTMLDivElement>(null);
    const [initialPatient] = useState<ConsultationPatient>(getInitialPatient);
    const [consultationId, setConsultationId] = useState<string | null>(null);
    const [elapsedTime, setElapsedTime] = useState(0);

    // Consultation state
    const [consultationStarted, setConsultationStarted] = useState(false);
    const [screenSharing, setScreenSharing] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [audioEnabled, setAudioEnabled] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    // Consultation workspace state
    const [activeTab, setActiveTab] = useState<ConsultationTab>("notes");
    const [endWithoutDiagnosisOpen, setEndWithoutDiagnosisOpen] = useState(false);
    const [consultationNotes, setConsultationNotes] = useState<ConsultationNotes>({
        notes: "",
        diagnosis: "",
        prescription: "",
        labTests: "",
        followUpNotes: "",
        followUpDate: undefined,
    });

    // Server state: consultation and patient via TanStack Query
    const consultationQuery = useConsultationQuery(consultationId ?? "");
    const currentConsultation = consultationQuery.data;
    const patientId = currentConsultation?.patientId;
    const patientQuery = usePatientQuery(patientId ?? "");
    const currentPatientData = patientQuery.data;

    const startConsultationMutation = useStartConsultation();
    const addNoteMutation = useAddConsultationNote();
    const completeConsultationMutation = useCompleteConsultation();

    // Webcam hook
    const {
        videoRef: doctorVideoRef,
        streamRef: doctorStreamRef,
        isEnabled: videoEnabled,
        isLoading: isLoadingCamera,
        isReady: hasStream,
        error: cameraError,
        start: startWebcam,
        stop: stopWebcam,
        toggle: toggleWebcam,
        clearError: clearCameraError,
        toggleAudio,
    } = useWebcam({ audioEnabled });

    // WebRTC room management
    const createRoomMutation = useCreateRoom();
    const endRoomMutation = useEndRoomByConsultation();

    // Patient video ref (WebRTC remote stream)
    const patientVideoRef = useRef<HTMLVideoElement>(null);

    // WebRTC socket + peer (enabled when consultation started)
    const webrtcSocket = useWebRTCSocket({
        consultationId,
        enabled: consultationStarted && !!consultationId,
    });

    const webrtcPeer = useWebRTCPeer({
        getLocalStream: () => doctorStreamRef.current,
        remoteVideoRef: patientVideoRef,
        sendOffer: webrtcSocket.sendOffer,
        sendAnswer: webrtcSocket.sendAnswer,
        sendIceCandidate: webrtcSocket.sendIceCandidate,
        onOffer: (cb) => webrtcSocket.onOffer((offer) => cb(offer)),
        onAnswer: (cb) => webrtcSocket.onAnswer((answer) => cb(answer)),
        onIceCandidate: (cb) => webrtcSocket.onIceCandidate((candidate) => cb(candidate)),
    });

    // Initialize consultation ID from session once (client-only)
    useEffect(() => {
        const id = getConsultationId();
        if (id) {
            queueMicrotask(() => setConsultationId(id));
        }
    }, []);

    // Redirect to waiting room if no session (direct navigation or expired)
    useEffect(() => {
        if (typeof window === "undefined") return;
        const id = getConsultationId();
        if (!id) {
            toast.error("Aucune consultation en cours. Retour à la salle d'attente.");
            router.replace("/dashboard/doctor/waiting-room");
        }
    }, [router]);

    // Join WebRTC room when socket connected and consultation started
    useEffect(() => {
        if (!consultationStarted || !consultationId || !webrtcSocket.isConnected || webrtcSocket.isJoined) return;
        webrtcSocket.joinRoom();
    }, [consultationStarted, consultationId, webrtcSocket.isConnected, webrtcSocket.isJoined, webrtcSocket.joinRoom]);

    // Doctor creates offer when patient/nurse joins
    useEffect(() => {
        if (!webrtcSocket.isJoined) return;
        const unsub = webrtcSocket.onUserJoined(() => {
            webrtcPeer.createOffer();
        });
        return unsub;
    }, [webrtcSocket.isJoined, webrtcSocket.onUserJoined, webrtcPeer.createOffer]);

    // Derive display patient from initial (session) + API data when available
    const displayPatient: ConsultationPatient = useMemo(() => {
        if (!currentPatientData) return initialPatient;
        const birthDate = new Date(currentPatientData.dateOfBirth);
        const today = new Date();
        const age = Math.floor((today.getTime() - birthDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
        const patientVitals = currentPatientData.vitalSigns;
        return {
            ...initialPatient,
            name: `${currentPatientData.firstName} ${currentPatientData.lastName}`,
            age,
            gender: currentPatientData.gender === "MALE" ? "M" : "F",
            allergies: currentPatientData.allergies || [],
            currentMedications: currentPatientData.currentMedications || [],
            medicalHistory: currentPatientData.medicalHistory || [],
            vitalSigns: patientVitals
                ? {
                      bloodPressure: patientVitals.bloodPressure || "-",
                      heartRate: patientVitals.heartRate || 0,
                      temperature: patientVitals.temperature || 0,
                      oxygenSaturation: patientVitals.oxygenSaturation || 0,
                      weight: patientVitals.weight || 0,
                      height: patientVitals.height || 0,
                  }
                : initialPatient.vitalSigns,
        };
    }, [currentPatientData, initialPatient]);

    // Sync notes from server when consultation loads (once, async to avoid sync setState in effect)
    useEffect(() => {
        if (!currentConsultation) return;
        queueMicrotask(() => {
            setConsultationNotes((prev) => ({
                ...prev,
                notes: currentConsultation.notes || "",
                diagnosis: currentConsultation.diagnosis || "",
            }));
        });
    }, [currentConsultation]);

    // Timer for consultation duration
    useEffect(() => {
        let timer: NodeJS.Timeout;
        if (consultationStarted) {
            timer = setInterval(() => {
                setElapsedTime((prev) => prev + 1);
            }, 1000);
        }
        return () => clearInterval(timer);
    }, [consultationStarted]);

    // Handle fullscreen changes
    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };

        document.addEventListener('fullscreenchange', handleFullscreenChange);
        return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
    }, []);

    // Format elapsed time
    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    // Handlers
    const handleStartConsultation = useCallback(() => {
        if (consultationId) {
            startConsultationMutation.mutate(consultationId, {
                onSuccess: () => {
                    createRoomMutation.mutate(consultationId);
                    setConsultationStarted(true);
                    setAudioEnabled(true);
                    startWebcam();
                },
            });
        }
    }, [consultationId, startConsultationMutation, createRoomMutation, startWebcam]);

    const handleToggleAudio = useCallback(() => {
        const newAudioState = !audioEnabled;
        setAudioEnabled(newAudioState);
        toggleAudio(newAudioState);
    }, [audioEnabled, toggleAudio]);

    const handleToggleVideo = useCallback(async () => {
        await toggleWebcam();
    }, [toggleWebcam]);

    const handleToggleScreenShare = useCallback(() => {
        setScreenSharing((prev) => !prev);
    }, []);

    const handleToggleFullscreen = useCallback(async () => {
        if (!videoContainerRef.current) return;

        try {
            if (!document.fullscreenElement) {
                await videoContainerRef.current.requestFullscreen();
            } else {
                await document.exitFullscreen();
            }
        } catch (error) {
            console.error("Error toggling fullscreen:", error);
        }
    }, []);

    const performEndConsultation = useCallback((diagnosisOverride?: string) => {
        if (!consultationId) return;

        const data: CompleteConsultationDto = {
            diagnosis: (diagnosisOverride ?? consultationNotes.diagnosis) || undefined,
            notes: [
                consultationNotes.notes,
                consultationNotes.prescription && `Prescription: ${consultationNotes.prescription}`,
                consultationNotes.followUpDate && `Suivi: ${consultationNotes.followUpDate}`,
            ].filter(Boolean).join("\n") || undefined,
        };

        completeConsultationMutation.mutate(
            { id: consultationId, data },
            {
                onSuccess: () => {
                    setEndWithoutDiagnosisOpen(false);
                    webrtcPeer.close();
                    webrtcSocket.leaveRoom();
                    endRoomMutation.mutate(consultationId);
                    toast.success("Consultation terminée et enregistrée");
                    stopWebcam();
                    setConsultationStarted(false);
                    setAudioEnabled(false);
                    sessionStorage.removeItem("consultationPatient");
                    router.push("/dashboard/doctor/waiting-room");
                },
                onError: (err) => {
                    toast.error(err instanceof Error ? err.message : "Erreur lors de la fin de consultation");
                },
            }
        );
    }, [consultationId, consultationNotes, completeConsultationMutation, endRoomMutation, router, stopWebcam, webrtcPeer, webrtcSocket]);

    const handleEndConsultation = useCallback(() => {
        if (!consultationId) {
            toast.error("Aucune consultation en cours");
            return;
        }
        if (!consultationNotes.diagnosis?.trim()) {
            setEndWithoutDiagnosisOpen(true);
            return;
        }
        performEndConsultation();
    }, [consultationId, consultationNotes.diagnosis, performEndConsultation]);

    const handleNotesChange = useCallback(<K extends keyof ConsultationNotes>(
        field: K,
        value: ConsultationNotes[K]
    ) => {
        setConsultationNotes((prev) => ({ ...prev, [field]: value }));
    }, []);

    const handleSave = useCallback(() => {
        if (!consultationId) {
            toast.error("Aucune consultation en cours");
            return;
        }
        if (!consultationNotes.notes) return;

        setIsSaving(true);
        addNoteMutation.mutate(
            { id: consultationId, data: { note: consultationNotes.notes } },
            {
                onSettled: () => setIsSaving(false),
            }
        );
    }, [consultationId, consultationNotes.notes, addNoteMutation]);

    const handleSaveDraft = useCallback(async () => {
        // Save to local storage as draft
        const draft = {
            consultationId,
            notes: consultationNotes,
            timestamp: new Date().toISOString(),
        };
        localStorage.setItem(`consultation-draft-${consultationId}`, JSON.stringify(draft));
        toast.success("Brouillon sauvegardé localement");
    }, [consultationId, consultationNotes]);

    const handleRetryCamera = useCallback(() => {
        startWebcam();
    }, [startWebcam]);

    return (
        <div className="flex flex-col h-full">
            <DashboardHeader
                breadcrumbs={[
                    { label: "Tableau de bord", href: "/dashboard/doctor" },
                    { label: "Salle de consultation" },
                ]}
                actions={
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleSave}
                        disabled={isSaving || !consultationStarted}
                        className="h-8"
                    >
                        {isSaving ? (
                            <RefreshCw className="size-4 mr-2 animate-spin" />
                        ) : null}
                        Sauvegarder
                    </Button>
                }
            />

            <div className="flex-1 p-4 space-y-2 overflow-y-auto">
                {/* Page Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-primary flex items-center gap-2">
                            <Video className="size-7 text-blue-600" />
                            Salle de Consultation
                        </h1>
                        <p className="text-muted-foreground">
                            Consultation en cours - {displayPatient.name}
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Clock className="size-4 text-muted-foreground" />
                        <span className="text-sm font-medium">
                            Durée: {formatTime(elapsedTime)}
                        </span>
                    </div>
                </div>

                {/* Main Consultation Layout */}
                <div className="grid lg:grid-cols-3 gap-2">
                    {/* Left Column - Video */}
                    <div className="lg:col-span-2 space-y-2">
                        {/* Video Area */}
                        <Card className="border-2 border-blue-300">
                            <CardContent className="p-0">
                                <VideoArea
                                    ref={videoContainerRef}
                                    patientName={displayPatient.name}
                                    urgencyLevel={displayPatient.urgencyLevel}
                                    consultationStarted={consultationStarted}
                                    videoEnabled={videoEnabled}
                                    isLoadingCamera={isLoadingCamera}
                                    cameraError={cameraError}
                                    isFullscreen={isFullscreen}
                                    doctorVideoRef={doctorVideoRef}
                                    patientVideoRef={patientVideoRef}
                                    hasStream={hasStream}
                                    onStartConsultation={handleStartConsultation}
                                    onClearError={clearCameraError}
                                    onRetryCamera={handleRetryCamera}
                                />

                                {/* Video Controls */}
                                {consultationStarted && (
                                    <VideoControls
                                        audioEnabled={audioEnabled}
                                        videoEnabled={videoEnabled}
                                        screenSharing={screenSharing}
                                        isFullscreen={isFullscreen}
                                        onToggleAudio={handleToggleAudio}
                                        onToggleVideo={handleToggleVideo}
                                        onToggleScreenShare={handleToggleScreenShare}
                                        onToggleFullscreen={handleToggleFullscreen}
                                        onEndConsultation={handleEndConsultation}
                                    />
                                )}
                            </CardContent>
                        </Card>

                        {/* Consultation Workspace */}
                        <ConsultationWorkspace
                            activeTab={activeTab}
                            notes={consultationNotes}
                            onTabChange={setActiveTab}
                            onNotesChange={handleNotesChange}
                            onSave={handleSave}
                            onSaveDraft={handleSaveDraft}
                        />
                    </div>

                    {/* Right Column - Patient Info */}
                    <PatientInfoSidebar patient={displayPatient} />
                </div>
            </div>

            <AlertDialog open={endWithoutDiagnosisOpen} onOpenChange={setEndWithoutDiagnosisOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Aucun diagnostic saisi</AlertDialogTitle>
                        <AlertDialogDescription>
                            Vous n&apos;avez pas renseigné de diagnostic. Terminer la consultation quand même ?
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Annuler</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => performEndConsultation(undefined)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            Terminer quand même
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
