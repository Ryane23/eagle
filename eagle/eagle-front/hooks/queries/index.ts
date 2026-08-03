/**
 * TanStack Query Hooks
 *
 * Usage in components:
 *
 * ```tsx
 * import { usePatientsQuery, useCreatePatient } from "@/hooks/queries";
 *
 * function PatientsPage() {
 *     const { data, isLoading, error, refetch } = usePatientsQuery();
 *     const createMutation = useCreatePatient();
 *
 *     if (isLoading) return <Skeleton />;
 *     if (error) return <Error message={error.message} />;
 *
 *     return (
 *         <div>
 *             {data?.map(patient => <PatientCard key={patient.id} {...patient} />)}
 *             <Button
 *                 onClick={() => createMutation.mutate(newData)}
 *                 disabled={createMutation.isPending}
 *             >
 *                 {createMutation.isPending ? "Creating..." : "Create"}
 *             </Button>
 *         </div>
 *     );
 * }
 * ```
 */

// ============================================================================
// Patients
// ============================================================================
export {
    patientKeys,
    usePatientsQuery,
    usePatientQuery,
    usePatientSearchQuery,
    useCreatePatient,
    useUpdatePatient,
    useUpdatePatientVitals,
    useUpdatePatientEhr,
    useDeactivatePatient,
    usePatientStats,
} from "./use-patients-query";

// ============================================================================
// Consultations
// ============================================================================
export {
    consultationKeys,
    useConsultationsQuery,
    useScheduleQuery,
    useConsultationQuery,
    usePatientConsultationsQuery,
    useNurseTeleconsultationConsultationsQuery,
    useStartConsultation,
    useAddConsultationNote,
    useCompleteConsultation,
    useCancelConsultation,
    useAssignConsultationDoctor,
    useConsultationStats,
} from "./use-consultations-query";

// ============================================================================
// Prescriptions
// ============================================================================
export {
    prescriptionKeys,
    usePrescriptionsQuery,
    usePrescriptionQuery,
    usePatientPrescriptionsQuery,
    useCreatePrescription,
    useUpdatePrescription,
    useDeletePrescription,
    useMarkPrescriptionAsDispensed,
    usePrescriptionStats,
} from "./use-prescriptions-query";

// ============================================================================
// Urgencies
// ============================================================================
export {
    urgencyKeys,
    useUrgenciesQuery,
    usePendingUrgenciesQuery,
    useUrgencyQuery,
    useCreateUrgency,
    useValidateUrgency,
    useAssignUrgency,
    useRejectUrgency,
    useStartUrgencyConsultation,
    useCompleteUrgency,
    useUrgencyStats,
} from "./use-urgencies-query";

// ============================================================================
// Queue
// ============================================================================
export {
    queueKeys,
    useGlobalQueueQuery,
    useHospitalQueueQuery,
    useQueueEntryQuery,
    useQueueStatsQuery,
    useAddToQueue,
    useUpdateQueueStatus,
    useRemoveFromQueue,
    useQueueStats,
} from "./use-queue-query";

// ============================================================================
// Notifications
// ============================================================================
export * from "./use-notifications-query";

// ============================================================================
// Reports
// ============================================================================
export * from "./use-reports-query";

// ============================================================================
// Messages
// ============================================================================
export {
    messageKeys,
    useConsultationMessagesQuery,
    useUnreadMessagesQuery,
    useUnreadMessageCountQuery,
    useSendMessage,
    useMarkMessageAsRead,
    useMarkAllMessagesAsRead,
    useDeleteMessage,
} from "./use-messages-query";

// ============================================================================
// Users (Admin)
// ============================================================================
export {
    userKeys,
    useUsersQuery,
    useUserQuery,
    useDoctorsQuery,
    useCreateUser,
    useUpdateUser,
    useDeleteUser,
    useActivateUser,
    useDeactivateUser,
    useUserStats,
} from "./use-users-query";

// ============================================================================
// Hospitals (Admin)
// ============================================================================
export {
    hospitalKeys,
    useHospitalsQuery,
    useHospitalQuery,
    useHospitalTreeQuery,
    useHospitalsByTypeQuery,
    useCreateHospital,
    useUpdateHospital,
    useDeleteHospital,
    useActivateHospital,
    useDeactivateHospital,
    useHospitalStats,
    usePrimaryCenterQuery,
} from "./use-hospitals-query";

export {
    workflowKeys,
    useWorkflowContextQuery,
    useWorkflowSummaryQuery,
    useHospitalVisitsQuery,
    useCreateVisit,
    useMarkVisitVitalsComplete,
    useSelectVisitSpecialty,
    useConsultationBoxesQuery,
    useHospitalConsultationBoxesQuery,
    useCreateConsultationBox,
    useUpdateConsultationBoxStatus,
    useAssignBoxSpecialty,
    useReserveConsultationBox,
    useReleaseConsultationBox,
    useAppointmentsQuery,
    useCreateAppointment,
    useAppointmentStatus,
    useCareTeamQuery,
} from "./use-workflow-query";

// ============================================================================
// Analytics (Admin)
// ============================================================================
export {
    analyticsKeys,
    useNetworkAnalyticsQuery,
    useBranchStatisticsQuery,
    useSystemHealthQuery,
    useNetworkStats,
} from "./use-analytics-query";

// ============================================================================
// Complaints (Admin)
// ============================================================================
export {
    complaintKeys,
    useComplaintsQuery,
    useComplaintQuery,
    useCreateComplaint,
    useUpdateComplaint,
    useDeleteComplaint,
    useComplaintStats,
} from "./use-complaints-query";

// ============================================================================
// System (Admin)
// ============================================================================
export {
    systemKeys,
    useSystemSettingsQuery,
    useSystemSettingsHistoryQuery,
    useMaintenanceModeQuery,
    useUpdateSystemSettings,
    useToggleMaintenanceMode,
} from "./use-system-query";

// ============================================================================
// Doctor Dashboard (Combined Queries)
// ============================================================================
export {
    doctorDashboardKeys,
    useDoctorDashboardQuery,
    useQueueStatsQuery as useDashboardQueueStatsQuery,
    useDoctorScheduleQuery,
    useAssignedUrgenciesQuery,
    type DoctorStats,
    type NextPatientInfo,
    type UrgentPatientInfo,
    type ScheduleItem,
} from "./use-doctor-dashboard-query";

// ============================================================================
// WebRTC (Video Consultations)
// ============================================================================
export {
    webrtcKeys,
    useWebRTCRoomQuery,
    useWebRTCRoomByConsultationQuery,
    useCreateRoom,
    useEndRoom,
    useEndRoomByConsultation,
} from "./use-webrtc-query";

// ============================================================================
// Follow-ups
// ============================================================================
export {
    followupKeys,
    useFollowupsQuery,
    useUpcomingFollowupsQuery,
    usePatientFollowupsQuery,
    useDoctorFollowupsQuery,
    useFollowupQuery,
    useFollowupStats,
    useCreateFollowup,
    useUpdateFollowup,
    useCompleteFollowup,
    useCancelFollowup,
    useMarkFollowupAsMissed,
} from "./use-followups-query";

// ============================================================================
// Specialties
// ============================================================================
export {
    specialtyKeys,
    useSpecialtiesQuery,
    useSearchSpecialtiesQuery,
    useSpecialtyQuery,
    useSpecialtyStats,
    useCreateSpecialty,
    useUpdateSpecialty,
    useDeleteSpecialty,
    useActivateSpecialty,
    useDeactivateSpecialty,
} from "./use-specialties-query";

// ============================================================================
// Tickets
// ============================================================================
export {
    ticketKeys,
    useTicketByNumberQuery,
    useTicketQuery,
    usePatientTicketsQuery,
    useHospitalTicketsQuery,
    useTicketQRCodeQuery,
    useCreateTicket,
} from "./use-tickets-query";

// ============================================================================
// Files
// ============================================================================
export {
    fileKeys,
    useMyFilesQuery,
    useFileQuery,
    useFilesByEntityQuery,
    useUploadFile,
    useDeleteFile,
} from "./use-files-query";

// ============================================================================
// Sync (Offline Support)
// ============================================================================
export {
    syncKeys,
    usePendingSyncQuery,
    useSyncStats,
    useSyncPending,
    useResolveConflict,
} from "./use-sync-query";

// ============================================================================
// Preparations (Nurse pre-consultation)
// ============================================================================
export {
    preparationKeys,
    useActivePreparationsQuery,
    useMyPreparationsQuery,
    usePreparationQuery,
    usePatientPreparationsQuery,
    useConsultationPreparationQuery,
    useCreatePreparation,
    useUpdatePreparationProgress,
    useUpdatePreparationChecklist,
    useAddPreparationObservations,
    useCompletePreparation,
    usePreparationStats,
} from "./use-preparations-query";

// ============================================================================
// Calendar
// ============================================================================
export {
    calendarKeys,
    useCalendarEventsQuery,
    useMyCalendarQuery,
    useCalendarEventQuery,
    useDateRangeEventsQuery,
    useEventsByTypeQuery,
    useCreateCalendarEvent,
    useUpdateCalendarEvent,
    useCancelCalendarEvent,
    useDeleteCalendarEvent,
} from "./use-calendar-query";

// ============================================================================
// Activities
// ============================================================================
export {
    activityKeys,
    useActivitiesQuery,
    useMyActivitiesQuery,
    useActivityStatsQuery,
    useActivityQuery,
    useUserActivitiesQuery,
    useDateRangeActivitiesQuery,
} from "./use-activities-query";

// ============================================================================
// Help (FAQs + Articles)
// ============================================================================
export {
    helpKeys,
    useFaqsQuery,
    useFaqSearchQuery,
    useFaqsByCategoryQuery,
    useFaqQuery,
    useCreateFaq,
    useUpdateFaq,
    useMarkFaqHelpful,
    useDeleteFaq,
    useHelpArticlesQuery,
    useHelpArticleSearchQuery,
    useHelpArticlesByCategoryQuery,
    useHelpArticleBySlugQuery,
    useHelpArticleQuery,
    useCreateHelpArticle,
    useUpdateHelpArticle,
    useMarkHelpArticleHelpful,
    useDeleteHelpArticle,
} from "./use-help-query";

// ============================================================================
// Permissions (Admin)
// ============================================================================
export {
    permissionKeys,
    usePermissionsQuery,
    usePermissionsByResourceQuery,
    useRolesQuery,
    useRolePermissionsQuery,
    usePermissionQuery,
    useCreatePermission,
    useUpdatePermission,
    useTogglePermission,
    useDeletePermission,
    useAssignPermissionsToRole,
} from "./use-permissions-query";

// ============================================================================
// RBAC (Admin)
// ============================================================================
export {
    rbacKeys,
    useRbacPermissionsQuery,
    useRbacPermissionQuery,
    useRbacPermissionsByResourceQuery,
    useRoleRbacPermissionsQuery,
    usePermissionRolesQuery,
    useCreateRbacPermission,
    useDeleteRbacPermission,
    useAssignRbacPermission,
    useRemoveRolePermission,
} from "./use-rbac-query";

// ============================================================================
// System Modules (Admin)
// ============================================================================
export {
    systemModuleKeys,
    useSystemModulesQuery,
    useEnabledModulesQuery,
    useMyHospitalModulesQuery,
    useCoreModulesQuery,
    useModulesByCategoryQuery,
    useSystemModuleQuery,
    useHospitalModuleConfigsQuery,
    useCreateSystemModule,
    useUpdateSystemModule,
    useToggleSystemModule,
    useUpdateHospitalModuleConfig,
    useDeleteSystemModule,
} from "./use-system-modules-query";

// ============================================================================
// Rules (Admin)
// ============================================================================
export {
    ruleKeys,
    useRulesQuery,
    useRuleQuery,
    useCreateRule,
    useUpdateRule,
    useActivateRule,
    useDeactivateRule,
    useDeleteRule,
} from "./use-rules-query";

// ============================================================================
// Referrals (Patient transfers)
// ============================================================================
export {
    referralKeys,
    useReferralsQuery,
    useSentReferralsQuery,
    useReceivedReferralsQuery,
    usePendingReferralsQuery,
    useReferralStatsQuery,
    useMyReferralsQuery,
    usePatientReferralsQuery,
    useReferralQuery,
    useCreateReferral,
    useUpdateReferral,
    useAcceptReferral,
    useRejectReferral,
    useMarkReferralInTransit,
    useCompleteReferral,
    useCancelReferral,
    useDeleteReferral,
} from "./use-referrals-query";
