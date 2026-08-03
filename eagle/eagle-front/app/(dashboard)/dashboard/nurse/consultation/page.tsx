"use client";

import { ConsultationBoxWorkspace } from "@/components/nurse/consultation-box-workspace";
import { EnhancedNurseDashboardHeader } from "@/components/nurse/enhanced-dashboard-header";
import { FloatingHelpButton } from "@/components/nurse/floating-help-button";

export default function ConsultationRoomPage() {
    return (
        <div className="flex h-full flex-col">
            <EnhancedNurseDashboardHeader />
            <main className="flex-1 space-y-4 overflow-y-auto p-4">
                <ConsultationBoxWorkspace />
            </main>
            <FloatingHelpButton />
        </div>
    );
}
