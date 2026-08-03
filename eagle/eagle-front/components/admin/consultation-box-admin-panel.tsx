"use client";

import { useMemo, useState } from "react";
import { DoorOpen, Loader2, Plus } from "lucide-react";
import { toast } from "sonner";
import {
    useAssignBoxSpecialty,
    useCreateConsultationBox,
    useHospitalConsultationBoxesQuery,
    useSpecialtiesQuery,
    useUpdateConsultationBoxStatus,
} from "@/hooks/queries";
import type { Hospital } from "@/types/api";
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
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

const STATUS_LABELS = {
    AVAILABLE: "Disponible",
    RESERVED: "Réservé",
    IN_USE: "En consultation",
    MAINTENANCE: "Maintenance",
    OFFLINE: "Hors ligne",
} as const;

const STATUS_CLASSES = {
    AVAILABLE: "bg-green-100 text-green-800",
    RESERVED: "bg-amber-100 text-amber-800",
    IN_USE: "bg-blue-100 text-blue-800",
    MAINTENANCE: "bg-orange-100 text-orange-800",
    OFFLINE: "bg-gray-100 text-gray-800",
} as const;

type AdminStatus = "AVAILABLE" | "MAINTENANCE" | "OFFLINE";

export function ConsultationBoxAdminPanel({
    hospital,
}: {
    hospital?: Hospital | null;
}) {
    const hospitalId = hospital?.type === "SUB" ? hospital.id : "";
    const boxesQuery = useHospitalConsultationBoxesQuery(hospitalId);
    const specialtiesQuery = useSpecialtiesQuery(true);
    const createBox = useCreateConsultationBox();
    const updateStatus = useUpdateConsultationBoxStatus();
    const assignSpecialty = useAssignBoxSpecialty();
    const [dialogOpen, setDialogOpen] = useState(false);
    const [code, setCode] = useState("");
    const [name, setName] = useState("");

    const specialtyNames = useMemo(
        () =>
            new Map(
                (specialtiesQuery.data || []).map((specialty) => [
                    specialty.id,
                    specialty.name,
                ]),
            ),
        [specialtiesQuery.data],
    );

    const handleCreate = () => {
        if (!hospitalId || !code.trim() || !name.trim()) {
            toast.error("Le code et le nom du box sont obligatoires");
            return;
        }
        createBox.mutate(
            {
                hospitalId,
                code: code.trim().toUpperCase(),
                name: name.trim(),
            },
            {
                onSuccess: () => {
                    toast.success("Box de consultation créé");
                    setDialogOpen(false);
                    setCode("");
                    setName("");
                },
                onError: (error) => toast.error(error.message),
            },
        );
    };

    const handleDialogOpenChange = (open: boolean) => {
        setDialogOpen(open);
        if (!open) {
            setCode("");
            setName("");
        }
    };

    return (
        <>
            <Card>
                <CardHeader className="flex-row items-center justify-between gap-3">
                    <div>
                        <CardTitle className="flex items-center gap-2 text-base">
                            <DoorOpen className="size-5" />
                            Box de consultation
                        </CardTitle>
                        <p className="mt-1 text-xs text-muted-foreground">
                            {hospital?.type === "SUB"
                                ? hospital.name
                                : "Sélectionnez un centre secondaire dans l'arborescence."}
                        </p>
                    </div>
                    {hospital?.type === "SUB" && (
                        <Button size="sm" onClick={() => handleDialogOpenChange(true)}>
                            <Plus className="mr-1.5 size-4" />
                            Nouveau box
                        </Button>
                    )}
                </CardHeader>
                {hospital?.type === "SUB" && (
                    <CardContent className="p-0">
                        {boxesQuery.isLoading ? (
                            <div className="space-y-2 p-4">
                                <Skeleton className="h-9 w-full" />
                                <Skeleton className="h-9 w-full" />
                            </div>
                        ) : boxesQuery.error ? (
                            <p className="p-4 text-sm text-destructive">
                                Impossible de charger les box de ce centre.
                            </p>
                        ) : (boxesQuery.data || []).length === 0 ? (
                            <div className="p-6 text-center text-sm text-muted-foreground">
                                Aucun box configuré pour ce centre.
                            </div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-24">Code</TableHead>
                                        <TableHead>Nom</TableHead>
                                        <TableHead>Spécialité active</TableHead>
                                        <TableHead className="w-44">Statut</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {(boxesQuery.data || []).map((box) => {
                                        const specialtyId =
                                            box.currentSpecialtyId || box.defaultSpecialtyId;
                                        const isOccupied = Boolean(box.activeVisitId);
                                        return (
                                            <TableRow key={box.id}>
                                                <TableCell className="font-semibold">
                                                    {box.code}
                                                </TableCell>
                                                <TableCell>{box.name}</TableCell>
                                                <TableCell>
                                                    <Select
                                                        value={specialtyId || ""}
                                                        onValueChange={(value) =>
                                                            assignSpecialty.mutate(
                                                                {
                                                                    boxId: box.id,
                                                                    data: { specialtyId: value },
                                                                },
                                                                {
                                                                    onSuccess: () =>
                                                                        toast.success(
                                                                            "Spécialité du box mise à jour",
                                                                        ),
                                                                    onError: (error) =>
                                                                        toast.error(error.message),
                                                                },
                                                            )
                                                        }
                                                        disabled={isOccupied}
                                                    >
                                                        <SelectTrigger className="h-8 w-48">
                                                            <SelectValue placeholder="Non affectée">
                                                                {specialtyId
                                                                    ? specialtyNames.get(specialtyId) ||
                                                                      "Spécialité affectée"
                                                                    : undefined}
                                                            </SelectValue>
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {(specialtiesQuery.data || []).map(
                                                                (specialty) => (
                                                                    <SelectItem
                                                                        key={specialty.id}
                                                                        value={specialty.id}
                                                                    >
                                                                        {specialty.name}
                                                                    </SelectItem>
                                                                ),
                                                            )}
                                                        </SelectContent>
                                                    </Select>
                                                </TableCell>
                                                <TableCell>
                                                    {box.status === "RESERVED" ||
                                                    box.status === "IN_USE" ? (
                                                        <Badge
                                                            className={STATUS_CLASSES[box.status]}
                                                        >
                                                            {STATUS_LABELS[box.status]}
                                                        </Badge>
                                                    ) : (
                                                        <Select
                                                            value={box.status}
                                                            onValueChange={(status) =>
                                                                updateStatus.mutate(
                                                                    {
                                                                        boxId: box.id,
                                                                        status: status as AdminStatus,
                                                                    },
                                                                    {
                                                                        onSuccess: () =>
                                                                            toast.success(
                                                                                "Statut du box mis à jour",
                                                                            ),
                                                                        onError: (error) =>
                                                                            toast.error(error.message),
                                                                    },
                                                                )
                                                            }
                                                            disabled={isOccupied}
                                                        >
                                                            <SelectTrigger className="h-8">
                                                                <SelectValue />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="AVAILABLE">
                                                                    Disponible
                                                                </SelectItem>
                                                                <SelectItem value="MAINTENANCE">
                                                                    Maintenance
                                                                </SelectItem>
                                                                <SelectItem value="OFFLINE">
                                                                    Hors ligne
                                                                </SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                )}
            </Card>

            <Dialog open={dialogOpen} onOpenChange={handleDialogOpenChange}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Nouveau box de consultation</DialogTitle>
                        <DialogDescription>
                            Créez un box pour {hospital?.name || "le centre sélectionné"}.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-2 sm:grid-cols-[120px_1fr]">
                        <div className="space-y-2">
                            <Label htmlFor="box-code">Code *</Label>
                            <Input
                                id="box-code"
                                value={code}
                                onChange={(event) =>
                                    setCode(event.target.value.toUpperCase())
                                }
                                maxLength={10}
                                placeholder="A"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="box-name">Nom *</Label>
                            <Input
                                id="box-name"
                                value={name}
                                onChange={(event) => setName(event.target.value)}
                                maxLength={80}
                                placeholder="Box A"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => handleDialogOpenChange(false)}
                        >
                            Annuler
                        </Button>
                        <Button
                            onClick={handleCreate}
                            disabled={
                                createBox.isPending || !code.trim() || !name.trim()
                            }
                        >
                            {createBox.isPending && (
                                <Loader2 className="mr-2 size-4 animate-spin" />
                            )}
                            Créer
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
