"use client";

import { EnhancedNurseDashboardHeader } from "@/components/nurse/enhanced-dashboard-header";
import { FloatingHelpButton } from "@/components/nurse/floating-help-button";
import { WaitingRoomsBySpecialty } from "@/components/nurse/waiting-rooms-by-specialty";
import { Button } from "@/components/ui/button";
import { RefreshCw, Users } from "lucide-react";

export default function NurseWaitingRoomPage() {
    return (
        <div className="flex h-full flex-col">
            <EnhancedNurseDashboardHeader />
            <main className="flex-1 space-y-4 overflow-y-auto p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-primary">Salle d&apos;attente</h1>
                        <p className="text-sm text-muted-foreground">
                            Gestion des arrivées, préparations et passages vers la consultation.
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <Button asChild variant="outline" size="sm">
                            <a href="/dashboard/nurse/patients">
                                <Users className="size-4" />
                                Patients
                            </a>
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => window.location.reload()}
                        >
                            <RefreshCw className="size-4" />
                            Actualiser
                        </Button>
                    </div>
                </div>

                <WaitingRoomsBySpecialty />
            </main>
            <FloatingHelpButton />
        </div>
    );
}
