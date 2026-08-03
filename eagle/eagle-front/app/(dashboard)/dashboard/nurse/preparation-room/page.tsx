"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
    Clock,
    FileUp,
    HeartPulse,
    Loader2,
    RefreshCw,
    Stethoscope,
    UserRound,
} from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { EnhancedNurseDashboardHeader } from "@/components/nurse/enhanced-dashboard-header";
import { FloatingHelpButton } from "@/components/nurse/floating-help-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import {
    preparationKeys,
    useActivePreparationsQuery,
    useAddPreparationObservations,
    useCompletePreparation,
    useCreatePreparation,
    useHospitalVisitsQuery,
    usePatientsQuery,
    useSpecialtiesQuery,
    useUpdatePatientVitals,
    useUpdatePreparationProgress,
    useUploadFile,
    workflowKeys,
} from "@/hooks/queries";
import type { Visit, VitalSigns } from "@/types/api";
import { parseApiDate } from "@/lib/utils";

type VitalForm = {
    systolic: string;
    diastolic: string;
    temperature: string;
    pulse: string;
    respiratoryRate: string;
    oxygenSaturation: string;
    weight: string;
    height: string;
    bloodSugar: string;
};

const EMPTY_VITALS: VitalForm = {
    systolic: "",
    diastolic: "",
    temperature: "",
    pulse: "",
    respiratoryRate: "",
    oxygenSaturation: "",
    weight: "",
    height: "",
    bloodSugar: "",
};

const roleLabels: Record<string, string> = {
    nurse: "Infirmier(ère)",
    secondary_secretary: "Secrétaire secondaire",
};

export default function PreparationRoomPage() {
    const queryClient = useQueryClient();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const visitsQuery = useHospitalVisitsQuery();
    const patientsQuery = usePatientsQuery();
    const preparationsQuery = useActivePreparationsQuery();
    const specialtiesQuery = useSpecialtiesQuery(true);
    const createPreparation = useCreatePreparation();
    const updateVitals = useUpdatePatientVitals();
    const addObservations = useAddPreparationObservations();
    const updateProgress = useUpdatePreparationProgress();
    const completePreparation = useCompletePreparation();
    const uploadFile = useUploadFile();

    const [selectedVisit, setSelectedVisit] = useState<Visit | null>(null);
    const [preparationId, setPreparationId] = useState<string | null>(null);
    const [vitals, setVitals] = useState<VitalForm>(EMPTY_VITALS);
    const [signs, setSigns] = useState("");
    const [symptoms, setSymptoms] = useState("");
    const [clinicalNotes, setClinicalNotes] = useState("");
    const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);
    const [currentMinute, setCurrentMinute] = useState(0);

    useEffect(() => {
        const updateClock = () => setCurrentMinute(Math.floor(Date.now() / 60000));
        const initialTimer = window.setTimeout(updateClock, 0);
        const interval = window.setInterval(updateClock, 60_000);
        return () => {
            window.clearTimeout(initialTimer);
            window.clearInterval(interval);
        };
    }, []);

    const patientsById = useMemo(
        () => new Map((patientsQuery.data || []).map((patient) => [patient.id, patient])),
        [patientsQuery.data],
    );
    const specialtiesById = useMemo(
        () =>
            new Map(
                (specialtiesQuery.data || []).map((specialty) => [
                    specialty.id,
                    specialty.name,
                ]),
            ),
        [specialtiesQuery.data],
    );
    const activePreparationsByVisit = useMemo(
        () =>
            new Map(
                (preparationsQuery.data || [])
                    .filter((preparation) => preparation.visitId)
                    .map((preparation) => [preparation.visitId!, preparation]),
            ),
        [preparationsQuery.data],
    );
    const waitingVisits = useMemo(
        () =>
            (visitsQuery.data || [])
                .filter((visit) =>
                    ["WAITING", "WAITING_FOR_VITALS", "IN_PREPARATION"].includes(
                        visit.status,
                    ),
                )
                .sort(
                    (left, right) =>
                        (parseApiDate(left.createdAt)?.getTime() || 0) -
                        (parseApiDate(right.createdAt)?.getTime() || 0),
                ),
        [visitsQuery.data],
    );

    const selectedPatient = selectedVisit
        ? patientsById.get(selectedVisit.patientId)
        : undefined;
    const isSaving =
        createPreparation.isPending ||
        updateVitals.isPending ||
        addObservations.isPending ||
        updateProgress.isPending ||
        completePreparation.isPending;

    const resetForm = () => {
        setSelectedVisit(null);
        setPreparationId(null);
        setVitals(EMPTY_VITALS);
        setSigns("");
        setSymptoms("");
        setClinicalNotes("");
        setUploadedFiles([]);
    };

    const startPreparation = async (visit: Visit) => {
        setSelectedVisit(visit);
        setVitals(EMPTY_VITALS);
        setSigns("");
        setSymptoms("");
        setClinicalNotes("");
        setUploadedFiles([]);
        const existing = activePreparationsByVisit.get(visit.id);
        if (existing) {
            setPreparationId(existing.id);
            return;
        }
        try {
            const preparation = await createPreparation.mutateAsync({
                patientId: visit.patientId,
                visitId: visit.id,
            });
            setPreparationId(preparation.id);
        } catch (error) {
            resetForm();
            toast.error(
                error instanceof Error
                    ? error.message
                    : "Impossible de démarrer la préparation",
            );
        }
    };

    const buildVitalSigns = (): VitalSigns | null => {
        const required = [
            vitals.systolic,
            vitals.diastolic,
            vitals.temperature,
            vitals.pulse,
            vitals.respiratoryRate,
            vitals.oxygenSaturation,
            vitals.weight,
            vitals.height,
        ];
        if (required.some((value) => !value.trim())) return null;
        const weight = Number(vitals.weight);
        const height = Number(vitals.height);
        return {
            bloodPressure: `${vitals.systolic}/${vitals.diastolic}`,
            temperature: Number(vitals.temperature),
            heartRate: Number(vitals.pulse),
            respiratoryRate: Number(vitals.respiratoryRate),
            oxygenSaturation: Number(vitals.oxygenSaturation),
            weight,
            height,
            bmi: height > 0 ? Number((weight / (height / 100) ** 2).toFixed(1)) : undefined,
            glycemia: vitals.bloodSugar ? Number(vitals.bloodSugar) : undefined,
        };
    };

    const finishPreparation = async () => {
        if (!selectedVisit || !preparationId) return;
        const vitalSigns = buildVitalSigns();
        if (!vitalSigns) {
            toast.error("Renseignez tous les signes vitaux obligatoires");
            return;
        }
        if (!signs.trim() && !symptoms.trim() && !clinicalNotes.trim()) {
            toast.error("Ajoutez les signes, symptômes ou notes cliniques");
            return;
        }
        try {
            await updateVitals.mutateAsync({
                id: selectedVisit.patientId,
                data: { vitalSigns },
            });
            await addObservations.mutateAsync({
                id: preparationId,
                data: {
                    observations: [
                        signs.trim() && `Signes: ${signs.trim()}`,
                        symptoms.trim() && `Symptômes: ${symptoms.trim()}`,
                        clinicalNotes.trim() && `Notes: ${clinicalNotes.trim()}`,
                    ]
                        .filter(Boolean)
                        .join("\n"),
                },
            });
            await updateProgress.mutateAsync({
                id: preparationId,
                data: { progress: 100 },
            });
            await completePreparation.mutateAsync(preparationId);
            await Promise.all([
                queryClient.invalidateQueries({ queryKey: workflowKeys.visits() }),
                queryClient.invalidateQueries({ queryKey: workflowKeys.summary() }),
                queryClient.invalidateQueries({ queryKey: preparationKeys.all }),
            ]);
            toast.success("Patient prêt pour la consultation", {
                description: `${selectedVisit.passingNumber} · Ticket et affectation automatiques en cours`,
            });
            resetForm();
        } catch (error) {
            toast.error(
                error instanceof Error
                    ? error.message
                    : "Impossible de terminer la préparation",
            );
        }
    };

    const uploadDocuments = async (files: FileList | null) => {
        if (!files || !selectedVisit) return;
        for (const file of Array.from(files)) {
            await uploadFile.mutateAsync({
                file,
                entityType: "patient",
                entityId: selectedVisit.patientId,
            });
            setUploadedFiles((current) => [...current, file.name]);
        }
    };

    const setVital = (field: keyof VitalForm, value: string) =>
        setVitals((current) => ({ ...current, [field]: value }));

    return (
        <div className="flex h-full flex-col">
            <EnhancedNurseDashboardHeader />
            <main className="flex-1 space-y-4 overflow-y-auto p-4">
                <div className="flex items-center justify-end">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                            visitsQuery.refetch();
                            patientsQuery.refetch();
                            preparationsQuery.refetch();
                        }}
                    >
                        <RefreshCw className="mr-2 size-4" />
                        Actualiser
                    </Button>
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                    <Card>
                        <CardContent className="p-4">
                            <p className="text-xs text-muted-foreground">En attente</p>
                            <p className="mt-1 text-2xl font-semibold">{waitingVisits.length}</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <p className="text-xs text-muted-foreground">En préparation</p>
                            <p className="mt-1 text-2xl font-semibold">
                                {activePreparationsByVisit.size}
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <p className="text-xs text-muted-foreground">Prêts aujourd&apos;hui</p>
                            <p className="mt-1 text-2xl font-semibold">
                                {(visitsQuery.data || []).filter((visit) =>
                                    ["READY", "READY_FOR_SCHEDULING", "QUEUED", "WAITING_FOR_CONSULTATION"].includes(visit.status),
                                ).length}
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {visitsQuery.isLoading || patientsQuery.isLoading ? (
                    <div className="space-y-3">
                        <Skeleton className="h-32 w-full" />
                        <Skeleton className="h-32 w-full" />
                    </div>
                ) : visitsQuery.error || patientsQuery.error ? (
                    <Card>
                        <CardContent className="p-6 text-sm text-destructive">
                            Impossible de charger la file de préparation.
                        </CardContent>
                    </Card>
                ) : waitingVisits.length === 0 ? (
                    <Card>
                        <CardContent className="p-10 text-center text-muted-foreground">
                            Aucun patient n&apos;attend la préparation.
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid gap-3 lg:grid-cols-2">
                        {waitingVisits.map((visit) => {
                            const patient = patientsById.get(visit.patientId);
                            const active = activePreparationsByVisit.has(visit.id);
                            const createdAt = parseApiDate(visit.createdAt);
                            const waitingMinutes = createdAt
                                ? Math.max(
                                      0,
                                      currentMinute -
                                          Math.floor(createdAt.getTime() / 60000),
                                  )
                                : 0;
                            return (
                                <Card key={visit.id}>
                                    <CardContent className="p-4">
                                        <div className="flex items-start justify-between gap-3">
                                            <div>
                                                <p className="text-2xl font-bold text-primary">
                                                    {visit.passingNumber}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    {visit.consultationNumber}
                                                </p>
                                            </div>
                                            <Badge variant={active ? "secondary" : "outline"}>
                                                {active ? "En préparation" : "En attente"}
                                            </Badge>
                                        </div>
                                        <div className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
                                            <p className="flex items-center gap-2 font-medium">
                                                <UserRound className="size-4 text-muted-foreground" />
                                                {patient
                                                    ? `${patient.firstName} ${patient.lastName}`
                                                    : visit.patientId}
                                            </p>
                                            <p className="flex items-center gap-2">
                                                <Stethoscope className="size-4 text-muted-foreground" />
                                                {visit.specialtyId
                                                    ? specialtiesById.get(visit.specialtyId) ||
                                                      "Spécialité demandée"
                                                    : "Non définie"}
                                            </p>
                                            <p className="flex items-center gap-2 text-muted-foreground">
                                                <Clock className="size-4" />
                                                Attente: {waitingMinutes} min
                                            </p>
                                            <p className="text-muted-foreground">
                                                Enregistré par:{" "}
                                                {roleLabels[visit.registeredByRole] ||
                                                    visit.registeredByRole}
                                            </p>
                                        </div>
                                        <Button
                                            className="mt-4 w-full sm:w-auto"
                                            onClick={() => startPreparation(visit)}
                                        >
                                            <HeartPulse className="mr-2 size-4" />
                                            {active ? "Continuer" : "Commencer"}
                                        </Button>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                )}
            </main>

            <Dialog open={Boolean(selectedVisit)} onOpenChange={(open) => !open && resetForm()}>
                <DialogContent className="max-h-[92vh] max-w-4xl overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-3">
                            <span className="text-xl text-primary">
                                {selectedVisit?.passingNumber}
                            </span>
                            Préparation clinique
                        </DialogTitle>
                        <DialogDescription>
                            {selectedPatient
                                ? `${selectedPatient.firstName} ${selectedPatient.lastName}`
                                : selectedVisit?.consultationNumber}
                            {" · "}
                            {selectedVisit?.consultationNumber}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-5">
                        <section>
                            <h3 className="mb-3 text-sm font-semibold">Signes vitaux</h3>
                            <div className="grid gap-3 sm:grid-cols-3">
                                <div className="space-y-2">
                                    <Label>Tension *</Label>
                                    <div className="grid grid-cols-2 gap-2">
                                        <Input
                                            type="number"
                                            value={vitals.systolic}
                                            onChange={(event) =>
                                                setVital("systolic", event.target.value)
                                            }
                                            placeholder="120"
                                        />
                                        <Input
                                            type="number"
                                            value={vitals.diastolic}
                                            onChange={(event) =>
                                                setVital("diastolic", event.target.value)
                                            }
                                            placeholder="80"
                                        />
                                    </div>
                                </div>
                                {[
                                    ["temperature", "Température (°C)", "37.0"],
                                    ["pulse", "Pouls (bpm)", "72"],
                                    ["respiratoryRate", "Fréquence respiratoire", "16"],
                                    ["oxygenSaturation", "Saturation O₂ (%)", "98"],
                                    ["weight", "Poids (kg)", "70"],
                                    ["height", "Taille (cm)", "170"],
                                    ["bloodSugar", "Glycémie", "Optionnel"],
                                ].map(([field, label, placeholder]) => (
                                    <div key={field} className="space-y-2">
                                        <Label>
                                            {label} {field !== "bloodSugar" && "*"}
                                        </Label>
                                        <Input
                                            type="number"
                                            step="0.1"
                                            value={vitals[field as keyof VitalForm]}
                                            onChange={(event) =>
                                                setVital(
                                                    field as keyof VitalForm,
                                                    event.target.value,
                                                )
                                            }
                                            placeholder={placeholder}
                                        />
                                    </div>
                                ))}
                            </div>
                        </section>

                        <section className="grid gap-3 md:grid-cols-3">
                            <div className="space-y-2">
                                <Label htmlFor="preparation-signs">Signes</Label>
                                <Textarea
                                    id="preparation-signs"
                                    value={signs}
                                    onChange={(event) => setSigns(event.target.value)}
                                    rows={4}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="preparation-symptoms">Symptômes</Label>
                                <Textarea
                                    id="preparation-symptoms"
                                    value={symptoms}
                                    onChange={(event) => setSymptoms(event.target.value)}
                                    rows={4}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="preparation-notes">Notes cliniques</Label>
                                <Textarea
                                    id="preparation-notes"
                                    value={clinicalNotes}
                                    onChange={(event) => setClinicalNotes(event.target.value)}
                                    rows={4}
                                />
                            </div>
                        </section>

                        <section className="space-y-2">
                            <Label>Documents complémentaires</Label>
                            <input
                                ref={fileInputRef}
                                type="file"
                                multiple
                                accept="image/*,application/pdf"
                                className="hidden"
                                onChange={(event) => uploadDocuments(event.target.files)}
                            />
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => fileInputRef.current?.click()}
                                disabled={uploadFile.isPending}
                            >
                                <FileUp className="mr-2 size-4" />
                                Ajouter des documents
                            </Button>
                            {uploadedFiles.length > 0 && (
                                <p className="text-xs text-muted-foreground">
                                    {uploadedFiles.join(", ")}
                                </p>
                            )}
                        </section>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={resetForm} disabled={isSaving}>
                            Annuler
                        </Button>
                        <Button
                            onClick={finishPreparation}
                            disabled={isSaving || !preparationId}
                        >
                            {isSaving && <Loader2 className="mr-2 size-4 animate-spin" />}
                            Terminer et planifier
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
            <FloatingHelpButton />
        </div>
    );
}
