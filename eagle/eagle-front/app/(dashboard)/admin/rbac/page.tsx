"use client";

import { useState, useMemo } from "react";
import { DashboardHeader } from "@/components/layout/dashboard-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
    GitBranch,
    ChevronRight,
    ChevronDown,
    Plus,
    Edit,
    Trash2,
    Shield,
    History,
    Search,
} from "lucide-react";
import { useRulesQuery } from "@/hooks/queries";
import { useUsersQuery } from "@/hooks/queries";
import type { UserRole } from "@/actions/rules";

type Role = {
    id: string;
    name: string;
    description: string;
    permissions: string[];
    inheritedPermissions: string[];
    userCount: number;
    children?: Role[];
};

const ROLE_NAMES: Record<UserRole, string> = {
    admin: "Administrateur",
    primary_secretary: "Secrétaire Principal",
    secondary_secretary: "Secrétaire Secondaire",
    nurse: "Infirmier(ère)",
    doctor: "Médecin",
};

const ROLE_DESCRIPTIONS: Record<UserRole, string> = {
    admin: "Accès complet au système",
    primary_secretary: "Gestion du réseau et validation des urgences",
    secondary_secretary: "Enregistrement des patients et gestion de la file d'attente",
    nurse: "Préparation des patients et assistance aux consultations",
    doctor: "Consultations et prescriptions",
};

const auditLog = [
    { id: 1, action: "Permission ajoutée", role: "Médecin", detail: "prescriptions.export", user: "Admin", date: "2025-01-15 10:30" },
    { id: 2, action: "Rôle modifié", role: "Infirmier(ère)", detail: "Description mise à jour", user: "Admin", date: "2025-01-14 15:20" },
    { id: 3, action: "Permission retirée", role: "Secrétaire Secondaire", detail: "patients.delete", user: "Admin", date: "2025-01-13 09:00" },
];

const RoleNode = ({ role, level = 0, onSelect }: { role: Role; level?: number; onSelect?: (role: Role) => void }) => {
    const [isOpen, setIsOpen] = useState(true);
    const hasChildren = role.children && role.children.length > 0;

    return (
        <div className="space-y-2 font-sans">
            <Collapsible open={isOpen} onOpenChange={setIsOpen}>
                <div
                    className={`flex items-center gap-2 p-3 rounded-lg bg-muted/50 border border-border hover:border-accent transition-colors cursor-pointer`}
                    style={{ marginLeft: `${level * 24}px` }}
                    onClick={() => onSelect?.(role)}
                >
                    {hasChildren && (
                        <CollapsibleTrigger asChild>
                            <Button variant="ghost" size="icon" className="size-6">
                                {isOpen ? <ChevronDown className="size-4" /> : <ChevronRight className="size-4" />}
                            </Button>
                        </CollapsibleTrigger>
                    )}
                    {!hasChildren && <div className="w-6" />}

                    <Shield className="size-4 text-primary" />

                    <div className="flex-1">
                        <div className="flex items-center gap-2">
                            <span className="font-medium">{role.name}</span>
                            <Badge variant="secondary" className="text-xs">{role.userCount} utilisateurs</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">{role.description}</p>
                    </div>

                    <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" className="size-8">
                            <Edit className="size-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="size-8">
                            <Plus className="size-4" />
                        </Button>
                        {role.id !== "admin" && (
                            <Button variant="ghost" size="icon" className="size-8 text-destructive">
                                <Trash2 className="size-4" />
                            </Button>
                        )}
                    </div>
                </div>

                {hasChildren && (
                    <CollapsibleContent className="space-y-2">
                        {role.children?.map((child) => (
                            <RoleNode key={child.id} role={child} level={level + 1} onSelect={onSelect} />
                        ))}
                    </CollapsibleContent>
                )}
            </Collapsible>
        </div>
    );
};

export default function RBACPage() {
    const [isTestOpen, setIsTestOpen] = useState(false);
    const [isAuditOpen, setIsAuditOpen] = useState(false);
    const [selectedRole, setSelectedRole] = useState<Role | null>(null);

    const { data: rules = [], isLoading: rulesLoading } = useRulesQuery(undefined, false);
    const { data: users = [] } = useUsersQuery();

    const userCountByRole = useMemo(() => {
        const counts: Record<string, number> = {};
        users.forEach((u) => {
            counts[u.role] = (counts[u.role] ?? 0) + 1;
        });
        return counts;
    }, [users]);

    const roleHierarchy = useMemo((): Role[] => {
        const rulesByRole: Record<string, string[]> = {};
        rules.filter((r) => r.isActive).forEach((r) => {
            const perm = `${r.resource}.${r.action}`;
            if (!rulesByRole[r.role]) rulesByRole[r.role] = [];
            if (!rulesByRole[r.role].includes(perm)) rulesByRole[r.role].push(perm);
        });

        const buildRole = (id: UserRole, children?: Role[]): Role => ({
            id,
            name: ROLE_NAMES[id],
            description: ROLE_DESCRIPTIONS[id],
            permissions: id === "admin" ? ["*"] : (rulesByRole[id] ?? []),
            inheritedPermissions: [],
            userCount: userCountByRole[id] ?? 0,
            children,
        });

        return [
            buildRole("admin", [
                buildRole("primary_secretary", [buildRole("secondary_secretary")]),
                buildRole("doctor", [buildRole("nurse")]),
            ]),
        ];
    }, [rules, userCountByRole]);

    return (
        <div className="flex flex-col h-full">
            <DashboardHeader
                breadcrumbs={[
                    { label: "Administration", href: "/admin" },
                    { label: "Hiérarchie RBAC" },
                ]}
                actions={
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setIsAuditOpen(true)}
                        >
                            <History className="mr-2 size-4" />
                            Journal d&apos;audit
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setIsTestOpen(true)}
                        >
                            <Search className="mr-2 size-4" />
                            Tester l&apos;accès
                        </Button>
                        <Button size="sm">
                            <Plus className="mr-2 size-4" />
                            Nouveau rôle
                        </Button>
                    </div>
                }
            />

            <div className="flex-1 p-4 space-y-4 overflow-auto">
                <div className="grid gap-6 lg:grid-cols-3">
                    <Card className="lg:col-span-2">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <GitBranch className="size-5" />
                                Arborescence des rôles
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {rulesLoading ? (
                                <div className="space-y-2">
                                    <Skeleton className="h-14 w-full" />
                                    <Skeleton className="h-14 w-full" />
                                    <Skeleton className="h-14 w-full" />
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {roleHierarchy.map((role) => (
                                        <RoleNode key={role.id} role={role} onSelect={setSelectedRole} />
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Détails du rôle</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {selectedRole ? (
                                <div className="space-y-4">
                                    <div>
                                        <Label>Nom</Label>
                                        <p className="font-medium">{selectedRole.name}</p>
                                    </div>
                                    <div>
                                        <Label>Permissions directes</Label>
                                        <div className="flex flex-wrap gap-1 mt-1">
                                            {selectedRole.permissions.map((perm) => (
                                                <Badge key={perm} variant="default" className="text-xs">{perm}</Badge>
                                            ))}
                                        </div>
                                    </div>
                                    <div>
                                        <Label>Permissions héritées</Label>
                                        <div className="flex flex-wrap gap-1 mt-1">
                                            {selectedRole.inheritedPermissions.map((perm) => (
                                                <Badge key={perm} variant="outline" className="text-xs">{perm}</Badge>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <p className="text-muted-foreground text-sm">
                                    Cliquez sur un rôle pour voir ses détails
                                </p>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>

            <Dialog open={isTestOpen} onOpenChange={setIsTestOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Tester l&apos;accès</DialogTitle>
                        <DialogDescription>
                            Vérifiez les permissions d&apos;un utilisateur ou d&apos;un rôle
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4">
                        <div>
                            <Label>Utilisateur ou rôle</Label>
                            <Input placeholder="Nom d&apos;utilisateur ou sélectionner un rôle" className="mt-1" />
                        </div>
                        <div>
                            <Label>Permission à tester</Label>
                            <Input placeholder="ex: patients.write" className="mt-1" />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsTestOpen(false)}>
                            Annuler
                        </Button>
                        <Button>
                            <Search className="mr-2 size-4" />
                            Tester
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={isAuditOpen} onOpenChange={setIsAuditOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Journal d&apos;audit RBAC</DialogTitle>
                        <DialogDescription>
                            Historique des modifications de rôles et permissions
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 max-h-96 overflow-auto">
                        {auditLog.map((entry) => (
                            <div key={entry.id} className="flex items-start gap-4 p-3 bg-muted/50 rounded-lg">
                                <History className="size-4 text-muted-foreground mt-1" />
                                <div className="flex-1">
                                    <p className="font-medium">{entry.action}</p>
                                    <p className="text-sm text-muted-foreground">
                                        Rôle: {entry.role} • {entry.detail}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        Par {entry.user} • {entry.date}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsAuditOpen(false)}>
                            Fermer
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
