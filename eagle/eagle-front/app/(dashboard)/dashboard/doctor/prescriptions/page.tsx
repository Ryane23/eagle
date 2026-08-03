"use client";

import { useState, useCallback, useMemo } from "react";
import { DashboardHeader } from "@/components/layout/dashboard-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
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
    Pill,
    Search,
    Plus,
    User,
    Calendar,
    FileText,
    Download,
    Eye,
    Printer,
    CheckCircle,
    Clock,
    XCircle,
    RefreshCw,
    AlertTriangle,
    Trash2,
    Pencil,
    X,
} from "lucide-react";
import {
    usePrescriptionsQuery,
    useCreatePrescription,
    useUpdatePrescription,
    useDeletePrescription,
    useMarkPrescriptionAsDispensed,
    usePrescriptionStats,
    useConsultationsQuery,
} from "@/hooks/queries";
import type { Prescription, PrescriptionMedication } from "@/types/api";
import { toast } from "sonner";

const statusConfig = {
    active: { label: "Active", color: "bg-green-100 text-green-800", icon: CheckCircle },
    dispensed: { label: "Délivrée", color: "bg-blue-100 text-blue-800", icon: CheckCircle },
    expired: { label: "Expirée", color: "bg-gray-100 text-gray-800", icon: Clock },
    cancelled: { label: "Annulée", color: "bg-red-100 text-red-800", icon: XCircle },
} as const;

const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
        day: "numeric",
        month: "short",
        year: "numeric",
    });
};

const emptyMedication: PrescriptionMedication = {
    name: "",
    dosage: "",
    frequency: "",
    duration: "",
    quantity: undefined,
    notes: "",
};

export default function PrescriptionsPage() {
    const [searchQuery, setSearchQuery] = useState("");
    const [filterStatus, setFilterStatus] = useState("all");
    const [selectedPrescription, setSelectedPrescription] = useState<Prescription | null>(null);
    const [detailsOpen, setDetailsOpen] = useState(false);

    // Create/Edit dialog state
    const [formOpen, setFormOpen] = useState(false);
    const [editingPrescription, setEditingPrescription] = useState<Prescription | null>(null);
    const [formConsultationId, setFormConsultationId] = useState("");
    const [formPatientId, setFormPatientId] = useState("");
    const [formInstructions, setFormInstructions] = useState("");
    const [formMedications, setFormMedications] = useState<PrescriptionMedication[]>([{ ...emptyMedication }]);

    // Delete confirmation state
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    // TanStack Query - automatic caching, deduplication, and refetching
    const { data: prescriptions = [], isLoading, error, refetch } = usePrescriptionsQuery();
    const { data: consultations = [] } = useConsultationsQuery();
    const createMutation = useCreatePrescription();
    const updateMutation = useUpdatePrescription();
    const deleteMutation = useDeletePrescription();
    const markAsDispensedMutation = useMarkPrescriptionAsDispensed();
    const stats = usePrescriptionStats();

    // Completed consultations that can have prescriptions
    const availableConsultations = useMemo(() => {
        return consultations.filter(
            (c) => c.status === "completed" || c.status === "in_progress"
        );
    }, [consultations]);

    // Client-side filtering with useMemo for performance
    const filteredPrescriptions = useMemo(() => {
        return prescriptions.filter((rx) => {
            const patientName = rx.patient ? `${rx.patient.firstName} ${rx.patient.lastName}` : "";
            const matchesSearch =
                patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                rx.id.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesStatus = filterStatus === "all" || rx.status === filterStatus;
            return matchesSearch && matchesStatus;
        });
    }, [prescriptions, searchQuery, filterStatus]);

    const handleViewDetails = useCallback((prescription: Prescription) => {
        setSelectedPrescription(prescription);
        setDetailsOpen(true);
    }, []);

    const handleMarkAsDispensed = useCallback(
        async (id: string) => {
            markAsDispensedMutation.mutate(id);
        },
        [markAsDispensedMutation]
    );

    const handleRefresh = useCallback(() => {
        refetch();
        toast.success("Ordonnances actualisées");
    }, [refetch]);

    const handlePrint = useCallback(() => {
        toast.info("Impression en cours...");
        window.print();
    }, []);

    // --- Create / Edit handlers ---

    const resetForm = useCallback(() => {
        setEditingPrescription(null);
        setFormConsultationId("");
        setFormPatientId("");
        setFormInstructions("");
        setFormMedications([{ ...emptyMedication }]);
    }, []);

    const handleOpenCreate = useCallback(() => {
        resetForm();
        setFormOpen(true);
    }, [resetForm]);

    const handleOpenEdit = useCallback((prescription: Prescription) => {
        setEditingPrescription(prescription);
        setFormConsultationId(prescription.consultationId);
        setFormPatientId(prescription.patientId);
        setFormInstructions(prescription.instructions || "");
        setFormMedications(
            prescription.medications?.length
                ? prescription.medications.map((m) => ({ ...m }))
                : [{ ...emptyMedication }]
        );
        setDetailsOpen(false);
        setFormOpen(true);
    }, []);

    const handleAddMedication = useCallback(() => {
        setFormMedications((prev) => [...prev, { ...emptyMedication }]);
    }, []);

    const handleRemoveMedication = useCallback((index: number) => {
        setFormMedications((prev) => prev.filter((_, i) => i !== index));
    }, []);

    const handleMedicationChange = useCallback(
        (index: number, field: keyof PrescriptionMedication, value: string | number) => {
            setFormMedications((prev) =>
                prev.map((med, i) => (i === index ? { ...med, [field]: value } : med))
            );
        },
        []
    );

    const handleSubmitForm = useCallback(() => {
        // Validate required fields
        const validMedications = formMedications.filter(
            (m) => m.name.trim() && m.dosage.trim() && m.frequency.trim() && m.duration.trim()
        );
        if (validMedications.length === 0) {
            toast.error("Ajoutez au moins un médicament avec nom, dosage, fréquence et durée.");
            return;
        }

        if (editingPrescription) {
            // Update existing
            updateMutation.mutate(
                {
                    id: editingPrescription.id,
                    data: {
                        medications: validMedications,
                        instructions: formInstructions || undefined,
                    },
                },
                {
                    onSuccess: () => {
                        setFormOpen(false);
                        resetForm();
                    },
                }
            );
        } else {
            // Create new
            if (!formConsultationId) {
                toast.error("Sélectionnez une consultation.");
                return;
            }
            if (!formPatientId) {
                toast.error("Sélectionnez un patient.");
                return;
            }
            createMutation.mutate(
                {
                    consultationId: formConsultationId,
                    patientId: formPatientId,
                    medications: validMedications,
                    instructions: formInstructions || undefined,
                },
                {
                    onSuccess: () => {
                        setFormOpen(false);
                        resetForm();
                    },
                }
            );
        }
    }, [editingPrescription, formConsultationId, formPatientId, formInstructions, formMedications, createMutation, updateMutation, resetForm]);

    // --- Delete handler ---

    const handleRequestDelete = useCallback((id: string) => {
        setDeletingId(id);
        setDeleteOpen(true);
    }, []);

    const handleConfirmDelete = useCallback(() => {
        if (!deletingId) return;
        deleteMutation.mutate(deletingId, {
            onSuccess: () => {
                setDeleteOpen(false);
                setDeletingId(null);
                setDetailsOpen(false);
                setSelectedPrescription(null);
            },
        });
    }, [deletingId, deleteMutation]);

    if (error) {
        return (
            <div className="flex flex-col h-full">
                <DashboardHeader
                    breadcrumbs={[
                        { label: "Tableau de bord", href: "/dashboard/doctor" },
                        { label: "Ordonnances" },
                    ]}
                />
                <div className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                        <AlertTriangle className="size-12 mx-auto text-red-500 mb-4" />
                        <p className="text-lg font-medium text-red-600">{error.message}</p>
                        <Button onClick={handleRefresh} className="mt-4">
                            Réessayer
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full">
            <DashboardHeader
                breadcrumbs={[
                    { label: "Tableau de bord", href: "/dashboard/doctor" },
                    { label: "Ordonnances" },
                ]}
                actions={
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={handleRefresh}>
                            <RefreshCw className="size-4 mr-2" />
                            Actualiser
                        </Button>
                        <Button size="sm" onClick={handleOpenCreate}>
                            <Plus className="size-4 mr-1.5" />
                            Nouvelle ordonnance
                        </Button>
                    </div>
                }
            />

            <div className="flex-1 p-4 space-y-4 overflow-y-auto">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-xl font-bold text-primary flex items-center gap-2">
                            <Pill className="size-5" />
                            Mes ordonnances
                        </h1>
                        <p className="text-xs text-muted-foreground">
                            Gérez vos prescriptions médicales
                        </p>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-3 gap-3">
                    <Card>
                        <CardContent className="p-3">
                            <div className="flex items-center gap-2">
                                <div className="p-2 rounded-full bg-blue-100">
                                    <FileText className="size-4 text-blue-600" />
                                </div>
                                <div>
                                    {isLoading ? (
                                        <Skeleton className="h-6 w-8" />
                                    ) : (
                                        <p className="text-xl font-bold">{stats.total}</p>
                                    )}
                                    <p className="text-[10px] text-muted-foreground">Total</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-3">
                            <div className="flex items-center gap-2">
                                <div className="p-2 rounded-full bg-green-100">
                                    <CheckCircle className="size-4 text-green-600" />
                                </div>
                                <div>
                                    {isLoading ? (
                                        <Skeleton className="h-6 w-8" />
                                    ) : (
                                        <p className="text-xl font-bold">{stats.active}</p>
                                    )}
                                    <p className="text-[10px] text-muted-foreground">Actives</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-3">
                            <div className="flex items-center gap-2">
                                <div className="p-2 rounded-full bg-purple-100">
                                    <Pill className="size-4 text-purple-600" />
                                </div>
                                <div>
                                    {isLoading ? (
                                        <Skeleton className="h-6 w-8" />
                                    ) : (
                                        <p className="text-xl font-bold">{stats.dispensed}</p>
                                    )}
                                    <p className="text-[10px] text-muted-foreground">Délivrées</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Filters */}
                <Card>
                    <CardContent className="p-3">
                        <div className="flex items-center gap-2">
                            <div className="relative flex-1">
                                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                                <Input
                                    placeholder="Rechercher par patient ou numéro..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-9 h-9"
                                />
                            </div>
                            <Tabs value={filterStatus} onValueChange={setFilterStatus}>
                                <TabsList className="h-9">
                                    <TabsTrigger value="all" className="text-xs">
                                        Toutes
                                    </TabsTrigger>
                                    <TabsTrigger value="active" className="text-xs">
                                        Actives
                                    </TabsTrigger>
                                    <TabsTrigger value="dispensed" className="text-xs">
                                        Délivrées
                                    </TabsTrigger>
                                </TabsList>
                            </Tabs>
                        </div>
                    </CardContent>
                </Card>

                {/* Prescriptions List */}
                <Card>
                    <CardContent className="p-0">
                        <ScrollArea className="h-[calc(100vh-400px)]">
                            {isLoading ? (
                                <div className="p-4 space-y-3">
                                    {[...Array(5)].map((_, i) => (
                                        <div key={i} className="flex gap-3 p-3">
                                            <div className="flex-1 space-y-2">
                                                <Skeleton className="h-4 w-24" />
                                                <Skeleton className="h-5 w-48" />
                                                <Skeleton className="h-3 w-32" />
                                            </div>
                                            <Skeleton className="h-8 w-8" />
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="divide-y">
                                    {filteredPrescriptions.map((prescription) => {
                                        const status = prescription.status as keyof typeof statusConfig;
                                        const statusInfo = statusConfig[status] || statusConfig.active;
                                        const patientName = prescription.patient
                                            ? `${prescription.patient.firstName} ${prescription.patient.lastName}`
                                            : "Patient inconnu";

                                        return (
                                            <div
                                                key={prescription.id}
                                                className="p-3 hover:bg-muted/50 cursor-pointer"
                                                onClick={() => handleViewDetails(prescription)}
                                            >
                                                <div className="flex items-start justify-between">
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <span className="font-mono text-xs text-muted-foreground">
                                                                {prescription.id.slice(0, 12)}
                                                            </span>
                                                            <Badge className={statusInfo.color}>
                                                                {statusInfo.label}
                                                            </Badge>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <User className="size-4 text-muted-foreground" />
                                                            <span className="font-medium text-sm">
                                                                {patientName}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                                                            <span className="flex items-center gap-1">
                                                                <Calendar className="size-3" />
                                                                {formatDate(prescription.createdAt)}
                                                            </span>
                                                            <span className="flex items-center gap-1">
                                                                <Pill className="size-3" />
                                                                {prescription.medications?.length || 0} médicament(s)
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="size-8"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleViewDetails(prescription);
                                                            }}
                                                        >
                                                            <Eye className="size-4" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="size-8"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handlePrint();
                                                            }}
                                                        >
                                                            <Printer className="size-4" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                    {filteredPrescriptions.length === 0 && !isLoading && (
                                        <div className="p-8 text-center">
                                            <Pill className="size-12 mx-auto text-muted-foreground mb-2 opacity-50" />
                                            <p className="text-sm text-muted-foreground">
                                                Aucune ordonnance trouvée
                                            </p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </ScrollArea>
                    </CardContent>
                </Card>
            </div>

            {/* Details Modal */}
            <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Pill className="size-5" />
                            Ordonnance
                        </DialogTitle>
                        <DialogDescription>
                            {selectedPrescription?.id.slice(0, 12)}
                        </DialogDescription>
                    </DialogHeader>
                    {selectedPrescription && (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-medium">
                                        {selectedPrescription.patient
                                            ? `${selectedPrescription.patient.firstName} ${selectedPrescription.patient.lastName}`
                                            : "Patient inconnu"}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        {selectedPrescription.patient?.idNumber || "N/A"}
                                    </p>
                                </div>
                                <Badge
                                    className={
                                        statusConfig[selectedPrescription.status as keyof typeof statusConfig]
                                            ?.color || statusConfig.active.color
                                    }
                                >
                                    {statusConfig[selectedPrescription.status as keyof typeof statusConfig]
                                        ?.label || "Active"}
                                </Badge>
                            </div>

                            <div>
                                <p className="text-sm font-medium mb-2">Médicaments prescrits</p>
                                <div className="space-y-2">
                                    {selectedPrescription.medications?.map((med, idx) => (
                                        <div key={idx} className="p-2 bg-muted rounded-lg">
                                            <p className="font-medium text-sm">
                                                {med.name} {med.dosage}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {med.frequency} • {med.duration}
                                            </p>
                                        </div>
                                    )) || (
                                            <p className="text-sm text-muted-foreground">
                                                Aucun médicament
                                            </p>
                                        )}
                                </div>
                            </div>

                            {selectedPrescription.instructions && (
                                <div>
                                    <p className="text-sm font-medium mb-1">Instructions</p>
                                    <p className="text-sm bg-blue-50 p-2 rounded">
                                        {selectedPrescription.instructions}
                                    </p>
                                </div>
                            )}

                            <div className="flex gap-2 pt-2">
                                <Button
                                    className="flex-1"
                                    size="sm"
                                    onClick={handlePrint}
                                >
                                    <Printer className="size-4 mr-1.5" />
                                    Imprimer
                                </Button>
                                <Button variant="outline" className="flex-1" size="sm">
                                    <Download className="size-4 mr-1.5" />
                                    Télécharger
                                </Button>
                            </div>

                            {selectedPrescription.status === "active" && (
                                <div className="space-y-2">
                                    <Button
                                        variant="outline"
                                        className="w-full"
                                        disabled={markAsDispensedMutation.isPending}
                                        onClick={() => {
                                            handleMarkAsDispensed(selectedPrescription.id);
                                            setDetailsOpen(false);
                                        }}
                                    >
                                        <CheckCircle className="size-4 mr-1.5" />
                                        {markAsDispensedMutation.isPending
                                            ? "En cours..."
                                            : "Marquer comme délivrée"}
                                    </Button>
                                    <div className="flex gap-2">
                                        <Button
                                            variant="outline"
                                            className="flex-1"
                                            size="sm"
                                            onClick={() => handleOpenEdit(selectedPrescription)}
                                        >
                                            <Pencil className="size-4 mr-1.5" />
                                            Modifier
                                        </Button>
                                        <Button
                                            variant="destructive"
                                            className="flex-1"
                                            size="sm"
                                            onClick={() => {
                                                handleRequestDelete(selectedPrescription.id);
                                            }}
                                        >
                                            <Trash2 className="size-4 mr-1.5" />
                                            Supprimer
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* Create / Edit Prescription Dialog */}
            <Dialog open={formOpen} onOpenChange={(open) => { if (!open) { setFormOpen(false); resetForm(); } else { setFormOpen(true); } }}>
                <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Pill className="size-5" />
                            {editingPrescription ? "Modifier l'ordonnance" : "Nouvelle ordonnance"}
                        </DialogTitle>
                        <DialogDescription>
                            {editingPrescription
                                ? "Modifiez les médicaments et instructions de cette ordonnance."
                                : "Créez une nouvelle ordonnance pour un patient."}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4">
                        {/* Consultation selector (only for create) */}
                        {!editingPrescription && (
                            <div className="space-y-2">
                                <Label htmlFor="consultation">Consultation</Label>
                                <select
                                    id="consultation"
                                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                    value={formConsultationId}
                                    onChange={(e) => {
                                        setFormConsultationId(e.target.value);
                                        const consultation = availableConsultations.find(
                                            (c) => c.id === e.target.value
                                        );
                                        if (consultation?.patientId) {
                                            setFormPatientId(consultation.patientId);
                                        }
                                    }}
                                >
                                    <option value="">Sélectionnez une consultation...</option>
                                    {availableConsultations.map((c) => (
                                        <option key={c.id} value={c.id}>
                                            {c.patient
                                                ? `${c.patient.firstName} ${c.patient.lastName}`
                                                : c.patientId?.slice(0, 8)}{" "}
                                            - {new Date(c.createdAt).toLocaleDateString("fr-FR")}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {/* Medications */}
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label>Médicaments</Label>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={handleAddMedication}
                                >
                                    <Plus className="size-3 mr-1" />
                                    Ajouter
                                </Button>
                            </div>
                            <div className="space-y-3">
                                {formMedications.map((med, idx) => (
                                    <div
                                        key={idx}
                                        className="p-3 border rounded-lg space-y-2 relative"
                                    >
                                        {formMedications.length > 1 && (
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                className="absolute top-1 right-1 size-6"
                                                onClick={() => handleRemoveMedication(idx)}
                                            >
                                                <X className="size-3" />
                                            </Button>
                                        )}
                                        <div className="grid grid-cols-2 gap-2">
                                            <div>
                                                <Label className="text-xs">Nom *</Label>
                                                <Input
                                                    placeholder="Amoxicilline"
                                                    value={med.name}
                                                    onChange={(e) =>
                                                        handleMedicationChange(idx, "name", e.target.value)
                                                    }
                                                    className="h-8 text-sm"
                                                />
                                            </div>
                                            <div>
                                                <Label className="text-xs">Dosage *</Label>
                                                <Input
                                                    placeholder="500mg"
                                                    value={med.dosage}
                                                    onChange={(e) =>
                                                        handleMedicationChange(idx, "dosage", e.target.value)
                                                    }
                                                    className="h-8 text-sm"
                                                />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-2">
                                            <div>
                                                <Label className="text-xs">Fréquence *</Label>
                                                <Input
                                                    placeholder="3 fois/jour"
                                                    value={med.frequency}
                                                    onChange={(e) =>
                                                        handleMedicationChange(idx, "frequency", e.target.value)
                                                    }
                                                    className="h-8 text-sm"
                                                />
                                            </div>
                                            <div>
                                                <Label className="text-xs">Durée *</Label>
                                                <Input
                                                    placeholder="7 jours"
                                                    value={med.duration}
                                                    onChange={(e) =>
                                                        handleMedicationChange(idx, "duration", e.target.value)
                                                    }
                                                    className="h-8 text-sm"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <Label className="text-xs">Notes</Label>
                                            <Input
                                                placeholder="Prendre pendant les repas..."
                                                value={med.notes || ""}
                                                onChange={(e) =>
                                                    handleMedicationChange(idx, "notes", e.target.value)
                                                }
                                                className="h-8 text-sm"
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Instructions */}
                        <div className="space-y-2">
                            <Label htmlFor="instructions">Instructions générales</Label>
                            <Textarea
                                id="instructions"
                                placeholder="Instructions supplémentaires pour le patient..."
                                value={formInstructions}
                                onChange={(e) => setFormInstructions(e.target.value)}
                                rows={3}
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => {
                                setFormOpen(false);
                                resetForm();
                            }}
                        >
                            Annuler
                        </Button>
                        <Button
                            onClick={handleSubmitForm}
                            disabled={createMutation.isPending || updateMutation.isPending}
                        >
                            {(createMutation.isPending || updateMutation.isPending)
                                ? "En cours..."
                                : editingPrescription
                                    ? "Mettre à jour"
                                    : "Créer l'ordonnance"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Supprimer cette ordonnance ?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Cette action est irréversible. L&apos;ordonnance sera définitivement supprimée.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setDeletingId(null)}>
                            Annuler
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleConfirmDelete}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            disabled={deleteMutation.isPending}
                        >
                            {deleteMutation.isPending ? "Suppression..." : "Supprimer"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
