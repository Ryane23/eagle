# Doctor Dashboard – Routes to Backend Mapping

| Route | Page | Backend Modules | Key Endpoints / Hooks |
|-------|------|-----------------|------------------------|
| `/dashboard/doctor` | page.tsx | consultations, urgencies, queue, activities | useConsultationStats, useUrgencyStats, useQueueStats |
| `/dashboard/doctor/waiting-room` | waiting-room/page.tsx | queue, consultations, users | useHospitalQueueQuery, useUpdateQueueStatus, useUsersQuery |
| `/dashboard/doctor/consultation` | consultation/page.tsx | consultations, queue, patients, webrtc, messages | useConsultationsStore*, usePatientsStore*, useCreateRoom, useEndRoomByConsultation |
| `/dashboard/doctor/patients` | patients/page.tsx | patients | usePatientsQuery, useDeactivatePatient, usePatientConsultationsQuery |
| `/dashboard/doctor/prescriptions` | prescriptions/page.tsx | prescriptions, consultations | usePrescriptionsQuery, useCreatePrescription, useUpdatePrescription, useDeletePrescription |
| `/dashboard/doctor/reports` | reports/page.tsx | reports, patients | useReportsQuery, useCreateReport, useUpdateReport, useDeleteReport |
| `/dashboard/doctor/messages` | messages/page.tsx | messages, consultations | useConsultationMessagesQuery, useMarkAllMessagesAsRead, useDeleteMessage |
| `/dashboard/doctor/emergencies` | emergencies/page.tsx | urgencies | useUrgenciesQuery (doctor scope) |
| `/dashboard/doctor/schedule` | schedule/page.tsx | consultations, calendar | useConsultationsQuery, useCancelConsultation |
| `/dashboard/doctor/statistics` | statistics/page.tsx | analytics, activities, consultations | useConsultationStats, activities/analytics hooks |
| `/dashboard/doctor/notifications` | notifications/page.tsx | notifications | useNotificationsQuery, useMarkNotificationAsRead |
| `/dashboard/doctor/settings` | settings/page.tsx | auth | updateProfile (PATCH /auth/me) |

\* Legacy stores still used in consultation page and patient-details-modal; to be migrated to TanStack Query.
