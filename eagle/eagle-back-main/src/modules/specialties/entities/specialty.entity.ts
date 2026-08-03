export interface Specialty {
  id: string;
  name: string;
  description?: string | null;
  icon?: string | null;
  isActive: boolean;
  displayOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

export const SpecialtyCollection = 'specialties';
