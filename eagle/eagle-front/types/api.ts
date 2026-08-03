// ============ USER TYPES ============

export type UserRole = "admin" | "primary_secretary" | "secondary_secretary" | "doctor" | "nurse";

export type User = {
    id: string;
    email: string;
    name: string;
    phone?: string | null;
    role: UserRole;
    hospitalId?: string | null;
    specialtyId?: string | null;
    departmentId?: string | null;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    lastLogin?: string | null;
    hospital?: {
        id: string;
        name: string;
        type: "PRIMARY" | "SUB";
    } | null;
};

export type WorkflowContext = {
    user: User;
    hospital: Hospital | null;
    parentHospital: Hospital | null;
    department: { id: string; name?: string } | null;
    activeShift: { id: string; startAt?: string; endAt?: string } | null;
    boxes: ConsultationBox[];
};

export type VisitStatus =
    | "REGISTERED"
    | "ARRIVED"
    | "WAITING"
    | "IN_PREPARATION"
    | "READY"
    | "WAITING_FOR_CONSULTATION"
    | "WAITING_FOR_VITALS"
    | "VITALS_COMPLETED"
    | "READY_FOR_SCHEDULING"
    | "QUEUED"
    | "IN_CONSULTATION"
    | "COMPLETED"
    | "CANCELLED"
    | "MISSED";

export type Visit = {
    id: string;
    patientId: string;
    originHospitalId: string;
    registeredBy: string;
    registeredByRole: string;
    consultationNumber: string;
    passingNumber: string;
    type: "WALK_IN" | "APPOINTMENT" | "FOLLOW_UP" | "REFERRAL" | "EMERGENCY";
    status: VisitStatus;
    complaint: string;
    specialtyId?: string | null;
    consultationId?: string | null;
    appointmentId?: string | null;
    referralId?: string | null;
    urgencyId?: string | null;
    ticketId?: string | null;
    boxId?: string | null;
    arrivedAt?: string | null;
    arrivedBy?: string | null;
    preparationStartedAt?: string | null;
    preparationStartedBy?: string | null;
    checkedInAt?: string | null;
    vitalsCompletedAt?: string | null;
    completedAt?: string | null;
    createdAt: string;
    updatedAt: string;
};

export type WorkflowSummary = {
    registrations: number;
    registered?: number;
    arrived?: number;
    waiting?: number;
    inPreparation?: number;
    ready?: number;
    waitingForVitals: number;
    vitalsCompleted: number;
    waitingForConsultation: number;
    inConsultation: number;
    completed: number;
};

export type ConsultationBox = {
    id: string;
    hospitalId: string;
    code: string;
    name: string;
    status: "AVAILABLE" | "RESERVED" | "IN_USE" | "MAINTENANCE" | "OFFLINE";
    isActive: boolean;
    defaultSpecialtyId?: string | null;
    currentSpecialtyId?: string | null;
    activeVisitId?: string | null;
    activeConsultationId?: string | null;
};

export type Appointment = {
    id: string;
    patientId: string;
    originHospitalId: string;
    specialtyId: string;
    selectedDoctorId?: string | null;
    scheduledAt: string;
    status: "BOOKED" | "CONFIRMED" | "CHECKED_IN" | "MISSED" | "CANCELLED" | "COMPLETED";
    reason?: string | null;
    visitId?: string | null;
    createdAt: string;
    updatedAt: string;
};

export type UpdateUserDto = {
    email?: string;
    name?: string;
    phone?: string;
    role?: UserRole;
    hospitalId?: string | null;
    specialtyId?: string | null;
    isActive?: boolean;
};

// ============ AUTH TYPES ============

export type AuthResponse = {
    accessToken: string;
    refreshToken: string;
    user: User;
    expiresIn: number;
};

export type LoginCredentials = {
    email: string;
    password: string;
};

export type RegisterData = {
    email: string;
    password: string;
    name: string;
    role: UserRole;
    hospitalId?: string;
    specialtyId?: string;
    phone?: string;
};

export type RefreshTokenDto = {
    refreshToken: string;
};

// ============ HOSPITAL TYPES ============

export type HospitalType = "PRIMARY" | "SUB";

export type Hospital = {
    id: string;
    name: string;
    type: HospitalType;
    parentHospitalId: string | null;
    address: string;
    city: string;
    country: string;
    contactPhone: string;
    contactEmail: string;
    code?: string;
    capacity?: number;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    children?: Hospital[];
};

export type CreateHospitalDto = {
    name: string;
    type: HospitalType;
    parentHospitalId?: string | null;
    address: string;
    city: string;
    country: string;
    contactPhone: string;
    contactEmail: string;
    code?: string;
    capacity?: number;
};

export type UpdateHospitalDto = Partial<CreateHospitalDto>;

// ============ PATIENT TYPES ============

export type PatientGender = "MALE" | "FEMALE";

export type Patient = {
    id: string;
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    gender?: PatientGender | null;
    maritalStatus?: "SINGLE" | "MARRIED" | "DIVORCED" | "WIDOWED" | null;
    diabetic?: boolean;
    hasDrugAllergies?: boolean;
    allergyDetails?: string | null;
    chronicConditions?: string | null;
    idNumber: string;
    phone: string;
    hospitalId: string;
    email?: string | null;
    address?: string | null;
    emergencyContactName?: string | null;
    emergencyContactPhone?: string | null;
    isActive: boolean;
    identityVerified?: boolean;
    vitalSigns?: VitalSigns | null;
    vitalSignsUpdatedAt?: string | null;
    bloodType?: string | null;
    medicalHistory?: string[] | null;
    allergies?: string[] | null;
    currentMedications?: string[] | null;
    createdAt: string;
    updatedAt: string;
};

/** Matches backend CreatePatientDto; phone fields must use E.164 format. */
export type CreatePatientDto = {
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    gender?: PatientGender;
    maritalStatus?: "SINGLE" | "MARRIED" | "DIVORCED" | "WIDOWED";
    idNumber: string;
    phone: string;
    email?: string;
    address?: string;
    emergencyContactName?: string;
    emergencyContactPhone?: string;
    diabetic?: boolean;
    hasDrugAllergies?: boolean;
    allergyDetails?: string;
    chronicConditions?: string;
};

export type UpdatePatientDto = Partial<CreatePatientDto>;

export type VitalSigns = {
    bloodPressure?: string;
    heartRate?: number;
    temperature?: number;
    respiratoryRate?: number;
    oxygenSaturation?: number;
    weight?: number;
    height?: number;
    bmi?: number;
    glycemia?: number;
};

export type UpdateVitalsDto = {
    vitalSigns: VitalSigns;
};

export type UpdateEhrDto = {
    medicalHistory?: string;
    allergies?: string;
    currentMedications?: string;
    bloodType?: string;
};

// ============ CONSULTATION TYPES ============

export type ConsultationType = "video" | "audio" | "chat";
export type ConsultationStatus = "scheduled" | "in_progress" | "completed" | "cancelled";

export type Consultation = {
    id: string;
    patientId: string;
    doctorId: string;
    specialtyId?: string | null;
    visitId?: string | null;
    originHospitalId?: string | null;
    appointmentId?: string | null;
    referralId?: string | null;
    boxId?: string | null;
    type: ConsultationType;
    status: ConsultationStatus;
    scheduledAt: string;
    startedAt?: string | null;
    endedAt?: string | null;
    symptoms?: string | null;
    diagnosis?: string | null;
    notes?: string | null;
    urgencyLevel?: string | null;
    fee?: number | null;
    createdAt: string;
    updatedAt: string;
    patient?: Patient;
    doctor?: User;
};

export type AddNoteDto = {
    note: string;
};

export type CompleteConsultationDto = {
    diagnosis?: string;
    notes?: string;
};

// ============ QUEUE TYPES ============

export type QueueStatus = "waiting" | "in_progress" | "completed" | "cancelled" | "removed";

export type QueueEntry = {
    id: string;
    consultationId: string;
    visitId?: string | null;
    originHospitalId?: string | null;
    appointmentId?: string | null;
    referralId?: string | null;
    urgencyId?: string | null;
    boxId?: string | null;
    specialtyId: string;
    consultation?: Consultation;
    patientId: string;
    patient?: Patient;
    hospitalId: string;
    priority: number;
    position: number;
    estimatedWaitTime: number;
    estimatedWaitMinutes?: number;
    schedulingTier?: number;
    schedulingReasons?: string[];
    status: QueueStatus;
    createdAt: string;
    updatedAt: string;
};

export type AddToQueueDto = {
    consultationId: string;
    priority?: number;
};

export type UpdateQueueStatusDto = {
    status: QueueStatus;
};

export type QueueStats = {
    totalWaiting: number;
    averageWaitTime: number;
    completedToday: number;
    inProgress: number;
};

// ============ MESSAGE TYPES ============

export type MessageType = "text" | "image" | "file" | "voice";

export type Message = {
    id: string;
    consultationId?: string | null;
    conversationId?: string;
    senderId: string;
    receiverId?: string | null;
    content: string;
    type?: MessageType;
    attachmentUrl?: string | null;
    isRead: boolean;
    readAt?: string | null;
    createdAt: string;
    updatedAt?: string;
    sender?: User;
};

export type CreateMessageDto = {
    consultationId?: string;
    receiverId: string;
    content: string;
    type: MessageType;
    attachmentUrl?: string;
};

// ============ WEBRTC TYPES ============

export type WebRTCRoom = {
    id: string;
    consultationId: string;
    status: "active" | "ended";
    createdAt: string;
    endedAt?: string | null;
};

// ============ FOLLOWUP TYPES ============

export type FollowupStatus = "scheduled" | "completed" | "cancelled" | "missed";

export type Followup = {
    id: string;
    consultationId: string;
    patientId: string;
    doctorId: string;
    scheduledDate: string;
    reason?: string;
    notes?: string;
    status: FollowupStatus;
    createdAt: string;
    updatedAt: string;
    patient?: Patient;
    doctor?: User;
};

export type CreateFollowupDto = {
    consultationId: string;
    patientId: string;
    scheduledDate: string;
    reason?: string;
    notes?: string;
};

export type UpdateFollowupDto = Partial<Omit<CreateFollowupDto, "consultationId" | "patientId">>;

// ============ SPECIALTY TYPES ============

export type Specialty = {
    id: string;
    name: string;
    description?: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
};

export type CreateSpecialtyDto = {
    name: string;
    description?: string;
};

export type UpdateSpecialtyDto = Partial<CreateSpecialtyDto>;

// ============ URGENCY TYPES ============

export type UrgencyStatus = "pending" | "validated" | "assigned" | "in_progress" | "completed" | "rejected";

/** Backend uses enum; frontend normalizes to this union for display/filters */
export type UrgencyLevelEnum = "LOW" | "MODERATE" | "URGENT" | "CRITICAL";

export type Urgency = {
    id: string;
    patientId: string;
    patient?: Patient;
    hospitalId: string;
    hospital?: Hospital;
    specialtyId?: string;
    reason: string;
    description?: string;
    urgencyLevel: number;
    validatedUrgencyLevel?: number;
    status: UrgencyStatus;
    doctorId?: string;
    doctor?: User;
    consultationId?: string;
    vitalSigns?: VitalSigns;
    rejectionReason?: string;
    createdBy: string;
    createdAt: string;
    updatedAt: string;
};

/** UI shape for create form; mapped to backend in actions/urgencies */
export type CreateUrgencyDto = {
    patientId: string;
    specialtyId?: string;
    /** Backend: reasonForConsultation */
    reason: string;
    description?: string;
    /** 1-5; mapped to LOW/MODERATE/URGENT/CRITICAL in action */
    urgencyLevel: number;
    vitalSigns?: VitalSigns;
    /** Specialty name for backend requestedSpecialty (e.g. from useSpecialtiesQuery) */
    requestedSpecialty?: string;
};

/** Backend expects newLevel (enum) and justification */
export type ValidateUrgencyDto = {
    newLevel: UrgencyLevelEnum;
    justification: string;
};

/** Backend expects assignedDoctorId and scheduledAt (ISO string) */
export type AssignUrgencyDto = {
    assignedDoctorId: string;
    scheduledAt: string;
};

export type RejectUrgencyDto = {
    rejectionReason: string;
};

export type UpdateUrgencyVitalsDto = {
    vitalSigns: VitalSigns;
};

// ============ REPORT TYPES ============

export type ReportType = "consultation" | "prescription" | "lab" | "imaging" | "other";
export type ReportStatus = "draft" | "final" | "amended";

export type Report = {
    id: string;
    consultationId?: string;
    patientId: string;
    doctorId: string;
    hospitalId: string;
    type: ReportType;
    title: string;
    content: string;
    status: ReportStatus;
    createdAt: string;
    updatedAt: string;
    patient?: Patient;
    doctor?: User;
};

export type CreateReportDto = {
    consultationId?: string;
    patientId: string;
    type: ReportType;
    title: string;
    content: string;
};

export type UpdateReportDto = Partial<Omit<CreateReportDto, "patientId" | "consultationId">>;

// ============ PRESCRIPTION TYPES ============

export type PrescriptionStatus = "active" | "dispensed" | "cancelled";

export type PrescriptionMedication = {
    name: string;
    dosage: string;
    frequency: string;
    duration: string;
    quantity?: number;
    notes?: string;
};

export type Prescription = {
    id: string;
    consultationId: string;
    consultation?: Consultation;
    patientId: string;
    patient?: Patient;
    doctorId: string;
    doctor?: User;
    hospitalId: string;
    medications: PrescriptionMedication[];
    instructions?: string;
    status: PrescriptionStatus;
    dispensedAt?: string;
    dispensedBy?: string;
    createdAt: string;
    updatedAt: string;
};

export type CreatePrescriptionDto = {
    consultationId: string;
    patientId: string;
    medications: PrescriptionMedication[];
    instructions?: string;
};

export type UpdatePrescriptionDto = {
    medications?: PrescriptionMedication[];
    instructions?: string;
};

// ============ COMPLAINT TYPES ============

export type ComplaintType = "service" | "technical" | "staff" | "billing" | "other";
export type ComplaintStatus = "open" | "in_progress" | "resolved" | "closed";
export type ComplaintPriority = "low" | "medium" | "high" | "urgent";

export type Complaint = {
    id: string;
    userId: string;
    hospitalId?: string;
    type: ComplaintType;
    subject: string;
    description: string;
    status: ComplaintStatus;
    priority: ComplaintPriority;
    resolution?: string;
    createdAt: string;
    updatedAt: string;
    user?: User;
};

export type CreateComplaintDto = {
    type: ComplaintType;
    subject: string;
    description: string;
    priority?: ComplaintPriority;
};

export type UpdateComplaintDto = {
    status?: ComplaintStatus;
    resolution?: string;
    priority?: ComplaintPriority;
};

// ============ NOTIFICATION TYPES ============

export type NotificationType =
    | "appointment"
    | "message"
    | "reminder"
    | "alert"
    | "urgency_created"
    | "urgency_validated"
    | "urgency_assigned"
    | "consultation_started"
    | "consultation_completed"
    | "prescription_created"
    | "message_received"
    | "system";

export type Notification = {
    id: string;
    userId: string;
    type: NotificationType;
    title: string;
    message: string;
    data?: Record<string, unknown>;
    relatedEntityId?: string | null;
    relatedEntityType?: string | null;
    isRead: boolean;
    readAt?: string | null;
    createdAt: string;
};

export type CreateNotificationDto = {
    type: "appointment" | "message" | "reminder" | "alert" | "system";
    title: string;
    message: string;
    relatedEntityId?: string;
    relatedEntityType?: string;
};

// ============ FILE TYPES ============

export type FileEntityType = "urgency" | "patient" | "consultation" | "prescription" | "report";

export type FileEntity = {
    id: string;
    filename: string;
    originalName: string;
    mimeType: string;
    size: number;
    url: string;
    uploadedBy: string;
    relatedEntityType?: FileEntityType;
    relatedEntityId?: string;
    createdAt: string;
};

export type UploadFileDto = {
    file: File;
    relatedEntityType?: FileEntityType;
    relatedEntityId?: string;
};

// ============ TICKET TYPES ============

export type Ticket = {
    id: string;
    ticketNumber: string;
    patientId: string;
    hospitalId: string;
    consultationId?: string;
    qrCode?: string;
    createdAt: string;
    patient?: Patient;
};

/** Backend expects only urgencyId (ticket is created from an urgency) */
export type CreateTicketDto = {
    urgencyId: string;
};

// ============ SYNC TYPES ============

export type SyncOperation = {
    id: string;
    entityType: string;
    entityId: string;
    operation: "create" | "update" | "delete";
    data: Record<string, unknown>;
    status: "pending" | "synced" | "conflict" | "failed";
    conflictResolution?: "local" | "remote";
    createdAt: string;
    syncedAt?: string;
};

// ============ ANALYTICS TYPES ============

export type NetworkAnalytics = {
    totalHospitals: number;
    primaryCenters: number;
    secondaryCenters: number;
    activeHospitals: number;
    totalUsers: number;
    activeUsers: number;
    totalPatients: number;
    activePatients: number;
    totalConsultations: number;
    consultationsThisWeek: number;
    consultationsThisMonth: number;
    totalUrgencies: number;
    averageWaitTime: number;
    consultationsToday: number;
    urgenciesToday: number;
    totalQueueEntries: number;
    activeQueueEntries: number;
    totalReports: number;
    pendingReports: number;
    totalComplaints: number;
    pendingComplaints: number;
    urgentComplaints: number;
    branchStatistics: BranchStatistics[];
    centerStats: BranchStatistics[];
    generatedAt: string;
};

export type BranchStatistics = {
    hospitalId: string;
    hospitalName: string;
    hospitalType: HospitalType;
    totalUsers: number;
    activeUsers: number;
    usersByRole: {
        admin: number;
        primary_secretary: number;
        secondary_secretary: number;
        nurse: number;
        doctor: number;
        specialist: number;
    };
    totalPatients: number;
    activePatients: number;
    newPatientsThisMonth: number;
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
    averageConsultationDuration?: number;
    totalQueueEntries: number;
    queueByStatus: {
        waiting: number;
        in_progress: number;
        completed: number;
        cancelled: number;
    };
    averageWaitTime: number;
    totalReferrals: number;
    pendingReferrals: number;
    totalReports: number;
    pendingReports: number;
    totalComplaints: number;
    pendingComplaints: number;
    urgentComplaints: number;
    lastActivityAt?: string;
    createdAt: string;
};

// ============ SYSTEM TYPES ============

export type SystemHealth = {
    status: "healthy" | "degraded" | "unhealthy";
    database: "healthy" | "unhealthy";
    timestamp: string;
    uptime: number;
};

export type SystemSettings = {
    maintenanceMode: boolean;
    maxUrgencyLevel: number;
    defaultConsultationDuration: number;
    autoDistribution: boolean;
    loadBalancing: boolean;
    assignmentStrategy: "availability" | "workload" | "specialty" | "manual";
    urgencyLevels: Array<{
        level: number;
        maxWaitMinutes: number;
        immediateNotification: boolean;
        overdueAction: "alert" | "escalate" | "reassign";
    }>;
    minBandwidthMbps: number;
    consultationStartDelayMinutes: number;
    autoRecordConsultations: boolean;
    allowedFileTypes: string[];
    maxFileSize: number;
};

export type UpdateSystemSettingsDto = Partial<SystemSettings>;

export type SystemSettingsHistory = {
    id: string;
    settings: SystemSettings;
    changes: string[];
    updatedBy: string;
    createdAt: unknown;
};

export type MaintenanceStatus = {
    isMaintenanceMode: boolean;
    message?: string;
};

// ============ GENERIC TYPES ============

export type PaginatedResponse<T> = {
    data: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
};

export type ApiResponse<T> = {
    success: boolean;
    data?: T;
    message?: string;
    error?: string;
};
