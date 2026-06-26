"use client";

import { memo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, Video, FileText, TrendingUp, CheckCircle2 } from "lucide-react";
import type { EmergencyPatient } from "@/types/emergencies";
import { getUrgencyConfig, getStatusConfig } from "@/types/emergencies";

interface EmergencyCardProps {
  patient: EmergencyPatient;
  onStartConsultation: (id: number) => void;
  onResolve: (id: number) => void;
  onViewDetails: (id: number) => void;
  onModifyUrgency: (id: number) => void;
}

export const EmergencyCard = memo(function EmergencyCard({
  patient,
  onStartConsultation,
  onResolve,
  onViewDetails,
  onModifyUrgency,
}: EmergencyCardProps) {
  const urgencyStyle = getUrgencyConfig(patient.urgencyLevel);
  const statusStyle = getStatusConfig(patient.status);
  const UrgencyIcon = urgencyStyle.icon;
  const StatusIcon = statusStyle.icon;

  return (
    <Card
      className={`border-l-4 ${urgencyStyle.bgColor} ${
        patient.urgencyLevel === 5 ? "shadow-lg shadow-red-100" : ""
      } flex flex-col`}
    >
      <CardContent className="p-2.5 flex flex-col flex-1 min-h-0">
        {/* Header Section */}
        <div className="flex items-start justify-between gap-2 mb-2 shrink-0">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 mb-1 flex-wrap">
              <h3 className="text-sm font-bold truncate">{patient.name}</h3>
              <Badge
                className={`${urgencyStyle.color} text-white flex items-center gap-1 text-[10px] shrink-0`}
              >
                <UrgencyIcon className="size-2.5" />
                {urgencyStyle.label}
              </Badge>
              <Badge
                className={`${statusStyle.color} text-white flex items-center gap-1 text-[10px] shrink-0`}
              >
                <StatusIcon className="size-2.5" />
                {statusStyle.label}
              </Badge>
            </div>
            <p className="text-[10px] text-muted-foreground truncate">
              {patient.age} ans • {patient.gender === "M" ? "Homme" : "Femme"}
            </p>
          </div>
          <div className="flex flex-col items-end gap-1 shrink-0">
            <div
              className={`flex items-center gap-1 px-1.5 py-0.5 rounded-lg ${
                patient.waitTime > 30 ? "bg-red-100" : "bg-orange-100"
              }`}
            >
              <Clock
                className={`size-2.5 ${
                  patient.waitTime > 30 ? "text-red-600" : "text-orange-600"
                }`}
              />
              <span
                className={`font-bold text-[10px] ${
                  patient.waitTime > 30 ? "text-red-600" : "text-orange-600"
                }`}
              >
                {patient.waitTime} min
              </span>
            </div>
            <p className="text-[10px] text-muted-foreground truncate">
              Arrivée: {patient.arrivalTime}
            </p>
          </div>
        </div>

        {/* Reason */}
        <div className="p-1.5 bg-muted/50 rounded-lg mb-1.5 shrink-0">
          <p className="font-semibold text-[10px] mb-0.5">Motif:</p>
          <p className="text-[10px] line-clamp-2">{patient.reason}</p>
        </div>

        {/* Vital Signs */}
        <VitalSignsGrid vitalSigns={patient.vitalSigns} />

        {/* Scrollable Content Area */}
        <div className="flex-1 min-h-0 space-y-1 overflow-hidden">
          {/* Symptoms */}
          <div className="shrink-0">
            <p className="text-[10px] font-semibold text-muted-foreground mb-0.5">
              Symptômes:
            </p>
            <div className="flex flex-wrap gap-0.5">
              {patient.symptoms.map((symptom, idx) => (
                <Badge key={idx} variant="outline" className="text-[10px]">
                  {symptom}
                </Badge>
              ))}
            </div>
          </div>

          {/* Triage Notes */}
          {patient.triageNotes && (
            <div className="shrink-0 p-1.5 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-[10px] font-semibold text-blue-700 mb-0.5">
                Notes de triage:
              </p>
              <p className="text-[10px] text-blue-900 line-clamp-2">
                {patient.triageNotes}
              </p>
              <p className="text-[10px] text-blue-600 mt-0.5 truncate">
                Infirmier: {patient.nurse}
              </p>
            </div>
          )}

          {/* Room and Assignment */}
          {patient.room && (
            <div className="flex items-center gap-1.5 text-[10px] shrink-0">
              <span className="font-medium truncate">📍 {patient.room}</span>
              {patient.assignedDoctor && (
                <span className="text-muted-foreground truncate">
                  Médecin: {patient.assignedDoctor}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Actions - Always at bottom */}
        <div className="flex flex-wrap gap-1 pt-1.5 mt-auto border-t shrink-0">
          {patient.status !== "in_consultation" && patient.status !== "resolved" && (
            <Button
              className="gap-1 h-7 text-[10px] px-2"
              size="sm"
              onClick={() => onStartConsultation(patient.id)}
            >
              <Video className="size-3" />
              Prendre en charge
            </Button>
          )}

          {patient.status === "in_consultation" && (
            <Button
              className="gap-1 h-7 text-[10px] px-2 bg-green-600 hover:bg-green-700"
              size="sm"
              onClick={() => onResolve(patient.id)}
            >
              <CheckCircle2 className="size-3" />
              Marquer résolu
            </Button>
          )}

          <Button
            variant="outline"
            className="gap-1 h-7 text-[10px] px-2"
            size="sm"
            onClick={() => onViewDetails(patient.id)}
          >
            <FileText className="size-3" />
            Dossier complet
          </Button>

          <Button
            variant="outline"
            className="gap-1 h-7 text-[10px] px-2"
            size="sm"
            onClick={() => onModifyUrgency(patient.id)}
          >
            <TrendingUp className="size-3" />
            Modifier urgence
          </Button>
        </div>
      </CardContent>
    </Card>
  );
});

// Sub-component for vital signs
interface VitalSignsGridProps {
  vitalSigns: EmergencyPatient["vitalSigns"];
}

function VitalSignsGrid({ vitalSigns }: VitalSignsGridProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-1 mb-1.5 shrink-0">
      {vitalSigns.bloodPressure && (
        <div className="p-1 bg-background rounded border min-w-0">
          <p className="text-[10px] text-muted-foreground mb-0.5">Tension</p>
          <p className="font-semibold text-[10px] truncate">{vitalSigns.bloodPressure}</p>
        </div>
      )}
      {vitalSigns.heartRate && (
        <div className="p-1 bg-background rounded border min-w-0">
          <p className="text-[10px] text-muted-foreground mb-0.5">Fréquence card.</p>
          <p className="font-semibold text-[10px]">{vitalSigns.heartRate} bpm</p>
        </div>
      )}
      {vitalSigns.temperature && (
        <div className="p-1 bg-background rounded border min-w-0">
          <p className="text-[10px] text-muted-foreground mb-0.5">Température</p>
          <p
            className={`font-semibold text-[10px] ${
              vitalSigns.temperature > 38 ? "text-red-600" : ""
            }`}
          >
            {vitalSigns.temperature}°C
          </p>
        </div>
      )}
      {vitalSigns.oxygenSaturation && (
        <div className="p-1 bg-background rounded border min-w-0">
          <p className="text-[10px] text-muted-foreground mb-0.5">SpO2</p>
          <p
            className={`font-semibold text-[10px] ${
              vitalSigns.oxygenSaturation < 95 ? "text-red-600" : ""
            }`}
          >
            {vitalSigns.oxygenSaturation}%
          </p>
        </div>
      )}
    </div>
  );
}

