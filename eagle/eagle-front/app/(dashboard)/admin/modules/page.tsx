"use client";

import { useState } from "react";
import { toast } from "sonner";
import { DashboardHeader } from "@/components/layout/dashboard-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
    Package,
    Play,
    Pause,
    RefreshCw,
    // Settings,
    Calendar,
    GitBranch,
    Clock,
    History,
    Edit,
    Brain,
    Video,
    FileText,
    Pill,
    Box,
} from "lucide-react";

type Module = {
    id: string;
    name: string;
    description: string;
    version: string;
    status: "active" | "inactive" | "maintenance";
    lastUpdate: string;
    dependencies: string[];
    icon?: React.ElementType;
};

type ModuleHistory = {
    id: string;
    moduleId: string;
    version: string;
    action: "created" | "updated" | "activated" | "deactivated" | "modified";
    modifiedBy: string;
    modifiedAt: string;
    changes?: string;
};

const mockModules: Module[] = [
    {
        id: "mod-001",
        name: "Gestion des patients",
        description: "Module de gestion des dossiers patients et de leurs informations médicales.",
        version: "2.4.1",
        status: "active",
        lastUpdate: "2025-01-10",
        dependencies: ["Base de données", "Authentification"],
        icon: Package,
    },
    {
        id: "mod-002",
        name: "Téléconsultation vidéo",
        description: "Module de visioconférence pour les consultations à distance.",
        version: "1.8.0",
        status: "active",
        lastUpdate: "2025-01-12",
        dependencies: ["WebRTC", "Gestion des patients"],
        icon: Video,
    },
    {
        id: "mod-003",
        name: "Notifications SMS",
        description: "Module d&apos;envoi de notifications SMS aux patients.",
        version: "1.2.3",
        status: "maintenance",
        lastUpdate: "2025-01-08",
        dependencies: ["API SMS", "Gestion des patients"],
        icon: Package,
    },
    {
        id: "mod-004",
        name: "Ordonnances électroniques",
        description: "Module de création et gestion des ordonnances.",
        version: "1.5.2",
        status: "active",
        lastUpdate: "2025-01-05",
        dependencies: ["Gestion des patients", "PDF Generator"],
        icon: Pill,
    },
    {
        id: "mod-005",
        name: "Statistiques et rapports",
        description: "Module de génération de rapports et statistiques.",
        version: "2.0.0",
        status: "inactive",
        lastUpdate: "2024-12-20",
        dependencies: ["Base de données"],
        icon: Package,
    },
    {
        id: "mod-006",
        name: "Intelligence Artificielle",
        description: "Module d'IA pour l'aide au diagnostic et l'analyse de données médicales.",
        version: "1.0.0",
        status: "active",
        lastUpdate: "2025-01-14",
        dependencies: ["Base de données", "API IA"],
        icon: Brain,
    },
    {
        id: "mod-007",
        name: "Boîte de consultation",
        description: "Module de gestion des dossiers de consultation et suivi médical.",
        version: "2.1.0",
        status: "active",
        lastUpdate: "2025-01-13",
        dependencies: ["Gestion des patients", "Base de données"],
        icon: Box,
    },
    {
        id: "mod-008",
        name: "Consultation vidéo",
        description: "Module de consultation vidéo en temps réel avec partage d'écran.",
        version: "2.0.5",
        status: "active",
        lastUpdate: "2025-01-15",
        dependencies: ["WebRTC", "Téléconsultation vidéo"],
        icon: Video,
    },
    {
        id: "mod-009",
        name: "Prescription",
        description: "Module avancé de gestion des prescriptions médicales et suivi des médicaments.",
        version: "3.0.1",
        status: "active",
        lastUpdate: "2025-01-16",
        dependencies: ["Ordonnances électroniques", "Base de données"],
        icon: FileText,
    },
];

const mockModuleHistory: ModuleHistory[] = [
    {
        id: "hist-001",
        moduleId: "mod-006",
        version: "1.0.0",
        action: "created",
        modifiedBy: "Admin System",
        modifiedAt: "2025-01-14 10:30",
        changes: "Création du module Intelligence Artificielle",
    },
    {
        id: "hist-002",
        moduleId: "mod-006",
        version: "1.0.0",
        action: "activated",
        modifiedBy: "Admin System",
        modifiedAt: "2025-01-14 10:35",
        changes: "Module activé pour tous les centres",
    },
    {
        id: "hist-003",
        moduleId: "mod-007",
        version: "2.1.0",
        action: "updated",
        modifiedBy: "Admin System",
        modifiedAt: "2025-01-13 14:20",
        changes: "Mise à jour: Ajout de nouvelles fonctionnalités de suivi",
    },
    {
        id: "hist-004",
        moduleId: "mod-008",
        version: "2.0.5",
        action: "modified",
        modifiedBy: "Admin System",
        modifiedAt: "2025-01-15 09:15",
        changes: "Modification: Amélioration de la qualité vidéo",
    },
    {
        id: "hist-005",
        moduleId: "mod-009",
        version: "3.0.1",
        action: "updated",
        modifiedBy: "Admin System",
        modifiedAt: "2025-01-16 11:45",
        changes: "Mise à jour majeure: Nouveau système de validation des prescriptions",
    },
];

const mockDeployments = [
    { id: "dep-001", module: "Téléconsultation vidéo", version: "1.8.0", centers: ["Tous"], scheduledAt: "2025-01-12 02:00", status: "completed" },
    { id: "dep-002", module: "Notifications SMS", version: "1.2.4", centers: ["Douala", "Bafoussam"], scheduledAt: "2025-01-16 03:00", status: "scheduled" },
    { id: "dep-003", module: "Gestion des patients", version: "2.5.0", centers: ["Tous"], scheduledAt: "2025-01-20 02:00", status: "scheduled" },
];

const statusColors: Record<string, string> = {
    active: "bg-green-100 text-green-800",
    inactive: "bg-gray-100 text-gray-800",
    maintenance: "bg-orange-100 text-orange-800",
};

const statusLabels: Record<string, string> = {
    active: "Actif",
    inactive: "Inactif",
    maintenance: "Maintenance",
};

export default function ModulesPage() {
    const [selectedModule, setSelectedModule] = useState<Module | null>(null);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [isHistoryDialogOpen, setIsHistoryDialogOpen] = useState(false);
    const [editFormData, setEditFormData] = useState({
        name: "",
        description: "",
        version: "",
    });

    return (
        <div className="flex flex-col h-full font-sans">
            <DashboardHeader
                breadcrumbs={[
                    { label: "Administration", href: "/admin" },
                    { label: "Gestion des modules" },
                ]}
            />

            <div className="flex-1 p-4 space-y-4 overflow-auto">
                <Tabs defaultValue="modules">
                    <TabsList>
                        <TabsTrigger value="modules">Modules</TabsTrigger>
                        <TabsTrigger value="deployments">Déploiements</TabsTrigger>
                        <TabsTrigger value="history">Historique</TabsTrigger>
                        <TabsTrigger value="dependencies">Dépendances</TabsTrigger>
                        <TabsTrigger value="parameters">Paramètres</TabsTrigger>
                    </TabsList>

                    <TabsContent value="modules" className="space-y-4 mt-4">
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {mockModules.map((module) => {
                                const IconComponent = module.icon || Package;
                                return (
                                    <Card key={module.id}>
                                        <CardHeader className="pb-2">
                                            <div className="flex items-start justify-between">
                                                <div className="flex items-center gap-2">
                                                    <IconComponent className="size-5 text-primary" />
                                                    <CardTitle className="text-base">{module.name}</CardTitle>
                                                </div>
                                                <Badge className={statusColors[module.status]}>
                                                    {statusLabels[module.status]}
                                                </Badge>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <p className="text-sm text-muted-foreground">{module.description}</p>
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="text-muted-foreground">Version {module.version}</span>
                                                <span className="text-muted-foreground">{module.lastUpdate}</span>
                                            </div>
                                            <div className="flex items-center gap-2 flex-wrap">
                                                {module.status === "active" ? (
                                                    <Button size="sm" variant="outline">
                                                        <Pause className="mr-1 size-3" />
                                                        Désactiver
                                                    </Button>
                                                ) : (
                                                    <Button size="sm" variant="outline">
                                                        <Play className="mr-1 size-3" />
                                                        Activer
                                                    </Button>
                                                )}
                                                <Button size="sm" variant="outline">
                                                    <RefreshCw className="mr-1 size-3" />
                                                    Mettre à jour
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={() => {
                                                        setSelectedModule(module);
                                                        setEditFormData({
                                                            name: module.name,
                                                            description: module.description,
                                                            version: module.version,
                                                        });
                                                        setIsEditDialogOpen(true);
                                                    }}
                                                >
                                                    <Edit className="size-4" />
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={() => {
                                                        setSelectedModule(module);
                                                        setIsHistoryDialogOpen(true);
                                                    }}
                                                >
                                                    <History className="size-4" />
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                );
                            })}
                        </div>
                    </TabsContent>

                    <TabsContent value="deployments" className="space-y-4 mt-4">
                        <div className="flex justify-between items-center">
                            <h2 className="text-lg font-semibold">Déploiements planifiés</h2>
                            <Button>
                                <Calendar className="mr-2 size-4" />
                                Planifier un déploiement
                            </Button>
                        </div>
                        <Card>
                            <CardContent className="pt-6">
                                <div className="space-y-4">
                                    {mockDeployments.map((deployment) => (
                                        <div
                                            key={deployment.id}
                                            className="flex items-center justify-between p-4 bg-muted/50 rounded-lg"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className={`size-3 rounded-full ${deployment.status === "completed" ? "bg-green-500" : "bg-blue-500"}`} />
                                                <div>
                                                    <p className="font-medium">{deployment.module} v{deployment.version}</p>
                                                    <p className="text-sm text-muted-foreground">
                                                        Centres: {deployment.centers.join(", ")}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <div className="text-right">
                                                    <p className="text-sm font-medium flex items-center gap-1">
                                                        <Clock className="size-3" />
                                                        {deployment.scheduledAt}
                                                    </p>
                                                    <Badge variant={deployment.status === "completed" ? "default" : "secondary"}>
                                                        {deployment.status === "completed" ? "Terminé" : "Planifié"}
                                                    </Badge>
                                                </div>
                                                {deployment.status !== "completed" && (
                                                    <Button size="sm" variant="outline">Modifier</Button>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="history" className="space-y-4 mt-4">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <History className="size-5" />
                                    Historique des modifications
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {mockModuleHistory.map((history) => {
                                        const relatedModule = mockModules.find((m) => m.id === history.moduleId);
                                        const actionLabels: Record<string, string> = {
                                            created: "Créé",
                                            updated: "Mis à jour",
                                            activated: "Activé",
                                            deactivated: "Désactivé",
                                            modified: "Modifié",
                                        };
                                        const actionColors: Record<string, string> = {
                                            created: "bg-blue-100 text-blue-800",
                                            updated: "bg-green-100 text-green-800",
                                            activated: "bg-purple-100 text-purple-800",
                                            deactivated: "bg-orange-100 text-orange-800",
                                            modified: "bg-yellow-100 text-yellow-800",
                                        };
                                        return (
                                            <div
                                                key={history.id}
                                                className="flex items-start gap-4 p-4 bg-muted/50 rounded-lg"
                                            >
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <p className="font-medium">{relatedModule?.name || "Module inconnu"}</p>
                                                        <Badge className={actionColors[history.action]}>
                                                            {actionLabels[history.action]}
                                                        </Badge>
                                                        <span className="text-xs text-muted-foreground">
                                                            v{history.version}
                                                        </span>
                                                    </div>
                                                    {history.changes && (
                                                        <p className="text-sm text-muted-foreground mb-2">
                                                            {history.changes}
                                                        </p>
                                                    )}
                                                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                                        <span className="flex items-center gap-1">
                                                            <Clock className="size-3" />
                                                            {new Date(history.modifiedAt).toLocaleString("fr-FR")}
                                                        </span>
                                                        <span>par {history.modifiedBy}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="dependencies" className="space-y-4 mt-4">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <GitBranch className="size-5" />
                                    Arbre des dépendances
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {mockModules.map((module) => (
                                        <div key={module.id} className="p-4 bg-muted/50 rounded-lg">
                                            <p className="font-medium">{module.name}</p>
                                            <div className="mt-2 flex flex-wrap gap-2">
                                                {module.dependencies.map((dep) => (
                                                    <Badge key={dep} variant="outline">{dep}</Badge>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="parameters" className="space-y-4 mt-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Paramètres globaux des modules</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <Label>Mises à jour automatiques</Label>
                                        <p className="text-sm text-muted-foreground">
                                            Appliquer automatiquement les mises à jour mineures
                                        </p>
                                    </div>
                                    <Switch />
                                </div>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <Label>Notifications de maintenance</Label>
                                        <p className="text-sm text-muted-foreground">
                                            Recevoir des alertes avant les maintenances planifiées
                                        </p>
                                    </div>
                                    <Switch defaultChecked />
                                </div>
                                <div>
                                    <Label>Fenêtre de maintenance</Label>
                                    <Select defaultValue="night">
                                        <SelectTrigger className="mt-1 w-64">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="night">Nuit (02:00 - 05:00)</SelectItem>
                                            <SelectItem value="weekend">Week-end</SelectItem>
                                            <SelectItem value="manual">Manuel uniquement</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <Button>Enregistrer les paramètres</Button>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>

            {/* Edit Module Dialog */}
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Modifier le module</DialogTitle>
                        <DialogDescription>
                            Modifiez les informations du module {selectedModule?.name}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4">
                        <div>
                            <Label>Nom du module</Label>
                            <Input
                                value={editFormData.name}
                                onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                                className="mt-1"
                            />
                        </div>
                        <div>
                            <Label>Description</Label>
                            <Input
                                value={editFormData.description}
                                onChange={(e) =>
                                    setEditFormData({ ...editFormData, description: e.target.value })
                                }
                                className="mt-1"
                            />
                        </div>
                        <div>
                            <Label>Version</Label>
                            <Input
                                value={editFormData.version}
                                onChange={(e) => setEditFormData({ ...editFormData, version: e.target.value })}
                                className="mt-1"
                                placeholder="ex: 1.0.0"
                            />
                        </div>
                        {selectedModule && (
                            <div>
                                <Label>Dépendances</Label>
                                <div className="flex flex-wrap gap-2 mt-1">
                                    {selectedModule.dependencies.map((dep) => (
                                        <Badge key={dep} variant="outline">
                                            {dep}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                            Annuler
                        </Button>
                        <Button
                            onClick={() => {
                                toast.success("Module modifié avec succès");
                                setIsEditDialogOpen(false);
                            }}
                        >
                            Enregistrer les modifications
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* History Dialog */}
            <Dialog open={isHistoryDialogOpen} onOpenChange={setIsHistoryDialogOpen}>
                <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <History className="size-5" />
                            Historique - {selectedModule?.name}
                        </DialogTitle>
                        <DialogDescription>
                            Historique complet des modifications de ce module
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-3">
                        {mockModuleHistory
                            .filter((h) => h.moduleId === selectedModule?.id)
                            .map((history) => {
                                const actionLabels: Record<string, string> = {
                                    created: "Créé",
                                    updated: "Mis à jour",
                                    activated: "Activé",
                                    deactivated: "Désactivé",
                                    modified: "Modifié",
                                };
                                const actionColors: Record<string, string> = {
                                    created: "bg-blue-100 text-blue-800",
                                    updated: "bg-green-100 text-green-800",
                                    activated: "bg-purple-100 text-purple-800",
                                    deactivated: "bg-orange-100 text-orange-800",
                                    modified: "bg-yellow-100 text-yellow-800",
                                };
                                return (
                                    <div
                                        key={history.id}
                                        className="flex items-start gap-4 p-4 bg-muted/50 rounded-lg"
                                    >
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <Badge className={actionColors[history.action]}>
                                                    {actionLabels[history.action]}
                                                </Badge>
                                                <span className="text-sm font-medium">v{history.version}</span>
                                            </div>
                                            {history.changes && (
                                                <p className="text-sm text-muted-foreground mb-2">
                                                    {history.changes}
                                                </p>
                                            )}
                                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                                <span className="flex items-center gap-1">
                                                    <Clock className="size-3" />
                                                    {new Date(history.modifiedAt).toLocaleString("fr-FR")}
                                                </span>
                                                <span>par {history.modifiedBy}</span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        {mockModuleHistory.filter((h) => h.moduleId === selectedModule?.id).length === 0 && (
                            <p className="text-sm text-muted-foreground text-center py-4">
                                Aucun historique disponible pour ce module
                            </p>
                        )}
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsHistoryDialogOpen(false)}>
                            Fermer
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Configuration Dialog */}
            <Dialog open={!!selectedModule && !isEditDialogOpen && !isHistoryDialogOpen} onOpenChange={() => setSelectedModule(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{selectedModule?.name}</DialogTitle>
                        <DialogDescription>Configuration du module</DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4">
                        <div>
                            <Label>Version actuelle</Label>
                            <p className="text-sm mt-1">{selectedModule?.version}</p>
                        </div>
                        <div>
                            <Label>Dépendances</Label>
                            <div className="flex flex-wrap gap-2 mt-1">
                                {selectedModule?.dependencies.map((dep) => (
                                    <Badge key={dep} variant="outline">
                                        {dep}
                                    </Badge>
                                ))}
                            </div>
                        </div>
                        <div>
                            <Label>Description</Label>
                            <p className="text-sm text-muted-foreground mt-1">{selectedModule?.description}</p>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setSelectedModule(null)}>
                            Fermer
                        </Button>
                        <Button>Configurer</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
