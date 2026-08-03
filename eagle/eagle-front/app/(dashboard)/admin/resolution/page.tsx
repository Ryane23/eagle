"use client";

import { useState } from "react";
import { AdminQuickStats } from "@/components/admin/admin-quick-stats";
import { DashboardHeader } from "@/components/layout/dashboard-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    CheckCircle,
    Clock,
    User,
    MessageSquare,
    ArrowRight,
} from "lucide-react";

type Task = {
    id: string;
    title: string;
    description: string;
    status: "pending" | "in_progress" | "completed";
    priority: "low" | "medium" | "high";
    assignee: string;
    incidentId: string;
    createdAt: string;
    dueDate: string;
};

const mockTasks: Task[] = [
    {
        id: "TSK-001",
        title: "Analyser les logs du serveur Maroua",
        description: "Identifier la cause de la latence élevée en analysant les logs système.",
        status: "in_progress",
        priority: "high",
        assignee: "Admin EAGLE",
        incidentId: "INC-001",
        createdAt: "2025-01-15 10:00",
        dueDate: "2025-01-15 18:00",
    },
    {
        id: "TSK-002",
        title: "Contacter le fournisseur réseau",
        description: "Vérifier avec le FAI si des travaux sont en cours dans la région.",
        status: "pending",
        priority: "medium",
        assignee: "Non assigné",
        incidentId: "INC-001",
        createdAt: "2025-01-15 10:30",
        dueDate: "2025-01-16 12:00",
    },
    {
        id: "TSK-003",
        title: "Réparer la synchronisation Douala-Yaoundé",
        description: "Corriger le bug de synchronisation des dossiers patients.",
        status: "in_progress",
        priority: "high",
        assignee: "Équipe technique",
        incidentId: "INC-002",
        createdAt: "2025-01-14 15:00",
        dueDate: "2025-01-15 17:00",
    },
    {
        id: "TSK-004",
        title: "Mettre à jour le module vidéo",
        description: "Déployer la nouvelle version du module de visioconférence.",
        status: "pending",
        priority: "high",
        assignee: "Admin EAGLE",
        incidentId: "INC-003",
        createdAt: "2025-01-13 12:00",
        dueDate: "2025-01-16 09:00",
    },
];

const statusColors: Record<string, string> = {
    pending: "bg-gray-100 text-gray-800",
    in_progress: "bg-blue-100 text-blue-800",
    completed: "bg-green-100 text-green-800",
};

const statusLabels: Record<string, string> = {
    pending: "En attente",
    in_progress: "En cours",
    completed: "Terminé",
};

const priorityColors: Record<string, string> = {
    low: "bg-gray-100 text-gray-800",
    medium: "bg-yellow-100 text-yellow-800",
    high: "bg-orange-100 text-orange-800",
};

export default function ResolutionCenterPage() {
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);

    const pendingTasks = mockTasks.filter((t) => t.status === "pending");
    const inProgressTasks = mockTasks.filter((t) => t.status === "in_progress");
    const completedTasks = mockTasks.filter((t) => t.status === "completed");

    const TaskCard = ({ task }: { task: Task }) => (
        <div className="p-4 bg-muted/50 rounded-lg border border-border space-y-3 font-sans">
            <div className="flex items-start justify-between">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono text-xs text-muted-foreground">{task.id}</span>
                        <Badge className={priorityColors[task.priority]}>{task.priority}</Badge>
                    </div>
                    <p className="font-medium">{task.title}</p>
                </div>
                <Badge className={statusColors[task.status]}>{statusLabels[task.status]}</Badge>
            </div>
            <p className="text-sm text-muted-foreground">{task.description}</p>
            <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-4 text-muted-foreground">
                    <span className="flex items-center gap-1">
                        <User className="size-3" />
                        {task.assignee}
                    </span>
                    <span className="flex items-center gap-1">
                        <Clock className="size-3" />
                        {task.dueDate}
                    </span>
                </div>
                <Button size="sm" variant="outline" onClick={() => setSelectedTask(task)}>
                    Détails
                    <ArrowRight className="ml-1 size-3" />
                </Button>
            </div>
        </div>
    );

    return (
        <div className="flex flex-col h-full">
            <DashboardHeader
                breadcrumbs={[
                    { label: "Administration", href: "/admin" },
                    { label: "Centre de résolution" },
                ]}
                actions={
                    <Button size="sm">
                        <CheckCircle className="mr-2 size-4" />
                        Nouvelle tâche
                    </Button>
                }
            />

            <div className="flex-1 p-4 space-y-4 overflow-auto">
                <AdminQuickStats
                    stats={[
                        {
                            label: "En attente",
                            value: pendingTasks.length,
                            icon: Clock,
                            color: "text-gray-600",
                        },
                        {
                            label: "En cours",
                            value: inProgressTasks.length,
                            icon: MessageSquare,
                            color: "text-blue-600",
                        },
                        {
                            label: "Terminées",
                            value: completedTasks.length,
                            icon: CheckCircle,
                            color: "text-green-600",
                        },
                    ]}
                />

                <Tabs defaultValue="all">
                    <TabsList>
                        <TabsTrigger value="all">Toutes ({mockTasks.length})</TabsTrigger>
                        <TabsTrigger value="pending">En attente ({pendingTasks.length})</TabsTrigger>
                        <TabsTrigger value="in_progress">En cours ({inProgressTasks.length})</TabsTrigger>
                        <TabsTrigger value="completed">Terminées ({completedTasks.length})</TabsTrigger>
                    </TabsList>

                    <TabsContent value="all" className="space-y-4 mt-4">
                        {mockTasks.map((task) => (
                            <TaskCard key={task.id} task={task} />
                        ))}
                    </TabsContent>

                    <TabsContent value="pending" className="space-y-4 mt-4">
                        {pendingTasks.map((task) => (
                            <TaskCard key={task.id} task={task} />
                        ))}
                    </TabsContent>

                    <TabsContent value="in_progress" className="space-y-4 mt-4">
                        {inProgressTasks.map((task) => (
                            <TaskCard key={task.id} task={task} />
                        ))}
                    </TabsContent>

                    <TabsContent value="completed" className="space-y-4 mt-4">
                        {completedTasks.length === 0 ? (
                            <p className="text-muted-foreground text-center py-8">
                                Aucune tâche terminée
                            </p>
                        ) : (
                            completedTasks.map((task) => (
                                <TaskCard key={task.id} task={task} />
                            ))
                        )}
                    </TabsContent>
                </Tabs>
            </div>

            <Dialog open={!!selectedTask} onOpenChange={() => setSelectedTask(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{selectedTask?.title}</DialogTitle>
                        <DialogDescription>
                            Tâche {selectedTask?.id} • Incident {selectedTask?.incidentId}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4">
                        <div>
                            <Label>Description</Label>
                            <p className="text-sm text-muted-foreground mt-1">{selectedTask?.description}</p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label>Assigné à</Label>
                                <Select defaultValue={selectedTask?.assignee}>
                                    <SelectTrigger className="mt-1">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Non assigné">Non assigné</SelectItem>
                                        <SelectItem value="Admin EAGLE">Admin EAGLE</SelectItem>
                                        <SelectItem value="Équipe technique">Équipe technique</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label>Statut</Label>
                                <Select defaultValue={selectedTask?.status}>
                                    <SelectTrigger className="mt-1">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="pending">En attente</SelectItem>
                                        <SelectItem value="in_progress">En cours</SelectItem>
                                        <SelectItem value="completed">Terminé</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div>
                            <Label>Ajouter une note</Label>
                            <Textarea placeholder="Décrivez l&apos;avancement..." className="mt-1" />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setSelectedTask(null)}>
                            Annuler
                        </Button>
                        <Button>
                            <MessageSquare className="mr-2 size-4" />
                            Mettre à jour
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
