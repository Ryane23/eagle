"use client";

import { memo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Siren, AlertTriangle, Video, Clock } from "lucide-react";

interface EmergencyStatsProps {
  criticalCount: number;
  urgentCount: number;
  inConsultationCount: number;
  avgWaitTime: number;
}

export const EmergencyStats = memo(function EmergencyStats({
  criticalCount,
  urgentCount,
  inConsultationCount,
  avgWaitTime,
}: EmergencyStatsProps) {
  return (
    <div className="grid gap-1.5 md:grid-cols-4">
      <Card className="border-red-200 min-h-[70px] max-h-[85px]">
        <CardHeader className="pb-1 px-3 pt-2">
          <CardTitle className="text-[10px] text-muted-foreground flex items-center gap-1">
            <Siren className="size-3 text-red-600" />
            Cas Critiques
          </CardTitle>
        </CardHeader>
        <CardContent className="px-3 pb-2 pt-0">
          <p className="text-lg font-bold text-red-600">{criticalCount}</p>
          <p className="text-[9px] text-muted-foreground mt-0.5">Niveau 5</p>
        </CardContent>
      </Card>

      <Card className="border-orange-200 min-h-[70px] max-h-[85px]">
        <CardHeader className="pb-1 px-3 pt-2">
          <CardTitle className="text-[10px] text-muted-foreground flex items-center gap-1">
            <AlertTriangle className="size-3 text-orange-600" />
            Cas Urgents
          </CardTitle>
        </CardHeader>
        <CardContent className="px-3 pb-2 pt-0">
          <p className="text-lg font-bold text-orange-600">{urgentCount}</p>
          <p className="text-[9px] text-muted-foreground mt-0.5">Niveau 4</p>
        </CardContent>
      </Card>

      <Card className="min-h-[70px] max-h-[85px]">
        <CardHeader className="pb-1 px-3 pt-2">
          <CardTitle className="text-[10px] text-muted-foreground flex items-center gap-1">
            <Video className="size-3" />
            En consultation
          </CardTitle>
        </CardHeader>
        <CardContent className="px-3 pb-2 pt-0">
          <p className="text-lg font-bold text-blue-600">{inConsultationCount}</p>
        </CardContent>
      </Card>

      <Card className="min-h-[70px] max-h-[85px]">
        <CardHeader className="pb-1 px-3 pt-2">
          <CardTitle className="text-[10px] text-muted-foreground flex items-center gap-1">
            <Clock className="size-3" />
            Temps moyen
          </CardTitle>
        </CardHeader>
        <CardContent className="px-3 pb-2 pt-0">
          <p className="text-lg font-bold">{avgWaitTime} min</p>
        </CardContent>
      </Card>
    </div>
  );
});

