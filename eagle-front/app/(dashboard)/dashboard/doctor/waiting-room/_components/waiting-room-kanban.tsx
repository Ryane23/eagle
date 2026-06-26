"use client";

import { memo } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Users, UserCheck, UserX, Calendar } from "lucide-react";
import { PatientCard } from "./patient-card";
import type { WaitingPatient } from "@/types/waiting-room";
import type { WaitingViewMode } from "@/types/waiting-room";

export type KanbanColumns = {
  all: WaitingPatient[];
  myPatients: WaitingPatient[];
  unassigned: WaitingPatient[];
  rendezVous: WaitingPatient[];
};

interface WaitingRoomKanbanProps {
  columns: KanbanColumns;
  viewMode: WaitingViewMode;
  onStartConsultation: (id: number) => void;
  onQueueBySeverity: (id: number) => void;
  onAssignDoctor: (id: number) => void;
  onViewDetails: (id: number) => void;
}

const COLUMN_CONFIG = [
  { key: "all" as const, label: "Tous", icon: Users },
  { key: "myPatients" as const, label: "Mes patients", icon: UserCheck },
  { key: "unassigned" as const, label: "Non assignés", icon: UserX },
  { key: "rendezVous" as const, label: "Rendez-vous", icon: Calendar },
] as const;

export const WaitingRoomKanban = memo(function WaitingRoomKanban({
  columns,
  viewMode,
  onStartConsultation,
  onQueueBySeverity,
  onAssignDoctor,
  onViewDetails,
}: WaitingRoomKanbanProps) {
  const cardClass = viewMode === "list" ? "space-y-1 px-2" : "space-y-2";

  return (
    <div
      className={
         "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 h-[calc(100vh-320px)] min-h-[400px]"
      }
    >
      {COLUMN_CONFIG.map(({ key, label, icon: Icon }) => {
        const patients = columns[key];
        return (
          <Card key={key} className={viewMode === "grid" ? "flex flex-col overflow-hidden min-h-0" : ""}>
            <CardHeader className="py-3 px-4 shrink-0 border-b">
              <div className="flex items-center gap-2">
                <Icon className="size-4 text-muted-foreground" />
                <span className="font-semibold text-sm">{label}</span>
                <span className="text-muted-foreground text-xs">({patients.length})</span>
              </div>
            </CardHeader>
            <CardContent className="flex-1 min-h-0 p-0 overflow-hidden">
              {patients.length === 0 ? (
                <p className="text-muted-foreground text-sm py-4 text-center">Aucun patient</p>
              ) : viewMode === "grid" ? (
                <ScrollArea className="h-full w-full px-3 pb-3">
                  <div className={cardClass}>
                    {patients.map((patient) => (
                      <PatientCard
                        key={patient._queueId ?? String(patient.id)}
                        patient={patient}
                        variant="grid"
                        onStartConsultation={onStartConsultation}
                        onQueueBySeverity={onQueueBySeverity}
                        onAssignDoctor={onAssignDoctor}
                        onViewDetails={onViewDetails}
                      />
                    ))}
                  </div>
                </ScrollArea>
              ) : (
                <div className={cardClass}>
                  {patients.map((patient) => (
                    <PatientCard
                      key={patient._queueId ?? String(patient.id)}
                      patient={patient}
                      variant="list"
                      onStartConsultation={onStartConsultation}
                      onQueueBySeverity={onQueueBySeverity}
                      onAssignDoctor={onAssignDoctor}
                      onViewDetails={onViewDetails}
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
});
