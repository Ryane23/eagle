"use client";

import { memo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle } from "lucide-react";
import type { PendingUrgencyValidation } from "@/types/dashboard";

// Re-export for backwards compatibility
export type PendingUrgency = PendingUrgencyValidation;

type UrgencyCardProps = {
  urgency: PendingUrgency;
};

const urgencyLevelClasses: Record<number, string> = {
  1: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  2: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  3: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  4: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
  5: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
};

function UrgencyCardComponent({ urgency }: UrgencyCardProps) {
  const router = useRouter();

  const handleValidate = useCallback(() => {
    router.push(`/dashboard/primary/validation?patient=${urgency.id}`);
  }, [router, urgency.id]);

  return (
    <div className="p-3 rounded-lg border bg-muted/30 hover:bg-muted/50 transition-colors">
      <div className="flex justify-between items-start mb-2">
        <div>
          <h4 className="text-sm font-semibold">{urgency.name}</h4>
          <div className="text-[10px] text-muted-foreground mt-0.5">
            {urgency.age} ans • {urgency.center} • {urgency.requestTime}
          </div>
        </div>
        <Badge
          variant="outline"
          className={`text-[10px] px-2 py-0.5 ${
            urgencyLevelClasses[urgency.requestedLevel] || urgencyLevelClasses[1]
          }`}
        >
          Niveau {urgency.requestedLevel}
        </Badge>
      </div>
      <div className="text-xs space-y-1">
        <div>
          <span className="font-medium">Motif:</span> {urgency.motif}
        </div>
        <div>
          <span className="font-medium">Symptômes:</span> {urgency.symptoms}
        </div>
      </div>
      <div className="mt-2 pt-2 border-t flex justify-between items-center">
        <div className="text-[10px] text-muted-foreground">
          Par: {urgency.requestedBy}
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 text-xs"
          onClick={handleValidate}
        >
          <CheckCircle className="size-3.5 mr-1" />
          Valider
        </Button>
      </div>
    </div>
  );
}

export const UrgencyCard = memo(UrgencyCardComponent);

