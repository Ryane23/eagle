"use client";

import {
  LayoutDashboard,
  Users,
  UserPlus,
  ClipboardList,
  ClipboardCheck,
  CheckCircle,
  Calendar,
  Building2,
  Stethoscope,
  HeartPulse,
  Video,
  Monitor,
  FileText,
  Pill,
  Bell,
  BarChart3,
  Settings,
  Shield,
  Activity,
  AlertTriangle,
  Package,
  Lock,
  GitBranch,
  MessageSquare,
  HelpCircle,
  type LucideIcon,
} from "lucide-react";

const iconMap: Record<string, LucideIcon> = {
  LayoutDashboard,
  Users,
  UserPlus,
  ClipboardList,
  ClipboardCheck,
  CheckCircle,
  Calendar,
  Building2,
  Stethoscope,
  HeartPulse,
  Video,
  Monitor,
  FileText,
  Pill,
  Bell,
  BarChart3,
  Settings,
  Shield,
  Activity,
  AlertTriangle,
  Package,
  Lock,
  GitBranch,
  MessageSquare,
  HelpCircle,
};

type NavIconProps = {
  name: string;
  className?: string;
};

export function NavIcon({ name, className }: NavIconProps) {
  const Icon = iconMap[name];
  if (!Icon) return null;
  return <Icon className={className} />;
}
