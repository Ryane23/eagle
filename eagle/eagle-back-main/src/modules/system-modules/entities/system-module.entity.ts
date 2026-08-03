export enum ModuleCategory {
  CORE = 'core',
  CLINICAL = 'clinical',
  ADMINISTRATIVE = 'administrative',
  COMMUNICATION = 'communication',
  REPORTING = 'reporting',
  SUPPORT = 'support',
}

export interface SystemModule {
  id: string;
  name: string;
  displayName: string;
  description: string;
  category: ModuleCategory;
  isCore: boolean;
  isEnabled: boolean;
  features?: string[];
  dependencies?: string[];
  order?: number;
  icon?: string;
  createdBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface HospitalModuleConfig {
  id: string;
  hospitalId: string;
  moduleId: string;
  isEnabled: boolean;
  customSettings?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export const SystemModuleCollection = 'system_modules';
export const HospitalModuleConfigCollection = 'hospital_module_configs';
