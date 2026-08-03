/**
 * Consultation-specific type definitions
 */

export interface ConsultationPatient {
  id: number;
  name: string;
  age: number;
  gender: "M" | "F";
  appointmentTime: string;
  urgencyLevel: number;
  reason: string;
  medicalHistory?: string[];
  currentMedications?: string[];
  allergies?: string[];
  vitalSigns?: ConsultationVitalSigns;
  waitTime?: number;
  arrivalTime?: string;
  type?: "new" | "followup";
  room?: string;
  nurse?: string;
}

export interface ConsultationVitalSigns {
  bloodPressure?: string;
  heartRate?: number;
  temperature?: number;
  weight?: number;
  height?: number;
  oxygenSaturation?: number;
}

export interface ConsultationNotes {
  notes: string;
  diagnosis: string;
  prescription: string;
  labTests: string;
  followUpNotes: string;
  followUpDate?: string;
}

export type ConsultationTab = "notes" | "diagnosis" | "prescription" | "exams" | "followup";

// Default patient data (fallback)
export const DEFAULT_CONSULTATION_PATIENT: ConsultationPatient = {
  id: 1,
  name: "Kamga Jean",
  age: 45,
  gender: "M",
  appointmentTime: "14:30",
  urgencyLevel: 4,
  reason: "Fièvre persistante (39°C) depuis 3 jours",
  medicalHistory: [
    "Hypertension artérielle (depuis 2018)",
    "Diabète de type 2 (depuis 2020)"
  ],
  currentMedications: [
    "Metformine 850mg - 2x/jour",
    "Enalapril 10mg - 1x/jour"
  ],
  allergies: [
    "Pénicilline",
    "Arachides"
  ],
  vitalSigns: {
    bloodPressure: "145/90",
    heartRate: 98,
    temperature: 39.2,
    weight: 82,
    height: 175
  }
};

// Helper functions
export function getUrgencyColor(level: number): string {
  if (level >= 4) return "bg-orange-500";
  if (level >= 3) return "bg-yellow-500";
  return "bg-green-500";
}

export function getUrgencyBadgeVariant(level: number): "destructive" | "secondary" | "default" {
  if (level >= 4) return "destructive";
  if (level >= 3) return "secondary";
  return "default";
}

