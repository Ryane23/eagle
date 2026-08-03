import type { SystemMetrics, ConnectedUser, CenterStatus, BackupEntry, MaintenanceItem } from "@/types";

export const systemMetrics: SystemMetrics = {
  cpu: { current: 45, peak: 78, unit: "%" },
  memory: { current: 62, peak: 85, unit: "%" },
  disk: { current: 38, peak: 38, unit: "%" },
  bandwidth: { current: 125, peak: 890, unit: "Mbps" },
};

export const mockConnectedUsers: ConnectedUser[] = [
  { id: 1, name: "Marie Dupont", role: "Secrétaire", center: "Douala", activity: "File d'attente", since: "08:30" },
  { id: 2, name: "Dr. Nana", role: "Médecin", center: "Yaoundé", activity: "Consultation", since: "09:00" },
  { id: 3, name: "Sophie Ateba", role: "Infirmière", center: "Douala", activity: "Préparation patient", since: "08:45" },
  { id: 4, name: "Jean Kamga", role: "Secrétaire Principal", center: "Yaoundé", activity: "Validation urgence", since: "09:15" },
];

export const mockCenterStatus: CenterStatus[] = [
  { name: "Yaoundé (Principal)", status: "online", latency: 12, load: 45, services: { video: "ok", db: "ok", api: "ok" } },
  { name: "Douala", status: "online", latency: 35, load: 62, services: { video: "ok", db: "ok", api: "ok" } },
  { name: "Bafoussam", status: "online", latency: 48, load: 38, services: { video: "ok", db: "ok", api: "ok" } },
  { name: "Maroua", status: "degraded", latency: 120, load: 78, services: { video: "degraded", db: "ok", api: "ok" } },
];

export const mockBackupHistory: BackupEntry[] = [
  { id: 1, type: "Complet", date: "2025-01-15 03:00", size: "2.4 GB", status: "success" },
  { id: 2, type: "Incrémental", date: "2025-01-14 03:00", size: "156 MB", status: "success" },
  { id: 3, type: "Incrémental", date: "2025-01-13 03:00", size: "142 MB", status: "success" },
  { id: 4, type: "Complet", date: "2025-01-12 03:00", size: "2.3 GB", status: "success" },
];

export const mockMaintenanceSchedule: MaintenanceItem[] = [
  { component: "Base de données", lastMaintenance: "2025-01-10", nextMaintenance: "2025-02-10", health: 95 },
  { component: "Serveur vidéo", lastMaintenance: "2025-01-05", nextMaintenance: "2025-02-05", health: 88 },
  { component: "API Gateway", lastMaintenance: "2025-01-08", nextMaintenance: "2025-02-08", health: 92 },
  { component: "Stockage", lastMaintenance: "2025-01-01", nextMaintenance: "2025-02-01", health: 78 },
];

