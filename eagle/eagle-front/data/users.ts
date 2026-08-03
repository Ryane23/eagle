import type { SessionUser } from "@/types/user";

type MockUser = {
  id: string;
  name: string;
  email: string;
  role: string;
  center: string;
  status: "active" | "inactive";
  lastLogin: string;
  createdAt: string;
};

export const mockUsers: MockUser[] = [
  { id: "1", name: "Marie Dupont", email: "marie.dupont@eagle.cm", role: "Secrétaire Secondaire", center: "Douala", status: "active", lastLogin: "Il y a 5 min", createdAt: "2024-06-15" },
  { id: "2", name: "Jean Kamga", email: "jean.kamga@eagle.cm", role: "Secrétaire Principal", center: "Yaoundé", status: "active", lastLogin: "Il y a 1h", createdAt: "2024-05-20" },
  { id: "3", name: "Sophie Ateba", email: "sophie.ateba@eagle.cm", role: "Infirmier(ère)", center: "Douala", status: "active", lastLogin: "Il y a 30 min", createdAt: "2024-07-01" },
  { id: "4", name: "Dr. Nana Pierre", email: "dr.nana@eagle.cm", role: "Médecin", center: "Yaoundé", status: "active", lastLogin: "Il y a 2h", createdAt: "2024-04-10" },
  { id: "5", name: "Paul Mbeki", email: "paul.mbeki@eagle.cm", role: "Infirmier(ère)", center: "Bafoussam", status: "inactive", lastLogin: "Il y a 3 jours", createdAt: "2024-08-05" },
  { id: "6", name: "Admin EAGLE", email: "admin@eagle.cm", role: "Administrateur", center: "Système", status: "active", lastLogin: "Maintenant", createdAt: "2024-01-01" },
];

export const mockSessionUsers: Record<string, SessionUser> = {
  secondary_secretary: {
    name: "Marie Dupont",
    email: "marie.dupont@eagle.cm",
    role: "secondary_secretary",
    center: "Centre de Douala",
  },
  primary_secretary: {
    name: "Jean Kamga",
    email: "jean.kamga@eagle.cm",
    role: "primary_secretary",
    center: "Centre Principal - Yaoundé",
  },
  nurse: {
    name: "Sophie Ateba",
    email: "sophie.ateba@eagle.cm",
    role: "nurse",
    center: "Centre de Douala",
  },
  doctor: {
    name: "Dr. Nana Pierre",
    email: "dr.nana@eagle.cm",
    role: "doctor",
    center: "Centre Principal - Yaoundé",
  },
  admin: {
    name: "Admin EAGLE",
    email: "admin@eagle.cm",
    role: "admin",
    center: "Système Central",
  },
};

