"use client";

import { memo, ReactNode } from "react";
import { StatsToggle } from "./stats-toggle";
import { useUIStore } from "@/stores/ui-store";

export type StatsRowProps = {
  children: ReactNode;
  /** Use global UI store state. If false, you must provide hidden + onToggle */
  useGlobalState?: boolean;
  hidden?: boolean;
  onToggle?: () => void;
  className?: string;
};

function StatsRowComponent({
  children,
  useGlobalState = true,
  hidden: hiddenProp,
  onToggle: onToggleProp,
  className,
}: StatsRowProps) {
  // Use selectors to prevent unnecessary re-renders
  const globalHidden = useUIStore((state) => state.statsHidden);
  const globalToggle = useUIStore((state) => state.toggleStats);

  const hidden = useGlobalState ? globalHidden : (hiddenProp ?? false);
  const onToggle = useGlobalState ? globalToggle : (onToggleProp ?? (() => {}));

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="flex-1">{!hidden && children}</div>
      <StatsToggle hidden={hidden} onToggle={onToggle} />
    </div>
  );
}

export const StatsRow = memo(StatsRowComponent);

