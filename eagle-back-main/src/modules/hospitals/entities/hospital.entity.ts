export enum HospitalType {
  PRIMARY = 'PRIMARY', // Main center in Yaoundé
  SECONDARY = 'SECONDARY', // Remote centers (Douala, Bafoussam, Maroua)
}

export interface Hospital {
  id: string;
  name: string; // Required
  type: HospitalType; // Required: PRIMARY or SECONDARY
  
  // Location details (All required)
  address: string;
  city: string;
  country: string;
  
  // Contact (Required)
  contactPhone: string;
  contactEmail: string;
  
  // Configuration
  isActive: boolean; // Defaults to true
  
  // Optional fields for internal use
  code?: string; // Unique code: 'YDE', 'DLA', 'BFM', 'MRA'
  capacity?: number | null; // Max patients that can be handled
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

export const HospitalCollection = 'hospitals';
