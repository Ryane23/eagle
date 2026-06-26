"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
    ClipboardList, 
    HeartPulse, 
    MessageSquare, 
    FileText,
    Video,
    Calendar 
} from "lucide-react";

type QuickAction = {
    label: string;
    icon: React.ElementType;
    href: string;
    variant?: "default" | "outline" | "secondary";
};

const quickActions: QuickAction[] = [
    { label: "Salle de Pré-consultation", icon: ClipboardList, href: "/dashboard/nurse/pre-consultation-room" },
    { label: "Signes vitaux", icon: HeartPulse, href: "/dashboard/nurse/vitals" },
    { label: "Messages", icon: MessageSquare, href: "/dashboard/nurse/messages" },
    { label: "Post-consultation", icon: FileText, href: "/dashboard/nurse/post-consultation" },
    { label: "Consultation", icon: Video, href: "/dashboard/nurse/consultation" },
    { label: "Calendrier", icon: Calendar, href: "/dashboard/nurse/calendar" },
];

export function NurseQuickAccessButtons() {
    return (
        <Card>
            <CardContent className="p-2">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-1.5">
                    {quickActions.map((action) => {
                        const Icon = action.icon;
                        return (
                            <Button
                                key={action.label}
                                variant={action.variant || "outline"}
                                className="flex flex-col items-center gap-1 h-auto py-2"
                                size="sm"
                                asChild
                            >
                                <a href={action.href}>
                                    <Icon className="size-3.5" />
                                    <span className="text-[10px] font-medium leading-tight">{action.label}</span>
                                </a>
                            </Button>
                        );
                    })}
                </div>
            </CardContent>
        </Card>
    );
}


