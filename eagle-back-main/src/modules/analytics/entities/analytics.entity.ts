export interface BranchStatistics {
  hospitalId: string;
  hospitalName: string;
  hospitalType: string;
  
  // User statistics
  totalUsers: number;
  activeUsers: number;
  usersByRole: {
    admin: number;
    primary_secretary: number;
    secondary_secretary: number;
    nurse: number;
    doctor: number;
  };

  // Patient statistics
  totalPatients: number;
  activePatients: number;
  newPatientsThisMonth: number;

  // Consultation statistics
  totalConsultations: number;
  consultationsByStatus: {
    scheduled: number;
    in_progress: number;
    completed: number;
    cancelled: number;
  };
  consultationsByType: {
    video: number;
    audio: number;
    chat: number;
  };
  consultationsThisMonth: number;
  averageConsultationDuration?: number; // in minutes

  // Queue statistics
  totalQueueEntries: number;
  queueByStatus: {
    waiting: number;
    in_progress: number;
    completed: number;
    cancelled: number;
  };
  averageWaitTime?: number; // in minutes

  // Reports and Complaints
  totalReports: number;
  pendingReports: number;
  totalComplaints: number;
  pendingComplaints: number;
  urgentComplaints: number;

  // Activity metrics
  lastActivityAt?: Date;
  createdAt: Date;
}

export interface NetworkOverview {
  totalHospitals: number;
  primaryCenters: number;
  secondaryCenters: number;
  activeHospitals: number;
  
  totalUsers: number;
  activeUsers: number;
  
  totalPatients: number;
  activePatients: number;
  
  totalConsultations: number;
  consultationsToday: number;
  consultationsThisWeek: number;
  consultationsThisMonth: number;
  
  totalQueueEntries: number;
  activeQueueEntries: number;
  
  totalReports: number;
  pendingReports: number;
  
  totalComplaints: number;
  pendingComplaints: number;
  urgentComplaints: number;
  
  branchStatistics: BranchStatistics[];
  generatedAt: Date;
}

