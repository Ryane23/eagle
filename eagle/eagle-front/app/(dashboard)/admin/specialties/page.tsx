"use client";

import { useState } from "react";
import { DashboardHeader } from "@/components/layout/dashboard-header";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Stethoscope,
    Plus,
    MoreHorizontal,
    Edit,
    Trash2,
    CheckCircle,
    Ban,
    Search,
    Loader2,
} from "lucide-react";
import { toast } from "sonner";
import {
    useSpecialtiesQuery,
    useCreateSpecialty,
    useUpdateSpecialty,
    useDeleteSpecialty,
    useActivateSpecialty,
    useDeactivateSpecialty,
} from "@/hooks/queries";

export default function SpecialtiesPage() {
    const { data: specialties = [], isLoading } = useSpecialtiesQuery();
    const createMutation = useCreateSpecialty();
    const updateMutation = useUpdateSpecialty();
    const deleteMutation = useDeleteSpecialty();
    const activateMutation = useActivateSpecialty();
    const deactivateMutation = useDeactivateSpecialty();

    const [searchQuery, setSearchQuery] = useState("");
    const [formOpen, setFormOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formName, setFormName] = useState("");
    const [formDescription, setFormDescription] = useState("");

    const filtered = specialties.filter((s) =>
        s.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const resetForm = () => {
        setEditingId(null);
        setFormName("");
        setFormDescription("");
    };

    const handleOpenCreate = () => {
        resetForm();
        setFormOpen(true);
    };

    const handleOpenEdit = (specialty: { id: string; name: string; description?: string }) => {
        setEditingId(specialty.id);
        setFormName(specialty.name);
        setFormDescription(specialty.description || "");
        setFormOpen(true);
    };

    const handleSubmit = () => {
        if (!formName.trim()) {
            toast.error("Le nom est requis");
            return;
        }

        const data = { name: formName, description: formDescription || undefined };

        if (editingId) {
            updateMutation.mutate(
                { id: editingId, data },
                { onSuccess: () => { setFormOpen(false); resetForm(); } }
            );
        } else {
            createMutation.mutate(data as { name: string; description?: string }, {
                onSuccess: () => { setFormOpen(false); resetForm(); },
            });
        }
    };

    const handleDelete = (id: string) => {
        deleteMutation.mutate(id);
    };

    return (
        <>
            <DashboardHeader
                breadcrumbs={[
                    { label: "Administration", href: "/admin" },
                    { label: "Spécialités" },
                ]}
                actions={
                    <Button size="sm" onClick={handleOpenCreate}>
                        <Plus className="mr-2 size-4" />
                        Nouvelle spécialité
                    </Button>
                }
            />

            <div className="flex-1 space-y-4 p-4 md:p-6">
                <Card>
                    <CardHeader className="pb-3">
                        <div className="flex items-center gap-3">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                                <Input
                                    placeholder="Rechercher une spécialité..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-9"
                                />
                            </div>
                            <Badge variant="secondary">{specialties.length} spécialités</Badge>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <div className="flex items-center justify-center py-8">
                                <Loader2 className="size-6 animate-spin" />
                            </div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Nom</TableHead>
                                        <TableHead>Description</TableHead>
                                        <TableHead>Statut</TableHead>
                                        <TableHead className="w-[60px]" />
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filtered.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                                                Aucune spécialité trouvée
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        filtered.map((specialty) => (
                                            <TableRow key={specialty.id}>
                                                <TableCell className="font-medium">
                                                    <div className="flex items-center gap-2">
                                                        <Stethoscope className="size-4 text-muted-foreground" />
                                                        {specialty.name}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-muted-foreground">
                                                    {specialty.description || "—"}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant={specialty.isActive ? "default" : "secondary"}>
                                                        {specialty.isActive ? "Actif" : "Inactif"}
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
                                                            <DropdownMenuItem onClick={() => handleOpenEdit(specialty)}>
                                                                <Edit className="mr-2 size-4" />
                                                                Modifier
                                                            </DropdownMenuItem>
                                                            {specialty.isActive ? (
                                                                <DropdownMenuItem onClick={() => deactivateMutation.mutate(specialty.id)}>
                                                                    <Ban className="mr-2 size-4" />
                                                                    Désactiver
                                                                </DropdownMenuItem>
                                                            ) : (
                                                                <DropdownMenuItem onClick={() => activateMutation.mutate(specialty.id)}>
                                                                    <CheckCircle className="mr-2 size-4" />
                                                                    Activer
                                                                </DropdownMenuItem>
                                                            )}
                                                            <DropdownMenuSeparator />
                                                            <DropdownMenuItem
                                                                className="text-destructive"
                                                                onClick={() => handleDelete(specialty.id)}
                                                            >
                                                                <Trash2 className="mr-2 size-4" />
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
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Create/Edit Dialog */}
            <Dialog open={formOpen} onOpenChange={setFormOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editingId ? "Modifier la spécialité" : "Nouvelle spécialité"}</DialogTitle>
                        <DialogDescription>
                            {editingId ? "Modifiez les informations de la spécialité." : "Ajoutez une nouvelle spécialité médicale."}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Nom *</Label>
                            <Input
                                id="name"
                                value={formName}
                                onChange={(e) => setFormName(e.target.value)}
                                placeholder="Ex: Cardiologie"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="description">Description</Label>
                            <Input
                                id="description"
                                value={formDescription}
                                onChange={(e) => setFormDescription(e.target.value)}
                                placeholder="Description de la spécialité"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setFormOpen(false)}>Annuler</Button>
                        <Button
                            onClick={handleSubmit}
                            disabled={createMutation.isPending || updateMutation.isPending}
                        >
                            {(createMutation.isPending || updateMutation.isPending) && (
                                <Loader2 className="mr-2 size-4 animate-spin" />
                            )}
                            {editingId ? "Enregistrer" : "Créer"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
