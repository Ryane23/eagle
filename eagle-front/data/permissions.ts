import type { ModulePermissions, PermissionAnomaly, PermissionRequest } from "@/types";

export const roles = [
  "Secrétaire Secondaire",
  "Secrétaire Principal",
  "Infirmier(ère)",
  "Médecin",
  "Administrateur",
];

export const mockPermissions: ModulePermissions[] = [
  {
    module: "Patients",
    submodules: [
      { name: "Voir les dossiers", permissions: { "Secrétaire Secondaire": "read", "Secrétaire Principal": "read", "Infirmier(ère)": "read", "Médecin": "write", "Administrateur": "admin" } },
      { name: "Créer un patient", permissions: { "Secrétaire Secondaire": "write", "Secrétaire Principal": "write", "Infirmier(ère)": "write", "Médecin": "none", "Administrateur": "admin" } },
      { name: "Modifier un dossier", permissions: { "Secrétaire Secondaire": "none", "Secrétaire Principal": "write", "Infirmier(ère)": "write", "Médecin": "write", "Administrateur": "admin" } },
    ],
  },
  {
    module: "Consultations",
    submodules: [
      { name: "Planifier", permissions: { "Secrétaire Secondaire": "write", "Secrétaire Principal": "write", "Infirmier(ère)": "read", "Médecin": "write", "Administrateur": "admin" } },
      { name: "Rejoindre la vidéo", permissions: { "Secrétaire Secondaire": "none", "Secrétaire Principal": "none", "Infirmier(ère)": "write", "Médecin": "write", "Administrateur": "admin" } },
      { name: "Rédiger un rapport", permissions: { "Secrétaire Secondaire": "none", "Secrétaire Principal": "none", "Infirmier(ère)": "none", "Médecin": "write", "Administrateur": "admin" } },
    ],
  },
  {
    module: "Administration",
    submodules: [
      { name: "Gérer les utilisateurs", permissions: { "Secrétaire Secondaire": "none", "Secrétaire Principal": "none", "Infirmier(ère)": "none", "Médecin": "none", "Administrateur": "admin" } },
      { name: "Configurer le système", permissions: { "Secrétaire Secondaire": "none", "Secrétaire Principal": "none", "Infirmier(ère)": "none", "Médecin": "none", "Administrateur": "admin" } },
      { name: "Voir les logs", permissions: { "Secrétaire Secondaire": "none", "Secrétaire Principal": "none", "Infirmier(ère)": "none", "Médecin": "none", "Administrateur": "admin" } },
    ],
  },
];

export const mockAnomalies: PermissionAnomaly[] = [
  { id: 1, type: "warning", message: "Le rôle Infirmier(ère) a accès en écriture aux dossiers mais pas en lecture sur certains modules.", suggestion: "Vérifier la cohérence des permissions" },
  { id: 2, type: "info", message: "3 utilisateurs ont des permissions personnalisées différentes de leur rôle.", suggestion: "Auditer les exceptions" },
];

export const mockPermissionRequests: PermissionRequest[] = [
  { id: 1, user: "Dr. Fotso", currentRole: "Médecin", requestedPermission: "Accès aux statistiques globales", date: "2025-01-14" },
  { id: 2, user: "Marie Dupont", currentRole: "Secrétaire Secondaire", requestedPermission: "Modifier les dossiers patients", date: "2025-01-13" },
];

