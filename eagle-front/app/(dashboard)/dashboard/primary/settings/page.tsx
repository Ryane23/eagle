"use client";

import { useState } from "react";
import { DashboardHeader } from "@/components/layout/dashboard-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
    Settings,
    User,
    Bell,
    Shield,
    Globe,
    Eye,
    EyeOff,
    Save,
    Upload,
    Network,
} from "lucide-react";
import { toast } from "sonner";
import { updateProfile } from "@/actions/auth";
import { useAuthStore } from "@/stores/auth-store";

export default function SettingsPage() {
    const user = useAuthStore((s) => s.user);
    const setUser = useAuthStore((s) => s.setUser);

    // Profile settings
    const [fullName, setFullName] = useState(user?.name ?? "Marie Kouam");
    const [position, setPosition] = useState("Secrétaire Principal");
    const [employeeId, setEmployeeId] = useState("EAGLE-SEC-2024-001");
    const [email, setEmail] = useState(user?.email ?? "marie.kouam@eagle.cm");
    const [phone, setPhone] = useState(user?.phone ?? "+237 6 XX XX XX XX");
    const [bio, setBio] = useState("Secrétaire principal avec 10 ans d&apos;expérience dans la gestion de réseau de santé.");

    // Notification settings
    const [emailNotifications, setEmailNotifications] = useState(true);
    const [smsNotifications, setSmsNotifications] = useState(true);
    const [urgentAlerts, setUrgentAlerts] = useState(true);
    const [centerAlerts, setCenterAlerts] = useState(true);
    const [validationRequests, setValidationRequests] = useState(true);
    const [scheduleChanges, setScheduleChanges] = useState(true);
    const [networkUpdates, setNetworkUpdates] = useState(true);

    // Network settings
    const [autoRefresh, setAutoRefresh] = useState(true);
    const [refreshInterval, setRefreshInterval] = useState("30");
    const [showOfflineCenters, setShowOfflineCenters] = useState(true);
    const [alertThreshold, setAlertThreshold] = useState("10");

    // Security settings
    const [twoFactorAuth, setTwoFactorAuth] = useState(false);
    const [sessionTimeout, setSessionTimeout] = useState("30");
    const [showPassword, setShowPassword] = useState(false);
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    // Language & Region
    const [language, setLanguage] = useState("fr");
    const [timezone, setTimezone] = useState("Africa/Douala");
    const [dateFormat, setDateFormat] = useState("DD/MM/YYYY");
    const [timeFormat, setTimeFormat] = useState("24h");

    const handleSaveProfile = async () => {
        try {
            const updated = await updateProfile({ name: fullName, phone: phone || undefined });
            setUser(updated);
            toast.success("Profil mis à jour avec succès!");
        } catch (error) {
            toast.error("Erreur lors de la mise à jour du profil");
        }
    };

    const handleSaveNotifications = () => {
        toast.success("Préférences de notification enregistrées!");
    };

    const handleSaveNetwork = () => {
        toast.success("Paramètres réseau sauvegardés!");
    };

    const handleSaveSecurity = () => {
        if (newPassword && newPassword !== confirmPassword) {
            toast.error("Les mots de passe ne correspondent pas!");
            return;
        }
        toast.success("Paramètres de sécurité mis à jour!");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
    };

    const handleSavePreferences = () => {
        toast.success("Préférences enregistrées!");
    };

    return (
        <div className="flex flex-col h-full">
            <DashboardHeader
                breadcrumbs={[
                    { label: "Tableau de bord", href: "/dashboard/primary" },
                    { label: "Paramètres" }
                ]}
            />

            <div className="flex-1 p-6 space-y-6 overflow-y-auto">
                {/* Page Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-primary flex items-center gap-2">
                            <Settings className="size-7 text-slate-600" />
                            Paramètres
                        </h1>
                        <p className="text-muted-foreground">
                            Gérer vos préférences et paramètres du compte
                        </p>
                    </div>
                </div>

                <Tabs defaultValue="profile" className="w-full">
                    <TabsList className="grid w-full grid-cols-5 max-w-3xl">
                        <TabsTrigger value="profile" className="gap-2">
                            <User className="size-4" />
                            Profil
                        </TabsTrigger>
                        <TabsTrigger value="notifications" className="gap-2">
                            <Bell className="size-4" />
                            Notifications
                        </TabsTrigger>
                        <TabsTrigger value="network" className="gap-2">
                            <Network className="size-4" />
                            Réseau
                        </TabsTrigger>
                        <TabsTrigger value="security" className="gap-2">
                            <Shield className="size-4" />
                            Sécurité
                        </TabsTrigger>
                        <TabsTrigger value="preferences" className="gap-2">
                            <Globe className="size-4" />
                            Préférences
                        </TabsTrigger>
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
                                            MK
                                        </AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <Button variant="outline" size="sm" className="mb-2">
                                            <Upload className="size-4 mr-2" />
                                            Changer la photo
                                        </Button>
                                        <p className="text-xs text-muted-foreground">
                                            JPG, PNG ou GIF. Max 2MB
                                        </p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="fullName">Nom complet</Label>
                                        <Input
                                            id="fullName"
                                            value={fullName}
                                            onChange={(e) => setFullName(e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="position">Poste</Label>
                                        <Input
                                            id="position"
                                            value={position}
                                            onChange={(e) => setPosition(e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="employeeId">ID Employé</Label>
                                        <Input
                                            id="employeeId"
                                            value={employeeId}
                                            onChange={(e) => setEmployeeId(e.target.value)}
                                            disabled
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="email">Email</Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="phone">Téléphone</Label>
                                        <Input
                                            id="phone"
                                            type="tel"
                                            value={phone}
                                            onChange={(e) => setPhone(e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="bio">Biographie</Label>
                                    <Textarea
                                        id="bio"
                                        value={bio}
                                        onChange={(e) => setBio(e.target.value)}
                                        rows={4}
                                    />
                                </div>

                                <div className="flex justify-end">
                                    <Button onClick={handleSaveProfile}>
                                        <Save className="size-4 mr-2" />
                                        Enregistrer les modifications
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Notifications Tab */}
                    <TabsContent value="notifications" className="space-y-6 mt-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Bell className="size-5" />
                                    Préférences de notification
                                </CardTitle>
                                <CardDescription>
                                    Configurez comment et quand vous recevez des notifications
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-0.5">
                                            <Label>Notifications par email</Label>
                                            <p className="text-sm text-muted-foreground">
                                                Recevoir des notifications importantes par email
                                            </p>
                                        </div>
                                        <Switch
                                            checked={emailNotifications}
                                            onCheckedChange={setEmailNotifications}
                                        />
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div className="space-y-0.5">
                                            <Label>Notifications SMS</Label>
                                            <p className="text-sm text-muted-foreground">
                                                Recevoir des alertes urgentes par SMS
                                            </p>
                                        </div>
                                        <Switch
                                            checked={smsNotifications}
                                            onCheckedChange={setSmsNotifications}
                                        />
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div className="space-y-0.5">
                                            <Label>Alertes urgentes</Label>
                                            <p className="text-sm text-muted-foreground">
                                                Notifications pour les urgences critiques
                                            </p>
                                        </div>
                                        <Switch
                                            checked={urgentAlerts}
                                            onCheckedChange={setUrgentAlerts}
                                        />
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div className="space-y-0.5">
                                            <Label>Alertes des centres</Label>
                                            <p className="text-sm text-muted-foreground">
                                                Notifications sur le statut des centres
                                            </p>
                                        </div>
                                        <Switch
                                            checked={centerAlerts}
                                            onCheckedChange={setCenterAlerts}
                                        />
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div className="space-y-0.5">
                                            <Label>Demandes de validation</Label>
                                            <p className="text-sm text-muted-foreground">
                                                Notifications pour les nouvelles demandes de validation
                                            </p>
                                        </div>
                                        <Switch
                                            checked={validationRequests}
                                            onCheckedChange={setValidationRequests}
                                        />
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div className="space-y-0.5">
                                            <Label>Changements de planning</Label>
                                            <p className="text-sm text-muted-foreground">
                                                Notifications sur les modifications de planning
                                            </p>
                                        </div>
                                        <Switch
                                            checked={scheduleChanges}
                                            onCheckedChange={setScheduleChanges}
                                        />
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div className="space-y-0.5">
                                            <Label>Mises à jour réseau</Label>
                                            <p className="text-sm text-muted-foreground">
                                                Notifications sur les changements du réseau
                                            </p>
                                        </div>
                                        <Switch
                                            checked={networkUpdates}
                                            onCheckedChange={setNetworkUpdates}
                                        />
                                    </div>
                                </div>

                                <div className="flex justify-end">
                                    <Button onClick={handleSaveNotifications}>
                                        <Save className="size-4 mr-2" />
                                        Enregistrer
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Network Tab */}
                    <TabsContent value="network" className="space-y-6 mt-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Network className="size-5" />
                                    Paramètres réseau
                                </CardTitle>
                                <CardDescription>
                                    Configurez les paramètres de suivi du réseau
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-0.5">
                                            <Label>Actualisation automatique</Label>
                                            <p className="text-sm text-muted-foreground">
                                                Actualiser automatiquement les données du réseau
                                            </p>
                                        </div>
                                        <Switch
                                            checked={autoRefresh}
                                            onCheckedChange={setAutoRefresh}
                                        />
                                    </div>

                                    {autoRefresh && (
                                        <div className="space-y-2">
                                            <Label htmlFor="refreshInterval">Intervalle d&apos;actualisation (secondes)</Label>
                                            <Select value={refreshInterval} onValueChange={setRefreshInterval}>
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="15">15 secondes</SelectItem>
                                                    <SelectItem value="30">30 secondes</SelectItem>
                                                    <SelectItem value="60">1 minute</SelectItem>
                                                    <SelectItem value="120">2 minutes</SelectItem>
                                                    <SelectItem value="300">5 minutes</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    )}

                                    <div className="flex items-center justify-between">
                                        <div className="space-y-0.5">
                                            <Label>Afficher les centres hors ligne</Label>
                                            <p className="text-sm text-muted-foreground">
                                                Inclure les centres hors ligne dans les listes
                                            </p>
                                        </div>
                                        <Switch
                                            checked={showOfflineCenters}
                                            onCheckedChange={setShowOfflineCenters}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="alertThreshold">Seuil d&apos;alerte (patients en attente)</Label>
                                        <Input
                                            id="alertThreshold"
                                            type="number"
                                            value={alertThreshold}
                                            onChange={(e) => setAlertThreshold(e.target.value)}
                                        />
                                        <p className="text-xs text-muted-foreground">
                                            Nombre de patients en attente avant déclenchement d&apos;une alerte
                                        </p>
                                    </div>
                                </div>

                                <div className="flex justify-end">
                                    <Button onClick={handleSaveNetwork}>
                                        <Save className="size-4 mr-2" />
                                        Enregistrer
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Security Tab */}
                    <TabsContent value="security" className="space-y-6 mt-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Shield className="size-5" />
                                    Sécurité et authentification
                                </CardTitle>
                                <CardDescription>
                                    Gérez votre mot de passe et les paramètres de sécurité
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-0.5">
                                            <Label>Authentification à deux facteurs</Label>
                                            <p className="text-sm text-muted-foreground">
                                                Ajouter une couche de sécurité supplémentaire
                                            </p>
                                        </div>
                                        <Switch
                                            checked={twoFactorAuth}
                                            onCheckedChange={setTwoFactorAuth}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="sessionTimeout">Délai d&apos;expiration de session (minutes)</Label>
                                        <Select value={sessionTimeout} onValueChange={setSessionTimeout}>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="15">15 minutes</SelectItem>
                                                <SelectItem value="30">30 minutes</SelectItem>
                                                <SelectItem value="60">1 heure</SelectItem>
                                                <SelectItem value="120">2 heures</SelectItem>
                                                <SelectItem value="240">4 heures</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="pt-4 border-t space-y-4">
                                        <h3 className="font-semibold">Changer le mot de passe</h3>
                                        
                                        <div className="space-y-2">
                                            <Label htmlFor="currentPassword">Mot de passe actuel</Label>
                                            <div className="relative">
                                                <Input
                                                    id="currentPassword"
                                                    type={showPassword ? "text" : "password"}
                                                    value={currentPassword}
                                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                                />
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    className="absolute right-0 top-0 h-full"
                                                    onClick={() => setShowPassword(!showPassword)}
                                                >
                                                    {showPassword ? (
                                                        <EyeOff className="size-4" />
                                                    ) : (
                                                        <Eye className="size-4" />
                                                    )}
                                                </Button>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="newPassword">Nouveau mot de passe</Label>
                                            <Input
                                                id="newPassword"
                                                type={showPassword ? "text" : "password"}
                                                value={newPassword}
                                                onChange={(e) => setNewPassword(e.target.value)}
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
                                            <Input
                                                id="confirmPassword"
                                                type={showPassword ? "text" : "password"}
                                                value={confirmPassword}
                                                onChange={(e) => setConfirmPassword(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="flex justify-end">
                                    <Button onClick={handleSaveSecurity}>
                                        <Save className="size-4 mr-2" />
                                        Enregistrer
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Preferences Tab */}
                    <TabsContent value="preferences" className="space-y-6 mt-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Globe className="size-5" />
                                    Langue et région
                                </CardTitle>
                                <CardDescription>
                                    Personnalisez votre langue et vos préférences régionales
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="language">Langue</Label>
                                        <Select value={language} onValueChange={setLanguage}>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="fr">Français</SelectItem>
                                                <SelectItem value="en">English</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="timezone">Fuseau horaire</Label>
                                        <Select value={timezone} onValueChange={setTimezone}>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Africa/Douala">Africa/Douala (GMT+1)</SelectItem>
                                                <SelectItem value="Africa/Yaounde">Africa/Yaounde (GMT+1)</SelectItem>
                                                <SelectItem value="UTC">UTC (GMT+0)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="dateFormat">Format de date</Label>
                                        <Select value={dateFormat} onValueChange={setDateFormat}>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                                                <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                                                <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="timeFormat">Format d&apos;heure</Label>
                                        <Select value={timeFormat} onValueChange={setTimeFormat}>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="24h">24 heures</SelectItem>
                                                <SelectItem value="12h">12 heures (AM/PM)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="flex justify-end">
                                    <Button onClick={handleSavePreferences}>
                                        <Save className="size-4 mr-2" />
                                        Enregistrer
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}

