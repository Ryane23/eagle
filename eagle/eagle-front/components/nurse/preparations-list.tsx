"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, User, Stethoscope } from "lucide-react";

type Preparation = {
    id: number;
    patient: string;
    time: string;
    status: "ready" | "pending" | "urgent";
    doctor: string;
    specialty?: string;
};

const mockPreparations: Preparation[] = [
    { id: 1, patient: "Kamga Jean", time: "09:00", status: "ready", doctor: "Dr. Nana", specialty: "Généraliste" },
    { id: 2, patient: "Mbeki Paul", time: "09:30", status: "pending", doctor: "Dr. Fotso", specialty: "Cardiologue" },
    { id: 3, patient: "Ngono Marie", time: "10:00", status: "urgent", doctor: "Dr. Ateba", specialty: "Pédiatre" },
    { id: 4, patient: "Talla Pierre", time: "10:30", status: "pending", doctor: "Dr. Nana", specialty: "Généraliste" },
];

export function PreparationsList() {
    const getStatusBadge = (status: Preparation["status"]) => {
        switch (status) {
            case "ready":
                return <Badge variant="default">Prêt</Badge>;
            case "urgent":
                return <Badge variant="destructive">Urgent</Badge>;
            default:
                return <Badge variant="secondary">En attente</Badge>;
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Patients à préparer</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {mockPreparations.map((prep) => (
                        <div 
                            key={prep.id} 
                            className={`flex items-center justify-between p-4 rounded-lg border transition-all hover:shadow-md ${
                                prep.status === "urgent" 
                                    ? "bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800" 
                                    : prep.status === "ready"
                                    ? "bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800"
                                    : "bg-muted/50"
                            }`}
                        >
                            <div className="flex items-center gap-4 flex-1">
                                <div className="text-center min-w-[60px]">
                                    <Clock className="size-4 text-muted-foreground mx-auto mb-1" />
                                    <p className="text-lg font-bold text-primary">{prep.time}</p>
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <User className="size-4 text-muted-foreground" />
                                        <p className="font-medium">{prep.patient}</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Stethoscope className="size-4 text-muted-foreground" />
                                        <p className="text-sm text-muted-foreground">{prep.doctor}</p>
                                        {prep.specialty && (
                                            <>
                                                <span className="text-muted-foreground">•</span>
                                                <p className="text-sm text-muted-foreground">{prep.specialty}</p>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                {getStatusBadge(prep.status)}
                                <Button size="sm" variant={prep.status === "ready" ? "outline" : "default"}>
                                    {prep.status === "ready" ? "Voir" : "Préparer"}
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}














