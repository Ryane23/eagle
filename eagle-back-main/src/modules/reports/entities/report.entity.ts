export enum ReportType {
  SYSTEM = 'system',
  USER = 'user',
  CONSULTATION = 'consultation',
  HOSPITAL = 'hospital',
  OTHER = 'other',
}

export enum ReportStatus {
  PENDING = 'pending',
  IN_REVIEW = 'in_review',
  RESOLVED = 'resolved',
  REJECTED = 'rejected',
}

export interface Report {
  id: string;
  title: string;
  description: string;
  type: ReportType;
  status: ReportStatus;

  // Reporter information
  reportedBy: string; // User ID
  reportedByName?: string; // For easier display

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

export const ReportCollection = 'reports';

