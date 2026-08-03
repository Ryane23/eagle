// Mobile/Responsive
export { useIsMobile } from "./use-mobile";

// Utility Hooks
export { useDebounce, useDebouncedCallback } from "./use-debounce";
export { usePagination } from "./use-pagination";

// Auth Hooks
export { useAuth, useUserRole, useRequireAuth, useLogout } from "./use-auth";

// Doctors (cached for assignment dropdowns)
export { useDoctors } from "./use-doctors";

// Patient Hooks
export {
  usePatients,
  useCurrentPatient,
  usePatientSearch,
  useFilteredPatients,
} from "./use-patients";

// Consultation Hooks
export {
  useConsultations,
  useCurrentConsultation,
  useConsultationStats,
  useFilteredConsultations,
} from "./use-consultations";

// Urgency Hooks
export {
  useUrgencies,
  usePendingValidation,
  useCurrentUrgency,
  useUrgencyStats,
  useFilteredUrgencies,
} from "./use-urgencies";

// Queue Hooks
export {
  useQueue,
  useHospitalQueue,
  useQueueStats,
  useSortedQueue,
} from "./use-queue";

// Notification Hooks
export {
  useNotifications,
  useUnreadNotifications,
  useNotificationsByType,
  useNotificationBell,
} from "./use-notifications";

// Media Hooks
export { useWebcam, type UseWebcamOptions, type UseWebcamReturn } from "./use-webcam";

// WebRTC Hooks
export {
  useWebRTCSocket,
  type UseWebRTCSocketOptions,
  type UseWebRTCSocketReturn,
} from "./use-webrtc-socket";
export {
  useWebRTCPeer,
  type UseWebRTCPeerOptions,
  type UseWebRTCPeerReturn,
} from "./use-webrtc-peer";

// Admin Users Hooks
export {
  useUsers,
  useUserDetails,
  useUsersStats,
  useUserSearch,
  useUsersFilter,
} from "./use-users";

// Admin Hospitals Hooks
export {
  useHospitals,
  useHospitalDetails,
  useHospitalsStats,
  useHospitalSearch,
  useHospitalsByType,
  useHospitalOptions,
} from "./use-hospitals";

// Analytics Hooks
export {
  useNetworkAnalytics,
  useSystemHealth,
  useBranchStatistics,
  useRefreshAnalytics,
  useAdminDashboardStats,
} from "./use-analytics";

// Complaints/Incidents Hooks
export {
  useComplaints,
  useComplaintDetails,
  useComplaintsStats,
  useFilteredComplaints,
  useComplaintSearch,
} from "./use-complaints";

// System Settings Hooks
export {
  useSystemSettings,
  useSystemHealthStatus,
  useMaintenanceMode,
  useRefreshSystem,
} from "./use-system";

// Doctor Dashboard Hooks
export {
  useDoctorStats,
  useNextPatient,
  useUrgentPatients,
  useDoctorSchedule,
  useDoctorDashboardRefresh,
  useStartConsultation,
  type DoctorStats,
  type NextPatientInfo,
  type UrgentPatientInfo,
  type ScheduleItem,
} from "./use-doctor-dashboard";

// TanStack Query Hooks (Server State)
export * from "./queries";
