/**
 * Centralized Mock Data for EAGLE Application
 * This file ensures consistency across all dashboards
 */

// ============ USERS / CONTACTS ============

export const mockContacts = [
    {
        id: "1",
        name: "Dr. Nana Pierre",
        code: "DOC-001",
        role: "Médecin",
        center: "Centre Principal - Yaoundé",
        function: "Consultations",
        status: "online" as const,
    },
    {
        id: "2",
        name: "Inf. Mbarga Sarah",
        code: "INF-002",
        role: "Infirmière",
        center: "Centre Principal - Yaoundé",
        function: "Soins",
        status: "online" as const,
    },
    {
        id: "3",
        name: "Inf. Nkomo Paul",
        code: "INF-003",
        role: "Infirmier",
        center: "Centre Principal - Yaoundé",
        function: "Soins",
        status: "online" as const,
    },
    {
        id: "4",
        name: "Sec. Talla Alice",
        code: "SEC-003",
        role: "Secrétaire Principal",
        center: "Centre Principal - Yaoundé",
        function: "Administration",
        status: "offline" as const,
    },
    {
        id: "5",
        name: "Lab. Mekongo Jean",
        code: "LAB-004",
        role: "Technicien Laboratoire",
        center: "Centre Principal - Yaoundé",
        function: "Laboratoire",
        status: "online" as const,
    },
    {
        id: "6",
        name: "Pharm. Biya Marie",
        code: "PHARM-005",
        role: "Pharmacienne",
        center: "Centre Principal - Yaoundé",
        function: "Pharmacie",
        status: "online" as const,
    },
    {
        id: "7",
        name: "Dr. Owona Marc",
        code: "DOC-002",
        role: "Médecin Spécialiste",
        center: "Centre Principal - Yaoundé",
        function: "Consultations",
        status: "online" as const,
    },
];

// ============ PATIENTS ============

export const mockPatients = [
    {
        id: "1",
        name: "Kamga Jean",
        age: 45,
        gender: "Homme" as const,
        patientCode: "PAT-2024-001",
        phone: "+237 6XX XXX XXX",
        email: "kamga.jean@email.cm",
        address: "Douala, Cameroun",
        lastVisit: "2024-12-08",
        identityVerified: true,
        createdAt: "2024-01-15",
    },
    {
        id: "2",
        name: "Mbeki Paul",
        age: 62,
        gender: "Homme" as const,
        patientCode: "PAT-2024-002",
        phone: "+237 6XX XXX XXX",
        email: "",
        address: "Yaoundé, Cameroun",
        lastVisit: "2024-12-08",
        identityVerified: true,
        createdAt: "2024-02-20",
    },
    {
        id: "3",
        name: "Ngono Marie",
        age: 28,
        gender: "Femme" as const,
        patientCode: "PAT-2024-003",
        phone: "+237 6XX XXX XXX",
        email: "",
        address: "",
        lastVisit: "2024-12-07",
        identityVerified: false,
        createdAt: "2024-03-10",
    },
];

// Patient data for doctor dashboard (extended info)
export const mockPatientsExtended = [
    {
        id: 1,
        name: "Kamga Jean",
        age: 45,
        gender: "M" as const,
        patientId: "PAT-2024-001",
        phone: "+237 6 XX XX XX XX",
        email: "kamga.jean@email.cm",
        address: "Douala, Cameroun",
        lastVisit: "15 Déc 2024",
        nextAppointment: "20 Déc 2024",
        totalConsultations: 12,
        chronicConditions: ["Hypertension", "Diabète type 2"],
        currentMedications: ["Metformine 850mg", "Enalapril 10mg"],
        allergies: ["Pénicilline"],
        recentDiagnosis: "Infection respiratoire",
        status: "chronic" as const,
    },
    {
        id: 2,
        name: "Tabi Aline",
        age: 52,
        gender: "F" as const,
        patientId: "PAT-2024-004",
        phone: "+237 6 XX XX XX XX",
        email: "tabi.aline@email.cm",
        address: "Yaoundé, Cameroun",
        lastVisit: "17 Déc 2024",
        totalConsultations: 8,
        chronicConditions: ["Asthme"],
        currentMedications: ["Salbutamol 100µg"],
        allergies: [] as string[],
        recentDiagnosis: "Crise d'asthme",
        status: "active" as const,
    },
    {
        id: 3,
        name: "Mbeki Paul",
        age: 62,
        gender: "M" as const,
        patientId: "PAT-2024-002",
        phone: "+237 6 XX XX XX XX",
        email: "",
        address: "Yaoundé, Cameroun",
        lastVisit: "10 Déc 2024",
        nextAppointment: "",
        totalConsultations: 5,
        chronicConditions: ["Hypertension"],
        currentMedications: ["Enalapril 10mg"],
        allergies: [] as string[],
        recentDiagnosis: "Contrôle tension",
        status: "chronic" as const,
    },
    {
        id: 4,
        name: "Ngono Marie",
        age: 28,
        gender: "F" as const,
        patientId: "PAT-2024-003",
        phone: "+237 6 XX XX XX XX",
        email: "",
        address: "Bafoussam, Cameroun",
        lastVisit: "10 Nov 2024",
        nextAppointment: "15 Déc 2024",
        totalConsultations: 3,
        chronicConditions: [] as string[],
        currentMedications: [] as string[],
        allergies: ["Arachides"],
        recentDiagnosis: "",
        status: "active" as const,
    },
];

// ============ CLINIC INFO ============

export const clinicInfo = {
    name: "Centre Principal - Yaoundé",
    code: "CPY-001",
    type: "Centre Principal",
};

// ============ USER INFO ============

export const userInfo = {
    doctor: {
        name: "Dr. Nana Pierre",
        code: "DOC-001",
    },
    nurse: {
        name: "Sophie Ateba",
        code: "INF-001",
    },
};

// ============ VITAL SIGNS (for Kamga Jean - consistent across pages) ============

export const kamgaJeanVitals = {
    bloodPressure: "145/90",
    heartRate: 98,
    temperature: 39.2,
    oxygenSaturation: 98,
    respiratoryRate: 16,
    weight: 75,
    height: 170,
};

export const mbekiPaulVitals = {
    bloodPressure: "140/85",
    heartRate: 72,
    temperature: 37.0,
    oxygenSaturation: 98,
    respiratoryRate: 16,
    weight: 80,
    height: 175,
};

export const ngonoMarieVitals = {
    bloodPressure: "120/80",
    heartRate: 68,
    temperature: 36.8,
    oxygenSaturation: 99,
    respiratoryRate: 14,
    weight: 60,
    height: 165,
};

// ============ HELPER FUNCTIONS ============

/**
 * Get patient by ID or code
 */
export function getPatientById(id: string | number) {
    const idStr = id.toString();
    return mockPatients.find(p => p.id === idStr) || 
           mockPatientsExtended.find(p => p.id.toString() === idStr || p.patientId === idStr);
}

/**
 * Get patient by code
 */
export function getPatientByCode(code: string) {
    return mockPatients.find(p => p.patientCode === code) ||
           mockPatientsExtended.find(p => p.patientId === code);
}

/**
 * Get contact by ID
 */
export function getContactById(id: string) {
    return mockContacts.find(c => c.id === id);
}

/**
 * Convert gender format
 */
export function normalizeGender(gender: string): "Homme" | "Femme" | "M" | "F" {
    if (gender === "Homme" || gender === "M" || gender === "Masculin") return "Homme";
    if (gender === "Femme" || gender === "F" || gender === "Féminin") return "Femme";
    return gender as "Homme" | "Femme" | "M" | "F";
}













