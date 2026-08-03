"use client";

import { memo } from "react";
import { Button } from "@/components/ui/button";
import { ChevronUp, ChevronDown } from "lucide-react";

export type StatsToggleProps = {
  hidden: boolean;
  onToggle: () => void;
  showLabel?: string;
  hideLabel?: string;
  className?: string;
};

function StatsToggleComponent({
  hidden,
  onToggle,
  showLabel = "Afficher stats",
  hideLabel = "Masquer stats",
  className,
}: StatsToggleProps) {
  return (
    <Button
      variant="ghost"
      size="sm"
      className={`h-7 px-2 gap-1 flex-shrink-0 ${className}`}
      onClick={onToggle}
    >
      {hidden ? (
        <>
          <ChevronDown className="size-3" />
          <span className="text-[10px]">{showLabel}</span>
        </>
      ) : (
        <>
          <ChevronUp className="size-3" />
          <span className="text-[10px]">{hideLabel}</span>
        </>
      )}
    </Button>
  );
}

export const StatsToggle = memo(StatsToggleComponent);

