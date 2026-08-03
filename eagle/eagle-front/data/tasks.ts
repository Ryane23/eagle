import type { Task } from "@/types";

export const mockTasks: Task[] = [
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

export const taskStatusColors: Record<string, string> = {
  pending: "bg-gray-100 text-gray-800",
  in_progress: "bg-blue-100 text-blue-800",
  completed: "bg-green-100 text-green-800",
};

export const taskStatusLabels: Record<string, string> = {
  pending: "En attente",
  in_progress: "En cours",
  completed: "Terminé",
};

export const taskPriorityColors: Record<string, string> = {
  low: "bg-gray-100 text-gray-800",
  medium: "bg-yellow-100 text-yellow-800",
  high: "bg-orange-100 text-orange-800",
};

