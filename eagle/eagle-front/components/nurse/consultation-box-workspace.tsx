"use client";

import { useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { DoorOpen, Stethoscope, UserRound, Video } from "lucide-react";
import {
    useAssignBoxSpecialty,
    useConsultationBoxesQuery,
    useNurseTeleconsultationConsultationsQuery,
    useSpecialtiesQuery,
} from "@/hooks/queries";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { parseApiDate } from "@/lib/utils";

const statusLabel = {
    AVAILABLE: "Disponible",
    RESERVED: "Réservé",
    IN_USE: "En consultation",
    MAINTENANCE: "Maintenance",
    OFFLINE: "Hors ligne",
} as const;

const emptySubscribe = () => () => {};

export function ConsultationBoxWorkspace() {
    const boxesQuery = useConsultationBoxesQuery();
    const consultationsQuery = useNurseTeleconsultationConsultationsQuery();
    const specialtiesQuery = useSpecialtiesQuery(true);
    const assignSpecialty = useAssignBoxSpecialty();
    const [selectedBoxId, setSelectedBoxId] = useState("");
    const requestedBoxId = useSyncExternalStore(
        emptySubscribe,
        () => new URLSearchParams(window.location.search).get("box") || "",
        () => "",
    );
    const boxes = boxesQuery.data || [];
    const consultations = consultationsQuery.data || [];
    const specialties = specialtiesQuery.data || [];

    if (boxesQuery.isLoading) {
        return <Skeleton className="h-80 w-full" />;
    }

    if (boxesQuery.error) {
        return (
            <Card className="border-destructive/40">
                <CardContent className="p-6 text-destructive">
                    Impossible de charger les box de consultation du centre.
                </CardContent>
            </Card>
        );
    }

    if (boxes.length === 0) {
        return (
            <Card>
                <CardContent className="p-8 text-center">
                    <DoorOpen className="mx-auto mb-3 size-10 text-muted-foreground" />
                    <p className="font-medium">Aucun box configuré pour ce centre</p>
                    <p className="text-sm text-muted-foreground">
                        L&apos;administrateur doit créer Box A et Box B.
                    </p>
                </CardContent>
            </Card>
        );
    }

    const activeBoxId =
        selectedBoxId ||
        (boxes.some((box) => box.id === requestedBoxId)
            ? requestedBoxId
            : boxes[0].id);

    return (
        <Tabs
            value={activeBoxId}
            onValueChange={setSelectedBoxId}
            className="space-y-4"
        >
            <TabsList className="h-auto max-w-full justify-start overflow-x-auto">
                {boxes.map((box) => (
                    <TabsTrigger key={box.id} value={box.id} className="gap-2" asChild>
                        <Link
                            href={`/dashboard/nurse/consultation?box=${encodeURIComponent(box.id)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <DoorOpen className="size-4" />
                            {box.name}
                            <Badge variant="secondary">{statusLabel[box.status]}</Badge>
                        </Link>
                    </TabsTrigger>
                ))}
            </TabsList>

            {boxes.map((box) => {
                const specialtyId = box.currentSpecialtyId || box.defaultSpecialtyId;
                const active = consultations.find(
                    (consultation) =>
                        consultation.boxId === box.id &&
                        consultation.status === "in_progress",
                );
                const upcoming = consultations.filter(
                    (consultation) =>
                        consultation.status === "scheduled" &&
                        consultation.boxId === box.id,
                );

                return (
                    <TabsContent key={box.id} value={box.id}>
                        <div className="grid gap-4 lg:grid-cols-3">
                            <Card className="lg:col-span-2">
                                <CardHeader className="flex-row items-center justify-between">
                                    <CardTitle className="flex items-center gap-2 text-base">
                                        <Stethoscope className="size-5" />
                                        {box.name}
                                    </CardTitle>
                                    <Select
                                        value={specialtyId || ""}
                                        onValueChange={(value) =>
                                            assignSpecialty.mutate({
                                                boxId: box.id,
                                                data: { specialtyId: value },
                                            })
                                        }
                                    >
                                        <SelectTrigger className="w-48">
                                            <SelectValue placeholder="Affecter une spécialité" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {specialties.map((specialty) => (
                                                <SelectItem key={specialty.id} value={specialty.id}>
                                                    {specialty.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </CardHeader>
                                <CardContent>
                                    {active ? (
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-3">
                                                <UserRound className="size-8 text-primary" />
                                                <div>
                                                    <p className="font-semibold">
                                                        {active.patient
                                                            ? `${active.patient.firstName} ${active.patient.lastName}`
                                                            : "Patient"}
                                                    </p>
                                                    <p className="text-sm text-muted-foreground">
                                                        {active.doctor?.name || "Médecin assigné"}
                                                    </p>
                                                </div>
                                            </div>
                                            <Button asChild>
                                                <Link
                                                    href={`/dashboard/nurse/teleconsultation?consultation=${encodeURIComponent(active.id)}&box=${encodeURIComponent(box.id)}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                >
                                                    <Video className="mr-2 size-4" />
                                                    Rejoindre la consultation
                                                </Link>
                                            </Button>
                                        </div>
                                    ) : (
                                        <div className="py-12 text-center text-muted-foreground">
                                            Aucun patient en consultation dans ce box.
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-base">Patients suivants</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-2">
                                    {upcoming.length === 0 && (
                                        <p className="text-sm text-muted-foreground">
                                            Aucun patient programmé.
                                        </p>
                                    )}
                                    {upcoming.slice(0, 6).map((consultation) => (
                                        <div key={consultation.id} className="border-b py-2 last:border-0">
                                            <p className="text-sm font-medium">
                                                {consultation.patient
                                                    ? `${consultation.patient.firstName} ${consultation.patient.lastName}`
                                                    : "Patient"}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {parseApiDate(consultation.scheduledAt)
                                                    ?.toLocaleTimeString("fr-FR", {
                                                        hour: "2-digit",
                                                        minute: "2-digit",
                                                    }) || "Heure non définie"}
                                            </p>
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>
                );
            })}
        </Tabs>
    );
}
