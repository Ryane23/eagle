export enum ComplaintType {
  SERVICE = 'service',
  STAFF = 'staff',
  SYSTEM = 'system',
  BILLING = 'billing',
  OTHER = 'other',
}

export enum ComplaintStatus {
  PENDING = 'pending',
  IN_REVIEW = 'in_review',
  RESOLVED = 'resolved',
  REJECTED = 'rejected',
}

export enum ComplaintPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent',
}

export interface Complaint {
  id: string;
  title: string;
  description: string;
  type: ComplaintType;
  status: ComplaintStatus;
  priority: ComplaintPriority;

  // Complainant information
  complainedBy: string; // User ID
  complainedByName?: string; // For easier display

  // Related entities (optional)
  relatedUserId?: string | null;
  relatedHospitalId?: string | null;
  relatedConsultationId?: string | null;

  // Resolution
  resolvedBy?: string | null; // Admin User ID
  resolvedAt?: Date | null;
  resolutionNotes?: string | null;

  createdAt: Date;
  updatedAt: Date;
}

export const ComplaintCollection = 'complaints';

