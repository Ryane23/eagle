export interface File {
  id: string;
  fileName: string;
  originalName: string;
  mimeType: string;
  size: number; // in bytes
  url: string; // Storage URL
  uploadedBy: string; // User ID
  relatedEntityType?: string | null; // 'urgency', 'patient', 'consultation', etc.
  relatedEntityId?: string | null; // ID of related entity
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export const FileCollection = 'files';

