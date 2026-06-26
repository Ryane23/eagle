"use client";

import { useState, useMemo, useCallback } from "react";
import { EnhancedNurseDashboardHeader } from "@/components/nurse/enhanced-dashboard-header";
import { FloatingHelpButton } from "@/components/nurse/floating-help-button";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    CheckCircle2,
    RefreshCw,
    Upload,
    Camera,
    Printer,
    Scan,
    Wifi,
    FileText,
    X,
    User,
    Stethoscope,
    AlertTriangle,
    HeartPulse,
    Loader2,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    useHospitalQueueQuery,
    useActivePreparationsQuery,
    useCreatePreparation,
    useUpdatePreparationProgress,
    useAddPreparationObservations,
    useUpdatePatientVitals,
    queueKeys,
    preparationKeys,
} from "@/hooks/queries";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getPreparationByConsultation } from "@/actions/preparations";
import type { QueueEntry } from "@/types/api";
import type { VitalSigns } from "@/types/api";

type Specialty = "all" | "Généraliste" | "Cardiologue" | "Pédiatre" | "Gynécologue";

type PreConsultationPatient = {
    id: string;
    consultationId: string;
    patientId: string;
    name: string;
    age: number;
    gender: "Homme" | "Femme";
    patientCode: string;
    doctor: string;
    specialty: Specialty;
    urgencyLevel: 1 | 2 | 3 | 4 | 5;
    status: "en-preparation" | "pret";
};

function mapQueueToPreConsultation(
    entry: QueueEntry,
    readyConsultationIds: Set<string>
): PreConsultationPatient {
    const patient = entry.patient;
    const isReady = readyConsultationIds.has(entry.consultationId);
    return {
        id: entry.id,
        consultationId: entry.consultationId,
        patientId: entry.patientId,
        name: patient ? `${patient.firstName} ${patient.lastName}` : entry.patientId,
        age: 0,
        gender: "Homme",
        patientCode: entry.patientId,
        doctor: entry.consultation?.doctorId || "Non assigné",
        specialty: "Généraliste" as Specialty,
        urgencyLevel: (entry.priority || 1) as 1 | 2 | 3 | 4 | 5,
        status: isReady ? "pret" : entry.status === "in_progress" ? "en-preparation" : "pret",
    };
}

export default function PreConsultationRoomPage() {
    const queryClient = useQueryClient();
    const { data: queueEntries = [] } = useHospitalQueueQuery();
    const { data: preparations = [] } = useActivePreparationsQuery();

    const readyConsultationIds = useMemo(
        () =>
            new Set(
                preparations
                    .filter(
                        (p) =>
                            p.consultationId &&
                            (p.status === "completed" ||
                                (p as { status?: string }).status === "READY" ||
                                (p as { status?: string }).status === "ready")
                    )
                    .map((p) => p.consultationId!)
            ),
        [preparations]
    );

    const allPatients = useMemo(
        () => queueEntries.map((e) => mapQueueToPreConsultation(e, readyConsultationIds)),
        [queueEntries, readyConsultationIds]
    );

    const createPreparationMutation = useCreatePreparation();
    const updateProgressMutation = useUpdatePreparationProgress();
    const addObservationsMutation = useAddPreparationObservations();
    const updateVitalsMutation = useUpdatePatientVitals();

    const [activeSpecialty, setActiveSpecialty] = useState<Specialty>("all");
    const [selectedPatient, setSelectedPatient] = useState<PreConsultationPatient | null>(null);
    const [currentPreparationId, setCurrentPreparationId] = useState<string | null>(null);
    const [preparationPanelOpen, setPreparationPanelOpen] = useState(false);
    const [newPatientOpen, setNewPatientOpen] = useState(false);

    const [vitalSigns, setVitalSigns] = useState({
        systolic: "",
        diastolic: "",
        glycemia: "",
        temperature: "",
        spo2: "",
        pulse: "",
        height: "",
        weight: "",
        respiratoryRate: "",
    });
    const [problem, setProblem] = useState("");

    const patientsToShow = activeSpecialty === "all" 
        ? allPatients 
        : allPatients.filter(p => p.specialty === activeSpecialty);

    const specialtyCounts = {
        all: allPatients.length,
        "Généraliste": allPatients.filter(p => p.specialty === "Généraliste").length,
        "Cardiologue": allPatients.filter(p => p.specialty === "Cardiologue").length,
        "Pédiatre": allPatients.filter(p => p.specialty === "Pédiatre").length,
        "Gynécologue": allPatients.filter(p => p.specialty === "Gynécologue").length,
    };

    const calculateBMI = () => {
        const weight = parseFloat(vitalSigns.weight);
        const height = parseFloat(vitalSigns.height) / 100;
        if (weight && height) {
            return (weight / (height * height)).toFixed(1);
        }
        return null;
    };

    const handleStartPreparation = useCallback(
        async (patient: PreConsultationPatient) => {
            setSelectedPatient(patient);
            setPreparationPanelOpen(true);
            setProblem("");
            setVitalSigns({
                systolic: "",
                diastolic: "",
                glycemia: "",
                temperature: "",
                spo2: "",
                pulse: "",
                height: "",
                weight: "",
                respiratoryRate: "",
            });

            const existing = await getPreparationByConsultation(patient.consultationId).catch(() => null);
            if (existing?.id) {
                setCurrentPreparationId(existing.id);
            } else {
                createPreparationMutation.mutate(
                    {
                        patientId: patient.patientId,
                        consultationId: patient.consultationId,
                    },
                    {
                        onSuccess: (prep) => {
                            setCurrentPreparationId(prep.id);
                        },
                        onError: (err) => {
                            toast.error(err instanceof Error ? err.message : "Erreur lors de la création de la préparation");
                        },
                    }
                );
            }

            const entry = queueEntries.find((e) => e.consultationId === patient.consultationId);
            const p = entry?.patient;
            if (p?.vitalSigns) {
                const vs = p.vitalSigns as Record<string, unknown>;
                const bp = typeof vs.bloodPressure === "string" ? vs.bloodPressure : "";
                const [systolic = "", diastolic = ""] = bp.split("/");
                setVitalSigns({
                    systolic: String(systolic).trim(),
                    diastolic: String(diastolic).trim(),
                    glycemia: vs.glycemia != null ? String(vs.glycemia) : "",
                    temperature: vs.temperature != null ? String(vs.temperature) : "",
                    spo2: vs.oxygenSaturation != null ? String(vs.oxygenSaturation) : "",
                    pulse: vs.heartRate != null ? String(vs.heartRate) : "",
                    height: vs.height != null ? String(vs.height) : "",
                    weight: vs.weight != null ? String(vs.weight) : "",
                    respiratoryRate: vs.respiratoryRate != null ? String(vs.respiratoryRate) : "",
                });
            }
        },
        [createPreparationMutation, queueEntries]
    );

    const buildVitalSignsPayload = useCallback((): Record<string, unknown> => {
        const vs: Record<string, unknown> = {};
        if (vitalSigns.systolic || vitalSigns.diastolic) {
            vs.bloodPressure = `${vitalSigns.systolic}/${vitalSigns.diastolic}`.replace(/\/$/, "").replace(/^\//, "");
        }
        const pulse = parseInt(vitalSigns.pulse, 10);
        if (!Number.isNaN(pulse)) vs.heartRate = pulse;
        const temp = parseFloat(vitalSigns.temperature);
        if (!Number.isNaN(temp)) vs.temperature = temp;
        const spo2 = parseInt(vitalSigns.spo2, 10);
        if (!Number.isNaN(spo2)) vs.oxygenSaturation = spo2;
        const rr = parseInt(vitalSigns.respiratoryRate, 10);
        if (!Number.isNaN(rr)) vs.respiratoryRate = rr;
        const weight = parseFloat(vitalSigns.weight);
        if (!Number.isNaN(weight)) vs.weight = weight;
        const height = parseFloat(vitalSigns.height);
        if (!Number.isNaN(height)) vs.height = height;
        const glycemia = parseFloat(vitalSigns.glycemia);
        if (!Number.isNaN(glycemia)) vs.glycemia = glycemia;
        return vs;
    }, [vitalSigns]);

    const handleUpdateVitals = useCallback(() => {
        if (!selectedPatient) return;
        const payload = buildVitalSignsPayload();
        if (Object.keys(payload).length === 0) {
            toast.error("Veuillez renseigner au moins un signe vital");
            return;
        }
        updateVitalsMutation.mutate(
            { id: selectedPatient.patientId, data: { vitalSigns: payload as VitalSigns } },
            {
                onSuccess: () => {
                    queryClient.invalidateQueries({ queryKey: queueKeys.all });
                    toast.success("Signes vitaux enregistrés");
                },
                onError: (err) => {
                    toast.error(err instanceof Error ? err.message : "Erreur lors de l'enregistrement");
                },
            }
        );
    }, [selectedPatient, buildVitalSignsPayload, updateVitalsMutation, queryClient]);

    const handleMarkReady = useCallback(() => {
        if (!selectedPatient || !currentPreparationId) {
            toast.error("Préparation non initialisée");
            return;
        }

        const doMarkReady = () => {
            updateProgressMutation.mutate(
                { id: currentPreparationId!, data: { progress: 100 } },
                {
                    onSuccess: () => {
                        setPreparationPanelOpen(false);
                        setSelectedPatient(null);
                        setCurrentPreparationId(null);
                        setVitalSigns({
                            systolic: "",
                            diastolic: "",
                            glycemia: "",
                            temperature: "",
                            spo2: "",
                            pulse: "",
                            height: "",
                            weight: "",
                            respiratoryRate: "",
                        });
                        setProblem("");
                        queryClient.invalidateQueries({ queryKey: preparationKeys.all });
                        queryClient.invalidateQueries({ queryKey: queueKeys.all });
                        toast.success("Patient marqué prêt pour la consultation");
                    },
                    onError: (err) => {
                        toast.error(err instanceof Error ? err.message : "Erreur lors du marquage");
                    },
                }
            );
        };

        if (problem.trim()) {
            addObservationsMutation.mutate(
                { id: currentPreparationId, data: { observations: problem.trim() } },
                {
                    onSuccess: () => doMarkReady(),
                    onError: (err) => {
                        toast.error(err instanceof Error ? err.message : "Erreur lors de l'enregistrement des observations");
                    },
                }
            );
        } else {
            doMarkReady();
        }
    }, [
        selectedPatient,
        currentPreparationId,
        problem,
        updateProgressMutation,
        addObservationsMutation,
        queryClient,
    ]);

    return (
        <div className="flex flex-col h-full">
            <EnhancedNurseDashboardHeader
                nurseName="Sophie Ateba"
                clinic="Centre Principal - Yaoundé"
                clinicCode="CPY-001"
                clinicType="Centre Principal"
            />

            <div className="flex-1 p-6 space-y-4 overflow-hidden flex flex-col">
                {/* Header with Actions */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-primary">Salle de Pré-consultation</h1>
                        <p className="text-muted-foreground">
                            Interface interactive de préparation des patients
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={() => setNewPatientOpen(true)}>
                            <CheckCircle2 className="size-4 mr-2" />
                            Nouveau patient
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => {
                                queryClient.invalidateQueries({ queryKey: queueKeys.all });
                                queryClient.invalidateQueries({ queryKey: preparationKeys.all });
                                toast.success("Données actualisées");
                            }}
                        >
                            <RefreshCw className="size-4 mr-2" />
                            Actualiser
                        </Button>
                    </div>
                </div>

                {/* Specialty Tabs */}
                <Tabs value={activeSpecialty} onValueChange={(v) => setActiveSpecialty(v as Specialty)}>
                    <TabsList className="grid w-full grid-cols-5">
                        <TabsTrigger value="all">
                            Tous ({specialtyCounts.all})
                        </TabsTrigger>
                        <TabsTrigger value="Généraliste">
                            Généraliste ({specialtyCounts["Généraliste"]})
                        </TabsTrigger>
                        <TabsTrigger value="Cardiologue">
                            Cardiologue ({specialtyCounts["Cardiologue"]})
                        </TabsTrigger>
                        <TabsTrigger value="Pédiatre">
                            Pédiatre ({specialtyCounts["Pédiatre"]})
                        </TabsTrigger>
                        <TabsTrigger value="Gynécologue">
                            Gynécologue ({specialtyCounts["Gynécologue"]})
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value={activeSpecialty} className="flex-1 overflow-hidden mt-4">
                        <ScrollArea className="h-full">
                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                {patientsToShow.map((patient) => (
                                    <Card
                                        key={patient.id}
                                        className={`cursor-pointer hover:shadow-lg transition-all ${
                                            patient.urgencyLevel >= 4 ? "border-l-4 border-l-orange-500" : ""
                                        }`}
                                        onClick={() => handleStartPreparation(patient)}
                                    >
                                        <CardContent className="p-4">
                                            <div className="flex items-start justify-between mb-3">
                                                <div className="flex items-center gap-3">
                                                    <Avatar className="size-12">
                                                        <AvatarFallback className="bg-primary text-primary-foreground">
                                                            {patient.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div>
                                                        <p className="font-semibold">{patient.name}</p>
                                                        <p className="text-sm text-muted-foreground">
                                                            {patient.age} ans, {patient.gender}
                                                        </p>
                                                    </div>
                                                </div>
                                                {patient.urgencyLevel >= 4 && (
                                                    <AlertTriangle className="size-5 text-orange-500" />
                                                )}
                                            </div>
                                            <div className="space-y-2 text-sm">
                                                <div className="flex items-center gap-2">
                                                    <Stethoscope className="size-4 text-muted-foreground" />
                                                    <span>{patient.doctor}</span>
                                                </div>
                                                <div>
                                                    <Badge variant="outline">{patient.specialty}</Badge>
                                                </div>
                                                <div className="pt-2 border-t">
                                                    <Badge
                                                        variant={patient.status === "pret" ? "default" : "secondary"}
                                                        className={patient.status === "pret" ? "bg-green-500" : ""}
                                                    >
                                                        {patient.status === "pret" ? "Prêt" : "En préparation"}
                                                    </Badge>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>

                            {patientsToShow.length === 0 && (
                                <Card>
                                    <CardContent className="py-12 text-center">
                                        <User className="size-12 mx-auto text-muted-foreground mb-4" />
                                        <p className="text-muted-foreground">
                                            Aucun patient pour cette spécialité
                                        </p>
                                    </CardContent>
                                </Card>
                            )}
                        </ScrollArea>
                    </TabsContent>
                </Tabs>
            </div>

            {/* Preparation Panel Sidebar */}
            {selectedPatient && preparationPanelOpen && (
                <div className="fixed right-0 top-0 h-full w-[420px] bg-background border-l shadow-2xl z-50 flex flex-col">
                    <div className="p-3 border-b flex items-center justify-between">
                        <div>
                            <h3 className="font-semibold text-sm">Préparation</h3>
                            <p className="text-xs text-muted-foreground">{selectedPatient.name}</p>
                        </div>
                        <Button variant="ghost" size="icon" className="size-8" onClick={() => setPreparationPanelOpen(false)}>
                            <X className="size-4" />
                        </Button>
                    </div>

                    <Tabs defaultValue="vitals" className="flex-1 flex flex-col">
                        <TabsList className="mx-3 mt-3 grid w-auto grid-cols-2">
                            <TabsTrigger value="vitals" className="text-xs">Signes Vitaux</TabsTrigger>
                            <TabsTrigger value="problem" className="text-xs">Problème</TabsTrigger>
                        </TabsList>

                        <TabsContent value="vitals" className="flex-1 overflow-hidden mt-0">
                            <ScrollArea className="h-full p-3">
                                <div className="space-y-4">
                                    {/* Patient Info */}
                                    <div className="flex items-center gap-2 p-2 bg-muted/50 rounded-lg">
                                        <Avatar className="size-10">
                                            <AvatarFallback className="text-xs">
                                                {selectedPatient.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium text-sm truncate">{selectedPatient.name}</p>
                                            <p className="text-xs text-muted-foreground truncate">
                                                {selectedPatient.patientCode}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Vital Signs Form - Compact */}
                                    <div className="space-y-3">
                                        <h4 className="text-xs font-semibold flex items-center gap-1">
                                            <HeartPulse className="size-3 text-red-500" />
                                            Mise à jour des signes vitaux
                                        </h4>
                                        <div className="grid grid-cols-2 gap-2">
                                            <div>
                                                <Label className="text-xs">Tension (mmHg)</Label>
                                                <div className="flex gap-1">
                                                    <Input
                                                        value={vitalSigns.systolic}
                                                        onChange={(e) => setVitalSigns({ ...vitalSigns, systolic: e.target.value })}
                                                        placeholder="120"
                                                        className="h-8 text-sm"
                                                    />
                                                    <span className="self-center text-xs text-muted-foreground">/</span>
                                                    <Input
                                                        value={vitalSigns.diastolic}
                                                        onChange={(e) => setVitalSigns({ ...vitalSigns, diastolic: e.target.value })}
                                                        placeholder="80"
                                                        className="h-8 text-sm w-16"
                                                    />
                                                </div>
                                            </div>
                                            <div>
                                                <Label className="text-xs">Pouls (bpm)</Label>
                                                <Input
                                                    value={vitalSigns.pulse}
                                                    onChange={(e) => setVitalSigns({ ...vitalSigns, pulse: e.target.value })}
                                                    placeholder="72"
                                                    className="h-8 text-sm"
                                                />
                                            </div>
                                            <div>
                                                <Label className="text-xs">Température (°C)</Label>
                                                <Input
                                                    value={vitalSigns.temperature}
                                                    onChange={(e) => setVitalSigns({ ...vitalSigns, temperature: e.target.value })}
                                                    placeholder="37.0"
                                                    className="h-8 text-sm"
                                                />
                                            </div>
                                            <div>
                                                <Label className="text-xs">SpO₂ (%)</Label>
                                                <Input
                                                    value={vitalSigns.spo2}
                                                    onChange={(e) => setVitalSigns({ ...vitalSigns, spo2: e.target.value })}
                                                    placeholder="98"
                                                    className="h-8 text-sm"
                                                />
                                            </div>
                                            <div>
                                                <Label className="text-xs">Respiratoire (/min)</Label>
                                                <Input
                                                    value={vitalSigns.respiratoryRate}
                                                    onChange={(e) => setVitalSigns({ ...vitalSigns, respiratoryRate: e.target.value })}
                                                    placeholder="16"
                                                    className="h-8 text-sm"
                                                />
                                            </div>
                                            <div>
                                                <Label className="text-xs">Glycémie (g/L)</Label>
                                                <Input
                                                    value={vitalSigns.glycemia}
                                                    onChange={(e) => setVitalSigns({ ...vitalSigns, glycemia: e.target.value })}
                                                    placeholder="1.0"
                                                    className="h-8 text-sm"
                                                />
                                            </div>
                                            <div>
                                                <Label className="text-xs">Poids (kg)</Label>
                                                <Input
                                                    value={vitalSigns.weight}
                                                    onChange={(e) => setVitalSigns({ ...vitalSigns, weight: e.target.value })}
                                                    placeholder="75"
                                                    className="h-8 text-sm"
                                                />
                                            </div>
                                            <div>
                                                <Label className="text-xs">Taille (cm)</Label>
                                                <Input
                                                    value={vitalSigns.height}
                                                    onChange={(e) => setVitalSigns({ ...vitalSigns, height: e.target.value })}
                                                    placeholder="170"
                                                    className="h-8 text-sm"
                                                />
                                            </div>
                                        </div>
                                        {calculateBMI() && (
                                            <div className="p-2 bg-muted rounded text-xs">
                                                <strong>IMC:</strong> {calculateBMI()}
                                            </div>
                                        )}
                                        <Button
                                            onClick={handleUpdateVitals}
                                            variant="outline"
                                            size="sm"
                                            className="w-full"
                                            disabled={updateVitalsMutation.isPending}
                                        >
                                            {updateVitalsMutation.isPending ? (
                                                <Loader2 className="size-4 mr-2 animate-spin" />
                                            ) : null}
                                            Enregistrer
                                        </Button>
                                    </div>
                                </div>
                            </ScrollArea>
                        </TabsContent>

                        <TabsContent value="problem" className="flex-1 overflow-hidden mt-0">
                            <ScrollArea className="h-full p-3">
                                <div className="space-y-4">
                                    {/* Patient Info */}
                                    <div className="flex items-center gap-2 p-2 bg-muted/50 rounded-lg">
                                        <Avatar className="size-10">
                                            <AvatarFallback className="text-xs">
                                                {selectedPatient.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium text-sm truncate">{selectedPatient.name}</p>
                                            <p className="text-xs text-muted-foreground truncate">
                                                {selectedPatient.patientCode}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Problem/Reason for Visit */}
                                    <div className="space-y-2">
                                        <Label className="text-xs">Problème / Raison de consultation</Label>
                                        <Textarea
                                            value={problem}
                                            onChange={(e) => setProblem(e.target.value)}
                                            placeholder="Décrivez le problème, symptômes, ou raison de consultation..."
                                            className="min-h-[200px] text-sm"
                                        />
                                    </div>

                                    {/* Documents */}
                                    <div className="space-y-2">
                                        <Label className="text-xs">Documents</Label>
                                        <div className="border-2 border-dashed rounded-lg p-6 text-center">
                                            <Upload className="size-6 mx-auto text-muted-foreground mb-2" />
                                            <p className="text-xs text-muted-foreground">
                                                Glissez-déposez ou cliquez
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </ScrollArea>
                        </TabsContent>
                    </Tabs>

                    {/* Actions */}
                    <div className="p-3 border-t flex gap-2">
                        <Button
                            onClick={handleMarkReady}
                            size="sm"
                            className="flex-1"
                            disabled={!currentPreparationId || updateProgressMutation.isPending || addObservationsMutation.isPending}
                        >
                            {(updateProgressMutation.isPending || addObservationsMutation.isPending) ? (
                                <Loader2 className="size-4 mr-2 animate-spin" />
                            ) : (
                                <CheckCircle2 className="size-4 mr-2" />
                            )}
                            Marquer prêt
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => setPreparationPanelOpen(false)}>
                            Fermer
                        </Button>
                    </div>
                </div>
            )}

            {/* Floating Toolbar */}
            <div className="fixed bottom-6 right-6 flex flex-col gap-2 z-40">
                <Button size="icon" className="rounded-full" title="Prise de photo">
                    <Camera className="size-5" />
                </Button>
                <Button size="icon" variant="outline" className="rounded-full" title="Impression">
                    <Printer className="size-5" />
                </Button>
                <Button size="icon" variant="outline" className="rounded-full" title="Scanner">
                    <Scan className="size-5" />
                </Button>
                <Button size="icon" variant="outline" className="rounded-full" title="Test connexion">
                    <Wifi className="size-5" />
                </Button>
                <Button size="icon" variant="outline" className="rounded-full" title="Export DPI">
                    <FileText className="size-5" />
                </Button>
            </div>

            {/* New Patient Modal */}
            <Dialog open={newPatientOpen} onOpenChange={setNewPatientOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Nouveau patient</DialogTitle>
                        <DialogDescription>
                            Créer un nouveau patient dans le système
                        </DialogDescription>
                    </DialogHeader>
                    <div className="text-center py-4">
                        <p className="text-muted-foreground">
                            Cette fonctionnalité intégrera le processus de vérification d&apos;identité.
                        </p>
                    </div>
                </DialogContent>
            </Dialog>

            <FloatingHelpButton />
        </div>
    );
}

