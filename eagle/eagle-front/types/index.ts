// API Types (backend contracts)
export * from "./api";

// Dashboard UI Types
export * from "./dashboard";
export * from "./consultation";
export * from "./nurse";

// Waiting Room Types (explicit exports to avoid conflicts)
export type {
    WaitingPatient,
    Doctor,
    WaitingSortOption,
    WaitingFilterStatus,
} from "./waiting-room";
export {
    URGENCY_COLORS,
    STATUS_CONFIG as WAITING_STATUS_CONFIG,
    getUrgencyColors,
    getStatusConfig as getWaitingStatusConfig,
} from "./waiting-room";

// Emergency Types (explicit exports to avoid conflicts)
export type {
    EmergencyStatus,
    EmergencyVitalSigns,
    EmergencyPatient,
    UrgencyConfig,
    StatusConfig as EmergencyStatusConfig,
} from "./emergencies";
export {
    URGENCY_CONFIG,
    STATUS_CONFIG as EMERGENCY_STATUS_CONFIG,
    getUrgencyConfig,
    getStatusConfig as getEmergencyStatusConfig,
} from "./emergencies";

// Domain Types
export * from "./incident";
export * from "./task";
export * from "./module";
export * from "./permission";
export * from "./rbac";
export * from "./supervision";
export * from "./rules";
