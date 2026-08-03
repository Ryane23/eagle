"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
    Video,
    FileText,
    Pill,
    Calendar,
    Users,
    BarChart3,
    MessageSquare,
    Settings
} from "lucide-react";

type QuickAction = {
    id: string;
    label: string;
    icon: React.ElementType;
    color: string;
    href?: string;
    action?: () => void;
};

export function QuickActionsGrid({ onStatsClick }: { onStatsClick?: () => void }) {
    const router = useRouter();

    const quickActions: QuickAction[] = [
        {
            id: "consultation",
            label: "Consultation",
            icon: Video,
            color: "bg-blue-100 text-blue-600 hover:bg-blue-200",
            href: "/dashboard/doctor/consultation"
        },
        {
            id: "prescriptions",
            label: "Ordonnances",
            icon: Pill,
            color: "bg-green-100 text-green-600 hover:bg-green-200",
            href: "/dashboard/doctor/prescriptions"
        },
        {
            id: "reports",
            label: "Rapports",
            icon: FileText,
            color: "bg-purple-100 text-purple-600 hover:bg-purple-200",
            href: "/dashboard/doctor/reports"
        },
        {
            id: "schedule",
            label: "Planning",
            icon: Calendar,
            color: "bg-orange-100 text-orange-600 hover:bg-orange-200",
            href: "/dashboard/doctor/schedule"
        },
        {
            id: "patients",
            label: "Patients",
            icon: Users,
            color: "bg-cyan-100 text-cyan-600 hover:bg-cyan-200",
            href: "/dashboard/doctor/patients"
        },
        {
            id: "stats",
            label: "Statistiques",
            icon: BarChart3,
            color: "bg-pink-100 text-pink-600 hover:bg-pink-200",
            action: onStatsClick
        },
        {
            id: "messages",
            label: "Messages",
            icon: MessageSquare,
            color: "bg-indigo-100 text-indigo-600 hover:bg-indigo-200",
            href: "/dashboard/doctor/messages"
        },
        {
            id: "settings",
            label: "Paramètres",
            icon: Settings,
            color: "bg-gray-100 text-gray-600 hover:bg-gray-200",
            href: "/dashboard/doctor/settings"
        }
    ];

    const handleClick = (action: QuickAction) => {
        if (action.action) {
            action.action();
        } else if (action.href) {
            router.push(action.href);
        }
    };

    return (
        <Card>
            <CardHeader className="pb-2">
                <CardTitle className="text-sm">Actions Rapides</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-4 gap-1.5">
                    {quickActions.map((action) => {
                        const Icon = action.icon;
                        return (
                            <Button
                                key={action.id}
                                variant="ghost"
                                className={`h-auto flex-col gap-1 py-2 px-1 ${action.color}`}
                                onClick={() => handleClick(action)}
                            >
                                <Icon className="size-4" />
                                <span className="text-[9px] font-medium leading-tight text-center">{action.label}</span>
                            </Button>
                        );
                    })}
                </div>
            </CardContent>
        </Card>
    );
}
