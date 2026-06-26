export const systemStats = [
  { title: "Utilisateurs actifs", value: "23", icon: "Users", trend: "+5%", color: "text-blue-500" },
  { title: "Incidents ouverts", value: "2", icon: "AlertTriangle", trend: "-1", color: "text-orange-500" },
  { title: "Santé système", value: "98%", icon: "Activity", trend: "+2%", color: "text-green-500" },
  { title: "Serveurs actifs", value: "4/4", icon: "Server", trend: "stable", color: "text-purple-500" },
];

export const recentActivity = [
  { id: 1, action: "Nouvel utilisateur créé", user: "Admin", time: "Il y a 5 min", type: "user" },
  { id: 2, action: "Module mis à jour", user: "Système", time: "Il y a 15 min", type: "module" },
  { id: 3, action: "Incident résolu #INC-042", user: "Admin", time: "Il y a 30 min", type: "incident" },
  { id: 4, action: "Backup automatique terminé", user: "Système", time: "Il y a 1h", type: "system" },
];

export const quickLinks = [
  { title: "Gérer les utilisateurs", url: "/admin/users", icon: "Users" },
  { title: "Voir les incidents", url: "/admin/incidents", icon: "AlertTriangle" },
  { title: "Supervision technique", url: "/admin/supervision", icon: "Activity" },
  { title: "Configurer les règles", url: "/admin/rules", icon: "CheckCircle" },
];

export const centerOverview = [
  { name: "Yaoundé (Principal)", status: "online", load: "45%", users: 8 },
  { name: "Douala", status: "online", load: "62%", users: 4 },
  { name: "Bafoussam", status: "online", load: "38%", users: 3 },
  { name: "Maroua", status: "degraded", load: "78%", users: 2 },
];

export const notifications = [
  { id: 1, title: "Nouvelle demande d'urgence", time: "Il y a 5 min", unread: true },
  { id: 2, title: "Consultation confirmée", time: "Il y a 15 min", unread: true },
  { id: 3, title: "Patient prêt", time: "Il y a 30 min", unread: false },
];

