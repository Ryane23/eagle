/**
 * Nurse module type definitions
 */

export interface NursePatient {
  id: string;
  name: string;
  age: number;
  gender: "Homme" | "Femme";
  patientCode: string;
  phone?: string;
  email?: string;
  address?: string;
  lastVisit?: string;
  identityVerified?: boolean;
  createdAt: string;
  status?: "active" | "inactive";
  bloodType?: string;
  allergies?: string[];
  medicalHistory?: string[];
  currentMedications?: string[];
  emergencyContact?: { name: string; phone: string; relationship?: string };
  insuranceInfo?: { provider: string; policyNumber: string };
}

export interface NewPatientFormData {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: string;
  phone: string;
  email: string;
  address: string;
  bloodType?: string;
  allergies?: string;
  // Vital Signs
  bloodPressureSystolic: string;
  bloodPressureDiastolic: string;
  heartRate: string;
  temperature: string;
  respiratoryRate: string;
  oxygenSaturation: string;
  weight: string;
  height: string;
  // Problem/Reason for visit
  problem: string;
}

export interface IdentityVerificationData {
  firstName: string;
  lastName: string;
  birthDate: string;
  birthPlace: string;
  documentNumber: string;
  documentType: string;
  extractedData: Record<string, string> | null;
}

export const INITIAL_PATIENT_FORM_DATA: NewPatientFormData = {
  firstName: "",
  lastName: "",
  dateOfBirth: "",
  gender: "",
  phone: "",
  email: "",
  address: "",
  bloodType: "",
  allergies: "",
  bloodPressureSystolic: "",
  bloodPressureDiastolic: "",
  heartRate: "",
  temperature: "",
  respiratoryRate: "",
  oxygenSaturation: "",
  weight: "",
  height: "",
  problem: "",
};

export const INITIAL_IDENTITY_DATA: IdentityVerificationData = {
  firstName: "",
  lastName: "",
  birthDate: "",
  birthPlace: "",
  documentNumber: "",
  documentType: "",
  extractedData: null,
};

// Calculate BMI helper
export function calculateBMI(weight: string, height: string): string | null {
  const w = parseFloat(weight);
  const h = parseFloat(height);
  
  if (!w || !h || h === 0) return null;
  
  const bmi = w / Math.pow(h / 100, 2);
  return bmi.toFixed(1);
}

