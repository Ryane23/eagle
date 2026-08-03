"use client";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
    User,
    Calendar,
    Clock,
    AlertTriangle,
    FileText,
    Activity,
    ArrowRight,
} from "lucide-react";
import { usePatientQuery, usePatientConsultationsQuery } from "@/hooks/queries";
import type { Patient, Consultation } from "@/types/api";

const urgencyColors = {
    1: "bg-gray-200 text-gray-700",
    2: "bg-blue-200 text-blue-700",
    3: "bg-yellow-200 text-yellow-700",
    4: "bg-orange-200 text-orange-700",
    5: "bg-red-200 text-red-700"
} as const;

const urgencyLabels = {
    1: "Très faible",
    2: "Faible",
    3: "Modéré",
    4: "Urgent",
    5: "Très urgent"
} as const;

type PatientDetailsModalProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    patientId?: string | null;
    onStartConsultation?: (patientId: string) => void;
    onModifyUrgency?: () => void;
};

export function PatientDetailsModal({
    open,
    onOpenChange,
    patientId,
    onStartConsultation,
    onModifyUrgency
}: PatientDetailsModalProps) {
    const effectiveId = open && patientId ? patientId : "";
    const patientQuery = usePatientQuery(effectiveId);
    const consultationsQuery = usePatientConsultationsQuery(effectiveId);

    const patient = patientQuery.data ?? null;
    const consultations: Consultation[] = consultationsQuery.data ?? [];
    const isLoading = patientQuery.isPending || consultationsQuery.isPending;

    // Calculate patient age
    const getAge = (dateOfBirth: string) => {
        const birth = new Date(dateOfBirth);
        const today = new Date();
        return Math.floor((today.getTime() - birth.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
    };

    // Get urgency level from latest consultation
    const latestConsultation = consultations.find(c => c.status !== 'completed');
    const urgencyLevelStr = latestConsultation?.urgencyLevel;
    const parsedUrgency = urgencyLevelStr ? parseInt(urgencyLevelStr, 10) : 2;
    const urgencyLevel = isNaN(parsedUrgency) ? 2 : parsedUrgency;
    const clampedUrgency = Math.min(Math.max(urgencyLevel, 1), 5) as 1 | 2 | 3 | 4 | 5;

    // Determine if patient is ready (has active queue entry)
    const isReady = latestConsultation?.status === 'scheduled';
    const isNewPatient = consultations.length <= 1;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-xl">
                        <User className="size-6" />
                        Détails du Patient
                    </DialogTitle>
                    <DialogDescription>
                        Informations complètes et historique médical
                    </DialogDescription>
                </DialogHeader>

                {isLoading ? (
                    <div className="space-y-6">
                        <Skeleton className="h-32 w-full" />
                        <Skeleton className="h-24 w-full" />
                        <Skeleton className="h-24 w-full" />
                    </div>
                ) : !patient ? (
                    <div className="py-8 text-center text-muted-foreground">
                        <User className="size-12 mx-auto mb-4 opacity-50" />
                        <p>Aucun patient sélectionné</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {/* Patient Info */}
                        <div className="p-4 bg-muted/50 rounded-lg">
                            <div className="flex items-start justify-between mb-3">
                                <div>
                                    <h3 className="text-2xl font-bold">
                                        {patient.firstName} {patient.lastName}
                                    </h3>
                                    <p className="text-muted-foreground">
                                        {getAge(patient.dateOfBirth)} ans • {patient.gender === "MALE" ? "Homme" : "Femme"}
                                    </p>
                                </div>
                                <Badge
                                    className={`${urgencyColors[clampedUrgency]} flex items-center gap-1`}
                                >
                                    <AlertTriangle className="size-3" />
                                    {urgencyLabels[clampedUrgency]}
                                </Badge>
                            </div>

                            <div className="grid grid-cols-3 gap-4 mt-4">
                                <div className="flex items-center gap-2">
                                    <Calendar className="size-4 text-muted-foreground" />
                                    <div>
                                        <p className="text-xs text-muted-foreground">ID Patient</p>
                                        <p className="font-semibold text-sm truncate">{patient.idNumber}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Clock className="size-4 text-orange-500" />
                                    <div>
                                        <p className="text-xs text-muted-foreground">Téléphone</p>
                                        <p className="font-semibold text-sm">{patient.phone || "N/A"}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <FileText className="size-4 text-muted-foreground" />
                                    <div>
                                        <p className="text-xs text-muted-foreground">Type</p>
                                        <p className="font-semibold text-sm">
                                            {isNewPatient ? "Nouveau" : "Suivi"}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <Separator />

                        {/* Medical History */}
                        <div>
                            <h4 className="font-semibold mb-3 flex items-center gap-2">
                                <Activity className="size-4" />
                                Antécédents Médicaux
                            </h4>
                            {!patient.medicalHistory || patient.medicalHistory.length === 0 ? (
                                <p className="text-sm text-muted-foreground p-3 bg-muted/50 rounded">
                                    Aucun antécédent enregistré
                                </p>
                            ) : (
                                <ul className="space-y-2">
                                    {patient.medicalHistory.map((item, index) => (
                                        <li
                                            key={index}
                                            className="text-sm p-2 bg-muted/50 rounded flex items-start gap-2"
                                        >
                                            <span className="text-primary mt-1">•</span>
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>

                        {/* Allergies */}
                        {patient.allergies && patient.allergies.length > 0 && (
                            <>
                                <Separator />
                                <div>
                                    <h4 className="font-semibold mb-3 flex items-center gap-2 text-red-600">
                                        <AlertTriangle className="size-4" />
                                        Allergies
                                    </h4>
                                    <div className="flex flex-wrap gap-2">
                                        {patient.allergies.map((allergy, index) => (
                                            <Badge key={index} variant="destructive">
                                                {allergy}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            </>
                        )}

                        <Separator />

                        {/* Previous Consultations */}
                        <div>
                            <h4 className="font-semibold mb-3 flex items-center gap-2">
                                <FileText className="size-4" />
                                Consultations Précédentes
                            </h4>
                            {consultations.filter(c => c.status === 'completed').length === 0 ? (
                                <p className="text-sm text-muted-foreground p-3 bg-muted/50 rounded">
                                    Aucune consultation antérieure
                                </p>
                            ) : (
                                <div className="space-y-2">
                                    {consultations
                                        .filter(c => c.status === 'completed')
                                        .slice(0, 5)
                                        .map((consultation) => (
                                            <div
                                                key={consultation.id}
                                                className="p-3 bg-muted/50 rounded border"
                                            >
                                                <div className="flex items-center justify-between mb-1">
                                                    <span className="text-sm font-semibold">
                                                        {new Date(consultation.createdAt).toLocaleDateString('fr-FR', {
                                                            day: 'numeric',
                                                            month: 'short',
                                                            year: 'numeric'
                                                        })}
                                                    </span>
                                                    <Badge variant="outline" className="text-xs">
                                                        {consultation.doctor
                                                            ? `Dr. ${consultation.doctor.name}`
                                                            : 'Médecin'}
                                                    </Badge>
                                                </div>
                                                <p className="text-sm text-muted-foreground">
                                                    {consultation.diagnosis || consultation.notes || 'Consultation effectuée'}
                                                </p>
                                            </div>
                                        ))}
                                </div>
                            )}
                        </div>

                        <Separator />

                        {/* Status Block */}
                        <div className={`p-4 rounded-lg ${isReady ? "bg-green-50 border border-green-200" : "bg-yellow-50 border border-yellow-200"}`}>
                            <p className="font-semibold mb-1">
                                Statut: {isReady ? "✓ Patient prêt" : "⏳ En attente"}
                            </p>
                            <p className="text-sm text-muted-foreground">
                                {isReady
                                    ? "Le patient est prêt pour la consultation"
                                    : "Le patient est en file d'attente"
                                }
                            </p>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3">
                            <Button
                                variant="outline"
                                className="flex-1"
                                onClick={onModifyUrgency}
                            >
                                <AlertTriangle className="size-4 mr-2" />
                                Modifier l&apos;urgence
                            </Button>
                            <Button
                                variant="outline"
                                className="flex-1"
                                asChild
                            >
                                <a href={`/dashboard/doctor/patients/${patient.id}`}>
                                    <FileText className="size-4 mr-2" />
                                    Voir dossier complet
                                </a>
                            </Button>
                        </div>

                        {latestConsultation && (
                            <Button
                                className="w-full"
                                size="lg"
                                onClick={() => onStartConsultation?.(patient.id)}
                            >
                                Démarrer la consultation
                                <ArrowRight className="size-4 ml-2" />
                            </Button>
                        )}
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
