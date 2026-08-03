"use client";

import { useState, useCallback } from "react";
import { DashboardHeader } from "@/components/layout/dashboard-header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    AlertTriangle,
    Search,
    Plus,
    RefreshCw,
    AlertCircle,
    Clock,
    CheckCircle,
    XCircle,
    Loader2,
    Eye,
    Trash2,
} from "lucide-react";
import { toast } from "sonner";
import {
    useComplaintsQuery,
    useComplaintStats,
    useCreateComplaint,
    useUpdateComplaint,
    useDeleteComplaint,
    complaintKeys,
} from "@/hooks/queries";
import { useQueryClient } from "@tanstack/react-query";
import type { Complaint, ComplaintStatus, ComplaintType, CreateComplaintDto } from "@/types/api";
import { AdminQuickStats } from "@/components/admin/admin-quick-stats";

const STATUS_CONFIG: Record<ComplaintStatus, { label: string; color: string; icon: typeof Clock }> = {
    open: { label: "Ouvert", color: "bg-yellow-100 text-yellow-800", icon: Clock },
    in_progress: { label: "En cours", color: "bg-blue-100 text-blue-800", icon: AlertCircle },
    resolved: { label: "Résolu", color: "bg-green-100 text-green-800", icon: CheckCircle },
    closed: { label: "Fermé", color: "bg-gray-100 text-gray-800", icon: XCircle },
};

const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
};

type CreateComplaintForm = {
    subject: string;
    description: string;
    type: ComplaintType;
    priority: "low" | "medium" | "high";
};

const initialFormState: CreateComplaintForm = {
    subject: "",
    description: "",
    type: "technical",
    priority: "medium",
};

export default function IncidentsPage() {
    const queryClient = useQueryClient();
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState<ComplaintStatus | "all">("all");
    const [createModalOpen, setCreateModalOpen] = useState(false);
    const [detailsModalOpen, setDetailsModalOpen] = useState(false);
    const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
    const [formData, setFormData] = useState<CreateComplaintForm>(initialFormState);

    // TanStack Query hooks
    const { data: complaints = [], isLoading, error, refetch } = useComplaintsQuery({
        status: statusFilter === "all" ? undefined : statusFilter,
        search: searchQuery,
    });
    const stats = useComplaintStats();

    // Mutations
    const createComplaintMutation = useCreateComplaint();
    const updateComplaintMutation = useUpdateComplaint();
    const deleteComplaintMutation = useDeleteComplaint();

    const handleRefresh = useCallback(() => {
        queryClient.invalidateQueries({ queryKey: complaintKeys.all });
        toast.success("Incidents actualisés");
    }, [queryClient]);

    const handleCreateComplaint = useCallback(async () => {
        if (!formData.subject || !formData.description) {
            toast.error("Veuillez remplir tous les champs obligatoires");
            return;
        }

        const createData: CreateComplaintDto = {
            subject: formData.subject,
            description: formData.description,
            type: formData.type,
            priority: formData.priority,
        };

        createComplaintMutation.mutate(createData, {
            onSuccess: () => {
                setCreateModalOpen(false);
                setFormData(initialFormState);
            },
        });
    }, [formData, createComplaintMutation]);

    const handleUpdateStatus = useCallback(
        (complaint: Complaint, newStatus: ComplaintStatus) => {
            updateComplaintMutation.mutate({
                id: complaint.id,
                data: { status: newStatus },
            });
        },
        [updateComplaintMutation]
    );

    const handleDeleteComplaint = useCallback(
        (complaintId: string) => {
            if (confirm("Êtes-vous sûr de vouloir supprimer cet incident ?")) {
                deleteComplaintMutation.mutate(complaintId);
            }
        },
        [deleteComplaintMutation]
    );

    const openDetails = useCallback((complaint: Complaint) => {
        setSelectedComplaint(complaint);
        setDetailsModalOpen(true);
    }, []);

    if (error) {
        return (
            <div className="flex flex-col h-full">
                <DashboardHeader
                    breadcrumbs={[
                        { label: "Administration", href: "/admin" },
                        { label: "Incidents" },
                    ]}
                />
                <div className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                        <AlertCircle className="size-12 mx-auto text-red-500 mb-4" />
                        <p className="text-lg font-medium text-red-600">{error.message}</p>
                        <Button onClick={() => refetch()} className="mt-4">
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
                    { label: "Administration", href: "/admin" },
                    { label: "Incidents" },
                ]}
                actions={
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={handleRefresh}>
                            <RefreshCw className="size-4 mr-2" />
                            Actualiser
                        </Button>
                        <Button size="sm" onClick={() => setCreateModalOpen(true)}>
                            <Plus className="size-4 mr-1.5" />
                            Nouvel incident
                        </Button>
                    </div>
                }
            />

            <div className="flex-1 p-4 space-y-4 overflow-y-auto">
                <AdminQuickStats
                    isLoading={isLoading}
                    stats={[
                        {
                            label: "Total",
                            value: stats.total,
                            icon: AlertTriangle,
                            color: "text-blue-500",
                        },
                        {
                            label: "Ouverts",
                            value: stats.open,
                            icon: Clock,
                            color: "text-yellow-600",
                        },
                        {
                            label: "En cours",
                            value: stats.inProgress,
                            icon: AlertCircle,
                            color: "text-blue-600",
                        },
                        {
                            label: "Résolus",
                            value: stats.resolved,
                            icon: CheckCircle,
                            color: "text-green-500",
                        },
                    ]}
                />

                {/* Filters */}
                <Card>
                    <CardContent className="p-3">
                        <div className="flex flex-col gap-3 md:flex-row md:items-center">
                            <div className="relative flex-1">
                                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                                <Input
                                    placeholder="Rechercher par titre..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-9 h-9"
                                />
                            </div>
                            <Select
                                value={statusFilter}
                                onValueChange={(v) => setStatusFilter(v as ComplaintStatus | "all")}
                            >
                                <SelectTrigger className="h-9 w-full md:w-36">
                                    <SelectValue placeholder="Statut" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Tous</SelectItem>
                                    {Object.entries(STATUS_CONFIG).map(([value, config]) => (
                                        <SelectItem key={value} value={value}>
                                            {config.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent>
                </Card>

                {/* Incidents List */}
                <Card>
                    <CardContent className="p-0">
                        <ScrollArea className="h-[calc(100vh-380px)]">
                            {isLoading ? (
                                <div className="p-4 space-y-3">
                                    {[...Array(5)].map((_, i) => (
                                        <div key={i} className="flex gap-3 p-3">
                                            <div className="flex-1 space-y-2">
                                                <Skeleton className="h-4 w-48" />
                                                <Skeleton className="h-3 w-64" />
                                                <Skeleton className="h-3 w-32" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : complaints.length === 0 ? (
                                <div className="p-8 text-center">
                                    <AlertTriangle className="size-10 mx-auto text-muted-foreground mb-2 opacity-50" />
                                    <p className="text-sm text-muted-foreground">
                                        Aucun incident trouvé
                                    </p>
                                </div>
                            ) : (
                                <div className="divide-y">
                                    {complaints.map((complaint) => {
                                        const statusConfig = STATUS_CONFIG[complaint.status] || STATUS_CONFIG.open;
                                        const StatusIcon = statusConfig.icon;

                                        return (
                                            <div
                                                key={complaint.id}
                                                className="p-3 hover:bg-muted/50 cursor-pointer"
                                                onClick={() => openDetails(complaint)}
                                            >
                                                <div className="flex items-start justify-between">
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <StatusIcon className="size-4" />
                                                            <span className="font-medium text-sm">
                                                                {complaint.subject}
                                                            </span>
                                                            <Badge className={statusConfig.color}>
                                                                {statusConfig.label}
                                                            </Badge>
                                                        </div>
                                                        <p className="text-xs text-muted-foreground line-clamp-2">
                                                            {complaint.description}
                                                        </p>
                                                        <p className="text-[10px] text-muted-foreground mt-1">
                                                            {formatDate(complaint.createdAt)}
                                                        </p>
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="size-8"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                openDetails(complaint);
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
                                                                handleDeleteComplaint(complaint.id);
                                                            }}
                                                        >
                                                            <Trash2 className="size-4" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </ScrollArea>
                    </CardContent>
                </Card>
            </div>

            {/* Create Modal */}
            <Dialog open={createModalOpen} onOpenChange={setCreateModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Nouvel incident</DialogTitle>
                        <DialogDescription>
                            Signalez un nouvel incident
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label>Sujet *</Label>
                            <Input
                                value={formData.subject}
                                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                placeholder="Sujet de l'incident"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Description *</Label>
                            <Textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                placeholder="Décrivez l'incident..."
                                rows={4}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Type</Label>
                                <Select
                                    value={formData.type}
                                    onValueChange={(v) => setFormData({ ...formData, type: v as ComplaintType })}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="technical">Technique</SelectItem>
                                        <SelectItem value="medical">Médical</SelectItem>
                                        <SelectItem value="administrative">Administratif</SelectItem>
                                        <SelectItem value="other">Autre</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Priorité</Label>
                                <Select
                                    value={formData.priority}
                                    onValueChange={(v) =>
                                        setFormData({ ...formData, priority: v as "low" | "medium" | "high" })
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="low">Basse</SelectItem>
                                        <SelectItem value="medium">Moyenne</SelectItem>
                                        <SelectItem value="high">Haute</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setCreateModalOpen(false)}>
                            Annuler
                        </Button>
                        <Button
                            onClick={handleCreateComplaint}
                            disabled={createComplaintMutation.isPending}
                        >
                            {createComplaintMutation.isPending && (
                                <Loader2 className="size-4 mr-2 animate-spin" />
                            )}
                            Créer
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Details Modal */}
            <Dialog open={detailsModalOpen} onOpenChange={setDetailsModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{selectedComplaint?.subject}</DialogTitle>
                        <DialogDescription>
                            {selectedComplaint && formatDate(selectedComplaint.createdAt)}
                        </DialogDescription>
                    </DialogHeader>
                    {selectedComplaint && (
                        <div className="space-y-4">
                            <div className="flex items-center gap-2">
                                <Badge className={STATUS_CONFIG[selectedComplaint.status]?.color}>
                                    {STATUS_CONFIG[selectedComplaint.status]?.label}
                                </Badge>
                                <Badge variant="outline">{selectedComplaint.type}</Badge>
                            </div>
                            <div>
                                <p className="text-sm font-medium mb-1">Description</p>
                                <p className="text-sm text-muted-foreground">
                                    {selectedComplaint.description}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm font-medium mb-2">Changer le statut</p>
                                <div className="flex gap-2">
                                    {Object.entries(STATUS_CONFIG).map(([status, config]) => (
                                        <Button
                                            key={status}
                                            variant={selectedComplaint.status === status ? "default" : "outline"}
                                            size="sm"
                                            onClick={() =>
                                                handleUpdateStatus(selectedComplaint, status as ComplaintStatus)
                                            }
                                            disabled={updateComplaintMutation.isPending}
                                        >
                                            {config.label}
                                        </Button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
