"use client";

import { memo } from "react";
import { Badge } from "@/components/ui/badge";
import { Stethoscope } from "lucide-react";
import { PatientCard } from "./patient-card";
import type { WaitingPatient } from "@/types/waiting-room";

interface SpecialtySectionProps {
  specialty: string;
  patients: WaitingPatient[];
  onStartConsultation: (id: number) => void;
  onQueueBySeverity: (id: number) => void;
  onAssignDoctor: (id: number) => void;
  onViewDetails: (id: number) => void;
}

export const SpecialtySection = memo(function SpecialtySection({
  specialty,
  patients,
  onStartConsultation,
  onQueueBySeverity,
  onAssignDoctor,
  onViewDetails,
}: SpecialtySectionProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Stethoscope className="size-5 text-primary" />
        <h2 className="text-lg font-semibold">{specialty}</h2>
        <Badge variant="secondary">{patients.length} patient(s)</Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        {patients.map((patient) => (
          <PatientCard
            key={patient._queueId ?? String(patient.id)}
            patient={patient}
            onStartConsultation={onStartConsultation}
            onQueueBySeverity={onQueueBySeverity}
            onAssignDoctor={onAssignDoctor}
            onViewDetails={onViewDetails}
          />
        ))}
      </div>
    </div>
  );
});

