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
    UserPlus,
    Search,
    MoreHorizontal,
    Edit,
    Trash2,
    Ban,
    CheckCircle,
    Loader2,
    RefreshCw,
    AlertCircle,
    Users,
} from "lucide-react";
import { toast } from "sonner";
import {
    useUsersQuery,
    useUserStats,
    useCreateUser,
    useUpdateUser,
    useDeleteUser,
    useActivateUser,
    useDeactivateUser,
    useHospitalsQuery,
    userKeys,
} from "@/hooks/queries";
import { useQueryClient } from "@tanstack/react-query";
import type { User, UserRole, RegisterData } from "@/types/api";

const ROLE_LABELS: Record<UserRole, string> = {
    admin: "Administrateur",
    primary_secretary: "Secrétaire Principal",
    secondary_secretary: "Secrétaire Secondaire",
    doctor: "Médecin",
    nurse: "Infirmier(ère)",
};

const STATUS_COLORS: Record<string, string> = {
    active: "bg-green-100 text-green-800",
    inactive: "bg-gray-100 text-gray-800",
    suspended: "bg-red-100 text-red-800",
};

const STATUS_LABELS: Record<string, string> = {
    active: "Actif",
    inactive: "Inactif",
    suspended: "Suspendu",
};

type CreateUserForm = {
    name: string;
    email: string;
    password: string;
    role: UserRole;
    hospitalId: string;
};

const initialFormState: CreateUserForm = {
    name: "",
    email: "",
    password: "",
    role: "secondary_secretary",
    hospitalId: "",
};

export default function UsersPage() {
    const queryClient = useQueryClient();
    const [searchQuery, setSearchQuery] = useState("");
    const [roleFilter, setRoleFilter] = useState<UserRole | "all">("all");
    const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
    const [createModalOpen, setCreateModalOpen] = useState(false);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [formData, setFormData] = useState<CreateUserForm>(initialFormState);

    // TanStack Query hooks
    const { data: users = [], isLoading, error, refetch } = useUsersQuery({
        role: roleFilter === "all" ? undefined : roleFilter,
        status: statusFilter,
        search: searchQuery,
    });
    const { data: hospitals = [] } = useHospitalsQuery();
    const stats = useUserStats();

    // Mutations
    const createUserMutation = useCreateUser();
    const updateUserMutation = useUpdateUser();
    const deleteUserMutation = useDeleteUser();
    const activateUserMutation = useActivateUser();
    const deactivateUserMutation = useDeactivateUser();

    const handleRefresh = useCallback(() => {
        queryClient.invalidateQueries({ queryKey: userKeys.all });
        toast.success("Utilisateurs actualisés");
    }, [queryClient]);

    const handleCreateUser = useCallback(async () => {
        if (!formData.name || !formData.email || !formData.password) {
            toast.error("Veuillez remplir tous les champs obligatoires");
            return;
        }

        const createData: RegisterData = {
            name: formData.name,
            email: formData.email,
            password: formData.password,
            role: formData.role,
            hospitalId: formData.hospitalId || undefined,
        };

        createUserMutation.mutate(createData, {
            onSuccess: () => {
                setCreateModalOpen(false);
                setFormData(initialFormState);
            },
        });
    }, [formData, createUserMutation]);

    const handleUpdateUser = useCallback(async () => {
        if (!selectedUser) return;

        updateUserMutation.mutate(
            {
                id: selectedUser.id,
                data: {
                    name: formData.name,
                    email: formData.email,
                    role: formData.role,
                    hospitalId: formData.hospitalId || undefined,
                },
            },
            {
                onSuccess: () => {
                    setEditModalOpen(false);
                    setSelectedUser(null);
                    setFormData(initialFormState);
                },
            }
        );
    }, [selectedUser, formData, updateUserMutation]);

    const handleDeleteUser = useCallback(
        (userId: string) => {
            if (confirm("Êtes-vous sûr de vouloir supprimer cet utilisateur ?")) {
                deleteUserMutation.mutate(userId);
            }
        },
        [deleteUserMutation]
    );

    const handleToggleStatus = useCallback(
        (user: User) => {
            if (user.isActive) {
                deactivateUserMutation.mutate(user.id);
            } else {
                activateUserMutation.mutate(user.id);
            }
        },
        [activateUserMutation, deactivateUserMutation]
    );

    const openEditModal = useCallback((user: User) => {
        setSelectedUser(user);
        setFormData({
            name: user.name,
            email: user.email,
            password: "",
            role: user.role,
            hospitalId: user.hospitalId || "",
        });
        setEditModalOpen(true);
    }, []);

    if (error) {
        return (
            <div className="flex flex-col h-full">
                <DashboardHeader
                    breadcrumbs={[
                        { label: "Administration", href: "/admin" },
                        { label: "Utilisateurs" },
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
                    { label: "Utilisateurs" },
                ]}
                actions={
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={handleRefresh}>
                            <RefreshCw className="size-4 mr-2" />
                            Actualiser
                        </Button>
                        <Button size="sm" onClick={() => setCreateModalOpen(true)}>
                            <UserPlus className="size-4 mr-1.5" />
                            Nouvel utilisateur
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
                                    <Users className="size-4 text-blue-600" />
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
                                <div className="p-2 rounded-full bg-purple-100">
                                    <Users className="size-4 text-purple-600" />
                                </div>
                                <div>
                                    {isLoading ? (
                                        <Skeleton className="h-6 w-8" />
                                    ) : (
                                        <p className="text-xl font-bold">{stats.doctors}</p>
                                    )}
                                    <p className="text-[10px] text-muted-foreground">Médecins</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-3">
                            <div className="flex items-center gap-2">
                                <div className="p-2 rounded-full bg-orange-100">
                                    <Users className="size-4 text-orange-600" />
                                </div>
                                <div>
                                    {isLoading ? (
                                        <Skeleton className="h-6 w-8" />
                                    ) : (
                                        <p className="text-xl font-bold">{stats.nurses}</p>
                                    )}
                                    <p className="text-[10px] text-muted-foreground">Infirmiers</p>
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
                                    placeholder="Rechercher par nom ou email..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-9 h-9"
                                />
                            </div>
                            <Select
                                value={roleFilter}
                                onValueChange={(v) => setRoleFilter(v as UserRole | "all")}
                            >
                                <SelectTrigger className="w-48 h-9">
                                    <SelectValue placeholder="Rôle" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Tous les rôles</SelectItem>
                                    {Object.entries(ROLE_LABELS).map(([value, label]) => (
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

                {/* Users Table */}
                <Card>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Utilisateur</TableHead>
                                    <TableHead>Rôle</TableHead>
                                    <TableHead>Centre</TableHead>
                                    <TableHead>Statut</TableHead>
                                    <TableHead className="w-12"></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    [...Array(5)].map((_, i) => (
                                        <TableRow key={i}>
                                            <TableCell>
                                                <Skeleton className="h-4 w-32" />
                                            </TableCell>
                                            <TableCell>
                                                <Skeleton className="h-4 w-24" />
                                            </TableCell>
                                            <TableCell>
                                                <Skeleton className="h-4 w-28" />
                                            </TableCell>
                                            <TableCell>
                                                <Skeleton className="h-5 w-16" />
                                            </TableCell>
                                            <TableCell>
                                                <Skeleton className="h-8 w-8" />
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : users.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center py-8">
                                            <Users className="size-10 mx-auto text-muted-foreground mb-2 opacity-50" />
                                            <p className="text-sm text-muted-foreground">
                                                Aucun utilisateur trouvé
                                            </p>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    users.map((user) => (
                                        <TableRow key={user.id}>
                                            <TableCell>
                                                <div>
                                                    <p className="font-medium">{user.name}</p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {user.email}
                                                    </p>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline">
                                                    {ROLE_LABELS[user.role] || user.role}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-sm text-muted-foreground">
                                                {user.hospital?.name || "-"}
                                            </TableCell>
                                            <TableCell>
                                                <Badge
                                                    className={
                                                        STATUS_COLORS[user.isActive ? "active" : "inactive"]
                                                    }
                                                >
                                                    {STATUS_LABELS[user.isActive ? "active" : "inactive"]}
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
                                                        <DropdownMenuItem onClick={() => openEditModal(user)}>
                                                            <Edit className="size-4 mr-2" />
                                                            Modifier
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => handleToggleStatus(user)}>
                                                            {user.isActive ? (
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
                                                            onClick={() => handleDeleteUser(user.id)}
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
                        <DialogTitle>Nouvel utilisateur</DialogTitle>
                        <DialogDescription>
                            Créez un nouveau compte utilisateur
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label>Nom complet *</Label>
                            <Input
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="Dr. Jean Dupont"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Email *</Label>
                            <Input
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                placeholder="jean.dupont@example.com"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Mot de passe *</Label>
                            <Input
                                type="password"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                placeholder="••••••••"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Rôle</Label>
                            <Select
                                value={formData.role}
                                onValueChange={(v) => setFormData({ ...formData, role: v as UserRole })}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {Object.entries(ROLE_LABELS).map(([value, label]) => (
                                        <SelectItem key={value} value={value}>
                                            {label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Centre de santé</Label>
                            <Select
                                value={formData.hospitalId}
                                onValueChange={(v) => setFormData({ ...formData, hospitalId: v })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Sélectionner un centre" />
                                </SelectTrigger>
                                <SelectContent>
                                    {hospitals.map((hospital) => (
                                        <SelectItem key={hospital.id} value={hospital.id}>
                                            {hospital.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setCreateModalOpen(false)}>
                            Annuler
                        </Button>
                        <Button
                            onClick={handleCreateUser}
                            disabled={createUserMutation.isPending}
                        >
                            {createUserMutation.isPending && (
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
                        <DialogTitle>Modifier utilisateur</DialogTitle>
                        <DialogDescription>
                            Modifiez les informations de cet utilisateur
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label>Nom complet</Label>
                            <Input
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Email</Label>
                            <Input
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Rôle</Label>
                            <Select
                                value={formData.role}
                                onValueChange={(v) => setFormData({ ...formData, role: v as UserRole })}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {Object.entries(ROLE_LABELS).map(([value, label]) => (
                                        <SelectItem key={value} value={value}>
                                            {label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Centre de santé</Label>
                            <Select
                                value={formData.hospitalId}
                                onValueChange={(v) => setFormData({ ...formData, hospitalId: v })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Sélectionner un centre" />
                                </SelectTrigger>
                                <SelectContent>
                                    {hospitals.map((hospital) => (
                                        <SelectItem key={hospital.id} value={hospital.id}>
                                            {hospital.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setEditModalOpen(false)}>
                            Annuler
                        </Button>
                        <Button
                            onClick={handleUpdateUser}
                            disabled={updateUserMutation.isPending}
                        >
                            {updateUserMutation.isPending && (
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
