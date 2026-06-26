import type { Incident } from "@/types";

export const mockIncidents: Incident[] = [
  {
    id: "INC-001",
    title: "Latence élevée sur le serveur de Maroua",
    description: "Les utilisateurs signalent des temps de réponse supérieurs à 5 secondes.",
    status: "open",
    priority: "high",
    assignee: "Non assigné",
    center: "Maroua",
    createdAt: "2025-01-15 09:30",
    updatedAt: "2025-01-15 09:30",
  },
  {
    id: "INC-002",
    title: "Erreur de synchronisation des dossiers patients",
    description: "Certains dossiers ne se synchronisent pas entre Douala et Yaoundé.",
    status: "in_progress",
    priority: "medium",
    assignee: "Admin EAGLE",
    center: "Douala",
    createdAt: "2025-01-14 14:20",
    updatedAt: "2025-01-15 08:00",
  },
  {
    id: "INC-003",
    title: "Problème de connexion vidéo intermittent",
    description: "Les consultations vidéo se déconnectent de manière aléatoire.",
    status: "escalated",
    priority: "critical",
    assignee: "Équipe technique",
    center: "Tous",
    createdAt: "2025-01-13 11:00",
    updatedAt: "2025-01-15 07:30",
  },
  {
    id: "INC-004",
    title: "Notification SMS non envoyée",
    description: "Les rappels SMS aux patients ne sont pas délivrés.",
    status: "resolved",
    priority: "low",
    assignee: "Admin EAGLE",
    center: "Bafoussam",
    createdAt: "2025-01-12 16:45",
    updatedAt: "2025-01-13 10:00",
  },
];

export const incidentStatusColors: Record<string, string> = {
  open: "bg-red-100 text-red-800",
  in_progress: "bg-blue-100 text-blue-800",
  resolved: "bg-green-100 text-green-800",
  escalated: "bg-orange-100 text-orange-800",
};

export const incidentStatusLabels: Record<string, string> = {
  open: "Ouvert",
  in_progress: "En cours",
  resolved: "Résolu",
  escalated: "Escaladé",
};

export const incidentPriorityColors: Record<string, string> = {
  low: "bg-gray-100 text-gray-800",
  medium: "bg-yellow-100 text-yellow-800",
  high: "bg-orange-100 text-orange-800",
  critical: "bg-red-100 text-red-800",
};

export const incidentPriorityLabels: Record<string, string> = {
  low: "Faible",
  medium: "Moyen",
  high: "Élevé",
  critical: "Critique",
};

