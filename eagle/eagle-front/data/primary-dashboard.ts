/**
 * Primary Secretary Dashboard Data
 * Centralized mock data for the primary dashboard
 */

import type {
    CenterDisplay,
    PendingUrgencyValidation,
    ConsultantDisplay,
    ActivityItem,
    NetworkStatsData,
} from "@/types/dashboard";

// Local type aliases for backwards compatibility
type Center = CenterDisplay;
type PendingUrgency = PendingUrgencyValidation;
type Consultant = ConsultantDisplay;

// Network Statistics
export const networkStats: NetworkStatsData = {
    totalPatients: 35,
    waitingPatients: 25,
    inConsultationPatients: 8,
    completedConsultations: 12,
    avgWaitTime: 28,
    urgentPatients: 7,
    pendingValidation: 3,
    centersOnline: 4,
    centersOffline: 1,
    totalCenters: 5,
};

// Centers Data
export const centers: Center[] = [
    {
        id: 1,
        name: "Centre Principal - Douala",
        code: "CP-DLA",
        type: "Centre Principal",
        status: "online",
        bandwidth: 8.5,
        waitingPatients: 12,
        consultants: 5,
        alertLevel: "normal",
        trend: "up",
        lastUpdate: "2 min",
        location: { lat: 4.0511, lng: 9.7679 },
    },
    {
        id: 2,
        name: "Clinique Saint Jean - Yaoundé",
        code: "CSJ-YDE",
        type: "Centre Secondaire",
        status: "online",
        bandwidth: 3.8,
        waitingPatients: 8,
        consultants: 3,
        alertLevel: "normal",
        trend: "stable",
        lastUpdate: "5 min",
        location: { lat: 3.848, lng: 11.5021 },
    },
    {
        id: 3,
        name: "Hôpital de District - Bafoussam",
        code: "HD-BAF",
        type: "Centre Secondaire",
        status: "offline",
        bandwidth: 0,
        waitingPatients: 5,
        consultants: 2,
        alertLevel: "issue",
        trend: "down",
        lastUpdate: "32 min",
        location: { lat: 5.4667, lng: 10.4167 },
    },
    {
        id: 4,
        name: "Centre Médical - Limbé",
        code: "CM-LIM",
        type: "Centre Secondaire",
        status: "online",
        bandwidth: 2.2,
        waitingPatients: 14,
        consultants: 2,
        alertLevel: "warning",
        trend: "up",
        lastUpdate: "3 min",
        location: { lat: 4.0225, lng: 9.21 },
    },
    {
        id: 5,
        name: "Clinique Moderne - Kribi",
        code: "CMK-KRI",
        type: "Centre Secondaire",
        status: "online",
        bandwidth: 4.1,
        waitingPatients: 6,
        consultants: 2,
        alertLevel: "normal",
        trend: "stable",
        lastUpdate: "1 min",
        location: { lat: 2.95, lng: 9.9 },
    },
];

// Active Consultants
export const activeConsultants: Consultant[] = [
    {
        id: 1,
        name: "Dr. Kamga Jean",
        specialty: "Cardiologie",
        patients: 3,
        status: "En consultation",
        center: "CP-DLA",
        since: "08:30",
        photo: "KJ",
        trend: "stable",
    },
    {
        id: 2,
        name: "Dr. Ndolo Marie",
        specialty: "Pédiatrie",
        patients: 2,
        status: "Disponible",
        center: "CP-DLA",
        since: "09:00",
        photo: "NM",
        trend: "up",
    },
    {
        id: 3,
        name: "Dr. Biyong Paul",
        specialty: "Neurologie",
        patients: 1,
        status: "En pause",
        center: "CSJ-YDE",
        since: "08:45",
        photo: "BP",
        trend: "down",
    },
    {
        id: 4,
        name: "Dr. Talla Jeanne",
        specialty: "Dermatologie",
        patients: 2,
        status: "En consultation",
        center: "CM-LIM",
        since: "09:15",
        photo: "TJ",
        trend: "stable",
    },
];

// Pending Urgency Validations
export const pendingUrgencyValidations: PendingUrgency[] = [
    {
        id: 1,
        name: "Ndombi Joseph",
        age: 67,
        center: "CSJ-YDE",
        requestedLevel: 4,
        motif: "Douleurs thoraciques",
        symptoms: "Essoufflement, sueurs",
        vital: "TA: 160/95, FC: 110",
        requestTime: "10:25",
        requestedBy: "Dr. Manga",
        trend: "stable",
    },
    {
        id: 2,
        name: "Feunou Marie",
        age: 8,
        center: "CM-LIM",
        requestedLevel: 3,
        motif: "Fièvre élevée",
        symptoms: "40.2°C, convulsions",
        vital: "FC: 125, FR: 28",
        requestTime: "10:32",
        requestedBy: "Dr. Nkodo",
        trend: "up",
    },
    {
        id: 3,
        name: "Mbarga Paul",
        age: 45,
        center: "HD-BAF",
        requestedLevel: 4,
        motif: "Crise d'asthme",
        symptoms: "Respiration sifflante",
        vital: "SpO2: 89%, FR: 30",
        requestTime: "10:40",
        requestedBy: "Dr. Tonye",
        trend: "down",
    },
];

// Recent Activities
export const recentActivities: ActivityItem[] = [
    {
        id: 1,
        type: "validation",
        action: "Validation urgence",
        user: "Sophie P.",
        details: "Niveau 4 validé pour Ndombi Joseph",
        time: "10:45",
        center: "CSJ-YDE",
    },
    {
        id: 2,
        type: "room",
        action: "Création salle",
        user: "Sophie P.",
        details: 'Salle "Orthopédie" créée à CSJ-YDE',
        time: "10:32",
        center: "CSJ-YDE",
    },
    {
        id: 3,
        type: "assignment",
        action: "Réattribution patient",
        user: "Sophie P.",
        details: "Patient Mbarga Paul réattribué à Dr. Tonye",
        time: "10:28",
        center: "CP-DLA",
    },
    {
        id: 4,
        type: "login",
        action: "Connexion",
        user: "Sophie P.",
        details: "Connexion au système",
        time: "08:30",
        center: "CP-DLA",
    },
];

