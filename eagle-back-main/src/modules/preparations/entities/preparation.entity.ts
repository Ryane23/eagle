export enum PreparationStatus {
  IN_PROGRESS = 'IN_PROGRESS',
  READY = 'READY',
  COMPLETED = 'COMPLETED',
}

export interface SymptomHistory {
  chiefComplaint: string;
  duration: string;
  severity: number; // 1-10
  characteristics: string;
}

export interface TechnicalChecklist {
  videoTested: boolean;
  audioTested: boolean;
  patientPositioned: boolean;
  lightingAdjusted: boolean;
}

export interface PsychologicalState {
  anxietyLevel: number; // 1-10
  cooperation: string;
  understanding: string;
  notes?: string;
}

export interface Preparation {
  id: string;
  patientId: string;
  nurseId: string;
  consultationId?: string | null;
  urgencyId?: string | null;

  // Progress tracking
  status: PreparationStatus;
  progress: number; // 0-100%

  // Pre-consultation data
  observations?: string | null;
  symptomHistory?: SymptomHistory | null;
  photoUrls?: string[] | null;

  // Technical setup
  technicalChecklist?: TechnicalChecklist | null;

  // Pre-consultation checklist
  questionsForDoctor?: string[] | null;
  suggestedExams?: string[] | null;
  psychologicalState?: PsychologicalState | null;

  readyAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export const PreparationCollection = 'preparations';
