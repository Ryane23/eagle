"use client";

import { useState } from "react";
import { EnhancedNurseDashboardHeader } from "@/components/nurse/enhanced-dashboard-header";
import { NurseQuickStats } from "@/components/nurse/nurse-quick-stats";
import { WaitingRoomsBySpecialty } from "@/components/nurse/waiting-rooms-by-specialty";
import { DashboardSidebar } from "@/components/nurse/dashboard-sidebar";
import { FloatingHelpButton } from "@/components/nurse/floating-help-button";
import { Button } from "@/components/ui/button";
import { ClipboardCheck, ChevronUp, ChevronDown } from "lucide-react";

export default function NurseDashboard() {
  const [statsHidden, setStatsHidden] = useState(false);

  return (
    <div className="flex flex-col h-full">
      <EnhancedNurseDashboardHeader
        nurseName="Sophie Ateba"
        clinic="Centre Principal - Yaoundé"
        clinicCode="CPY-001"
        clinicType="Centre Principal"
      />

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

        {/* Quick Access Button */}
        <div className="flex justify-end">
          <Button asChild size="sm" className="h-7">
            <a href="/dashboard/nurse/pre-consultation-room">
              <ClipboardCheck className="size-3 mr-1.5" />
              <span className="text-xs">Accès Salle de Pré-consultation</span>
            </a>
          </Button>
        </div>

        {/* Main Content - Two Column Layout */}
        <div className="grid lg:grid-cols-3 gap-4">
          {/* Main Content - Waiting Rooms */}
          <div className="lg:col-span-2">
            <WaitingRoomsBySpecialty />
          </div>

          {/* Sidebar */}
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

