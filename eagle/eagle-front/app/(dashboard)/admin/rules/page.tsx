"use client";

import { ChangeEvent, useMemo, useRef, useState } from "react";
import { DashboardHeader } from "@/components/layout/dashboard-header";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
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
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    AlertCircle,
    AlertTriangle,
    Clock,
    Download,
    History,
    Play,
    RotateCcw,
    Save,
    Upload,
    Users,
} from "lucide-react";
import {
    useSystemSettingsHistoryQuery,
    useSystemSettingsQuery,
    useUpdateSystemSettings,
} from "@/hooks/queries";
import { parseApiDate } from "@/lib/utils";
import type { SystemSettings, UpdateSystemSettingsDto } from "@/types/api";
import { toast } from "sonner";

const urgencyNames: Record<number, string> = {
    1: "Non urgent",
    2: "Peu urgent",
    3: "Urgent",
    4: "Très urgent",
    5: "Critique",
};

const urgencyBadgeClasses: Record<number, string> = {
    1: "bg-gray-100 text-gray-800",
    2: "bg-blue-100 text-blue-800",
    3: "bg-yellow-100 text-yellow-800",
    4: "bg-orange-100 text-orange-800",
    5: "bg-red-100 text-red-800",
};

const settingLabels: Record<string, string> = {
    maintenanceMode: "mode maintenance",
    maxUrgencyLevel: "niveau maximal d'urgence",
    defaultConsultationDuration: "durée des consultations",
    autoDistribution: "distribution automatique",
    loadBalancing: "équilibrage de charge",
    assignmentStrategy: "stratégie d'affectation",
    urgencyLevels: "niveaux d'urgence",
    minBandwidthMbps: "seuil de bande passante",
    consultationStartDelayMinutes: "alerte de démarrage",
    autoRecordConsultations: "enregistrement automatique",
    allowedFileTypes: "types de fichiers",
    maxFileSize: "taille maximale des fichiers",
};

const importableKeys: Array<keyof SystemSettings> = [
    "maintenanceMode",
    "maxUrgencyLevel",
    "defaultConsultationDuration",
    "autoDistribution",
    "loadBalancing",
    "assignmentStrategy",
    "urgencyLevels",
    "minBandwidthMbps",
    "consultationStartDelayMinutes",
    "autoRecordConsultations",
    "allowedFileTypes",
    "maxFileSize",
];

export default function RulesPage() {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [draftOverride, setDraftOverride] = useState<SystemSettings | null>(null);
    const [isSimulationOpen, setIsSimulationOpen] = useState(false);
    const { data: settings, isLoading, error, refetch } = useSystemSettingsQuery();
    const { data: history = [], isLoading: isHistoryLoading } =
        useSystemSettingsHistoryQuery();
    const updateSettings = useUpdateSystemSettings();
    const draft = draftOverride ?? settings ?? null;

    const pickEditableSettings = (source: SystemSettings): UpdateSystemSettingsDto => {
        const editable: UpdateSystemSettingsDto = {};
        for (const key of importableKeys) {
            Object.assign(editable, { [key]: source[key] });
        }
        return editable;
    };

    const hasChanges = useMemo(
        () =>
            Boolean(
                settings &&
                draft &&
                JSON.stringify(pickEditableSettings(settings)) !==
                    JSON.stringify(pickEditableSettings(draft))
            ),
        [draft, settings]
    );

    const simulation = useMemo(() => {
        if (!draft) return { waitReduction: 0, capacityIncrease: 0, risk: "Indisponible" };
        const waitReduction =
            (draft.autoDistribution ? 8 : 0) + (draft.loadBalancing ? 7 : 0);
        const capacityIncrease =
            draft.assignmentStrategy === "manual" ? 0 : draft.minBandwidthMbps >= 5 ? 8 : 4;
        const risk =
            draft.consultationStartDelayMinutes <= 5 || !draft.loadBalancing
                ? "Modéré"
                : "Faible";
        return { waitReduction, capacityIncrease, risk };
    }, [draft]);

    const updateDraft = <K extends keyof SystemSettings>(
        key: K,
        value: SystemSettings[K]
    ) => {
        setDraftOverride((current) => {
            const base = current ?? settings;
            return base ? { ...base, [key]: value } : current;
        });
    };

    const updateUrgencyLevel = (
        level: number,
        update: Partial<SystemSettings["urgencyLevels"][number]>
    ) => {
        if (!draft) return;
        updateDraft(
            "urgencyLevels",
            draft.urgencyLevels.map((item) =>
                item.level === level ? { ...item, ...update } : item
            )
        );
    };

    const save = (nextSettings = draft) => {
        if (!nextSettings) return;
        updateSettings.mutate(pickEditableSettings(nextSettings), {
            onSuccess: () => setDraftOverride(null),
        });
    };

    const applyPreset = (preset: "urban" | "rural") => {
        if (!draft) return;
        setDraftOverride({
            ...draft,
            autoDistribution: true,
            loadBalancing: preset === "urban",
            assignmentStrategy: preset === "urban" ? "workload" : "specialty",
            defaultConsultationDuration: preset === "urban" ? 30 : 40,
            minBandwidthMbps: preset === "urban" ? 8 : 2,
        });
        toast.success(
            preset === "urban"
                ? "Préréglage centre urbain appliqué"
                : "Préréglage centre rural appliqué"
        );
    };

    const exportSettings = () => {
        if (!draft) return;
        const blob = new Blob([JSON.stringify(draft, null, 2)], {
            type: "application/json",
        });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `eagle-system-settings-${new Date().toISOString().slice(0, 10)}.json`;
        link.click();
        URL.revokeObjectURL(url);
        toast.success("Configuration exportée");
    };

    const importSettings = async (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        event.target.value = "";
        if (!file || !settings) return;

        try {
            const parsed = JSON.parse(await file.text()) as Partial<SystemSettings>;
            const imported: UpdateSystemSettingsDto = {};
            for (const key of importableKeys) {
                if (parsed[key] !== undefined) {
                    Object.assign(imported, { [key]: parsed[key] });
                }
            }
            setDraftOverride({ ...settings, ...imported });
            toast.success("Configuration importée. Vérifiez puis enregistrez.");
        } catch {
            toast.error("Le fichier de configuration est invalide");
        }
    };

    const formatDateTime = (value: unknown) => {
        const date = parseApiDate(value);
        return date
            ? new Intl.DateTimeFormat("fr-FR", {
                dateStyle: "medium",
                timeStyle: "short",
            }).format(date)
            : "Date indisponible";
    };

    if (isLoading || !draft) {
        return (
            <div className="flex h-full flex-col">
                <DashboardHeader breadcrumbs={[{ label: "Règles opérationnelles" }]} />
                <div className="space-y-4 p-6">
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-96 w-full" />
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex h-full flex-col">
                <DashboardHeader breadcrumbs={[{ label: "Règles opérationnelles" }]} />
                <div className="m-auto max-w-lg">
                    <Alert variant="destructive">
                        <AlertCircle className="size-4" />
                        <AlertTitle>Configuration indisponible</AlertTitle>
                        <AlertDescription className="space-y-3">
                            <p>{error.message}</p>
                            <Button variant="outline" onClick={() => refetch()}>
                                Réessayer
                            </Button>
                        </AlertDescription>
                    </Alert>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-full flex-col font-sans">
            <DashboardHeader
                breadcrumbs={[
                    { label: "Administration", href: "/admin" },
                    { label: "Règles opérationnelles" },
                ]}
                actions={
                    <div className="flex flex-wrap gap-2">
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="application/json"
                            className="hidden"
                            onChange={importSettings}
                        />
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <Upload className="mr-2 size-4" />
                            Importer
                        </Button>
                        <Button variant="outline" size="sm" onClick={exportSettings}>
                            <Download className="mr-2 size-4" />
                            Exporter
                        </Button>
                        <Button
                            size="sm"
                            disabled={!hasChanges || updateSettings.isPending}
                            onClick={() => save()}
                        >
                            <Save className="mr-2 size-4" />
                            {updateSettings.isPending
                                ? "Enregistrement..."
                                : "Enregistrer"}
                        </Button>
                    </div>
                }
            />

            <main className="flex-1 space-y-4 overflow-auto p-4">
                {hasChanges && (
                    <Alert>
                        <AlertCircle className="size-4" />
                        <AlertTitle>Modifications non enregistrées</AlertTitle>
                        <AlertDescription>
                            Enregistrez pour appliquer ces règles à l&apos;application.
                        </AlertDescription>
                    </Alert>
                )}

                <Tabs defaultValue="distribution" className="space-y-4">
                    <TabsList className="max-w-full justify-start overflow-x-auto">
                        <TabsTrigger value="distribution">Distribution</TabsTrigger>
                        <TabsTrigger value="urgency">Urgences</TabsTrigger>
                        <TabsTrigger value="consultation">Consultations</TabsTrigger>
                        <TabsTrigger value="simulation">Simulation</TabsTrigger>
                        <TabsTrigger value="history">Historique</TabsTrigger>
                    </TabsList>

                    <TabsContent value="distribution">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-base">
                                    <Users className="size-5" />
                                    Distribution des patients
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="flex items-center justify-between gap-4">
                                    <div>
                                        <Label>Distribution automatique</Label>
                                        <p className="text-sm text-muted-foreground">
                                            Affecter les patients aux médecins disponibles
                                        </p>
                                    </div>
                                    <Switch
                                        checked={draft.autoDistribution}
                                        onCheckedChange={(value) =>
                                            updateDraft("autoDistribution", value)
                                        }
                                    />
                                </div>
                                <div className="flex items-center justify-between gap-4">
                                    <div>
                                        <Label>Équilibrage de charge</Label>
                                        <p className="text-sm text-muted-foreground">
                                            Répartir les consultations entre les médecins
                                        </p>
                                    </div>
                                    <Switch
                                        checked={draft.loadBalancing}
                                        onCheckedChange={(value) =>
                                            updateDraft("loadBalancing", value)
                                        }
                                    />
                                </div>
                                <div className="max-w-md space-y-2">
                                    <Label>Stratégie d&apos;affectation</Label>
                                    <Select
                                        value={draft.assignmentStrategy}
                                        onValueChange={(value) =>
                                            updateDraft(
                                                "assignmentStrategy",
                                                value as SystemSettings["assignmentStrategy"]
                                            )
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="availability">Disponibilité</SelectItem>
                                            <SelectItem value="workload">Charge de travail</SelectItem>
                                            <SelectItem value="specialty">Spécialité</SelectItem>
                                            <SelectItem value="manual">Manuel</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="flex flex-wrap gap-2 border-t pt-4">
                                    <Button variant="outline" onClick={() => applyPreset("urban")}>
                                        Centre urbain
                                    </Button>
                                    <Button variant="outline" onClick={() => applyPreset("rural")}>
                                        Centre rural
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="urgency">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-base">
                                    <AlertTriangle className="size-5" />
                                    Niveaux d&apos;urgence
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="divide-y">
                                {draft.urgencyLevels.map((urgency) => (
                                    <div key={urgency.level} className="space-y-4 py-4 first:pt-0">
                                        <div className="flex flex-wrap items-center justify-between gap-3">
                                            <div className="flex items-center gap-3">
                                                <Badge className={urgencyBadgeClasses[urgency.level]}>
                                                    Niveau {urgency.level}
                                                </Badge>
                                                <span className="font-medium">
                                                    {urgencyNames[urgency.level]}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Label htmlFor={`notification-${urgency.level}`}>
                                                    Notification immédiate
                                                </Label>
                                                <Switch
                                                    id={`notification-${urgency.level}`}
                                                    checked={urgency.immediateNotification}
                                                    onCheckedChange={(value) =>
                                                        updateUrgencyLevel(urgency.level, {
                                                            immediateNotification: value,
                                                        })
                                                    }
                                                />
                                            </div>
                                        </div>
                                        <div className="grid gap-4 sm:grid-cols-2">
                                            <div className="space-y-2">
                                                <Label>Attente maximale (minutes)</Label>
                                                <Input
                                                    type="number"
                                                    min={1}
                                                    value={urgency.maxWaitMinutes}
                                                    onChange={(event) =>
                                                        updateUrgencyLevel(urgency.level, {
                                                            maxWaitMinutes: Math.max(
                                                                1,
                                                                Number(event.target.value)
                                                            ),
                                                        })
                                                    }
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Action en cas de dépassement</Label>
                                                <Select
                                                    value={urgency.overdueAction}
                                                    onValueChange={(value) =>
                                                        updateUrgencyLevel(urgency.level, {
                                                            overdueAction:
                                                                value as typeof urgency.overdueAction,
                                                        })
                                                    }
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="alert">Alerter</SelectItem>
                                                        <SelectItem value="escalate">Escalader</SelectItem>
                                                        <SelectItem value="reassign">Réaffecter</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="consultation">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-base">
                                    <Clock className="size-5" />
                                    Paramètres de consultation
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-7">
                                <div>
                                    <div className="mb-2 flex justify-between gap-4">
                                        <Label>Durée par défaut</Label>
                                        <span className="text-sm font-medium">
                                            {draft.defaultConsultationDuration} min
                                        </span>
                                    </div>
                                    <Slider
                                        value={[draft.defaultConsultationDuration]}
                                        min={5}
                                        max={120}
                                        step={5}
                                        onValueChange={([value]) =>
                                            updateDraft("defaultConsultationDuration", value)
                                        }
                                    />
                                </div>
                                <div>
                                    <div className="mb-2 flex justify-between gap-4">
                                        <Label>Bande passante minimale</Label>
                                        <span className="text-sm font-medium">
                                            {draft.minBandwidthMbps} Mbps
                                        </span>
                                    </div>
                                    <Slider
                                        value={[draft.minBandwidthMbps]}
                                        min={1}
                                        max={20}
                                        step={1}
                                        onValueChange={([value]) =>
                                            updateDraft("minBandwidthMbps", value)
                                        }
                                    />
                                </div>
                                <div>
                                    <div className="mb-2 flex justify-between gap-4">
                                        <Label>Alerte de retard au démarrage</Label>
                                        <span className="text-sm font-medium">
                                            {draft.consultationStartDelayMinutes} min
                                        </span>
                                    </div>
                                    <Slider
                                        value={[draft.consultationStartDelayMinutes]}
                                        min={1}
                                        max={30}
                                        step={1}
                                        onValueChange={([value]) =>
                                            updateDraft("consultationStartDelayMinutes", value)
                                        }
                                    />
                                </div>
                                <div className="flex items-center justify-between gap-4 border-t pt-5">
                                    <div>
                                        <Label>Enregistrement automatique</Label>
                                        <p className="text-sm text-muted-foreground">
                                            Enregistrer les sessions selon la politique de confidentialité
                                        </p>
                                    </div>
                                    <Switch
                                        checked={draft.autoRecordConsultations}
                                        onCheckedChange={(value) =>
                                            updateDraft("autoRecordConsultations", value)
                                        }
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="simulation">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-base">
                                    <Play className="size-5" />
                                    Simulation locale
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <p className="text-sm text-muted-foreground">
                                    Estimez l&apos;effet de la configuration actuelle avant de
                                    l&apos;enregistrer.
                                </p>
                                <Button onClick={() => setIsSimulationOpen(true)}>
                                    <Play className="mr-2 size-4" />
                                    Lancer la simulation
                                </Button>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="history">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-base">
                                    <History className="size-5" />
                                    Historique des modifications
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {isHistoryLoading ? (
                                    <div className="space-y-3">
                                        {[1, 2, 3].map((item) => (
                                            <Skeleton key={item} className="h-16 w-full" />
                                        ))}
                                    </div>
                                ) : history.length === 0 ? (
                                    <p className="py-8 text-center text-sm text-muted-foreground">
                                        Aucun changement enregistré pour le moment.
                                    </p>
                                ) : (
                                    <div className="divide-y">
                                        {history.map((entry) => (
                                            <div
                                                key={entry.id}
                                                className="flex flex-wrap items-center justify-between gap-3 py-4"
                                            >
                                                <div>
                                                    <p className="text-sm font-medium">
                                                        {entry.changes
                                                            .map(
                                                                (change) =>
                                                                    settingLabels[change] ?? change
                                                            )
                                                            .join(", ")}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {formatDateTime(entry.createdAt)}
                                                        {" · "}
                                                        {entry.updatedBy}
                                                    </p>
                                                </div>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    disabled={updateSettings.isPending}
                                                    onClick={() => save(entry.settings)}
                                                >
                                                    <RotateCcw className="mr-2 size-4" />
                                                    Restaurer
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </main>

            <Dialog open={isSimulationOpen} onOpenChange={setIsSimulationOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Résultats estimés</DialogTitle>
                        <DialogDescription>
                            Calcul indicatif basé sur les règles non enregistrées.
                        </DialogDescription>
                    </DialogHeader>
                    <dl className="grid gap-3 sm:grid-cols-3">
                        <div className="border p-3">
                            <dt className="text-xs text-muted-foreground">Attente</dt>
                            <dd className="text-xl font-bold text-green-700">
                                -{simulation.waitReduction}%
                            </dd>
                        </div>
                        <div className="border p-3">
                            <dt className="text-xs text-muted-foreground">Capacité</dt>
                            <dd className="text-xl font-bold text-blue-700">
                                +{simulation.capacityIncrease}%
                            </dd>
                        </div>
                        <div className="border p-3">
                            <dt className="text-xs text-muted-foreground">Surcharge</dt>
                            <dd className="text-xl font-bold">{simulation.risk}</dd>
                        </div>
                    </dl>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsSimulationOpen(false)}>
                            Fermer
                        </Button>
                        <Button
                            disabled={!hasChanges || updateSettings.isPending}
                            onClick={() => {
                                save();
                                setIsSimulationOpen(false);
                            }}
                        >
                            Enregistrer ces règles
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
