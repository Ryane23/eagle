"use client";

import { memo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, TrendingDown } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type StatsCardProps = {
  title: string;
  value: string | number;
  icon: LucideIcon;
  color?: string;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  className?: string;
};

function StatsCardComponent({
  title,
  value,
  icon: Icon,
  color = "text-blue-500",
  trend,
  className,
}: StatsCardProps) {
  return (
    <Card
      className={`hover:shadow-md transition-shadow rounded-xl flex-shrink-0 min-w-[180px] ${className}`}
    >
      <CardContent className="p-3">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg bg-muted/50 ${color} flex-shrink-0`}>
            <Icon className="size-4" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-lg font-bold leading-tight">{value}</p>
            <p className="text-[11px] text-muted-foreground leading-tight truncate">
              {title}
            </p>
            {trend && (
              <div
                className={`flex items-center gap-0.5 text-[10px] mt-0.5 ${
                  trend.isPositive ? "text-green-600" : "text-orange-600"
                }`}
              >
                {trend.isPositive ? (
                  <TrendingUp className="size-2.5" />
                ) : (
                  <TrendingDown className="size-2.5" />
                )}
                <span className="font-medium">{trend.value}</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export const StatsCard = memo(StatsCardComponent);

