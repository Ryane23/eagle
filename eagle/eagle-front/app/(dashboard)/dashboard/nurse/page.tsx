"use client";

import { useState } from "react";
import { EnhancedNurseDashboardHeader } from "@/components/nurse/enhanced-dashboard-header";
import { NurseQuickStats } from "@/components/nurse/nurse-quick-stats";
import { DashboardSidebar } from "@/components/nurse/dashboard-sidebar";
import { FloatingHelpButton } from "@/components/nurse/floating-help-button";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ClipboardCheck, ChevronUp, ChevronDown, DoorOpen, Users } from "lucide-react";

export default function NurseDashboard() {
  const [statsHidden, setStatsHidden] = useState(false);

  return (
    <div className="flex flex-col h-full">
      <EnhancedNurseDashboardHeader />

      <div className="flex-1 p-4 space-y-2 overflow-y-auto">
        {/* Quick Stats with Toggle */}
        <div className="flex items-center gap-2">
          <div className="flex-1">
            <NurseQuickStats hidden={statsHidden} />
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-2 gap-1 flex-shrink-0"
            onClick={() => setStatsHidden(!statsHidden)}
          >
            {statsHidden ? (
              <>
                <ChevronDown className="size-3" />
                <span className="text-[10px]">Afficher stats</span>
              </>
            ) : (
              <>
                <ChevronUp className="size-3" />
                <span className="text-[10px]">Masquer stats</span>
              </>
            )}
          </Button>
        </div>

        <div className="flex flex-wrap justify-end gap-2">
          <Button asChild size="sm" variant="outline" className="h-7">
            <a href="/dashboard/nurse/waiting-room">
              <DoorOpen className="size-3 mr-1.5" />
              <span className="text-xs">Ouvrir Salle d&apos;attente</span>
            </a>
          </Button>
          <Button asChild size="sm" variant="outline" className="h-7">
            <a href="/dashboard/nurse/patients">
              <Users className="size-3 mr-1.5" />
              <span className="text-xs">Patients</span>
            </a>
          </Button>
          <Button asChild size="sm" className="h-7">
            <a href="/dashboard/nurse/preparation-room">
              <ClipboardCheck className="size-3 mr-1.5" />
              <span className="text-xs">Accès Salle de préparation</span>
            </a>
          </Button>
        </div>

        {/* Main Content - Two Column Layout */}
        <div className="grid lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2">
            <Card>
              <CardContent className="p-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-primary">Salle d&apos;attente</h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Gérez les patients enregistrés, confirmez les arrivées et suivez les étapes de préparation depuis sa page dédiée.
                    </p>
                  </div>
                  <Button asChild>
                    <a href="/dashboard/nurse/waiting-room">
                      <DoorOpen className="size-4" />
                      Accéder
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-1">
            <DashboardSidebar />
          </div>
        </div>
      </div>

      {/* Floating Help Button */}
      <FloatingHelpButton />
    </div>
  );
}
