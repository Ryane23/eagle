"use client";

import { useState, useCallback, useMemo } from "react";
import { EnhancedNurseDashboardHeader } from "@/components/nurse/enhanced-dashboard-header";
import { FloatingHelpButton } from "@/components/nurse/floating-help-button";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Search,
    HeartPulse,
    Thermometer,
    Droplet,
    Activity,
    Plus,
    User,
    TrendingUp,
    AlertCircle,
    RefreshCw,
    Loader2,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { usePatientsQuery, useUpdatePatientVitals, patientKeys } from "@/hooks/queries";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { Patient, VitalSigns } from "@/types/api";

type VitalStatus = "normal" | "warning" | "critical";

// Helper to determine vital status based on values
function getVitalStatus(patient: Patient): VitalStatus {
    const vitals = patient.vitalSigns;
    if (!vitals) return "normal";

    // Check for critical values
    if (vitals.temperature && vitals.temperature > 39.5) return "critical";
    if (vitals.oxygenSaturation && vitals.oxygenSaturation < 90) return "critical";
    if (vitals.heartRate && (vitals.heartRate > 120 || vitals.heartRate < 50)) return "critical";

    // Check for warning values
    if (vitals.temperature && vitals.temperature > 38.5) return "warning";
    if (vitals.oxygenSaturation && vitals.oxygenSaturation < 95) return "warning";
    if (vitals.heartRate && (vitals.heartRate > 100 || vitals.heartRate < 60)) return "warning";

    return "normal";
}

// Helper to format date
function formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString("fr-FR", {
        day: "numeric",
        month: "short",
        year: "numeric",
    });
}

function formatTime(dateString: string): string {
    return new Date(dateString).toLocaleTimeString("fr-FR", {
        hour: "2-digit",
        minute: "2-digit",
    });
}

export default function VitalsPage() {
    const queryClient = useQueryClient();
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [newVitalOpen, setNewVitalOpen] = useState(false);
    const [selectedPatientId, setSelectedPatientId] = useState("");
    const [vitalData, setVitalData] = useState<VitalSigns>({
        bloodPressure: "",
        heartRate: undefined,
        temperature: undefined,
        respiratoryRate: undefined,
        oxygenSaturation: undefined,
        weight: undefined,
        height: undefined,
    });

    // TanStack Query
    const { data: patients = [], isLoading, error, refetch } = usePatientsQuery();
    const updateVitalsMutation = useUpdatePatientVitals();

    // Filter patients
    const filteredPatients = useMemo(() => {
        return patients
            .filter((patient) => {
                // Search filter
                const searchLower = searchQuery.toLowerCase();
                const matchesSearch =
                    patient.firstName.toLowerCase().includes(searchLower) ||
                    patient.lastName.toLowerCase().includes(searchLower) ||
                    patient.idNumber.toLowerCase().includes(searchLower);

                // Status filter
                if (statusFilter === "all") return matchesSearch;
                const status = getVitalStatus(patient);
                return matchesSearch && status === statusFilter;
            })
            .filter((patient) => patient.vitalSigns) // Only show patients with vitals
            .sort((a, b) => {
                // Sort by last updated (most recent first)
                return new Date(b.updatedAt || b.createdAt).getTime() -
                    new Date(a.updatedAt || a.createdAt).getTime();
            });
    }, [patients, searchQuery, statusFilter]);

    const getStatusBadge = (status: VitalStatus) => {
        switch (status) {
            case "normal":
                return <Badge variant="default" className="bg-green-500">Normal</Badge>;
            case "warning":
                return <Badge variant="destructive" className="bg-orange-500">Attention</Badge>;
            case "critical":
                return <Badge variant="destructive">Critique</Badge>;
        }
    };

    const getStatusIcon = (status: VitalStatus) => {
        switch (status) {
            case "normal":
                return <TrendingUp className="size-4 text-green-600" />;
            case "warning":
                return <AlertCircle className="size-4 text-orange-600" />;
            case "critical":
                return <AlertCircle className="size-4 text-red-600" />;
        }
    };

    const handleSaveVital = useCallback(async () => {
        if (!selectedPatientId) {
            toast.error("Veuillez sélectionner un patient");
            return;
        }

        updateVitalsMutation.mutate(
            { id: selectedPatientId, data: { vitalSigns: vitalData } },
            {
                onSuccess: () => {
                    setNewVitalOpen(false);
                    setSelectedPatientId("");
                    setVitalData({
                        bloodPressure: "",
                        heartRate: undefined,
                        temperature: undefined,
                        respiratoryRate: undefined,
                        oxygenSaturation: undefined,
                        weight: undefined,
                        height: undefined,
                    });
                },
            }
        );
    }, [selectedPatientId, vitalData, updateVitalsMutation]);

    const handleRefresh = useCallback(() => {
        queryClient.invalidateQueries({ queryKey: patientKeys.all });
        toast.success("Données actualisées");
    }, [queryClient]);

    if (error) {
        return (
            <div className="flex flex-col h-full">
                <EnhancedNurseDashboardHeader
                    nurseName="Sophie Ateba"
                    clinic="Centre Principal - Yaoundé"
                    clinicCode="CPY-001"
                    clinicType="Centre Principal"
                />
                <div className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                        <AlertCircle className="size-12 mx-auto text-destructive mb-4" />
                        <h2 className="text-lg font-semibold mb-2">Erreur de chargement</h2>
                        <p className="text-muted-foreground mb-4">{error.message}</p>
                        <Button onClick={() => refetch()}>
                            <RefreshCw className="size-4 mr-2" />
                            Réessayer
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full">
            <EnhancedNurseDashboardHeader
                nurseName="Sophie Ateba"
                clinic="Centre Principal - Yaoundé"
                clinicCode="CPY-001"
                clinicType="Centre Principal"
            />

            <div className="flex-1 p-6 space-y-6 overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-primary">Signes Vitaux</h1>
                        <p className="text-muted-foreground">
                            Enregistrez et consultez les signes vitaux des patients
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={handleRefresh} disabled={isLoading}>
                            <RefreshCw className={`size-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
                            Actualiser
                        </Button>
                        <Button onClick={() => setNewVitalOpen(true)}>
                            <Plus className="size-4 mr-2" />
                            Nouveau relevé
                        </Button>
                    </div>
                </div>

                {/* Search and Filters */}
                <Card>
                    <CardContent className="p-4">
                        <div className="flex flex-col md:flex-row gap-4">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                                <Input
                                    placeholder="Rechercher un patient..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-9"
                                />
                            </div>
                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger className="w-full md:w-[180px]">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Tous les statuts</SelectItem>
                                    <SelectItem value="normal">Normal</SelectItem>
                                    <SelectItem value="warning">Attention</SelectItem>
                                    <SelectItem value="critical">Critique</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent>
                </Card>

                {/* Vital Signs List */}
                {isLoading ? (
                    <div className="grid gap-4">
                        {[1, 2, 3].map((i) => (
                            <Card key={i}>
                                <CardContent className="p-6">
                                    <div className="flex items-start gap-4 mb-4">
                                        <Skeleton className="size-12 rounded-full" />
                                        <div className="flex-1 space-y-2">
                                            <Skeleton className="h-5 w-32" />
                                            <Skeleton className="h-4 w-48" />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        {[1, 2, 3, 4].map((j) => (
                                            <Skeleton key={j} className="h-16 w-full" />
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {filteredPatients.map((patient) => {
                            const vitals = patient.vitalSigns;
                            const status = getVitalStatus(patient);

                            return (
                                <Card key={patient.id} className="hover:shadow-md transition-shadow">
                                    <CardContent className="p-6">
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="flex items-center gap-4">
                                                <Avatar className="size-12">
                                                    <AvatarFallback className="bg-primary text-primary-foreground">
                                                        {patient.firstName[0]}{patient.lastName[0]}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <h3 className="text-lg font-semibold">
                                                        {patient.firstName} {patient.lastName}
                                                    </h3>
                                                    <p className="text-sm text-muted-foreground">
                                                        {patient.idNumber} • Mis à jour: {formatDate(patient.updatedAt || patient.createdAt)} à {formatTime(patient.updatedAt || patient.createdAt)}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {getStatusIcon(status)}
                                                {getStatusBadge(status)}
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                                            <div className="flex items-center gap-2">
                                                <Droplet className="size-5 text-red-500" />
                                                <div>
                                                    <p className="text-xs text-muted-foreground">Tension</p>
                                                    <p className="font-semibold">{vitals?.bloodPressure || "N/A"}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <HeartPulse className="size-5 text-red-500" />
                                                <div>
                                                    <p className="text-xs text-muted-foreground">Pouls</p>
                                                    <p className="font-semibold">{vitals?.heartRate || "N/A"} bpm</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Thermometer className="size-5 text-orange-500" />
                                                <div>
                                                    <p className="text-xs text-muted-foreground">Température</p>
                                                    <p className="font-semibold">{vitals?.temperature || "N/A"}°C</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Activity className="size-5 text-blue-500" />
                                                <div>
                                                    <p className="text-xs text-muted-foreground">Respiratoire</p>
                                                    <p className="font-semibold">{vitals?.respiratoryRate || "N/A"} /min</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Activity className="size-5 text-green-500" />
                                                <div>
                                                    <p className="text-xs text-muted-foreground">SpO2</p>
                                                    <p className="font-semibold">{vitals?.oxygenSaturation || "N/A"}%</p>
                                                </div>
                                            </div>
                                            {vitals?.weight && vitals?.height && (
                                                <div className="flex items-center gap-2">
                                                    <User className="size-5 text-purple-500" />
                                                    <div>
                                                        <p className="text-xs text-muted-foreground">Poids/Taille</p>
                                                        <p className="font-semibold">{vitals.weight}kg / {vitals.height}cm</p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        <div className="mt-4 pt-4 border-t flex justify-end">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => {
                                                    setSelectedPatientId(patient.id);
                                                    setVitalData({
                                                        bloodPressure: vitals?.bloodPressure || "",
                                                        heartRate: vitals?.heartRate,
                                                        temperature: vitals?.temperature,
                                                        respiratoryRate: vitals?.respiratoryRate,
                                                        oxygenSaturation: vitals?.oxygenSaturation,
                                                        weight: vitals?.weight,
                                                        height: vitals?.height,
                                                    });
                                                    setNewVitalOpen(true);
                                                }}
                                            >
                                                Mettre à jour
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                )}

                {!isLoading && filteredPatients.length === 0 && (
                    <Card>
                        <CardContent className="py-12 text-center">
                            <HeartPulse className="size-12 mx-auto text-muted-foreground mb-4" />
                            <p className="text-lg font-medium text-muted-foreground">
                                Aucun relevé de signes vitaux trouvé
                            </p>
                        </CardContent>
                    </Card>
                )}
            </div>

            {/* New Vital Sign Modal */}
            <Dialog open={newVitalOpen} onOpenChange={setNewVitalOpen}>
                <DialogContent className="max-w-2xl max-h-[90vh]">
                    <DialogHeader>
                        <DialogTitle>
                            {selectedPatientId ? "Mettre à jour les signes vitaux" : "Nouveau relevé de signes vitaux"}
                        </DialogTitle>
                        <DialogDescription>
                            Enregistrez les signes vitaux d&apos;un patient
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-6 overflow-y-auto max-h-[70vh] pr-2">
                        <div>
                            <Label>Patient</Label>
                            <Select value={selectedPatientId} onValueChange={setSelectedPatientId}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Sélectionner un patient" />
                                </SelectTrigger>
                                <SelectContent>
                                    {patients.map((patient) => (
                                        <SelectItem key={patient.id} value={patient.id}>
                                            {patient.firstName} {patient.lastName} ({patient.idNumber})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label>Tension artérielle (mmHg)</Label>
                                <Input
                                    placeholder="Ex: 120/80"
                                    value={vitalData.bloodPressure || ""}
                                    onChange={(e) => setVitalData({ ...vitalData, bloodPressure: e.target.value })}
                                />
                            </div>
                            <div>
                                <Label>Fréquence cardiaque (bpm)</Label>
                                <Input
                                    type="number"
                                    placeholder="Ex: 72"
                                    value={vitalData.heartRate || ""}
                                    onChange={(e) => setVitalData({ ...vitalData, heartRate: e.target.value ? parseInt(e.target.value) : undefined })}
                                />
                            </div>
                            <div>
                                <Label>Température (°C)</Label>
                                <Input
                                    type="number"
                                    step="0.1"
                                    placeholder="Ex: 36.8"
                                    value={vitalData.temperature || ""}
                                    onChange={(e) => setVitalData({ ...vitalData, temperature: e.target.value ? parseFloat(e.target.value) : undefined })}
                                />
                            </div>
                            <div>
                                <Label>Fréquence respiratoire (/min)</Label>
                                <Input
                                    type="number"
                                    placeholder="Ex: 16"
                                    value={vitalData.respiratoryRate || ""}
                                    onChange={(e) => setVitalData({ ...vitalData, respiratoryRate: e.target.value ? parseInt(e.target.value) : undefined })}
                                />
                            </div>
                            <div>
                                <Label>Saturation en oxygène (%)</Label>
                                <Input
                                    type="number"
                                    placeholder="Ex: 98"
                                    value={vitalData.oxygenSaturation || ""}
                                    onChange={(e) => setVitalData({ ...vitalData, oxygenSaturation: e.target.value ? parseInt(e.target.value) : undefined })}
                                />
                            </div>
                            <div>
                                <Label>Poids (kg)</Label>
                                <Input
                                    type="number"
                                    placeholder="Ex: 75"
                                    value={vitalData.weight || ""}
                                    onChange={(e) => setVitalData({ ...vitalData, weight: e.target.value ? parseFloat(e.target.value) : undefined })}
                                />
                            </div>
                            <div>
                                <Label>Taille (cm)</Label>
                                <Input
                                    type="number"
                                    placeholder="Ex: 170"
                                    value={vitalData.height || ""}
                                    onChange={(e) => setVitalData({ ...vitalData, height: e.target.value ? parseInt(e.target.value) : undefined })}
                                />
                            </div>
                        </div>

                        <div className="flex gap-2 pt-4 border-t">
                            <Button
                                onClick={handleSaveVital}
                                className="flex-1"
                                disabled={updateVitalsMutation.isPending || !selectedPatientId}
                            >
                                {updateVitalsMutation.isPending ? (
                                    <>
                                        <Loader2 className="size-4 mr-2 animate-spin" />
                                        Enregistrement...
                                    </>
                                ) : (
                                    "Enregistrer"
                                )}
                            </Button>
                            <Button variant="outline" onClick={() => setNewVitalOpen(false)}>
                                Annuler
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            <FloatingHelpButton />
        </div>
    );
}
