export interface Department {
  id: string;
  hospitalId: string;
  name: string;
  code: string;
  specialtyIds: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
export const DepartmentCollection = 'departments';
