export type NavItem = {
  title: string;
  url: string;
  icon: string;
  badge?: string;
  openInNewTab?: boolean;
  items?: NavItem[];
};

export type NavGroup = {
  label: string;
  items: NavItem[];
};

export const secondarySecretaryNav: NavGroup[] = [
  {
    label: "Principal",
    items: [
      { title: "Tableau de bord", url: "/dashboard/secondary", icon: "LayoutDashboard" },
      { title: "File d'attente", url: "/dashboard/secondary/queue", icon: "ClipboardList" },
    ],
  },
  {
    label: "Patients",
    items: [
      { title: "Nouveau patient", url: "/dashboard/secondary/register", icon: "UserPlus" },
      { title: "Rechercher", url: "/dashboard/secondary/patients", icon: "Users" },
      { title: "Historique", url: "/dashboard/secondary/history", icon: "FileText" },
    ],
  },
  {
    label: "Communication",
    items: [
      { title: "Notifications", url: "/dashboard/secondary/notifications", icon: "Bell" },
    ],
  },
];

export const primarySecretaryNav: NavGroup[] = [
  {
    label: "Principal",
    items: [
      { title: "Tableau de bord", url: "/dashboard/primary", icon: "LayoutDashboard" },
      { title: "Demandes", url: "/dashboard/primary/requests", icon: "ClipboardList", badge: "3" },
    ],
  },
  {
    label: "Validation",
    items: [
      { title: "Urgences à valider", url: "/dashboard/primary/validation", icon: "CheckCircle" },
      { title: "Planning médecins", url: "/dashboard/primary/schedule", icon: "Calendar" },
    ],
  },
  {
    label: "Réseau",
    items: [
      { title: "Centres", url: "/dashboard/primary/centers", icon: "Building2" },
      { title: "Statistiques", url: "/dashboard/primary/stats", icon: "BarChart3" },
    ],
  },
  {
    label: "Communication",
    items: [
      { title: "Notifications", url: "/dashboard/primary/notifications", icon: "Bell" },
    ],
  },
  {
    label: "Système",
    items: [
      { title: "Paramètres", url: "/dashboard/primary/settings", icon: "Settings" },
    ],
  },
];

export const nurseNav: NavGroup[] = [
  {
    label: "Principal",
    items: [
      { title: "Tableau de bord", url: "/dashboard/nurse", icon: "LayoutDashboard" },
      { title: "Patients", url: "/dashboard/nurse/patients", icon: "Users" },
      { title: "Salle d'attente", url: "/dashboard/nurse/waiting-room", icon: "Clock" },
      { title: "Rendez-vous", url: "/dashboard/nurse/appointments", icon: "Calendar" },
      { title: "Salle de préparation", url: "/dashboard/nurse/preparation-room", icon: "ClipboardCheck" },
      {
        title: "Box de consultation",
        url: "/dashboard/nurse/consultation",
        icon: "Video",
        openInNewTab: true,
      },
      { title: "Documents / Post-consultation", url: "/dashboard/nurse/post-consultation", icon: "FileText" },
      { title: "Gestion des Urgences", url: "/dashboard/nurse/emergencies", icon: "AlertTriangle", badge: "2" },
    ],
  },
  {
    label: "Communication",
    items: [
      { title: "Messages", url: "/dashboard/nurse/messages", icon: "MessageSquare", badge: "3" },
      { title: "Notifications", url: "/dashboard/nurse/notifications", icon: "Bell" },
    ],
  },
  {
    label: "Système",
    items: [
      { title: "Paramètres", url: "/dashboard/nurse/settings", icon: "Settings" },
      { title: "Aide", url: "/dashboard/nurse/help", icon: "HelpCircle" },
    ],
  },
];

export const doctorNav: NavGroup[] = [
  {
    label: "Principal",
    items: [
      { title: "Tableau de bord", url: "/dashboard/doctor", icon: "LayoutDashboard" },
      { title: "Mon planning", url: "/dashboard/doctor/schedule", icon: "Calendar" },
      { title: "Salle d'attente", url: "/dashboard/doctor/waiting-room", icon: "Clock" },
    ],
  },
  {
    label: "Consultations",
    items: [
      { title: "Dossiers patients", url: "/dashboard/doctor/patients", icon: "Users" },
      { title: "Salle de consultation", url: "/dashboard/doctor/consultation", icon: "Video" },
      { title: "Urgences", url: "/dashboard/doctor/emergencies", icon: "AlertTriangle", badge: "2" },
    ],
  },
  {
    label: "Documents",
    items: [
      { title: "Ordonnances", url: "/dashboard/doctor/prescriptions", icon: "Pill" },
      { title: "Rapports", url: "/dashboard/doctor/reports", icon: "FileText" },
      { title: "Statistiques", url: "/dashboard/doctor/statistics", icon: "BarChart3" },
    ],
  },
  {
    label: "Communication",
    items: [
      { title: "Messages", url: "/dashboard/doctor/messages", icon: "MessageSquare" },
      { title: "Notifications", url: "/dashboard/doctor/notifications", icon: "Bell" },
    ],
  },
  {
    label: "Système",
    items: [
      { title: "Paramètres", url: "/dashboard/doctor/settings", icon: "Settings" },
    ],
  },
];

export const adminNav: NavGroup[] = [
  {
    label: "Principal",
    items: [
      { title: "Tableau de bord", url: "/admin", icon: "LayoutDashboard" },
      { title: "Incidents", url: "/admin/incidents", icon: "AlertTriangle" },
      { title: "Centre de résolution", url: "/admin/resolution", icon: "CheckCircle" },
    ],
  },
  {
    label: "Gestion",
    items: [
      { title: "Utilisateurs", url: "/admin/users", icon: "Users" },
      { title: "Centres de santé", url: "/admin/hospitals", icon: "Building2" },
      { title: "Validation inscriptions", url: "/admin/centers/validations", icon: "UserCheck" },
      { title: "Modules", url: "/admin/modules", icon: "Package" },
      { title: "Permissions", url: "/admin/permissions", icon: "Lock" },
      { title: "Hiérarchie RBAC", url: "/admin/rbac", icon: "GitBranch" },
    ],
  },
  {
    label: "Supervision",
    items: [
      { title: "Supervision technique", url: "/admin/supervision", icon: "Activity" },
      { title: "Règles opérationnelles", url: "/admin/rules", icon: "Settings" },
    ],
  },
];

export type UserRole = "secondary_secretary" | "primary_secretary" | "nurse" | "superior_nurse" | "doctor" | "admin";

export const roleNavigation: Record<UserRole, NavGroup[]> = {
  secondary_secretary: secondarySecretaryNav,
  primary_secretary: primarySecretaryNav,
  nurse: nurseNav,
  superior_nurse: nurseNav,
  doctor: doctorNav,
  admin: adminNav,
};

export const roleTitles: Record<UserRole, string> = {
  secondary_secretary: "Secrétaire Secondaire",
  primary_secretary: "Secrétaire Principal",
  nurse: "Infirmier(ère)",
  superior_nurse: "Infirmier(ère) Supérieur(e)",
  doctor: "Médecin",
  admin: "Administrateur",
};
