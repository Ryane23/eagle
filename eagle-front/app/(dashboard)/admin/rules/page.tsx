"use client";

import { useState } from "react";
import { DashboardHeader } from "@/components/layout/dashboard-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
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
    Users,
    AlertTriangle,
    Clock,
    Play,
    Download,
    Upload,
    History,
    Calendar,
    Save,
} from "lucide-react";

const urgencyLevels = [
    { level: 1, name: "Non urgent", color: "bg-gray-100 text-gray-800", maxWait: 120, notification: false },
    { level: 2, name: "Peu urgent", color: "bg-blue-100 text-blue-800", maxWait: 90, notification: false },
    { level: 3, name: "Urgent", color: "bg-yellow-100 text-yellow-800", maxWait: 45, notification: true },
    { level: 4, name: "Très urgent", color: "bg-orange-100 text-orange-800", maxWait: 20, notification: true },
    { level: 5, name: "Critique", color: "bg-red-100 text-red-800", maxWait: 5, notification: true },
];

const configHistory = [
    { id: 1, date: "2025-01-15 10:30", user: "Admin", changes: "Durée consultation modifiée: 25 → 30 min" },
    { id: 2, date: "2025-01-14 15:00", user: "Admin", changes: "Seuil urgence niveau 4 modifié" },
    { id: 3, date: "2025-01-12 09:00", user: "Admin", changes: "Activation alerte délai > 10 min" },
];

export default function RulesPage() {
    const [isSimulationOpen, setIsSimulationOpen] = useState(false);
    const [consultationDuration, setConsultationDuration] = useState([30]);
    const [bandwidthThreshold, setBandwidthThreshold] = useState([5]);
    const [delayAlert, setDelayAlert] = useState([10]);

    return (
        <div className="flex flex-col h-full font-sans">
            <DashboardHeader
                breadcrumbs={[
                    { label: "Administration", href: "/admin" },
                    { label: "Règles opérationnelles" },
                ]}
            />

            <div className="flex-1 p-6 space-y-6 overflow-auto">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-primary">Configuration des règles opérationnelles</h1>
                        <p className="text-muted-foreground">
                            Paramétrez le fonctionnement du système EAGLE
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="outline">
                            <Upload className="mr-2 size-4" />
                            Importer
                        </Button>
                        <Button variant="outline">
                            <Download className="mr-2 size-4" />
                            Exporter
                        </Button>
                        <Button>
                            <Save className="mr-2 size-4" />
                            Enregistrer
                        </Button>
                    </div>
                </div>

                <Tabs defaultValue="distribution">
                    <TabsList>
                        <TabsTrigger value="distribution">Distribution patients</TabsTrigger>
                        <TabsTrigger value="urgency">Niveaux d&apos;urgence</TabsTrigger>
                        <TabsTrigger value="consultation">Paramètres consultation</TabsTrigger>
                        <TabsTrigger value="simulation">Simulation</TabsTrigger>
                        <TabsTrigger value="history">Historique</TabsTrigger>
                    </TabsList>

                    <TabsContent value="distribution" className="space-y-4 mt-4">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Users className="size-5" />
                                    Règles de distribution des patients
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <Label>Distribution automatique</Label>
                                        <p className="text-sm text-muted-foreground">
                                            Assigner automatiquement les patients aux médecins disponibles
                                        </p>
                                    </div>
                                    <Switch defaultChecked />
                                </div>

                                <div className="flex items-center justify-between">
                                    <div>
                                        <Label>Équilibrage de charge</Label>
                                        <p className="text-sm text-muted-foreground">
                                            Répartir équitablement les consultations entre les médecins
                                        </p>
                                    </div>
                                    <Switch defaultChecked />
                                </div>

                                <div>
                                    <Label>Algorithme de distribution</Label>
                                    <Select defaultValue="round_robin">
                                        <SelectTrigger className="mt-1 w-64">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="round_robin">Tour de rôle</SelectItem>
                                            <SelectItem value="least_busy">Moins occupé d&apos;abord</SelectItem>
                                            <SelectItem value="specialty_match">Correspondance spécialité</SelectItem>
                                            <SelectItem value="manual">Manuel uniquement</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div>
                                    <Label>Préréglages par type de centre</Label>
                                    <div className="grid grid-cols-2 gap-4 mt-2">
                                        <Card className="p-4">
                                            <p className="font-medium">Centre urbain</p>
                                            <p className="text-sm text-muted-foreground">Haute capacité, multi-spécialités</p>
                                            <Button size="sm" variant="outline" className="mt-2">Appliquer</Button>
                                        </Card>
                                        <Card className="p-4">
                                            <p className="font-medium">Centre rural</p>
                                            <p className="text-sm text-muted-foreground">Capacité limitée, généraliste</p>
                                            <Button size="sm" variant="outline" className="mt-2">Appliquer</Button>
                                        </Card>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="urgency" className="space-y-4 mt-4">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <AlertTriangle className="size-5" />
                                    Configuration des niveaux d&apos;urgence
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {urgencyLevels.map((level) => (
                                        <div key={level.level} className="p-4 bg-muted/50 rounded-lg">
                                            <div className="flex items-center justify-between mb-4">
                                                <div className="flex items-center gap-3">
                                                    <Badge className={level.color}>Niveau {level.level}</Badge>
                                                    <span className="font-medium">{level.name}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm text-muted-foreground">Notification immédiate</span>
                                                    <Switch defaultChecked={level.notification} />
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <Label className="text-xs">Temps d&apos;attente max (min)</Label>
                                                    <Input type="number" defaultValue={level.maxWait} className="mt-1" />
                                                </div>
                                                <div>
                                                    <Label className="text-xs">Action si dépassé</Label>
                                                    <Select defaultValue="alert">
                                                        <SelectTrigger className="mt-1">
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="alert">Alerte uniquement</SelectItem>
                                                            <SelectItem value="escalate">Escalader</SelectItem>
                                                            <SelectItem value="reassign">Réassigner</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="consultation" className="space-y-4 mt-4">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Clock className="size-5" />
                                    Paramètres de consultation
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <Label>Durée par défaut (minutes)</Label>
                                        <span className="font-medium">{consultationDuration[0]} min</span>
                                    </div>
                                    <Slider
                                        value={consultationDuration}
                                        onValueChange={setConsultationDuration}
                                        max={60}
                                        min={15}
                                        step={5}
                                    />
                                </div>

                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <Label>Seuil bande passante min (Mbps)</Label>
                                        <span className="font-medium">{bandwidthThreshold[0]} Mbps</span>
                                    </div>
                                    <Slider
                                        value={bandwidthThreshold}
                                        onValueChange={setBandwidthThreshold}
                                        max={20}
                                        min={1}
                                        step={1}
                                    />
                                    <p className="text-xs text-muted-foreground mt-1">
                                        Alerte si la bande passante descend en dessous de ce seuil
                                    </p>
                                </div>

                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <Label>Alerte délai démarrage (minutes)</Label>
                                        <span className="font-medium">{delayAlert[0]} min</span>
                                    </div>
                                    <Slider
                                        value={delayAlert}
                                        onValueChange={setDelayAlert}
                                        max={30}
                                        min={5}
                                        step={1}
                                    />
                                    <p className="text-xs text-muted-foreground mt-1">
                                        Notification si la consultation ne démarre pas dans ce délai
                                    </p>
                                </div>

                                <div className="flex items-center justify-between">
                                    <div>
                                        <Label>Enregistrement automatique</Label>
                                        <p className="text-sm text-muted-foreground">
                                            Sauvegarder automatiquement les sessions vidéo
                                        </p>
                                    </div>
                                    <Switch />
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="simulation" className="space-y-4 mt-4">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Play className="size-5" />
                                    Simulation des règles
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <p className="text-muted-foreground">
                                    Testez l&apos;impact des modifications avant de les appliquer.
                                </p>

                                <div className="grid md:grid-cols-2 gap-4">
                                    <div>
                                        <Label>Scénario</Label>
                                        <Select defaultValue="peak">
                                            <SelectTrigger className="mt-1">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="normal">Jour normal</SelectItem>
                                                <SelectItem value="peak">Pic d&apos;activité</SelectItem>
                                                <SelectItem value="emergency">Urgence multiple</SelectItem>
                                                <SelectItem value="degraded">Mode dégradé</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div>
                                        <Label>Centre cible</Label>
                                        <Select defaultValue="all">
                                            <SelectTrigger className="mt-1">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">Tous les centres</SelectItem>
                                                <SelectItem value="yaounde">Yaoundé</SelectItem>
                                                <SelectItem value="douala">Douala</SelectItem>
                                                <SelectItem value="bafoussam">Bafoussam</SelectItem>
                                                <SelectItem value="maroua">Maroua</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <Button onClick={() => setIsSimulationOpen(true)}>
                                    <Play className="mr-2 size-4" />
                                    Lancer la simulation
                                </Button>
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
                                <div className="space-y-4">
                                    {configHistory.map((entry) => (
                                        <div key={entry.id} className="flex items-start gap-4 p-3 bg-muted/50 rounded-lg">
                                            <Calendar className="size-4 text-muted-foreground mt-1" />
                                            <div className="flex-1">
                                                <p className="font-medium">{entry.changes}</p>
                                                <p className="text-sm text-muted-foreground">
                                                    Par {entry.user} • {entry.date}
                                                </p>
                                            </div>
                                            <Button size="sm" variant="outline">Restaurer</Button>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Calendar className="size-5" />
                                    Planifier un changement
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div>
                                        <Label>Date d&apos;application</Label>
                                        <Input type="datetime-local" className="mt-1" />
                                    </div>
                                    <div>
                                        <Label>Configuration à appliquer</Label>
                                        <Select>
                                            <SelectTrigger className="mt-1">
                                                <SelectValue placeholder="Sélectionner..." />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="current">Configuration actuelle</SelectItem>
                                                <SelectItem value="backup_1">Backup 2025-01-15</SelectItem>
                                                <SelectItem value="backup_2">Backup 2025-01-14</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <Button variant="outline">
                                    <Calendar className="mr-2 size-4" />
                                    Planifier
                                </Button>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>

            <Dialog open={isSimulationOpen} onOpenChange={setIsSimulationOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Résultats de la simulation</DialogTitle>
                        <DialogDescription>
                            Impact estimé des règles configurées
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4">
                        <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                            <p className="font-medium text-green-800">Temps d&apos;attente moyen</p>
                            <p className="text-2xl font-bold text-green-700">-15%</p>
                            <p className="text-sm text-green-600">Réduction estimée</p>
                        </div>
                        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                            <p className="font-medium text-blue-800">Capacité de traitement</p>
                            <p className="text-2xl font-bold text-blue-700">+8%</p>
                            <p className="text-sm text-blue-600">Augmentation estimée</p>
                        </div>
                        <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                            <p className="font-medium text-yellow-800">Risque de surcharge</p>
                            <p className="text-2xl font-bold text-yellow-700">Faible</p>
                            <p className="text-sm text-yellow-600">En période de pic</p>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsSimulationOpen(false)}>
                            Fermer
                        </Button>
                        <Button>Appliquer ces règles</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

