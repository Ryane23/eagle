import type { Role, AuditLogEntry } from "@/types";

export const roleHierarchy: Role[] = [
  {
    id: "admin",
    name: "Administrateur",
    description: "Accès complet au système",
    permissions: ["*"],
    inheritedPermissions: [],
    userCount: 1,
    children: [
      {
        id: "primary_secretary",
        name: "Secrétaire Principal",
        description: "Gestion du réseau et validation des urgences",
        permissions: ["urgency.validate", "schedule.manage", "centers.view", "stats.view"],
        inheritedPermissions: ["patients.read", "consultations.read"],
        userCount: 2,
        children: [
          {
            id: "secondary_secretary",
            name: "Secrétaire Secondaire",
            description: "Enregistrement des patients et gestion de la file d'attente",
            permissions: ["patients.create", "queue.manage", "tickets.create"],
            inheritedPermissions: ["patients.read"],
            userCount: 4,
          },
        ],
      },
      {
        id: "doctor",
        name: "Médecin",
        description: "Consultations et prescriptions",
        permissions: ["consultations.conduct", "prescriptions.create", "reports.create", "patients.write"],
        inheritedPermissions: ["patients.read", "consultations.read"],
        userCount: 5,
        children: [
          {
            id: "superior_nurse",
            name: "Infirmier(ère) Supérieur(e)",
            description: "Supervision de l'équipe infirmière et gestion des préparations",
            permissions: ["nurses.manage", "preparations.supervise", "team.schedule", "vitals.record", "consultation.assist", "patients.prepare"],
            inheritedPermissions: ["patients.read", "consultations.read"],
            userCount: 2,
            children: [
              {
                id: "nurse",
                name: "Infirmier(ère)",
                description: "Préparation des patients et assistance aux consultations",
                permissions: ["vitals.record", "consultation.assist", "patients.prepare"],
                inheritedPermissions: ["patients.read"],
                userCount: 6,
              },
            ],
          },
        ],
      },
    ],
  },
];

export const mockAuditLog: AuditLogEntry[] = [
  { id: 1, action: "Permission ajoutée", role: "Médecin", detail: "prescriptions.export", user: "Admin", date: "2025-01-15 10:30" },
  { id: 2, action: "Rôle modifié", role: "Infirmier(ère)", detail: "Description mise à jour", user: "Admin", date: "2025-01-14 15:20" },
  { id: 3, action: "Permission retirée", role: "Secrétaire Secondaire", detail: "patients.delete", user: "Admin", date: "2025-01-13 09:00" },
];

