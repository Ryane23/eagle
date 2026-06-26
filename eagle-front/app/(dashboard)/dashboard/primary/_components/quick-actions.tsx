"use client";

import { memo } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ClipboardList,
  UserCheck,
  Calendar,
  Building,
  BarChart2,
  Bell,
  Settings,
} from "lucide-react";

type QuickActionsProps = {
  pendingValidationCount: number;
};

function QuickActionsComponent({ pendingValidationCount }: QuickActionsProps) {
  const router = useRouter();

  return (
    <Card>
      <CardContent className="p-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-medium text-muted-foreground mr-2">
            Actions rapides:
          </span>
          <Button
            size="sm"
            className="h-8 text-xs"
            onClick={() => router.push("/dashboard/primary/requests")}
          >
            <ClipboardList className="size-3.5 mr-1.5" />
            Demandes
          </Button>
          <Button
            size="sm"
            variant="secondary"
            className="h-8 text-xs"
            onClick={() => router.push("/dashboard/primary/validation")}
          >
            <UserCheck className="size-3.5 mr-1.5" />
            Valider urgences
            {pendingValidationCount > 0 && (
              <Badge variant="destructive" className="ml-1.5 size-4 p-0 text-[9px]">
                {pendingValidationCount}
              </Badge>
            )}
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="h-8 text-xs"
            onClick={() => router.push("/dashboard/primary/schedule")}
          >
            <Calendar className="size-3.5 mr-1.5" />
            Planning
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="h-8 text-xs"
            onClick={() => router.push("/dashboard/primary/centers")}
          >
            <Building className="size-3.5 mr-1.5" />
            Centres
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="h-8 text-xs"
            onClick={() => router.push("/dashboard/primary/stats")}
          >
            <BarChart2 className="size-3.5 mr-1.5" />
            Statistiques
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="h-8 text-xs"
            onClick={() => router.push("/dashboard/primary/notifications")}
          >
            <Bell className="size-3.5 mr-1.5" />
            Notifications
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="h-8 text-xs"
            onClick={() => router.push("/dashboard/primary/settings")}
          >
            <Settings className="size-3.5 mr-1.5" />
            Paramètres
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export const QuickActions = memo(QuickActionsComponent);

