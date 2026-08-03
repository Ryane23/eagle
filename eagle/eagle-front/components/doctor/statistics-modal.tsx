"use client";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    BarChart,
    Bar,
    LineChart,
    Line,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer
} from "recharts";
import { BarChart3, Clock, CheckCircle, AlertTriangle } from "lucide-react";

// Patient flow data (patients per hour)
const patientFlowData = [
    { hour: "8h", patients: 2 },
    { hour: "9h", patients: 4 },
    { hour: "10h", patients: 3 },
    { hour: "11h", patients: 5 },
    { hour: "12h", patients: 1 },
    { hour: "14h", patients: 3 },
    { hour: "15h", patients: 4 },
    { hour: "16h", patients: 2 },
    { hour: "17h", patients: 1 }
];

// Wait time distribution
const waitTimeData = [
    { range: "0-10 min", count: 8 },
    { range: "10-20 min", count: 12 },
    { range: "20-30 min", count: 6 },
    { range: "30-45 min", count: 3 },
    { range: ">45 min", count: 2 }
];

// Consultation completion
const consultationCompletionData = [
    { name: "Terminées", value: 8, color: "#10b981" },
    { name: "En cours", value: 1, color: "#3b82f6" },
    { name: "En attente", value: 4, color: "#f59e0b" }
];

// Urgency level breakdown
const urgencyBreakdownData = [
    { level: "Niveau 1", count: 3, color: "#9ca3af" },
    { level: "Niveau 2", count: 5, color: "#3b82f6" },
    { level: "Niveau 3", count: 2, color: "#fbbf24" },
    { level: "Niveau 4", count: 2, color: "#f97316" },
    { level: "Niveau 5", count: 1, color: "#ef4444" }
];

// Daily patient trend (last 7 days)
const dailyTrendData = [
    { day: "Lun", patients: 18 },
    { day: "Mar", patients: 22 },
    { day: "Mer", patients: 15 },
    { day: "Jeu", patients: 20 },
    { day: "Ven", patients: 19 },
    { day: "Sam", patients: 12 },
    { day: "Dim", patients: 8 }
];

type StatisticsModalProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
};

export function StatisticsModal({ open, onOpenChange }: StatisticsModalProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-xl">
                        <BarChart3 className="size-6" />
                        Statistiques et Analyses
                    </DialogTitle>
                    <DialogDescription>
                        Vue détaillée de votre activité et performance
                    </DialogDescription>
                </DialogHeader>

                <Tabs defaultValue="today" className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="today">Aujourd&apos;hui</TabsTrigger>
                        <TabsTrigger value="week">Cette semaine</TabsTrigger>
                        <TabsTrigger value="month">Ce mois</TabsTrigger>
                    </TabsList>

                    <TabsContent value="today" className="space-y-4">
                        <div className="grid md:grid-cols-2 gap-4">
                            {/* Patient Flow Graph */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-base flex items-center gap-2">
                                        <BarChart3 className="size-4" />
                                        Flux de Patients par Heure
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <ResponsiveContainer width="100%" height={250}>
                                        <BarChart data={patientFlowData}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="hour" />
                                            <YAxis />
                                            <Tooltip />
                                            <Bar dataKey="patients" fill="#3b82f6" />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </CardContent>
                            </Card>

                            {/* Wait Time Distribution */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-base flex items-center gap-2">
                                        <Clock className="size-4" />
                                        Distribution des Temps d&apos;Attente
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <ResponsiveContainer width="100%" height={250}>
                                        <BarChart data={waitTimeData}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="range" />
                                            <YAxis />
                                            <Tooltip />
                                            <Bar dataKey="count" fill="#f59e0b" />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </CardContent>
                            </Card>

                            {/* Consultation Completion */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-base flex items-center gap-2">
                                        <CheckCircle className="size-4" />
                                        État des Consultations
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <ResponsiveContainer width="100%" height={250}>
                                        <PieChart>
                                            <Pie
                                                data={consultationCompletionData}
                                                cx="50%"
                                                cy="50%"
                                                labelLine={false}
                                                label={(entry) => `${entry.name}: ${entry.value}`}
                                                outerRadius={80}
                                                fill="#8884d8"
                                                dataKey="value"
                                            >
                                                {consultationCompletionData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                                ))}
                                            </Pie>
                                            <Tooltip />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </CardContent>
                            </Card>

                            {/* Urgency Level Breakdown */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-base flex items-center gap-2">
                                        <AlertTriangle className="size-4" />
                                        Répartition par Niveau d&apos;Urgence
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <ResponsiveContainer width="100%" height={250}>
                                        <BarChart data={urgencyBreakdownData}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="level" />
                                            <YAxis />
                                            <Tooltip />
                                            <Bar dataKey="count">
                                                {urgencyBreakdownData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                                ))}
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    <TabsContent value="week" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Tendance Hebdomadaire</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ResponsiveContainer width="100%" height={400}>
                                    <LineChart data={dailyTrendData}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="day" />
                                        <YAxis />
                                        <Tooltip />
                                        <Legend />
                                        <Line 
                                            type="monotone" 
                                            dataKey="patients" 
                                            stroke="#3b82f6" 
                                            strokeWidth={2}
                                            name="Nombre de patients"
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>

                        <div className="grid md:grid-cols-3 gap-4">
                            <Card>
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-sm text-muted-foreground">
                                        Total Patients
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-3xl font-bold">114</p>
                                    <p className="text-sm text-green-600">+8% vs semaine dernière</p>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-sm text-muted-foreground">
                                        Temps Moyen/Consultation
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-3xl font-bold">28 min</p>
                                    <p className="text-sm text-green-600">-2 min vs semaine dernière</p>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-sm text-muted-foreground">
                                        Taux de Satisfaction
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-3xl font-bold">96%</p>
                                    <p className="text-sm text-green-600">+2% vs semaine dernière</p>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    <TabsContent value="month" className="space-y-4">
                        <div className="grid md:grid-cols-2 gap-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-base">Performance Mensuelle</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        <div>
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-sm font-medium">Consultations</span>
                                                <span className="text-sm font-bold">487</span>
                                            </div>
                                            <div className="w-full bg-gray-200 rounded-full h-2">
                                                <div className="bg-blue-600 h-2 rounded-full" style={{ width: "87%" }} />
                                            </div>
                                        </div>
                                        <div>
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-sm font-medium">Prescriptions</span>
                                                <span className="text-sm font-bold">412</span>
                                            </div>
                                            <div className="w-full bg-gray-200 rounded-full h-2">
                                                <div className="bg-green-600 h-2 rounded-full" style={{ width: "82%" }} />
                                            </div>
                                        </div>
                                        <div>
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-sm font-medium">Examens prescrits</span>
                                                <span className="text-sm font-bold">156</span>
                                            </div>
                                            <div className="w-full bg-gray-200 rounded-full h-2">
                                                <div className="bg-purple-600 h-2 rounded-full" style={{ width: "65%" }} />
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-base">Objectifs Atteints</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <ResponsiveContainer width="100%" height={250}>
                                        <PieChart>
                                            <Pie
                                                data={[
                                                    { name: "Atteints", value: 85, color: "#10b981" },
                                                    { name: "Restants", value: 15, color: "#e5e7eb" }
                                                ]}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={60}
                                                outerRadius={80}
                                                fill="#8884d8"
                                                dataKey="value"
                                            >
                                                <Cell fill="#10b981" />
                                                <Cell fill="#e5e7eb" />
                                            </Pie>
                                            <Tooltip />
                                        </PieChart>
                                    </ResponsiveContainer>
                                    <p className="text-center text-sm text-muted-foreground mt-2">
                                        85% des objectifs mensuels atteints
                                    </p>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>
                </Tabs>
            </DialogContent>
        </Dialog>
    );
}


