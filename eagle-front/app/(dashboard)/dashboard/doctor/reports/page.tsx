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
    FileText,
    Search,
    Plus,
    User,
    Calendar,
    Download,
    Eye,
    Edit,
    Trash2,
    RefreshCw,
    AlertTriangle,
    CheckCircle,
    Clock,
} from "lucide-react";
import {
    useMyReportsQuery,
    useCreateReport,
    useUpdateReport,
    useDeleteReport,
    useReportStats,
    usePatientsQuery,
} from "@/hooks/queries";
import type { Report, ReportStatus, ReportType } from "@/types/api";
import { toast } from "sonner";

const statusConfig: Record<ReportStatus, { label: string; color: string; icon: typeof CheckCircle }> = {
    draft: { label: "Brouillon", color: "bg-gray-100 text-gray-800", icon: Clock },
    final: { label: "Finalisé", color: "bg-green-100 text-green-800", icon: CheckCircle },
    amended: { label: "Modifié", color: "bg-blue-100 text-blue-800", icon: Edit },
};

const typeConfig: Record<ReportType, { label: string; color: string }> = {
    consultation: { label: "Consultation", color: "bg-blue-100 text-blue-800" },
    prescription: { label: "Ordonnance", color: "bg-green-100 text-green-800" },
    lab: { label: "Résultat labo", color: "bg-purple-100 text-purple-800" },
    imaging: { label: "Imagerie", color: "bg-orange-100 text-orange-800" },
    other: { label: "Autre", color: "bg-gray-100 text-gray-800" },
};

const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
        day: "numeric",
        month: "short",
        year: "numeric",
    });
};

export default function ReportsPage() {
    const [searchQuery, setSearchQuery] = useState("");
    const [filterStatus, setFilterStatus] = useState<"all" | ReportStatus>("all");
    const filterType: "all" | ReportType = "all"; // TODO: Add type filter UI
    const [selectedReport, setSelectedReport] = useState<Report | null>(null);
    const [detailsOpen, setDetailsOpen] = useState(false);

    // Create/Edit dialog state
    const [formOpen, setFormOpen] = useState(false);
    const [editingReport, setEditingReport] = useState<Report | null>(null);
    const [formTitle, setFormTitle] = useState("");
    const [formContent, setFormContent] = useState("");
    const [formType, setFormType] = useState<ReportType>("consultation");
    const [formPatientId, setFormPatientId] = useState("");

    // Delete confirmation state
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    // TanStack Query
    const { data: reports = [], isLoading, error, refetch } = useMyReportsQuery();
    const { data: patients = [] } = usePatientsQuery();
    const createMutation = useCreateReport();
    const updateMutation = useUpdateReport();
    const deleteMutation = useDeleteReport();
    const stats = useReportStats();

    // Client-side filtering with useMemo
    const filteredReports = useMemo(() => {
        return reports.filter((report) => {
            const matchesSearch =
                report.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                report.content?.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesStatus = filterStatus === "all" || report.status === filterStatus;
            const matchesType = filterType === "all" || report.type === filterType;
            return matchesSearch && matchesStatus && matchesType;
        });
    }, [reports, searchQuery, filterStatus, filterType]);

    const handleViewDetails = useCallback((report: Report) => {
        setSelectedReport(report);
        setDetailsOpen(true);
    }, []);

    const handleRefresh = useCallback(() => {
        refetch();
        toast.success("Rapports actualisés");
    }, [refetch]);

    // --- Create / Edit handlers ---

    const resetForm = useCallback(() => {
        setEditingReport(null);
        setFormTitle("");
        setFormContent("");
        setFormType("consultation");
        setFormPatientId("");
    }, []);

    const handleOpenCreate = useCallback(() => {
        resetForm();
        setFormOpen(true);
    }, [resetForm]);

    const handleOpenEdit = useCallback((report: Report) => {
        setEditingReport(report);
        setFormTitle(report.title);
        setFormContent(report.content || "");
        setFormType(report.type);
        setFormPatientId(report.patientId);
        setDetailsOpen(false);
        setFormOpen(true);
    }, []);

    const handleSubmitForm = useCallback(() => {
        if (!formTitle.trim()) {
            toast.error("Le titre est obligatoire.");
            return;
        }
        if (!formContent.trim()) {
            toast.error("Le contenu est obligatoire.");
            return;
        }

        if (editingReport) {
            updateMutation.mutate(
                {
                    id: editingReport.id,
                    data: {
                        title: formTitle,
                        content: formContent,
                        type: formType,
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
            if (!formPatientId) {
                toast.error("Sélectionnez un patient.");
                return;
            }
            createMutation.mutate(
                {
                    patientId: formPatientId,
                    type: formType,
                    title: formTitle,
                    content: formContent,
                },
                {
                    onSuccess: () => {
                        setFormOpen(false);
                        resetForm();
                    },
                }
            );
        }
    }, [editingReport, formTitle, formContent, formType, formPatientId, createMutation, updateMutation, resetForm]);

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
                setSelectedReport(null);
            },
        });
    }, [deletingId, deleteMutation]);

    if (error) {
        return (
            <div className="flex flex-col h-full">
                <DashboardHeader
                    breadcrumbs={[
                        { label: "Tableau de bord", href: "/dashboard/doctor" },
                        { label: "Rapports" },
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
                    { label: "Rapports" },
                ]}
                actions={
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={handleRefresh}>
                            <RefreshCw className="size-4 mr-2" />
                            Actualiser
                        </Button>
                        <Button size="sm" onClick={handleOpenCreate}>
                            <Plus className="size-4 mr-1.5" />
                            Nouveau rapport
                        </Button>
                    </div>
                }
            />

            <div className="flex-1 p-4 space-y-4 overflow-y-auto">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-xl font-bold text-primary flex items-center gap-2">
                            <FileText className="size-5" />
                            Mes rapports
                        </h1>
                        <p className="text-xs text-muted-foreground">
                            Gérez vos rapports médicaux
                        </p>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-4 gap-3">
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
                                <div className="p-2 rounded-full bg-gray-100">
                                    <Clock className="size-4 text-gray-600" />
                                </div>
                                <div>
                                    {isLoading ? (
                                        <Skeleton className="h-6 w-8" />
                                    ) : (
                                        <p className="text-xl font-bold">{stats.draft}</p>
                                    )}
                                    <p className="text-[10px] text-muted-foreground">Brouillons</p>
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
                                        <p className="text-xl font-bold">{stats.final}</p>
                                    )}
                                    <p className="text-[10px] text-muted-foreground">Finalisés</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-3">
                            <div className="flex items-center gap-2">
                                <div className="p-2 rounded-full bg-blue-100">
                                    <Edit className="size-4 text-blue-600" />
                                </div>
                                <div>
                                    {isLoading ? (
                                        <Skeleton className="h-6 w-8" />
                                    ) : (
                                        <p className="text-xl font-bold">{stats.amended}</p>
                                    )}
                                    <p className="text-[10px] text-muted-foreground">Modifiés</p>
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
                                    placeholder="Rechercher par titre ou contenu..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-9 h-9"
                                />
                            </div>
                            <Tabs
                                value={filterStatus}
                                onValueChange={(v) => setFilterStatus(v as "all" | ReportStatus)}
                            >
                                <TabsList className="h-9">
                                    <TabsTrigger value="all" className="text-xs">
                                        Tous
                                    </TabsTrigger>
                                    <TabsTrigger value="draft" className="text-xs">
                                        Brouillons
                                    </TabsTrigger>
                                    <TabsTrigger value="final" className="text-xs">
                                        Finalisés
                                    </TabsTrigger>
                                </TabsList>
                            </Tabs>
                        </div>
                    </CardContent>
                </Card>

                {/* Reports List */}
                <Card>
                    <CardContent className="p-0">
                        <ScrollArea className="h-[calc(100vh-420px)]">
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
                                    {filteredReports.map((report) => {
                                        const statusInfo = statusConfig[report.status] || statusConfig.draft;
                                        const typeInfo = typeConfig[report.type] || typeConfig.other;

                                        return (
                                            <div
                                                key={report.id}
                                                className="p-3 hover:bg-muted/50 cursor-pointer"
                                                onClick={() => handleViewDetails(report)}
                                            >
                                                <div className="flex items-start justify-between">
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <Badge className={statusInfo.color}>
                                                                {statusInfo.label}
                                                            </Badge>
                                                            <Badge variant="outline" className={typeInfo.color}>
                                                                {typeInfo.label}
                                                            </Badge>
                                                        </div>
                                                        <p className="font-medium text-sm">
                                                            {report.title}
                                                        </p>
                                                        {report.patient && (
                                                            <div className="flex items-center gap-2 mt-1">
                                                                <User className="size-3 text-muted-foreground" />
                                                                <span className="text-xs text-muted-foreground">
                                                                    {report.patient.firstName} {report.patient.lastName}
                                                                </span>
                                                            </div>
                                                        )}
                                                        <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                                                            <span className="flex items-center gap-1">
                                                                <Calendar className="size-3" />
                                                                {formatDate(report.createdAt)}
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
                                                                handleViewDetails(report);
                                                            }}
                                                        >
                                                            <Eye className="size-4" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="size-8 text-red-500"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleRequestDelete(report.id);
                                                            }}
                                                        >
                                                            <Trash2 className="size-4" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                    {filteredReports.length === 0 && !isLoading && (
                                        <div className="p-8 text-center">
                                            <FileText className="size-12 mx-auto text-muted-foreground mb-2 opacity-50" />
                                            <p className="text-sm text-muted-foreground">
                                                Aucun rapport trouvé
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
                            <FileText className="size-5" />
                            {selectedReport?.title}
                        </DialogTitle>
                        <DialogDescription>
                            {selectedReport && formatDate(selectedReport.createdAt)}
                        </DialogDescription>
                    </DialogHeader>
                    {selectedReport && (
                        <div className="space-y-4">
                            <div className="flex items-center gap-2">
                                <Badge className={statusConfig[selectedReport.status]?.color}>
                                    {statusConfig[selectedReport.status]?.label}
                                </Badge>
                                <Badge variant="outline" className={typeConfig[selectedReport.type]?.color}>
                                    {typeConfig[selectedReport.type]?.label}
                                </Badge>
                            </div>

                            {selectedReport.patient && (
                                <div>
                                    <p className="text-sm font-medium mb-1">Patient</p>
                                    <p className="text-sm text-muted-foreground">
                                        {selectedReport.patient.firstName} {selectedReport.patient.lastName}
                                    </p>
                                </div>
                            )}

                            <div>
                                <p className="text-sm font-medium mb-1">Contenu</p>
                                <div className="text-sm bg-muted p-3 rounded-lg max-h-48 overflow-y-auto">
                                    {selectedReport.content || "Aucun contenu"}
                                </div>
                            </div>

                            <div className="flex gap-2 pt-2">
                                <Button
                                    className="flex-1"
                                    size="sm"
                                    onClick={() => handleOpenEdit(selectedReport)}
                                >
                                    <Edit className="size-4 mr-1.5" />
                                    Modifier
                                </Button>
                                <Button variant="outline" className="flex-1" size="sm">
                                    <Download className="size-4 mr-1.5" />
                                    Télécharger
                                </Button>
                            </div>
                            <Button
                                variant="destructive"
                                size="sm"
                                className="w-full"
                                onClick={() => handleRequestDelete(selectedReport.id)}
                            >
                                <Trash2 className="size-4 mr-1.5" />
                                Supprimer
                            </Button>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* Create / Edit Report Dialog */}
            <Dialog open={formOpen} onOpenChange={(open) => { if (!open) { setFormOpen(false); resetForm(); } else { setFormOpen(true); } }}>
                <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <FileText className="size-5" />
                            {editingReport ? "Modifier le rapport" : "Nouveau rapport"}
                        </DialogTitle>
                        <DialogDescription>
                            {editingReport
                                ? "Modifiez le contenu de ce rapport médical."
                                : "Créez un nouveau rapport médical."}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4">
                        {/* Patient selector (only for create) */}
                        {!editingReport && (
                            <div className="space-y-2">
                                <Label htmlFor="patient">Patient</Label>
                                <select
                                    id="patient"
                                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                    value={formPatientId}
                                    onChange={(e) => setFormPatientId(e.target.value)}
                                >
                                    <option value="">Sélectionnez un patient...</option>
                                    {patients.map((p) => (
                                        <option key={p.id} value={p.id}>
                                            {p.firstName} {p.lastName}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {/* Report type */}
                        <div className="space-y-2">
                            <Label htmlFor="type">Type de rapport</Label>
                            <select
                                id="type"
                                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                value={formType}
                                onChange={(e) => setFormType(e.target.value as ReportType)}
                            >
                                <option value="consultation">Consultation</option>
                                <option value="prescription">Ordonnance</option>
                                <option value="lab">Résultat labo</option>
                                <option value="imaging">Imagerie</option>
                                <option value="other">Autre</option>
                            </select>
                        </div>

                        {/* Title */}
                        <div className="space-y-2">
                            <Label htmlFor="title">Titre *</Label>
                            <Input
                                id="title"
                                placeholder="Titre du rapport..."
                                value={formTitle}
                                onChange={(e) => setFormTitle(e.target.value)}
                            />
                        </div>

                        {/* Content */}
                        <div className="space-y-2">
                            <Label htmlFor="content">Contenu *</Label>
                            <Textarea
                                id="content"
                                placeholder="Contenu du rapport médical..."
                                value={formContent}
                                onChange={(e) => setFormContent(e.target.value)}
                                rows={8}
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
                                : editingReport
                                    ? "Mettre à jour"
                                    : "Créer le rapport"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Supprimer ce rapport ?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Cette action est irréversible. Le rapport sera définitivement supprimé.
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
