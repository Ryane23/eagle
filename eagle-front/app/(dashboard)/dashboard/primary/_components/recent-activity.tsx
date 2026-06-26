"use client";

import { memo } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { History, CheckCircle, Layers, Users, Activity, LogOut, FileText } from "lucide-react";
import type { ActivityItem as ActivityItemType, ActivityType } from "@/types/dashboard";

// Re-export for backwards compatibility
export type ActivityItem = ActivityItemType;

type RecentActivityProps = {
  activities: ActivityItem[];
};

const typeClasses: Record<ActivityType, string> = {
  validation: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  room: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  assignment: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
  login: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  logout: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400",
  document: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400",
  preparation: "bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-400",
  vitals: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  message: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
  consultation: "bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-400",
};

const typeIcons: Record<ActivityType, typeof Activity> = {
  validation: CheckCircle,
  room: Layers,
  assignment: Users,
  login: Activity,
  logout: LogOut,
  document: FileText,
  preparation: Layers,
  vitals: Activity,
  message: History,
  consultation: Users,
};

function RecentActivityComponent({ activities }: RecentActivityProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <History className="size-5 text-gray-600" />
          Activité récente
        </CardTitle>
      </CardHeader>
      <CardContent className="p-3">
        <ScrollArea className="h-[180px]">
          <div className="space-y-3">
            {activities.map((activity) => {
              const Icon = typeIcons[activity.type];
              return (
                <div key={activity.id} className="flex items-start gap-3">
                  <div
                    className={`size-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      typeClasses[activity.type]
                    }`}
                  >
                    <Icon className="size-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-semibold">{activity.action}</div>
                    <div className="text-[11px] text-muted-foreground mt-0.5">
                      {activity.details}
                    </div>
                    <div className="text-[10px] text-muted-foreground mt-1">
                      {activity.user} • {activity.time} • {activity.center}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

export const RecentActivity = memo(RecentActivityComponent);

