export interface Medication {
  name: string; // Medication name (e.g., "Paracetamol 500mg")
  dosage: string; // Dosage instructions (e.g., "1 tablet")
  frequency: string; // How often (e.g., "Every 8 hours", "Twice daily")
  duration: string; // How long (e.g., "5 days", "1 week")
  instructions?: string; // Additional instructions (e.g., "Take with food")
}

export interface Prescription {
  id: string;
  
  // Links to other entities
  consultationId: string; // Required - Reference to consultations
  patientId: string; // Required - Reference to patients
  doctorId: string; // Required - Reference to users (doctor)
  
  // Prescription details
  medications: Medication[]; // Required - Array of medications
  
  // Additional information
  instructions?: string | null; // General instructions for patient
  notes?: string | null; // Doctor's notes (internal)
  
  // Status tracking
  isDispensed: boolean; // Whether prescription has been dispensed
  dispensedBy?: string | null; // User ID of nurse who dispensed
  dispensedAt?: Date | null; // When prescription was dispensed
  
  createdAt: Date;
  updatedAt: Date;
}

export const PrescriptionCollection = 'prescriptions';
