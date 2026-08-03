/**
 * Emergency module type definitions
 */

import type { LucideIcon } from "lucide-react";
import { Siren, AlertTriangle, Activity, Video, CheckCircle2 } from "lucide-react";

export type EmergencyStatus = "critical" | "urgent" | "stable" | "in_consultation" | "resolved";

export interface EmergencyVitalSigns {
  bloodPressure?: string;
  heartRate?: number;
  temperature?: number;
  oxygenSaturation?: number;
}

export interface EmergencyPatient {
  id: number;
  name: string;
  age: number;
  gender: "M" | "F";
  urgencyLevel: number;
  reason: string;
  symptoms: string[];
  vitalSigns: EmergencyVitalSigns;
  arrivalTime?: string;
  waitTime: number;
  status: EmergencyStatus;
  assignedDoctor?: string;
  room?: string;
  nurse?: string;
  triageNotes?: string;
  center?: string;
  // Original IDs for API calls
  _urgencyId?: string;
}

export interface UrgencyConfig {
  label: string;
  color: string;
  textColor: string;
  bgColor: string;
  icon: LucideIcon;
}

export interface StatusConfig {
  label: string;
  color: string;
  icon: LucideIcon;
}

export const URGENCY_CONFIG: Record<number, UrgencyConfig> = {
  5: {
    label: "Critique",
    color: "bg-red-600",
    textColor: "text-red-700",
    bgColor: "bg-red-50 border-red-300",
    icon: Siren,
  },
  4: {
    label: "Urgent",
    color: "bg-orange-500",
    textColor: "text-orange-700",
    bgColor: "bg-orange-50 border-orange-300",
    icon: AlertTriangle,
  },
  3: {
    label: "Modéré",
    color: "bg-yellow-500",
    textColor: "text-yellow-700",
    bgColor: "bg-yellow-50 border-yellow-300",
    icon: Activity,
  },
};

export const STATUS_CONFIG: Record<EmergencyStatus, StatusConfig> = {
  critical: { label: "Critique", color: "bg-red-600", icon: Siren },
  urgent: { label: "Urgent", color: "bg-orange-500", icon: AlertTriangle },
  stable: { label: "Stable", color: "bg-yellow-500", icon: Activity },
  in_consultation: { label: "En consultation", color: "bg-blue-500", icon: Video },
  resolved: { label: "Résolu", color: "bg-green-500", icon: CheckCircle2 },
};

export function getUrgencyConfig(level: number): UrgencyConfig {
  return URGENCY_CONFIG[level] || URGENCY_CONFIG[3];
}

export function getStatusConfig(status: EmergencyStatus): StatusConfig {
  return STATUS_CONFIG[status];
}

