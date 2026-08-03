"use client";

import { memo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Clock, AlertTriangle, CheckCircle2 } from "lucide-react";

interface WaitingStatsProps {
  totalWaiting: number;
  readyPatients: number;
  urgentPatients: number;
  avgWaitTime: number;
}

export const WaitingStats = memo(function WaitingStats({
  totalWaiting,
  readyPatients,
  urgentPatients,
  avgWaitTime,
}: WaitingStatsProps) {
  return (
    <div className="grid gap-2 md:grid-cols-4">
      <StatCard
        icon={Users}
        label="Patients en attente"
        value={totalWaiting}
      />
      <StatCard
        icon={CheckCircle2}
        label="Patients prêts"
        value={readyPatients}
        valueClassName="text-green-600"
      />
      <StatCard
        icon={AlertTriangle}
        label="Urgences"
        value={urgentPatients}
        valueClassName="text-orange-600"
      />
      <StatCard
        icon={Clock}
        label="Temps moyen"
        value={`${avgWaitTime} min`}
      />
    </div>
  );
});

interface StatCardProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number | string;
  valueClassName?: string;
}

function StatCard({ icon: Icon, label, value, valueClassName }: StatCardProps) {
  return (
    <Card className="min-h-[100px] max-h-[120px]">
      <CardHeader className="pb-2">
        <CardTitle className="text-xs text-muted-foreground flex items-center gap-1.5">
          <Icon className="size-3.5" />
          {label}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className={`text-2xl font-bold ${valueClassName || ""}`}>{value}</p>
      </CardContent>
    </Card>
  );
}

