export enum ReferralStatus {
  PENDING = 'pending', // Awaiting review by receiving hospital
  ACCEPTED = 'accepted', // Receiving hospital accepted
  REJECTED = 'rejected', // Receiving hospital rejected
  IN_TRANSIT = 'in_transit', // Patient being transferred
  COMPLETED = 'completed', // Patient arrived and consultation started
  CANCELLED = 'cancelled', // Referral cancelled
}

export enum ReferralPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent',
}

export interface Referral {
  id: string;
  
  // Patient and Urgency Info
  patientId: string;
  urgencyId?: string | null; // Related urgency if exists
  
  // Hospitals
  fromHospitalId: string; // Sending hospital
  toHospitalId: string; // Receiving hospital
  
  // Personnel
  referredBy: string; // User ID of referring doctor/nurse
  acceptedBy?: string | null; // User ID who accepted
  
  // Referral Details
  reason: string; // Why patient is being referred
  medicalSummary: string; // Patient's current condition
  specialtyNeeded?: string | null; // Required specialty
  requiredResources?: string[] | null; // e.g., ['ICU', 'Ventilator']
  priority: ReferralPriority;
  
  // Status Tracking
  status: ReferralStatus;
  rejectionReason?: string | null; // If rejected, why?
  
  // Documents
  attachmentUrls?: string[] | null; // Medical records, test results
  
  // Timestamps
  estimatedArrivalTime?: Date | null;
  acceptedAt?: Date | null;
  rejectedAt?: Date | null;
  completedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export const ReferralCollection = 'referrals';
