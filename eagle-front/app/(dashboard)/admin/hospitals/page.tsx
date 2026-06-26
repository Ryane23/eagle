"use client";

import { useState, useCallback } from "react";
import { DashboardHeader } from "@/components/layout/dashboard-header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
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
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Building2,
    Search,
    MoreHorizontal,
    Edit,
    Trash2,
    Ban,
    CheckCircle,
    Loader2,
    RefreshCw,
    AlertCircle,
    Plus,
    MapPin,
} from "lucide-react";
import { toast } from "sonner";
import {
    useHospitalsQuery,
    useHospitalStats,
    useCreateHospital,
    useUpdateHospital,
    useDeleteHospital,
    useActivateHospital,
    useDeactivateHospital,
    hospitalKeys,
} from "@/hooks/queries";
import { useQueryClient } from "@tanstack/react-query";
import type { Hospital, HospitalType, CreateHospitalDto } from "@/types/api";

const TYPE_LABELS: Record<HospitalType, string> = {
    PRIMARY: "Centre Principal",
    SECONDARY: "Centre Secondaire",
};

const TYPE_COLORS: Record<HospitalType, string> = {
    PRIMARY: "bg-blue-100 text-blue-800",
    SECONDARY: "bg-purple-100 text-purple-800",
};

type CreateHospitalForm = {
    name: string;
    type: HospitalType;
    address: string;
    city: string;
    country: string;
    contactPhone: string;
    contactEmail: string;
};

const initialFormState: CreateHospitalForm = {
    name: "",
    type: "SECONDARY",
    address: "",
    city: "",
    country: "Cameroun",
    contactPhone: "",
    contactEmail: "",
};

export default function HospitalsPage() {
    const queryClient = useQueryClient();
    const [searchQuery, setSearchQuery] = useState("");
    const [typeFilter, setTypeFilter] = useState<HospitalType | "all">("all");
    const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
    const [createModalOpen, setCreateModalOpen] = useState(false);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [selectedHospital, setSelectedHospital] = useState<Hospital | null>(null);
    const [formData, setFormData] = useState<CreateHospitalForm>(initialFormState);

    // TanStack Query hooks
    const { data: hospitals = [], isLoading, error, refetch } = useHospitalsQuery({
        type: typeFilter === "all" ? undefined : typeFilter,
        status: statusFilter,
        search: searchQuery,
    });
    const stats = useHospitalStats();

    // Mutations
    const createHospitalMutation = useCreateHospital();
    const updateHospitalMutation = useUpdateHospital();
    const deleteHospitalMutation = useDeleteHospital();
    const activateHospitalMutation = useActivateHospital();
    const deactivateHospitalMutation = useDeactivateHospital();

    const handleRefresh = useCallback(() => {
        queryClient.invalidateQueries({ queryKey: hospitalKeys.all });
        toast.success("Centres actualisés");
    }, [queryClient]);

    const handleCreateHospital = useCallback(async () => {
        if (!formData.name || !formData.city) {
            toast.error("Veuillez remplir tous les champs obligatoires");
            return;
        }

        const createData: CreateHospitalDto = {
            name: formData.name,
            type: formData.type,
            address: formData.address,
            city: formData.city,
            country: formData.country,
            contactPhone: formData.contactPhone,
            contactEmail: formData.contactEmail,
        };

        createHospitalMutation.mutate(createData, {
            onSuccess: () => {
                setCreateModalOpen(false);
                setFormData(initialFormState);
            },
        });
    }, [formData, createHospitalMutation]);

    const handleUpdateHospital = useCallback(async () => {
        if (!selectedHospital) return;

        updateHospitalMutation.mutate(
            {
                id: selectedHospital.id,
                data: {
                    name: formData.name,
                    type: formData.type,
                    address: formData.address,
                    city: formData.city,
                    country: formData.country,
                    contactPhone: formData.contactPhone,
                    contactEmail: formData.contactEmail,
                },
            },
            {
                onSuccess: () => {
                    setEditModalOpen(false);
                    setSelectedHospital(null);
                    setFormData(initialFormState);
                },
            }
        );
    }, [selectedHospital, formData, updateHospitalMutation]);

    const handleDeleteHospital = useCallback(
        (hospitalId: string) => {
            if (confirm("Êtes-vous sûr de vouloir supprimer ce centre ?")) {
                deleteHospitalMutation.mutate(hospitalId);
            }
        },
        [deleteHospitalMutation]
    );

    const handleToggleStatus = useCallback(
        (hospital: Hospital) => {
            if (hospital.isActive) {
                deactivateHospitalMutation.mutate(hospital.id);
            } else {
                activateHospitalMutation.mutate(hospital.id);
            }
        },
        [activateHospitalMutation, deactivateHospitalMutation]
    );

    const openEditModal = useCallback((hospital: Hospital) => {
        setSelectedHospital(hospital);
        setFormData({
            name: hospital.name,
            type: hospital.type,
            address: hospital.address || "",
            city: hospital.city || "",
            country: hospital.country || "Cameroun",
            contactPhone: hospital.contactPhone || "",
            contactEmail: hospital.contactEmail || "",
        });
        setEditModalOpen(true);
    }, []);

    if (error) {
        return (
            <div className="flex flex-col h-full">
                <DashboardHeader
                    breadcrumbs={[
                        { label: "Administration", href: "/admin" },
                        { label: "Centres" },
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
                    { label: "Centres" },
                ]}
                actions={
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={handleRefresh}>
                            <RefreshCw className="size-4 mr-2" />
                            Actualiser
                        </Button>
                        <Button size="sm" onClick={() => setCreateModalOpen(true)}>
                            <Plus className="size-4 mr-1.5" />
                            Nouveau centre
                        </Button>
                    </div>
                }
            />

            <div className="flex-1 p-4 space-y-4 overflow-y-auto">
                {/* Stats */}
                <div className="grid grid-cols-4 gap-3">
                    <Card>
                        <CardContent className="p-3">
                            <div className="flex items-center gap-2">
                                <div className="p-2 rounded-full bg-blue-100">
                                    <Building2 className="size-4 text-blue-600" />
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
                                    <p className="text-[10px] text-muted-foreground">Actifs</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-3">
                            <div className="flex items-center gap-2">
                                <div className="p-2 rounded-full bg-blue-100">
                                    <Building2 className="size-4 text-blue-600" />
                                </div>
                                <div>
                                    {isLoading ? (
                                        <Skeleton className="h-6 w-8" />
                                    ) : (
                                        <p className="text-xl font-bold">{stats.primary}</p>
                                    )}
                                    <p className="text-[10px] text-muted-foreground">Principaux</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-3">
                            <div className="flex items-center gap-2">
                                <div className="p-2 rounded-full bg-purple-100">
                                    <Building2 className="size-4 text-purple-600" />
                                </div>
                                <div>
                                    {isLoading ? (
                                        <Skeleton className="h-6 w-8" />
                                    ) : (
                                        <p className="text-xl font-bold">{stats.secondary}</p>
                                    )}
                                    <p className="text-[10px] text-muted-foreground">Secondaires</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Filters */}
                <Card>
                    <CardContent className="p-3">
                        <div className="flex items-center gap-3">
                            <div className="relative flex-1">
                                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                                <Input
                                    placeholder="Rechercher par nom ou ville..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-9 h-9"
                                />
                            </div>
                            <Select
                                value={typeFilter}
                                onValueChange={(v) => setTypeFilter(v as HospitalType | "all")}
                            >
                                <SelectTrigger className="w-48 h-9">
                                    <SelectValue placeholder="Type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Tous les types</SelectItem>
                                    {Object.entries(TYPE_LABELS).map(([value, label]) => (
                                        <SelectItem key={value} value={value}>
                                            {label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Select
                                value={statusFilter}
                                onValueChange={(v) => setStatusFilter(v as "all" | "active" | "inactive")}
                            >
                                <SelectTrigger className="w-36 h-9">
                                    <SelectValue placeholder="Statut" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Tous</SelectItem>
                                    <SelectItem value="active">Actifs</SelectItem>
                                    <SelectItem value="inactive">Inactifs</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent>
                </Card>

                {/* Hospitals Table */}
                <Card>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Centre</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Localisation</TableHead>
                                    <TableHead>Statut</TableHead>
                                    <TableHead className="w-12"></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    [...Array(5)].map((_, i) => (
                                        <TableRow key={i}>
                                            <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                                            <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                                            <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                                            <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                                            <TableCell><Skeleton className="h-8 w-8" /></TableCell>
                                        </TableRow>
                                    ))
                                ) : hospitals.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center py-8">
                                            <Building2 className="size-10 mx-auto text-muted-foreground mb-2 opacity-50" />
                                            <p className="text-sm text-muted-foreground">
                                                Aucun centre trouvé
                                            </p>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    hospitals.map((hospital) => (
                                        <TableRow key={hospital.id}>
                                            <TableCell>
                                                <p className="font-medium">{hospital.name}</p>
                                            </TableCell>
                                            <TableCell>
                                                <Badge className={TYPE_COLORS[hospital.type]}>
                                                    {TYPE_LABELS[hospital.type]}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                                    <MapPin className="size-3" />
                                                    {hospital.city || "-"}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge
                                                    className={
                                                        hospital.isActive
                                                            ? "bg-green-100 text-green-800"
                                                            : "bg-gray-100 text-gray-800"
                                                    }
                                                >
                                                    {hospital.isActive ? "Actif" : "Inactif"}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="size-8">
                                                            <MoreHorizontal className="size-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem onClick={() => openEditModal(hospital)}>
                                                            <Edit className="size-4 mr-2" />
                                                            Modifier
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => handleToggleStatus(hospital)}>
                                                            {hospital.isActive ? (
                                                                <>
                                                                    <Ban className="size-4 mr-2" />
                                                                    Désactiver
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <CheckCircle className="size-4 mr-2" />
                                                                    Activer
                                                                </>
                                                            )}
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem
                                                            className="text-red-600"
                                                            onClick={() => handleDeleteHospital(hospital.id)}
                                                        >
                                                            <Trash2 className="size-4 mr-2" />
                                                            Supprimer
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>

            {/* Create Modal */}
            <Dialog open={createModalOpen} onOpenChange={setCreateModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Nouveau centre</DialogTitle>
                        <DialogDescription>
                            Créez un nouveau centre de santé
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label>Nom *</Label>
                            <Input
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="Hôpital Central"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Type</Label>
                            <Select
                                value={formData.type}
                                onValueChange={(v) => setFormData({ ...formData, type: v as HospitalType })}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {Object.entries(TYPE_LABELS).map(([value, label]) => (
                                        <SelectItem key={value} value={value}>
                                            {label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Ville *</Label>
                                <Input
                                    value={formData.city}
                                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                    placeholder="Yaoundé"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Pays</Label>
                                <Input
                                    value={formData.country}
                                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                                    placeholder="Cameroun"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Adresse</Label>
                            <Input
                                value={formData.address}
                                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                placeholder="123 Rue de la Santé"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Téléphone</Label>
                                <Input
                                    value={formData.contactPhone}
                                    onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                                    placeholder="+237 6XX XXX XXX"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Email</Label>
                                <Input
                                    type="email"
                                    value={formData.contactEmail}
                                    onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                                    placeholder="contact@hospital.cm"
                                />
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setCreateModalOpen(false)}>
                            Annuler
                        </Button>
                        <Button
                            onClick={handleCreateHospital}
                            disabled={createHospitalMutation.isPending}
                        >
                            {createHospitalMutation.isPending && (
                                <Loader2 className="size-4 mr-2 animate-spin" />
                            )}
                            Créer
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Edit Modal */}
            <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Modifier le centre</DialogTitle>
                        <DialogDescription>
                            Modifiez les informations du centre
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label>Nom</Label>
                            <Input
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Type</Label>
                            <Select
                                value={formData.type}
                                onValueChange={(v) => setFormData({ ...formData, type: v as HospitalType })}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {Object.entries(TYPE_LABELS).map(([value, label]) => (
                                        <SelectItem key={value} value={value}>
                                            {label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Ville</Label>
                                <Input
                                    value={formData.city}
                                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Pays</Label>
                                <Input
                                    value={formData.country}
                                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Adresse</Label>
                            <Input
                                value={formData.address}
                                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Téléphone</Label>
                                <Input
                                    value={formData.contactPhone}
                                    onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Email</Label>
                                <Input
                                    type="email"
                                    value={formData.contactEmail}
                                    onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setEditModalOpen(false)}>
                            Annuler
                        </Button>
                        <Button
                            onClick={handleUpdateHospital}
                            disabled={updateHospitalMutation.isPending}
                        >
                            {updateHospitalMutation.isPending && (
                                <Loader2 className="size-4 mr-2 animate-spin" />
                            )}
                            Enregistrer
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
