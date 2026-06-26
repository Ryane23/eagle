"use client";

import { useState } from "react";
import { EnhancedNurseDashboardHeader } from "@/components/nurse/enhanced-dashboard-header";
import { updateProfile } from "@/actions/auth";
import { useAuthStore } from "@/stores/auth-store";
import { FloatingHelpButton } from "@/components/nurse/floating-help-button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
    User,
    Bell,
    Moon,
    Shield,
    Save,
    Key,
    Mail,
    Phone,
    Building2,
    Award,
    Users,
    Eye,
    Calendar,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";

// Mock data - in real app, this would come from auth context
const currentUserRole: "nurse" | "superior_nurse" = "superior_nurse"; // Change to "nurse" to see regular view

const mockTeamMembers = [
    { id: "1", name: "Marie Kouam", email: "marie.kouam@eagle.cm", role: "nurse", status: "active", lastActive: "Il y a 5 min" },
    { id: "2", name: "Paul Ndongo", email: "paul.ndongo@eagle.cm", role: "nurse", status: "active", lastActive: "Il y a 12 min" },
    { id: "3", name: "Julie Mbarga", email: "julie.mbarga@eagle.cm", role: "nurse", status: "away", lastActive: "Il y a 1h" },
    { id: "4", name: "Robert Tamo", email: "robert.tamo@eagle.cm", role: "nurse", status: "active", lastActive: "Il y a 3 min" },
];

export default function SettingsPage() {
    const user = useAuthStore((s) => s.user);
    const setUser = useAuthStore((s) => s.setUser);

    const [profileData, setProfileData] = useState({
        name: user?.name ?? "Sophie Ateba",
        email: user?.email ?? "sophie.ateba@eagle.cm",
        phone: user?.phone ?? "+237 6XX XXX XXX",
        center: "Centre Principal - Yaoundé",
        employeeId: "EAGLE-NUR-2024-001",
        licenseNumber: "CM-NUR-2024-001",
        specialization: "Infirmier(ère) en soins primaires",
        yearsOfExperience: "8",
    });

    const [notifications, setNotifications] = useState({
        email: true,
        push: true,
        sms: false,
        messages: true,
        preparations: true,
        documents: true,
    });

    const [preferences, setPreferences] = useState({
        darkMode: false,
        language: "fr",
        timezone: "Africa/Douala",
    });

    const handleSaveProfile = async () => {
        try {
            const updated = await updateProfile({
                name: profileData.name,
                phone: profileData.phone || undefined,
            });
            setUser(updated);
            toast.success("Profil mis à jour avec succès!");
        } catch (error) {
            toast.error("Erreur lors de la mise à jour du profil");
        }
    };

    return (
        <div className="flex flex-col h-full">
            <EnhancedNurseDashboardHeader
                nurseName="Sophie Ateba"
                clinic="Centre Principal - Yaoundé"
                clinicCode="CPY-001"
                clinicType="Centre Principal"
            />

            <div className="flex-1 p-6 space-y-6 overflow-y-auto">
                {/* Header */}
                <div>
                    <h1 className="text-2xl font-bold text-primary">Paramètres</h1>
                    <p className="text-muted-foreground">
                        Gérez vos préférences et paramètres de compte
                    </p>
                </div>

                <Tabs defaultValue="profile" className="w-full">
                    <TabsList className="grid w-full grid-cols-5">
                        <TabsTrigger value="profile">Profil</TabsTrigger>
                        <TabsTrigger value="role">Rôle</TabsTrigger>
                        {currentUserRole === "superior_nurse" && (
                            <TabsTrigger value="team">Équipe</TabsTrigger>
                        )}
                        <TabsTrigger value="notifications">Notifications</TabsTrigger>
                        <TabsTrigger value="preferences">Préférences</TabsTrigger>
                        <TabsTrigger value="security">Sécurité</TabsTrigger>
                    </TabsList>

                    {/* Profile Tab */}
                    <TabsContent value="profile" className="space-y-6 mt-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <User className="size-5" />
                                    Informations personnelles
                                </CardTitle>
                                <CardDescription>
                                    Gérez vos informations de profil
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center gap-4 mb-6">
                                    <Avatar className="size-20">
                                        <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                                            SA
                                        </AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <Button variant="outline">Changer la photo</Button>
                                        <p className="text-sm text-muted-foreground mt-2">
                                            JPG, PNG ou GIF. Max 2MB
                                        </p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="name">Nom complet</Label>
                                        <Input
                                            id="name"
                                            value={profileData.name}
                                            onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="email">Email</Label>
                                        <div className="flex items-center gap-2">
                                            <Mail className="size-4 text-muted-foreground" />
                                            <Input
                                                id="email"
                                                type="email"
                                                value={profileData.email}
                                                onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <Label htmlFor="phone">Téléphone</Label>
                                        <div className="flex items-center gap-2">
                                            <Phone className="size-4 text-muted-foreground" />
                                            <Input
                                                id="phone"
                                                value={profileData.phone}
                                                onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <Label htmlFor="center">Centre</Label>
                                        <div className="flex items-center gap-2">
                                            <Building2 className="size-4 text-muted-foreground" />
                                            <Input
                                                id="center"
                                                value={profileData.center}
                                                disabled
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <Label htmlFor="employeeId">Numéro d&apos;employé</Label>
                                        <Input
                                            id="employeeId"
                                            value={profileData.employeeId}
                                            onChange={(e) => setProfileData({ ...profileData, employeeId: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="licenseNumber">Numéro de licence</Label>
                                        <Input
                                            id="licenseNumber"
                                            value={profileData.licenseNumber}
                                            onChange={(e) => setProfileData({ ...profileData, licenseNumber: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="specialization">Spécialisation</Label>
                                        <Input
                                            id="specialization"
                                            value={profileData.specialization}
                                            onChange={(e) => setProfileData({ ...profileData, specialization: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="yearsOfExperience">Années d&apos;expérience</Label>
                                        <Input
                                            id="yearsOfExperience"
                                            type="number"
                                            value={profileData.yearsOfExperience}
                                            onChange={(e) => setProfileData({ ...profileData, yearsOfExperience: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <Button onClick={handleSaveProfile}>
                                    <Save className="size-4 mr-2" />
                                    Enregistrer les modifications
                                </Button>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Role & Permissions Tab */}
                    <TabsContent value="role" className="space-y-6 mt-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Award className="size-5" />
                                    Rôle et Permissions
                                </CardTitle>
                                <CardDescription>
                                    Informations sur votre rôle et vos permissions dans le système
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                                    <div>
                                        <Label className="text-sm font-medium">Rôle actuel</Label>
                                        <div className="flex items-center gap-2 mt-1">
                                            <Badge variant={currentUserRole === "superior_nurse" ? "default" : "secondary"} className="text-sm">
                                                {currentUserRole === "superior_nurse" ? "Infirmier(ère) Supérieur(e)" : "Infirmier(ère)"}
                                            </Badge>
                                        </div>
                                    </div>
                                    {currentUserRole === "superior_nurse" && (
                                        <Award className="size-6 text-primary" />
                                    )}
                                </div>

                                <Separator />

                                <div>
                                    <Label className="text-sm font-medium mb-3 block">Permissions</Label>
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2 p-2 bg-muted/30 rounded">
                                            <div className="size-2 bg-green-500 rounded-full" />
                                            <span className="text-sm">Enregistrement des signes vitaux</span>
                                        </div>
                                        <div className="flex items-center gap-2 p-2 bg-muted/30 rounded">
                                            <div className="size-2 bg-green-500 rounded-full" />
                                            <span className="text-sm">Assistance aux consultations</span>
                                        </div>
                                        <div className="flex items-center gap-2 p-2 bg-muted/30 rounded">
                                            <div className="size-2 bg-green-500 rounded-full" />
                                            <span className="text-sm">Préparation des patients</span>
                                        </div>
                                        <div className="flex items-center gap-2 p-2 bg-muted/30 rounded">
                                            <div className="size-2 bg-green-500 rounded-full" />
                                            <span className="text-sm">Lecture des dossiers patients</span>
                                        </div>
                                        {currentUserRole === "superior_nurse" && (
                                            <>
                                                <div className="flex items-center gap-2 p-2 bg-primary/10 rounded border border-primary/20">
                                                    <div className="size-2 bg-primary rounded-full" />
                                                    <span className="text-sm font-medium">Gestion de l&apos;équipe infirmière</span>
                                                </div>
                                                <div className="flex items-center gap-2 p-2 bg-primary/10 rounded border border-primary/20">
                                                    <div className="size-2 bg-primary rounded-full" />
                                                    <span className="text-sm font-medium">Supervision des préparations</span>
                                                </div>
                                                <div className="flex items-center gap-2 p-2 bg-primary/10 rounded border border-primary/20">
                                                    <div className="size-2 bg-primary rounded-full" />
                                                    <span className="text-sm font-medium">Planification de l&apos;équipe</span>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>

                                <Separator />

                                <div>
                                    <Label className="text-sm font-medium mb-3 block">Statistiques</Label>
                                    <div className="grid grid-cols-3 gap-4">
                                        <div className="text-center p-3 bg-blue-50 rounded-lg">
                                            <p className="text-2xl font-bold text-blue-600">
                                                {currentUserRole === "superior_nurse" ? "12" : "45"}
                                            </p>
                                            <p className="text-xs text-muted-foreground mt-1">
                                                {currentUserRole === "superior_nurse" ? "Infirmiers gérés" : "Patients préparés"}
                                            </p>
                                        </div>
                                        <div className="text-center p-3 bg-green-50 rounded-lg">
                                            <p className="text-2xl font-bold text-green-600">128</p>
                                            <p className="text-xs text-muted-foreground mt-1">Consultations assistées</p>
                                        </div>
                                        <div className="text-center p-3 bg-orange-50 rounded-lg">
                                            <p className="text-2xl font-bold text-orange-600">2.5</p>
                                            <p className="text-xs text-muted-foreground mt-1">Années dans le système</p>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Team Management Tab (Superior Nurse Only) */}
                    {currentUserRole === "superior_nurse" && (
                        <TabsContent value="team" className="space-y-6 mt-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Users className="size-5" />
                                        Gestion de l&apos;Équipe Infirmière
                                    </CardTitle>
                                    <CardDescription>
                                        Gérez les membres de votre équipe infirmière
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="mb-4 flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-muted-foreground">
                                                {mockTeamMembers.length} infirmier(s) sous votre supervision
                                            </p>
                                        </div>
                                        <Button size="sm">
                                            <Users className="size-4 mr-2" />
                                            Ajouter un membre
                                        </Button>
                                    </div>
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Nom</TableHead>
                                                <TableHead>Email</TableHead>
                                                <TableHead>Statut</TableHead>
                                                <TableHead>Dernière activité</TableHead>
                                                <TableHead className="text-right">Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {mockTeamMembers.map((member) => (
                                                <TableRow key={member.id}>
                                                    <TableCell className="font-medium">{member.name}</TableCell>
                                                    <TableCell>{member.email}</TableCell>
                                                    <TableCell>
                                                        <Badge variant={member.status === "active" ? "default" : "secondary"}>
                                                            {member.status === "active" ? "Actif" : "Absent"}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="text-sm text-muted-foreground">
                                                        {member.lastActive}
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <div className="flex items-center justify-end gap-2">
                                                            <Button variant="ghost" size="sm">
                                                                <Eye className="size-4" />
                                                            </Button>
                                                            <Button variant="ghost" size="sm">
                                                                <Calendar className="size-4" />
                                                            </Button>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Calendar className="size-5" />
                                        Planification de l&apos;Équipe
                                    </CardTitle>
                                    <CardDescription>
                                        Gérez les horaires et les affectations de votre équipe
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                                        <div>
                                            <Label className="text-sm font-medium">Semaine en cours</Label>
                                            <p className="text-xs text-muted-foreground mt-1">
                                                15 - 21 Janvier 2025
                                            </p>
                                        </div>
                                        <Button variant="outline" size="sm">
                                            <Calendar className="size-4 mr-2" />
                                            Voir le planning
                                        </Button>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="p-3 bg-blue-50 rounded-lg">
                                            <p className="text-lg font-bold text-blue-600">8</p>
                                            <p className="text-xs text-muted-foreground">Shifts planifiés</p>
                                        </div>
                                        <div className="p-3 bg-green-50 rounded-lg">
                                            <p className="text-lg font-bold text-green-600">4</p>
                                            <p className="text-xs text-muted-foreground">Infirmiers disponibles</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    )}

                    {/* Notifications Tab */}
                    <TabsContent value="notifications" className="space-y-6 mt-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Bell className="size-5" />
                                    Préférences de notifications
                                </CardTitle>
                                <CardDescription>
                                    Choisissez comment vous souhaitez recevoir les notifications
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <Label>Notifications par email</Label>
                                            <p className="text-sm text-muted-foreground">
                                                Recevoir les notifications par email
                                            </p>
                                        </div>
                                        <Switch
                                            checked={notifications.email}
                                            onCheckedChange={(checked) =>
                                                setNotifications({ ...notifications, email: checked })
                                            }
                                        />
                                    </div>
                                    <Separator />
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <Label>Notifications push</Label>
                                            <p className="text-sm text-muted-foreground">
                                                Recevoir les notifications push dans l&apos;application
                                            </p>
                                        </div>
                                        <Switch
                                            checked={notifications.push}
                                            onCheckedChange={(checked) =>
                                                setNotifications({ ...notifications, push: checked })
                                            }
                                        />
                                    </div>
                                    <Separator />
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <Label>Notifications SMS</Label>
                                            <p className="text-sm text-muted-foreground">
                                                Recevoir les notifications par SMS
                                            </p>
                                        </div>
                                        <Switch
                                            checked={notifications.sms}
                                            onCheckedChange={(checked) =>
                                                setNotifications({ ...notifications, sms: checked })
                                            }
                                        />
                                    </div>
                                    <Separator />
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <Label>Notifications de messages</Label>
                                            <p className="text-sm text-muted-foreground">
                                                Recevoir des notifications pour les nouveaux messages
                                            </p>
                                        </div>
                                        <Switch
                                            checked={notifications.messages}
                                            onCheckedChange={(checked) =>
                                                setNotifications({ ...notifications, messages: checked })
                                            }
                                        />
                                    </div>
                                    <Separator />
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <Label>Notifications de préparations</Label>
                                            <p className="text-sm text-muted-foreground">
                                                Recevoir des notifications pour les nouvelles préparations
                                            </p>
                                        </div>
                                        <Switch
                                            checked={notifications.preparations}
                                            onCheckedChange={(checked) =>
                                                setNotifications({ ...notifications, preparations: checked })
                                            }
                                        />
                                    </div>
                                    <Separator />
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <Label>Notifications de documents</Label>
                                            <p className="text-sm text-muted-foreground">
                                                Recevoir des notifications pour les documents
                                            </p>
                                        </div>
                                        <Switch
                                            checked={notifications.documents}
                                            onCheckedChange={(checked) =>
                                                setNotifications({ ...notifications, documents: checked })
                                            }
                                        />
                                    </div>
                                </div>
                                <Button>
                                    <Save className="size-4 mr-2" />
                                    Enregistrer les préférences
                                </Button>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Preferences Tab */}
                    <TabsContent value="preferences" className="space-y-6 mt-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Moon className="size-5" />
                                    Préférences d&apos;affichage
                                </CardTitle>
                                <CardDescription>
                                    Personnalisez l&apos;apparence de l&apos;application
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <Label>Mode sombre</Label>
                                        <p className="text-sm text-muted-foreground">
                                            Activer le mode sombre
                                        </p>
                                    </div>
                                    <Switch
                                        checked={preferences.darkMode}
                                        onCheckedChange={(checked) =>
                                            setPreferences({ ...preferences, darkMode: checked })
                                        }
                                    />
                                </div>
                                <Separator />
                                <div>
                                    <Label>Langue</Label>
                                    <select
                                        className="mt-2 w-full rounded-md border border-input bg-background px-3 py-2"
                                        value={preferences.language}
                                        onChange={(e) =>
                                            setPreferences({ ...preferences, language: e.target.value })
                                        }
                                    >
                                        <option value="fr">Français</option>
                                        <option value="en">English</option>
                                    </select>
                                </div>
                                <Separator />
                                <div>
                                    <Label>Fuseau horaire</Label>
                                    <Input
                                        value={preferences.timezone}
                                        onChange={(e) =>
                                            setPreferences({ ...preferences, timezone: e.target.value })
                                        }
                                        className="mt-2"
                                    />
                                </div>
                                <Button>
                                    <Save className="size-4 mr-2" />
                                    Enregistrer les préférences
                                </Button>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Security Tab */}
                    <TabsContent value="security" className="space-y-6 mt-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Shield className="size-5" />
                                    Sécurité
                                </CardTitle>
                                <CardDescription>
                                    Gérez la sécurité de votre compte
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <Label>Changer le mot de passe</Label>
                                    <div className="mt-2 space-y-3">
                                        <Input type="password" placeholder="Mot de passe actuel" />
                                        <Input type="password" placeholder="Nouveau mot de passe" />
                                        <Input type="password" placeholder="Confirmer le nouveau mot de passe" />
                                    </div>
                                    <Button className="mt-4">
                                        <Key className="size-4 mr-2" />
                                        Changer le mot de passe
                                    </Button>
                                </div>
                                <Separator />
                                <div>
                                    <Label>Sessions actives</Label>
                                    <p className="text-sm text-muted-foreground mt-2">
                                        Gérez vos sessions actives sur différents appareils
                                    </p>
                                    <Button variant="outline" className="mt-4">
                                        Voir les sessions actives
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>

            <FloatingHelpButton />
        </div>
    );
}













