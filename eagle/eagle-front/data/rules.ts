import type { UrgencyLevel, ConfigHistoryEntry } from "@/types";

export const urgencyLevels: UrgencyLevel[] = [
  { level: 1, name: "Non urgent", color: "bg-gray-100 text-gray-800", maxWait: 120, notification: false },
  { level: 2, name: "Peu urgent", color: "bg-blue-100 text-blue-800", maxWait: 90, notification: false },
  { level: 3, name: "Urgent", color: "bg-yellow-100 text-yellow-800", maxWait: 45, notification: true },
  { level: 4, name: "Très urgent", color: "bg-orange-100 text-orange-800", maxWait: 20, notification: true },
  { level: 5, name: "Critique", color: "bg-red-100 text-red-800", maxWait: 5, notification: true },
];

export const mockConfigHistory: ConfigHistoryEntry[] = [
  { id: 1, date: "2025-01-15 10:30", user: "Admin", changes: "Durée consultation modifiée: 25 → 30 min" },
  { id: 2, date: "2025-01-14 15:00", user: "Admin", changes: "Seuil urgence niveau 4 modifié" },
  { id: 3, date: "2025-01-12 09:00", user: "Admin", changes: "Activation alerte délai > 10 min" },
];

