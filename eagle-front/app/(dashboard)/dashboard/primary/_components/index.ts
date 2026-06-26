// Primary Secretary Dashboard Components
export { NetworkStats } from "./network-stats";
export { QuickActions } from "./quick-actions";
export { CenterCard, type Center } from "./center-card";
export { CentersList } from "./centers-list";
export { UrgencyCard, type PendingUrgency } from "./urgency-card";
export { PendingUrgencies } from "./pending-urgencies";
export { ActiveConsultants, type Consultant } from "./active-consultants";
export { RecentActivity, type ActivityItem } from "./recent-activity";

// Re-export types from centralized location
export type {
  NetworkStatsData,
  CenterDisplay,
  PendingUrgencyValidation,
  ConsultantDisplay,
  ActivityItem as ActivityItemType,
} from "@/types/dashboard";

