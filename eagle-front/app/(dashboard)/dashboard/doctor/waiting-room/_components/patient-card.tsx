"use client";

import { memo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Clock,
  Building2,
  Video,
  ArrowUpDown,
  User,
  FileText,
  CheckCircle2,
} from "lucide-react";
import type { WaitingPatient } from "@/types/waiting-room";
import { getUrgencyColors, getStatusConfig } from "@/types/waiting-room";

interface PatientCardProps {
  patient: WaitingPatient;
  variant?: "grid" | "list";
  onStartConsultation: (id: number) => void;
  onQueueBySeverity: (id: number) => void;
  onAssignDoctor: (id: number) => void;
  onViewDetails: (id: number) => void;
}

export const PatientCard = memo(function PatientCard({
  patient,
  variant = "grid",
  onStartConsultation,
  onQueueBySeverity,
  onAssignDoctor,
  onViewDetails,
}: PatientCardProps) {
  const colors = getUrgencyColors(patient.urgencyLevel);
  const status = getStatusConfig(patient.status);

  const StatusIcon = patient.status === "ready" 
    ? CheckCircle2 
    : patient.status === "preparation" 
      ? User 
      : Clock;

  const positionBadge = patient.position != null ? (
    <span
      className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-amber-500 font-bold text-white shadow-sm ring-2 ring-amber-400/80 text-xs"
      title="Ordre de passage"
    >
      {patient.position}
    </span>
  ) : null;

  if (variant === "list") {
    return (
      <Card className={`border-l-4 ${colors.bg} hover:shadow-sm transition-shadow`}>
        <CardContent className="py-2 px-3">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-medium truncate flex-1 min-w-0">{patient.name}</h3>
            {positionBadge}
            <div className="flex items-center gap-1 shrink-0">
              {patient.status === "ready" && (
                <Button
                  className="h-7 w-7 p-0"
                  size="sm"
                  onClick={() => onStartConsultation(patient.id)}
                  disabled={!patient._consultationId}
                  title={!patient._consultationId ? "Assignez un médecin d'abord" : "Consulter"}
                >
                  <Video className="size-3.5" />
                </Button>
              )}
              <Button variant="outline" className="h-7 w-7 p-0" size="sm" onClick={() => onQueueBySeverity(patient.id)} title="Réorganiser par sévérité">
                <ArrowUpDown className="size-3.5" />
              </Button>
              <Button variant="outline" className="h-7 w-7 p-0" size="sm" onClick={() => onAssignDoctor(patient.id)} title="Assigner un médecin">
                <User className="size-3.5" />
              </Button>
              <Button variant="outline" className="h-7 w-7 p-0" size="sm" onClick={() => onViewDetails(patient.id)} title="Fiche patient">
                <FileText className="size-3.5" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`border-l-4 ${colors.bg} hover:shadow-md transition-shadow`}>
      <CardContent className="p-3">
        <div className="space-y-2">
          {/* Header: name left, position top-right */}
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                <h3 className="text-sm font-bold truncate">{patient.name}</h3>
                <Badge className={`${colors.badge} text-white text-[10px] h-4 px-1`}>
                  U{patient.urgencyLevel}
                </Badge>
              </div>
              <p className="text-[10px] text-muted-foreground">
                {patient.age} ans • {patient.gender === "M" ? "H" : "F"}
              </p>
            </div>
            {positionBadge}
          </div>

          {/* Sub-center info */}
          <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
            <Building2 className="size-3" />
            <span className="truncate">{patient.subCenterCode}</span>
          </div>

          {/* Time info */}
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1">
              <Clock className="size-3 text-orange-500" />
              <span className="font-semibold text-orange-600">
                {patient.waitTime} min
              </span>
            </div>
            <Badge className={`${status.color} text-white text-[10px] h-4`}>
              <StatusIcon className="size-2.5 mr-1" />
              {status.label}
            </Badge>
          </div>

          {/* Reason */}
          <div className="p-1.5 bg-muted/50 rounded text-[10px]">
            <p className="truncate">{patient.reason}</p>
          </div>

          {/* Actions */}
          <div className="flex gap-1.5">
            {patient.status === "ready" && (
              <Button
                className="flex-1 h-7 text-[10px]"
                size="sm"
                onClick={() => onStartConsultation(patient.id)}
                disabled={!patient._consultationId}
                title={!patient._consultationId ? "Assignez un médecin d'abord" : undefined}
              >
                <Video className="size-3 mr-1" />
                Consulter
              </Button>
            )}
            <Button
              variant="outline"
              className="h-7 text-[10px] px-2"
              size="sm"
              onClick={() => onQueueBySeverity(patient.id)}
              title="Réorganiser par sévérité"
            >
              <ArrowUpDown className="size-3" />
            </Button>
            <Button
              variant="outline"
              className="h-7 text-[10px] px-2"
              size="sm"
              onClick={() => onAssignDoctor(patient.id)}
              title="Assigner un médecin"
            >
              <User className="size-3" />
            </Button>
            <Button
              variant="outline"
              className="h-7 text-[10px] px-2"
              size="sm"
              onClick={() => onViewDetails(patient.id)}
            >
              <FileText className="size-3" />
            </Button>
          </div>

          {patient.assignedDoctor && (
            <div className="text-[10px] text-muted-foreground flex items-center gap-1">
              <User className="size-3" />
              Assigné: {patient.assignedDoctor}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
});

