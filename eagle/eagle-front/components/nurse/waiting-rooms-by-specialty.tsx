"use client";

import { useMemo, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import {
    AlertCircle,
    CheckCircle2,
    Clock,
    DoorOpen,
    HeartPulse,
    Search,
    Stethoscope,
    Ticket,
    User,
} from "lucide-react";
import {
    useCreateVisit,
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
    useUrgenciesQuery,
    preparationKeys,
    workflowKeys,
} from "@/hooks/queries";
import { parseApiDate } from "@/lib/utils";
import type { Patient, Visit, VisitStatus, VitalSigns } from "@/types/api";

type WorkflowTab =
    | "registered"
    | "waiting"
    | "preparation"
    | "ready"
    | "consultation"
    | "in_consultation"
    | "completed";

type DisplayItem = {
    id: string;
    patientId: string;
    name: string;
    age: number;
    gender: "Homme" | "Femme";
    phone: string;
    visit?: Visit;
    specialty: string;
    specialtyId?: string | null;
    urgencyLevel?: number | null;
    timestamp?: Date | null;
};

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

const vitalGuidance: Record<
    keyof VitalForm,
    { label: string; unit: string; placeholder: string; help: string; min?: number; max?: number }
> = {
    systolic: {
        label: "Pression systolique",
        unit: "mmHg",
        placeholder: "120",
        help: "Valeur habituelle adulte: 90-140 mmHg",
        min: 50,
        max: 260,
    },
    diastolic: {
        label: "Pression diastolique",
        unit: "mmHg",
        placeholder: "80",
        help: "Valeur habituelle adulte: 60-90 mmHg",
        min: 30,
        max: 160,
    },
    temperature: {
        label: "Température",
        unit: "°C",
        placeholder: "37.0",
        help: "Valeur habituelle: 36.0-37.5 °C",
        min: 30,
        max: 45,
    },
    pulse: {
        label: "Pouls",
        unit: "bpm",
        placeholder: "72",
        help: "Valeur habituelle adulte: 60-100 bpm",
        min: 30,
        max: 220,
    },
    respiratoryRate: {
        label: "Fréquence respiratoire",
        unit: "/min",
        placeholder: "16",
        help: "Valeur habituelle adulte: 12-20/min",
        min: 6,
        max: 60,
    },
    oxygenSaturation: {
        label: "Saturation oxygène",
        unit: "%",
        placeholder: "98",
        help: "Valeur habituelle: 95-100%",
        min: 50,
        max: 100,
    },
    weight: {
        label: "Poids",
        unit: "kg",
        placeholder: "70",
        help: "Entrez le poids en kilogrammes",
        min: 1,
        max: 350,
    },
    height: {
        label: "Taille",
        unit: "cm",
        placeholder: "170",
        help: "Entrez la taille en centimètres",
        min: 30,
        max: 250,
    },
    bloodSugar: {
        label: "Glycémie",
        unit: "g/L",
        placeholder: "0.95",
        help: "Optionnel; utile si patient diabétique ou malaise",
        min: 0.2,
        max: 6,
    },
};

const workflowTabs: Array<{
    value: WorkflowTab;
    label: string;
    statuses: VisitStatus[];
}> = [
    { value: "registered", label: "Enregistrés", statuses: [] },
    { value: "waiting", label: "Arrivés", statuses: ["ARRIVED", "WAITING", "WAITING_FOR_VITALS"] },
    { value: "preparation", label: "Préparation", statuses: ["IN_PREPARATION"] },
    { value: "ready", label: "Prêts", statuses: ["READY", "VITALS_COMPLETED", "READY_FOR_SCHEDULING"] },
    { value: "consultation", label: "Attente consultation", statuses: ["WAITING_FOR_CONSULTATION", "QUEUED"] },
    { value: "in_consultation", label: "En consultation", statuses: ["IN_CONSULTATION"] },
    { value: "completed", label: "Terminés", statuses: ["COMPLETED"] },
];

const statusLabels: Partial<Record<VisitStatus, string>> = {
    ARRIVED: "Arrivé",
    WAITING: "En attente",
    WAITING_FOR_VITALS: "En attente",
    IN_PREPARATION: "Préparation",
    READY: "Prêt",
    VITALS_COMPLETED: "Prêt",
    READY_FOR_SCHEDULING: "Prêt",
    WAITING_FOR_CONSULTATION: "File médecin",
    QUEUED: "File médecin",
    IN_CONSULTATION: "Consultation",
    COMPLETED: "Terminé",
};

function calculateAge(value: unknown) {
    const birthDate = parseApiDate(value);
    if (!birthDate) return 0;
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDifference = today.getMonth() - birthDate.getMonth();
    if (
        monthDifference < 0 ||
        (monthDifference === 0 && today.getDate() < birthDate.getDate())
    ) {
        age -= 1;
    }
    return age >= 0 && age < 130 ? age : 0;
}

function patientName(patient: Patient) {
    return `${patient.firstName || ""} ${patient.lastName || ""}`.trim() || "Patient inconnu";
}

function initials(name: string) {
    return name
        .split(" ")
        .map((part) => part[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();
}

function sortByTimestamp(left: DisplayItem, right: DisplayItem) {
    return (right.timestamp?.getTime() || 0) - (left.timestamp?.getTime() || 0);
}

function buildVitalSigns(vitals: VitalForm): VitalSigns | null {
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
}

function validateVitalRanges(vitals: VitalForm): string | null {
    for (const [field, guidance] of Object.entries(vitalGuidance) as Array<
        [keyof VitalForm, (typeof vitalGuidance)[keyof VitalForm]]
    >) {
        const value = vitals[field].trim();
        if (!value && field === "bloodSugar") continue;
        if (!value) return `${guidance.label} est obligatoire.`;
        const numeric = Number(value);
        if (!Number.isFinite(numeric)) {
            return `${guidance.label} doit être une valeur numérique.`;
        }
        if (
            (guidance.min !== undefined && numeric < guidance.min) ||
            (guidance.max !== undefined && numeric > guidance.max)
        ) {
            return `${guidance.label} doit être entre ${guidance.min} et ${guidance.max} ${guidance.unit}.`;
        }
    }
    return null;
}

export function WaitingRoomsBySpecialty() {
    const queryClient = useQueryClient();
    const [searchQuery, setSearchQuery] = useState("");
    const [activeTab, setActiveTab] = useState<WorkflowTab>("registered");
    const [specialtyFilter, setSpecialtyFilter] = useState("all");
    const [urgencyFilter, setUrgencyFilter] = useState("all");
    const [arrivalSpecialties, setArrivalSpecialties] = useState<Record<string, string>>({});
    const [preparationVisit, setPreparationVisit] = useState<Visit | null>(null);
    const [preparationId, setPreparationId] = useState<string | null>(null);
    const [vitals, setVitals] = useState<VitalForm>(EMPTY_VITALS);
    const [signs, setSigns] = useState("");
    const [symptoms, setSymptoms] = useState("");
    const [clinicalNotes, setClinicalNotes] = useState("");
    const [selectedItem, setSelectedItem] = useState<DisplayItem | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const patientsQuery = usePatientsQuery();
    const visitsQuery = useHospitalVisitsQuery();
    const specialtiesQuery = useSpecialtiesQuery(true);
    const urgenciesQuery = useUrgenciesQuery();
    const preparationsQuery = useActivePreparationsQuery();
    const createVisit = useCreateVisit();
    const createPreparation = useCreatePreparation();
    const updateVitals = useUpdatePatientVitals();
    const addObservations = useAddPreparationObservations();
    const updateProgress = useUpdatePreparationProgress();
    const completePreparation = useCompletePreparation();
    const uploadFile = useUploadFile();

    const patients = useMemo(() => patientsQuery.data || [], [patientsQuery.data]);
    const visits = useMemo(() => visitsQuery.data || [], [visitsQuery.data]);
    const specialties = useMemo(
        () => specialtiesQuery.data || [],
        [specialtiesQuery.data],
    );
    const urgencies = useMemo(
        () => urgenciesQuery.data || [],
        [urgenciesQuery.data],
    );
    const preparations = useMemo(
        () => preparationsQuery.data || [],
        [preparationsQuery.data],
    );

    const specialtyNames = useMemo(
        () => new Map(specialties.map((specialty) => [specialty.id, specialty.name])),
        [specialties],
    );
    const urgencyByPatient = useMemo(() => {
        const entries = urgencies
            .filter((urgency) => !["completed", "rejected"].includes(urgency.status))
            .sort((left, right) => right.urgencyLevel - left.urgencyLevel);
        return new Map(entries.map((urgency) => [urgency.patientId, urgency]));
    }, [urgencies]);
    const activePreparationsByVisit = useMemo(
        () =>
            new Map(
                preparations
                    .filter((preparation) => preparation.visitId)
                    .map((preparation) => [preparation.visitId!, preparation]),
            ),
        [preparations],
    );
    const activeVisitPatientIds = useMemo(
        () =>
            new Set(
                visits
                    .filter((visit) => !["COMPLETED", "CANCELLED", "MISSED"].includes(visit.status))
                    .map((visit) => visit.patientId),
            ),
        [visits],
    );

    const itemsByTab = useMemo(() => {
        const patientsById = new Map(patients.map((patient) => [patient.id, patient]));
        const grouped = Object.fromEntries(
            workflowTabs.map((tab) => [tab.value, [] as DisplayItem[]]),
        ) as Record<WorkflowTab, DisplayItem[]>;

        for (const patient of patients) {
            if (activeVisitPatientIds.has(patient.id)) continue;
            const name = patientName(patient);
            grouped.registered.push({
                id: patient.id,
                patientId: patient.id,
                name,
                age: calculateAge(patient.dateOfBirth),
                gender: patient.gender === "MALE" ? "Homme" : "Femme",
                phone: patient.phone || "N/A",
                specialty: "À confirmer",
                specialtyId: null,
                urgencyLevel: urgencyByPatient.get(patient.id)?.urgencyLevel || null,
                timestamp: parseApiDate(patient.createdAt),
            });
        }

        for (const visit of visits) {
            const tab = workflowTabs.find((item) => item.statuses.includes(visit.status));
            if (!tab) continue;
            const patient = patientsById.get(visit.patientId);
            if (!patient) continue;
            const name = patientName(patient);
            grouped[tab.value].push({
                id: visit.id,
                patientId: patient.id,
                name,
                age: calculateAge(patient.dateOfBirth),
                gender: patient.gender === "MALE" ? "Homme" : "Femme",
                phone: patient.phone || "N/A",
                visit,
                specialty: visit.specialtyId
                    ? specialtyNames.get(visit.specialtyId) || "Spécialité"
                    : "À confirmer",
                specialtyId: visit.specialtyId || null,
                urgencyLevel: urgencyByPatient.get(patient.id)?.urgencyLevel || null,
                timestamp:
                    parseApiDate(visit.arrivedAt) ||
                    parseApiDate(visit.checkedInAt) ||
                    parseApiDate(visit.createdAt),
            });
        }

        workflowTabs.forEach((tab) => grouped[tab.value].sort(sortByTimestamp));
        return grouped;
    }, [activeVisitPatientIds, patients, specialtyNames, urgencyByPatient, visits]);

    const currentItems = itemsByTab[activeTab].filter((item) => {
        const query = searchQuery.toLowerCase();
        const matchesSearch =
            item.name.toLowerCase().includes(query) ||
            item.phone.toLowerCase().includes(query) ||
            item.visit?.passingNumber?.toLowerCase().includes(query) ||
            item.visit?.consultationNumber?.toLowerCase().includes(query);
        const matchesSpecialty =
            specialtyFilter === "all" || item.specialtyId === specialtyFilter;
        const matchesUrgency =
            urgencyFilter === "all" ||
            String(item.urgencyLevel || "none") === urgencyFilter;
        return matchesSearch && matchesSpecialty && matchesUrgency;
    });

    const isLoading =
        patientsQuery.isLoading ||
        visitsQuery.isLoading ||
        specialtiesQuery.isLoading ||
        urgenciesQuery.isLoading ||
        preparationsQuery.isLoading;
    const hasError =
        patientsQuery.error ||
        visitsQuery.error ||
        specialtiesQuery.error ||
        urgenciesQuery.error ||
        preparationsQuery.error;

    const markArrived = async (patientId: string) => {
        const specialtyId = arrivalSpecialties[patientId];
        if (!specialtyId) {
            toast.error("Sélectionnez la spécialité avant de confirmer l'arrivée.");
            return;
        }
        try {
            const visit = await createVisit.mutateAsync({
                patientId,
                type: "WALK_IN",
                specialtyId,
            });
            toast.success("Arrivée confirmée", {
                description: `${visit.passingNumber} · ${visit.consultationNumber}`,
            });
            setActiveTab("waiting");
        } catch (error) {
            toast.error(
                error instanceof Error
                    ? error.message
                    : "Impossible de confirmer l'arrivée",
            );
        }
    };

    const resetPreparation = () => {
        setPreparationVisit(null);
        setPreparationId(null);
        setVitals(EMPTY_VITALS);
        setSigns("");
        setSymptoms("");
        setClinicalNotes("");
    };

    const startPreparation = async (visit: Visit) => {
        setPreparationVisit(visit);
        setVitals(EMPTY_VITALS);
        setSigns("");
        setSymptoms("");
        setClinicalNotes("");
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
            resetPreparation();
            toast.error(
                error instanceof Error
                    ? error.message
                    : "Impossible de démarrer la préparation",
            );
        }
    };

    const finishPreparation = async () => {
        if (!preparationVisit || !preparationId) return;
        const vitalError = validateVitalRanges(vitals);
        if (vitalError) {
            toast.error(vitalError);
            return;
        }
        const vitalSigns = buildVitalSigns(vitals);
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
                id: preparationVisit.patientId,
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
                description: `${preparationVisit.passingNumber} · Ticket et affectation automatiques en cours`,
            });
            setActiveTab("ready");
            resetPreparation();
        } catch (error) {
            toast.error(
                error instanceof Error
                    ? error.message
                    : "Impossible de terminer la préparation",
            );
        }
    };

    const selectedPatient = preparationVisit
        ? patients.find((patient) => patient.id === preparationVisit.patientId)
        : selectedItem
            ? patients.find((patient) => patient.id === selectedItem.patientId)
        : undefined;
    const isSavingPreparation =
        createPreparation.isPending ||
        updateVitals.isPending ||
        addObservations.isPending ||
        updateProgress.isPending ||
        completePreparation.isPending;
    const setVital = (field: keyof VitalForm, value: string) =>
        setVitals((current) => ({ ...current, [field]: value }));

    const uploadAttachment = async (files: FileList | null) => {
        if (!files || !selectedItem) return;
        for (const file of Array.from(files)) {
            await uploadFile.mutateAsync({
                file,
                entityType: "patient",
                entityId: selectedItem.patientId,
            });
        }
        toast.success("Document ajouté au dossier patient");
    };

    const selectedPreparation = selectedItem?.visit
        ? activePreparationsByVisit.get(selectedItem.visit.id)
        : undefined;
    const checklist: Array<[string, boolean]> = selectedItem
        ? [
            ["Identité vérifiée", Boolean(selectedPatient)],
            ["Patient arrivé", Boolean(selectedItem.visit?.arrivedAt || selectedItem.visit?.checkedInAt)],
            ["Signes vitaux enregistrés", Boolean(selectedItem.visit?.vitalsCompletedAt || selectedPreparation?.progress === 100)],
            ["Signes et symptômes enregistrés", Boolean(selectedPreparation?.observations)],
            ["Ticket généré", Boolean(selectedItem.visit?.ticketId)],
            ["Médecin assigné", Boolean(selectedItem.visit?.consultationId)],
            ["Consultation terminée", selectedItem.visit?.status === "COMPLETED"],
        ]
        : [];
    const timeline = selectedItem?.visit
        ? [
            {
                label: "Patient enregistré",
                at: parseApiDate(selectedItem.visit.createdAt),
                actor: selectedItem.visit.registeredByRole || "Personnel",
            },
            {
                label: "Arrivée confirmée",
                at: parseApiDate(selectedItem.visit.arrivedAt) || parseApiDate(selectedItem.visit.checkedInAt),
                actor: "Accueil / Infirmier",
            },
            {
                label: "Préparation commencée",
                at: parseApiDate(selectedItem.visit.preparationStartedAt),
                actor: "Infirmier",
            },
            {
                label: "Préparation terminée",
                at: parseApiDate(selectedItem.visit.vitalsCompletedAt),
                actor: "Infirmier",
            },
            {
                label: "Consultation terminée",
                at: parseApiDate(selectedItem.visit.completedAt),
                actor: "Médecin",
            },
        ].filter((event) => event.at)
        : [];

    if (hasError) {
        return (
            <Card>
                <CardContent className="p-6">
                    <div className="flex items-center gap-2 text-destructive">
                        <AlertCircle className="size-5" />
                        <p>Erreur lors du chargement de la Salle d&apos;attente</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <>
            <Card>
                <CardHeader>
                    <CardTitle>Salle d&apos;attente</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            placeholder="Rechercher un patient, numéro de passage..."
                            value={searchQuery}
                            onChange={(event) => setSearchQuery(event.target.value)}
                            className="pl-9"
                        />
                    </div>
                    <div className="grid gap-2 md:grid-cols-2">
                        <Select value={specialtyFilter} onValueChange={setSpecialtyFilter}>
                            <SelectTrigger>
                                <SelectValue placeholder="Filtrer par spécialité" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Toutes les spécialités</SelectItem>
                                {specialties.map((specialty) => (
                                    <SelectItem key={specialty.id} value={specialty.id}>
                                        {specialty.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Select value={urgencyFilter} onValueChange={setUrgencyFilter}>
                            <SelectTrigger>
                                <SelectValue placeholder="Filtrer par urgence" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Toutes les urgences</SelectItem>
                                <SelectItem value="5">Critique</SelectItem>
                                <SelectItem value="4">Urgent</SelectItem>
                                <SelectItem value="3">Prioritaire</SelectItem>
                                <SelectItem value="2">Routine</SelectItem>
                                <SelectItem value="1">Suivi</SelectItem>
                                <SelectItem value="none">Sans urgence</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as WorkflowTab)}>
                        <TabsList className="h-auto flex-wrap justify-start">
                            {workflowTabs.map((tab) => (
                                <TabsTrigger key={tab.value} value={tab.value}>
                                    {tab.label} ({itemsByTab[tab.value].length})
                                </TabsTrigger>
                            ))}
                        </TabsList>

                        <TabsContent value={activeTab} className="mt-3">
                            {isLoading ? (
                                <div className="space-y-2">
                                    {[...Array(4)].map((_, index) => (
                                        <Card key={index}>
                                            <CardContent className="p-3">
                                                <div className="flex items-start gap-3">
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
                            ) : currentItems.length === 0 ? (
                                <div className="py-8 text-center text-muted-foreground">
                                    <p>Aucun patient dans cette étape</p>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {currentItems.map((item) => (
                                        <Card
                                            key={item.id}
                                            className="cursor-pointer transition-shadow hover:shadow-md"
                                            onClick={() => setSelectedItem(item)}
                                        >
                                            <CardContent className="p-3">
                                                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                                                    <div className="flex min-w-0 flex-1 items-start gap-3">
                                                        <Avatar className="size-10 shrink-0">
                                                            <AvatarFallback className={item.gender === "Homme" ? "bg-blue-500" : "bg-pink-500"}>
                                                                {initials(item.name)}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        <div className="min-w-0 flex-1">
                                                            <div className="mb-1 flex flex-wrap items-center gap-1.5">
                                                                <p className="truncate text-sm font-semibold">{item.name}</p>
                                                                {item.visit ? (
                                                                    <Badge variant="secondary">
                                                                        {statusLabels[item.visit.status] || item.visit.status}
                                                                    </Badge>
                                                                ) : (
                                                                    <Badge variant="outline">Enregistré</Badge>
                                                                )}
                                                                {item.visit?.passingNumber ? (
                                                                    <Badge variant="outline">
                                                                        <Ticket className="mr-1 size-3" />
                                                                        {item.visit.passingNumber}
                                                                    </Badge>
                                                                ) : null}
                                                                {item.urgencyLevel ? (
                                                                    <Badge variant={item.urgencyLevel >= 4 ? "destructive" : "secondary"}>
                                                                        Urgence {item.urgencyLevel}
                                                                    </Badge>
                                                                ) : null}
                                                            </div>
                                                            <div className="grid gap-1.5 text-xs text-muted-foreground md:grid-cols-4">
                                                                <div className="flex items-center gap-1 truncate">
                                                                    <User className="size-3 shrink-0" />
                                                                    <span className="truncate">{item.age} ans, {item.gender}</span>
                                                                </div>
                                                                <div className="flex items-center gap-1 truncate">
                                                                    <Stethoscope className="size-3 shrink-0" />
                                                                    <span className="truncate">{item.specialty}</span>
                                                                </div>
                                                                <div className="flex items-center gap-1 truncate">
                                                                    <Clock className="size-3 shrink-0" />
                                                                    <span className="truncate">
                                                                        {item.timestamp
                                                                            ? item.timestamp.toLocaleTimeString("fr-FR", {
                                                                                hour: "2-digit",
                                                                                minute: "2-digit",
                                                                            })
                                                                            : "--:--"}
                                                                    </span>
                                                                </div>
                                                                <div className="flex items-center gap-1 truncate">
                                                                    <HeartPulse className="size-3 shrink-0" />
                                                                    <span className="truncate">
                                                                        {item.visit?.consultationNumber || "Sans visite active"}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    {activeTab === "registered" ? (
                                                        <div
                                                            className="flex shrink-0 flex-col gap-2 sm:min-w-56"
                                                            onClick={(event) => event.stopPropagation()}
                                                        >
                                                            <Select
                                                                value={arrivalSpecialties[item.patientId] || ""}
                                                                onValueChange={(value) =>
                                                                    setArrivalSpecialties((current) => ({
                                                                        ...current,
                                                                        [item.patientId]: value,
                                                                    }))
                                                                }
                                                            >
                                                                <SelectTrigger className="w-full">
                                                                    <SelectValue placeholder="Spécialité" />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    {specialties.map((specialty) => (
                                                                        <SelectItem key={specialty.id} value={specialty.id}>
                                                                            {specialty.name}
                                                                        </SelectItem>
                                                                    ))}
                                                                </SelectContent>
                                                            </Select>
                                                            <Button
                                                                size="sm"
                                                                onClick={(event) => {
                                                                    event.stopPropagation();
                                                                    markArrived(item.patientId);
                                                                }}
                                                                disabled={createVisit.isPending}
                                                            >
                                                                <DoorOpen className="size-4" />
                                                                Marquer arrivé
                                                            </Button>
                                                        </div>
                                                    ) : item.visit?.status === "WAITING" ||
                                                      item.visit?.status === "WAITING_FOR_VITALS" ||
                                                      item.visit?.status === "IN_PREPARATION" ? (
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            className="shrink-0"
                                                            onClick={(event) => {
                                                                event.stopPropagation();
                                                                if (item.visit) startPreparation(item.visit);
                                                            }}
                                                        >
                                                            <CheckCircle2 className="size-4" />
                                                            {item.visit.status === "IN_PREPARATION" ? "Continuer" : "Préparer"}
                                                        </Button>
                                                    ) : null}
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

            <Sheet open={Boolean(selectedItem)} onOpenChange={(open) => !open && setSelectedItem(null)}>
                <SheetContent className="w-full overflow-y-auto sm:max-w-xl">
                    <SheetHeader>
                        <SheetTitle>{selectedItem?.name || "Patient"}</SheetTitle>
                        <SheetDescription>
                            Dossier, actions et suivi du parcours patient.
                        </SheetDescription>
                    </SheetHeader>

                    {selectedItem ? (
                        <div className="mt-5 space-y-5">
                            <div className="flex items-start gap-3">
                                <Avatar className="size-12">
                                    <AvatarFallback className={selectedItem.gender === "Homme" ? "bg-blue-500" : "bg-pink-500"}>
                                        {initials(selectedItem.name)}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="min-w-0 flex-1">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <p className="font-semibold">{selectedItem.name}</p>
                                        <Badge variant="secondary">
                                            {selectedItem.visit
                                                ? statusLabels[selectedItem.visit.status] || selectedItem.visit.status
                                                : "Enregistré"}
                                        </Badge>
                                        {selectedItem.urgencyLevel ? (
                                            <Badge variant={selectedItem.urgencyLevel >= 4 ? "destructive" : "outline"}>
                                                Priorité {selectedItem.urgencyLevel}
                                            </Badge>
                                        ) : null}
                                    </div>
                                    <p className="text-sm text-muted-foreground">
                                        {selectedItem.age} ans · {selectedItem.gender} · {selectedItem.phone}
                                    </p>
                                </div>
                            </div>

                            <div className="grid gap-2 text-sm sm:grid-cols-2">
                                <div>
                                    <p className="text-xs text-muted-foreground">Consultation</p>
                                    <p className="font-medium">{selectedItem.visit?.consultationNumber || "Non créée"}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground">Passage</p>
                                    <p className="font-medium">{selectedItem.visit?.passingNumber || "Non attribué"}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground">Spécialité</p>
                                    <p className="font-medium">{selectedItem.specialty}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground">Type</p>
                                    <p className="font-medium">{selectedItem.visit?.type || "Enregistrement"}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground">Arrivée</p>
                                    <p className="font-medium">
                                        {selectedItem.timestamp
                                            ? selectedItem.timestamp.toLocaleTimeString("fr-FR", {
                                                hour: "2-digit",
                                                minute: "2-digit",
                                            })
                                            : "Non confirmée"}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground">Infirmier registration</p>
                                    <p className="font-medium">{selectedItem.visit?.registeredByRole || "Session actuelle"}</p>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <p className="text-sm font-semibold">Actions</p>
                                <div className="flex flex-wrap gap-2">
                                    {!selectedItem.visit ? (
                                        <>
                                            <Select
                                                value={arrivalSpecialties[selectedItem.patientId] || ""}
                                                onValueChange={(value) =>
                                                    setArrivalSpecialties((current) => ({
                                                        ...current,
                                                        [selectedItem.patientId]: value,
                                                    }))
                                                }
                                            >
                                                <SelectTrigger className="w-52">
                                                    <SelectValue placeholder="Spécialité" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {specialties.map((specialty) => (
                                                        <SelectItem key={specialty.id} value={specialty.id}>
                                                            {specialty.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <Button onClick={() => markArrived(selectedItem.patientId)}>
                                                <DoorOpen className="size-4" />
                                                Marquer arrivé
                                            </Button>
                                        </>
                                    ) : ["WAITING", "WAITING_FOR_VITALS", "IN_PREPARATION"].includes(selectedItem.visit.status) ? (
                                        <Button
                                            onClick={() => {
                                                if (selectedItem.visit) startPreparation(selectedItem.visit);
                                            }}
                                        >
                                            <HeartPulse className="size-4" />
                                            {selectedItem.visit.status === "IN_PREPARATION" ? "Ouvrir préparation" : "Commencer préparation"}
                                        </Button>
                                    ) : ["READY", "READY_FOR_SCHEDULING"].includes(selectedItem.visit.status) ? (
                                        <Button variant="outline">
                                            <Ticket className="size-4" />
                                            Voir ticket
                                        </Button>
                                    ) : selectedItem.visit.status === "WAITING_FOR_CONSULTATION" || selectedItem.visit.status === "QUEUED" ? (
                                        <Button variant="outline">
                                            <Clock className="size-4" />
                                            Voir position
                                        </Button>
                                    ) : selectedItem.visit.status === "IN_CONSULTATION" ? (
                                        <Button asChild>
                                            <a href="/dashboard/nurse/consultation">
                                                <Stethoscope className="size-4" />
                                                Salle de consultation
                                            </a>
                                        </Button>
                                    ) : (
                                        <Button variant="outline">
                                            Voir rapport
                                        </Button>
                                    )}
                                    <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
                                        Ajouter document
                                    </Button>
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        className="hidden"
                                        accept="image/*,application/pdf"
                                        onChange={(event) => uploadAttachment(event.target.files)}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <p className="text-sm font-semibold">Checklist</p>
                                <div className="space-y-2">
                                    {checklist.map(([label, done]) => (
                                        <div key={label} className="flex items-center justify-between rounded-md border p-2 text-sm">
                                            <span>{label}</span>
                                            <Badge variant={done ? "default" : "outline"}>
                                                {done ? "OK" : "À faire"}
                                            </Badge>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <p className="text-sm font-semibold">Documents cliniques</p>
                                <div className="rounded-md border p-3 text-sm text-muted-foreground">
                                    Les documents ajoutés sont enregistrés dans le dossier patient. La liste détaillée des aperçus sera branchée sur l&apos;API fichiers.
                                </div>
                            </div>

                            <div className="space-y-2">
                                <p className="text-sm font-semibold">Timeline</p>
                                <div className="space-y-3">
                                    {timeline.length === 0 ? (
                                        <p className="text-sm text-muted-foreground">Aucun événement de visite pour le moment.</p>
                                    ) : (
                                        timeline.map((event) => (
                                            <div key={`${event.label}-${event.at?.toISOString()}`} className="border-l pl-3">
                                                <p className="text-sm font-medium">{event.label}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    {event.at?.toLocaleTimeString("fr-FR", {
                                                        hour: "2-digit",
                                                        minute: "2-digit",
                                                    })} · {event.actor}
                                                </p>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>
                    ) : null}
                </SheetContent>
            </Sheet>

            <Dialog open={Boolean(preparationVisit)} onOpenChange={(open) => !open && resetPreparation()}>
                <DialogContent className="max-h-[92vh] max-w-4xl overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-3">
                            <span className="text-xl text-primary">
                                {preparationVisit?.passingNumber}
                            </span>
                            Préparation clinique
                        </DialogTitle>
                        <DialogDescription>
                            {selectedPatient
                                ? `${selectedPatient.firstName} ${selectedPatient.lastName}`
                                : preparationVisit?.consultationNumber}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
                        <div className="space-y-3">
                            <div className="grid gap-3 sm:grid-cols-2">
                                {(Object.keys(vitalGuidance) as Array<keyof VitalForm>).map((field) => {
                                    const guidance = vitalGuidance[field];
                                    return (
                                        <div
                                            key={field}
                                            className={field === "bloodSugar" ? "space-y-1.5 sm:col-span-2" : "space-y-1.5"}
                                        >
                                            <div className="flex items-center justify-between gap-2">
                                                <Label>{guidance.label}</Label>
                                                <span className="text-xs text-muted-foreground">{guidance.unit}</span>
                                            </div>
                                            <Input
                                                value={vitals[field]}
                                                onChange={(event) => setVital(field, event.target.value)}
                                                inputMode={["temperature", "weight", "height", "bloodSugar"].includes(field) ? "decimal" : "numeric"}
                                                placeholder={guidance.placeholder}
                                            />
                                            <p className="text-xs text-muted-foreground">{guidance.help}</p>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="space-y-3">
                            <div className="space-y-1.5">
                                <Label>Signes</Label>
                                <Textarea value={signs} onChange={(event) => setSigns(event.target.value)} rows={3} />
                            </div>
                            <div className="space-y-1.5">
                                <Label>Symptômes</Label>
                                <Textarea value={symptoms} onChange={(event) => setSymptoms(event.target.value)} rows={3} />
                            </div>
                            <div className="space-y-1.5">
                                <Label>Notes cliniques</Label>
                                <Textarea value={clinicalNotes} onChange={(event) => setClinicalNotes(event.target.value)} rows={4} />
                            </div>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={resetPreparation} disabled={isSavingPreparation}>
                            Annuler
                        </Button>
                        <Button onClick={finishPreparation} disabled={isSavingPreparation || !preparationId}>
                            <HeartPulse className="size-4" />
                            Terminer la préparation
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
