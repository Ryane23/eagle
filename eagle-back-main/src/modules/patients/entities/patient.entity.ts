export interface Patient {
  id: string;
  
  // Required Fields
  firstName: string; // Required (e.g., "Kamga")
  lastName: string; // Required (e.g., "Jean")
  dateOfBirth: Date; // Required (e.g., "1980-05-15")
  idNumber: string; // Required (e.g., "123456789012345") - Should be unique
  phone: string; // Required (e.g., "+237 699 123 456")
  hospitalId: string; // Required - Reference to hospitals collection (Secondary Center where registered)
  
  // Optional Fields
  email?: string | null; // Optional, but useful for notifications
  address?: string | null; // (e.g., "456 Market Avenue, Douala")
  emergencyContactName?: string | null; // (e.g., "Marie Kamga")
  emergencyContactPhone?: string | null; // (e.g., "+237 699 987 654")
  
  // Status
  isActive: boolean; // Defaults to true - Required
  
  // Vital Signs (updated by nurse)
  vitalSigns?: Record<string, any> | null; // e.g., { "bp": "165/95", "hr": 95, "temp": "98.6" }
  vitalSignsUpdatedAt?: Date | null;
  vitalSignsUpdatedBy?: string | null; // Nurse user ID
  
  // Encrypted Health Data Fields (AES-256) - EHR
  medicalHistory?: string | null; // ENCRYPTED
  allergies?: string | null; // ENCRYPTED
  currentMedications?: string | null; // ENCRYPTED
  bloodType?: string | null;
  
  // Identity Verification (for nurse workflow)
  identityVerified: boolean; // Default false
  identityVerifiedAt?: Date | null;
  identityVerifiedBy?: string | null; // Nurse user ID
  identityDocumentType?: string | null; // 'CNI' | 'PASSPORT' | 'OTHER'
  identityDocumentUrl?: string | null; // URL to uploaded document
  photoUrl?: string | null; // Patient photo URL
  
  // Nurse Workflow Tracking
  nurseWorkflowStatus?: 'ARRIVED' | 'WAITING' | 'PREPARATION' | 'READY' | 'IN_CONSULTATION' | null;
  preparationProgress?: number | null; // 0-100%
  preparationNurseId?: string | null;
  
  createdAt: Date;
  updatedAt: Date;
}

export const PatientCollection = 'patients';
