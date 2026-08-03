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
  maritalStatus: string;
  idNumber: string;
  phone: string;
  email: string;
  address: string;
  diabetic: string;
  hasDrugAllergies: string;
  allergyDetails: string;
  chronicConditions: string;
  specialtyId: string;
  visitType: "WALK_IN" | "APPOINTMENT";
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
  maritalStatus: "",
  idNumber: "",
  phone: "",
  email: "",
  address: "",
  diabetic: "no",
  hasDrugAllergies: "no",
  allergyDetails: "",
  chronicConditions: "",
  specialtyId: "",
  visitType: "WALK_IN",
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

