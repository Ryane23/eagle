"use client";

import { useState, useMemo, useEffect } from "react";
import { DashboardHeader } from "@/components/layout/dashboard-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Lock, AlertTriangle, Clock, Shield, CheckCircle, X, Eye, Edit } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useRolesQuery, usePermissionsQuery, permissionKeys } from "@/hooks/queries";
import type { Permission as ApiPermission } from "@/actions/permissions";

type PermissionLevel = "none" | "read" | "write" | "admin";

const ROLE_DISPLAY_NAMES: Record<string, string> = {
    admin: "Administrateur",
    primary_secretary: "Secrétaire Principal",
    secondary_secretary: "Secrétaire Secondaire",
    nurse: "Infirmier(ère)",
    doctor: "Médecin",
};

const RESOURCE_DISPLAY_NAMES: Record<string, string> = {
    patients: "Patients",
    consultations: "Consultations",
    urgencies: "Urgences",
    prescriptions: "Ordonnances",
    reports: "Rapports",
    users: "Utilisateurs",
    hospitals: "Hôpitaux",
    files: "Fichiers",
    queue: "File d'attente",
    system: "Système",
    analytics: "Analytique",
};

function actionToLevel(action: string): PermissionLevel {
    if (action === "manage") return "admin";
    if (["create", "update", "delete", "assign", "approve", "reject"].includes(action)) return "write";
    if (action === "read") return "read";
    return "none";
}

const anomalies = [
    { id: 1, type: "warning", message: "Le rôle Infirmier(ère) a accès en écriture aux dossiers mais pas en lecture sur certains modules.", suggestion: "Vérifier la cohérence des permissions" },
    { id: 2, type: "info", message: "3 utilisateurs ont des permissions personnalisées différentes de leur rôle.", suggestion: "Auditer les exceptions" },
];

const pendingRequests = [
    { id: 1, user: "Dr. Fotso", currentRole: "Médecin", requestedPermission: "Accès aux statistiques globales", date: "2025-01-14" },
    { id: 2, user: "Marie Dupont", currentRole: "Secrétaire Secondaire", requestedPermission: "Modifier les dossiers patients", date: "2025-01-13" },
];

const PermissionBadge = ({ permission }: { permission: PermissionLevel }) => {
    const config: Record<PermissionLevel, { icon: React.ReactNode; className: string; label: string }> = {
        none: { icon: <X className="size-3" />, className: "bg-gray-100 text-gray-600", label: "Aucun" },
        read: { icon: <Eye className="size-3" />, className: "bg-blue-100 text-blue-700", label: "Lecture" },
        write: { icon: <Edit className="size-3" />, className: "bg-green-100 text-green-700", label: "Écriture" },
        admin: { icon: <Shield className="size-3" />, className: "bg-purple-100 text-purple-700", label: "Admin" },
    };

    const { icon, className, label } = config[permission];
    return (
        <Badge className={`${className} gap-1`}>
            {icon}
            {label}
        </Badge>
    );
};

export default function PermissionsPage() {
    const queryClient = useQueryClient();
    const { data: rolePermissions = [], isLoading } = useRolesQuery();
    const { data: allPermissions = [] } = usePermissionsQuery(true);

    const roles = useMemo(() => {
        const names = rolePermissions.map((rp) => rp.role);
        return [...new Set(names)].sort().map((r) => ({
            id: r,
            name: ROLE_DISPLAY_NAMES[r] ?? r,
        }));
    }, [rolePermissions]);

    const matrixData = useMemo(() => {
        const byResource: Record<string, { name: string; permissions: { perm: ApiPermission; byRole: Record<string, PermissionLevel> }[] }> = {};
        allPermissions.forEach((p) => {
            const resName = RESOURCE_DISPLAY_NAMES[p.resource] ?? p.resource;
            if (!byResource[p.resource]) {
                byResource[p.resource] = { name: resName, permissions: [] };
            }
            const byRole: Record<string, PermissionLevel> = {};
            rolePermissions.forEach((rp) => {
                const hasPerm = rp.permissions.some((x) => x.id === p.id);
                byRole[rp.role] = hasPerm ? actionToLevel(p.action) : "none";
            });
            byResource[p.resource].permissions.push({ perm: p, byRole });
        });
        return Object.entries(byResource).map(([k, v]) => ({ resource: k, ...v }));
    }, [allPermissions, rolePermissions]);

    const [selectedRole, setSelectedRole] = useState(roles[0]?.id ?? "");
    useEffect(() => {
        if (roles.length > 0 && !selectedRole) {
            queueMicrotask(() => setSelectedRole(roles[0].id));
        }
    }, [roles, selectedRole]);

    const handleRefresh = () => {
        queryClient.invalidateQueries({ queryKey: permissionKeys.all });
    };

    return (
        <div className="flex flex-col h-full font-sans">
            <DashboardHeader
                breadcrumbs={[
                    { label: "Administration", href: "/admin" },
                    { label: "Matrice des permissions" },
                ]}
                actions={
                    <Button variant="outline" size="sm" onClick={handleRefresh}>
                        <Lock className="mr-2 size-4" />
                        Actualiser
                    </Button>
                }
            />

            <div className="flex-1 p-4 space-y-4 overflow-auto">
                <Tabs defaultValue="matrix">
                    <TabsList>
                        <TabsTrigger value="matrix">Matrice</TabsTrigger>
                        <TabsTrigger value="anomalies">Anomalies</TabsTrigger>
                        <TabsTrigger value="requests">Demandes en attente</TabsTrigger>
                        <TabsTrigger value="stats">Statistiques</TabsTrigger>
                    </TabsList>

                    <TabsContent value="matrix" className="space-y-4 mt-4">
                        <div className="flex items-center gap-4">
                            <span className="text-sm font-medium">Filtrer par rôle:</span>
                            <Select value={selectedRole} onValueChange={setSelectedRole}>
                                <SelectTrigger className="w-64">
                                    <SelectValue placeholder="Sélectionner un rôle" />
                                </SelectTrigger>
                                <SelectContent>
                                    {roles.map((role) => (
                                        <SelectItem key={role.id} value={role.id}>{role.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <Card>
                            <CardContent className="pt-6">
                                {isLoading ? (
                                    <div className="space-y-4">
                                        <Skeleton className="h-6 w-32" />
                                        <Skeleton className="h-12 w-full" />
                                        <Skeleton className="h-12 w-full" />
                                    </div>
                                ) : (
                                    <div className="space-y-6">
                                        {matrixData.map((moduleGroup) => (
                                            <div key={moduleGroup.resource}>
                                                <h3 className="font-semibold text-primary mb-3">{moduleGroup.name}</h3>
                                                <div className="space-y-2">
                                                    {moduleGroup.permissions.map(({ perm, byRole }) => (
                                                        <div
                                                            key={perm.id}
                                                            className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                                                        >
                                                            <span className="text-sm">{perm.name}</span>
                                                            <div className="flex items-center gap-2">
                                                                <PermissionBadge permission={byRole[selectedRole] ?? "none"} />
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                        {matrixData.length === 0 && (
                                            <p className="text-sm text-muted-foreground py-4">Aucune permission définie</p>
                                        )}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="anomalies" className="space-y-4 mt-4">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <AlertTriangle className="size-5 text-orange-500" />
                                    Anomalies détectées
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {anomalies.map((anomaly) => (
                                        <div
                                            key={anomaly.id}
                                            className={`p-4 rounded-lg border ${anomaly.type === "warning" ? "bg-orange-50 border-orange-200" : "bg-blue-50 border-blue-200"
                                                }`}
                                        >
                                            <p className="font-medium">{anomaly.message}</p>
                                            <p className="text-sm text-muted-foreground mt-1">
                                                Suggestion: {anomaly.suggestion}
                                            </p>
                                            <Button size="sm" variant="outline" className="mt-2">
                                                Résoudre
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="requests" className="space-y-4 mt-4">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Clock className="size-5" />
                                    Demandes de permissions
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {pendingRequests.map((request) => (
                                        <div
                                            key={request.id}
                                            className="flex items-center justify-between p-4 bg-muted/50 rounded-lg"
                                        >
                                            <div>
                                                <p className="font-medium">{request.user}</p>
                                                <p className="text-sm text-muted-foreground">
                                                    {request.currentRole} • Demande: {request.requestedPermission}
                                                </p>
                                                <p className="text-xs text-muted-foreground">{request.date}</p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Button size="sm" variant="outline">Refuser</Button>
                                                <Button size="sm">
                                                    <CheckCircle className="mr-1 size-4" />
                                                    Approuver
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="stats" className="space-y-4 mt-4">
                        <div className="grid gap-4 md:grid-cols-3">
                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm font-medium text-muted-foreground">
                                        Niveau de sécurité
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-2xl font-bold text-green-600">Élevé</p>
                                    <p className="text-xs text-muted-foreground">Principe du moindre privilège respecté</p>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm font-medium text-muted-foreground">
                                        Rôles définis
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-2xl font-bold">{roles.length}</p>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm font-medium text-muted-foreground">
                                        Permissions personnalisées
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-2xl font-bold">3</p>
                                    <p className="text-xs text-muted-foreground">Exceptions au modèle RBAC</p>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}
