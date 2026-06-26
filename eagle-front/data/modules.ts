import type { Module, Deployment } from "@/types";

export const mockModules: Module[] = [
  {
    id: "mod-001",
    name: "Gestion des patients",
    description: "Module de gestion des dossiers patients et de leurs informations médicales.",
    version: "2.4.1",
    status: "active",
    lastUpdate: "2025-01-10",
    dependencies: ["Base de données", "Authentification"],
  },
  {
    id: "mod-002",
    name: "Téléconsultation vidéo",
    description: "Module de visioconférence pour les consultations à distance.",
    version: "1.8.0",
    status: "active",
    lastUpdate: "2025-01-12",
    dependencies: ["WebRTC", "Gestion des patients"],
  },
  {
    id: "mod-003",
    name: "Notifications SMS",
    description: "Module d'envoi de notifications SMS aux patients.",
    version: "1.2.3",
    status: "maintenance",
    lastUpdate: "2025-01-08",
    dependencies: ["API SMS", "Gestion des patients"],
  },
  {
    id: "mod-004",
    name: "Ordonnances électroniques",
    description: "Module de création et gestion des ordonnances.",
    version: "1.5.2",
    status: "active",
    lastUpdate: "2025-01-05",
    dependencies: ["Gestion des patients", "PDF Generator"],
  },
  {
    id: "mod-005",
    name: "Statistiques et rapports",
    description: "Module de génération de rapports et statistiques.",
    version: "2.0.0",
    status: "inactive",
    lastUpdate: "2024-12-20",
    dependencies: ["Base de données"],
  },
];

export const mockDeployments: Deployment[] = [
  { id: "dep-001", module: "Téléconsultation vidéo", version: "1.8.0", centers: ["Tous"], scheduledAt: "2025-01-12 02:00", status: "completed" },
  { id: "dep-002", module: "Notifications SMS", version: "1.2.4", centers: ["Douala", "Bafoussam"], scheduledAt: "2025-01-16 03:00", status: "scheduled" },
  { id: "dep-003", module: "Gestion des patients", version: "2.5.0", centers: ["Tous"], scheduledAt: "2025-01-20 02:00", status: "scheduled" },
];

export const moduleStatusColors: Record<string, string> = {
  active: "bg-green-100 text-green-800",
  inactive: "bg-gray-100 text-gray-800",
  maintenance: "bg-orange-100 text-orange-800",
};

export const moduleStatusLabels: Record<string, string> = {
  active: "Actif",
  inactive: "Inactif",
  maintenance: "Maintenance",
};

