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
    Calendar,
    Video,
    Mail,
    Phone,
    Eye,
    EyeOff,
    Save,
    Upload,
    Download,
    Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { updateProfile } from "@/actions/auth";
import { useAuthStore } from "@/stores/auth-store";

export default function SettingsPage() {
    const user = useAuthStore((s) => s.user);

    // Profile settings
    const [fullName, setFullName] = useState(user?.name || "Dr. Nana Pierre");
    const [specialty, setSpecialty] = useState("Médecin Généraliste");
    const [licenseNumber, setLicenseNumber] = useState("CM-DOC-2024-001");
    const [email, setEmail] = useState(user?.email || "dr.nana@eagle.cm");
    const [phone, setPhone] = useState(user?.phone || "+237 6 XX XX XX XX");
    const [bio, setBio] = useState("Médecin généraliste avec 15 ans d&apos;expérience en télémédecine et soins primaires.");

    // Notification settings
    const [emailNotifications, setEmailNotifications] = useState(true);
    const [smsNotifications, setSmsNotifications] = useState(true);
    const [urgentAlerts, setUrgentAlerts] = useState(true);
    const [appointmentReminders, setAppointmentReminders] = useState(true);
    const [labResultsAlerts, setLabResultsAlerts] = useState(true);
    const [newMessageAlerts, setNewMessageAlerts] = useState(true);

    // Schedule settings
    const [consultationDuration, setConsultationDuration] = useState("30");
    const [breakDuration, setBreakDuration] = useState("15");
    const [maxPatientsPerDay, setMaxPatientsPerDay] = useState("20");

    // Consultation settings
    const [videoQuality, setVideoQuality] = useState("hd");
    const [autoRecord, setAutoRecord] = useState(false);
    const [showPatientHistory, setShowPatientHistory] = useState(true);
    const [requirePreparation, setRequirePreparation] = useState(true);

    // Security settings
    const [twoFactorAuth, setTwoFactorAuth] = useState(false);
    const [sessionTimeout, setSessionTimeout] = useState("30");
    const [showPassword, setShowPassword] = useState(false);

    // Language & Region
    const [language, setLanguage] = useState("fr");
    const [timezone, setTimezone] = useState("Africa/Douala");
    const [dateFormat, setDateFormat] = useState("DD/MM/YYYY");
    const [timeFormat, setTimeFormat] = useState("24h");

    const handleSaveProfile = async () => {
        try {
            await updateProfile({
                name: fullName,
                phone,
            });
            toast.success("Profil mis à jour avec succès!");
        } catch (error) {
            toast.error("Erreur lors de la mise à jour du profil");
        }
    };

    const handleSaveNotifications = () => {
        toast.success("Préférences de notification enregistrées!");
    };

    const handleSaveSchedule = () => {
        toast.success("Paramètres d&apos;horaire sauvegardés!");
    };

    const handleSaveSecurity = () => {
        toast.success("Paramètres de sécurité mis à jour!");
    };

    return (
        <div className="flex flex-col h-full">
            <DashboardHeader
                breadcrumbs={[
                    { label: "Tableau de bord", href: "/dashboard/doctor" },
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
                    <TabsList className="grid w-full grid-cols-6 max-w-3xl">
                        <TabsTrigger value="profile" className="gap-2">
                            <User className="size-4" />
                            Profil
                        </TabsTrigger>
                        <TabsTrigger value="notifications" className="gap-2">
                            <Bell className="size-4" />
                            Notifications
                        </TabsTrigger>
                        <TabsTrigger value="schedule" className="gap-2">
                            <Calendar className="size-4" />
                            Horaires
                        </TabsTrigger>
                        <TabsTrigger value="consultation" className="gap-2">
                            <Video className="size-4" />
                            Consultation
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
                                    Informations Personnelles
                                </CardTitle>
                                <CardDescription>
                                    Gérer vos informations de profil professionnel
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {/* Avatar Section */}
                                <div className="flex items-center gap-6">
                                    <Avatar className="size-24">
                                        <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                                            NP
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="space-y-2">
                                        <Button className="gap-2">
                                            <Upload className="size-4" />
                                            Changer la photo
                                        </Button>
                                        <p className="text-xs text-muted-foreground">
                                            JPG, PNG ou GIF. Max 2MB.
                                        </p>
                                    </div>
                                </div>

                                {/* Form Fields */}
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="fullName">Nom complet *</Label>
                                        <Input
                                            id="fullName"
                                            value={fullName}
                                            onChange={(e) => setFullName(e.target.value)}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="specialty">Spécialité *</Label>
                                        <Select value={specialty} onValueChange={setSpecialty}>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Médecin Généraliste">Médecin Généraliste</SelectItem>
                                                <SelectItem value="Cardiologue">Cardiologue</SelectItem>
                                                <SelectItem value="Pédiatre">Pédiatre</SelectItem>
                                                <SelectItem value="Dermatologue">Dermatologue</SelectItem>
                                                <SelectItem value="Autre">Autre</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="license">Numéro de licence *</Label>
                                        <Input
                                            id="license"
                                            value={licenseNumber}
                                            onChange={(e) => setLicenseNumber(e.target.value)}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="email">Email professionnel *</Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="phone">Téléphone *</Label>
                                        <Input
                                            id="phone"
                                            value={phone}
                                            onChange={(e) => setPhone(e.target.value)}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="center">Centre médical</Label>
                                        <Input
                                            id="center"
                                            defaultValue="Centre Principal - Yaoundé"
                                            disabled
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="bio">Biographie professionnelle</Label>
                                    <Textarea
                                        id="bio"
                                        value={bio}
                                        onChange={(e) => setBio(e.target.value)}
                                        rows={4}
                                        placeholder="Décrivez votre expérience et expertise..."
                                    />
                                </div>

                                <div className="flex gap-3">
                                    <Button onClick={handleSaveProfile} className="gap-2">
                                        <Save className="size-4" />
                                        Enregistrer les modifications
                                    </Button>
                                    <Button variant="outline">
                                        Annuler
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
                                    Préférences de Notification
                                </CardTitle>
                                <CardDescription>
                                    Choisissez comment vous souhaitez être notifié
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {/* Notification Channels */}
                                <div className="space-y-4">
                                    <h3 className="font-semibold">Canaux de notification</h3>
                                    
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <Mail className="size-5 text-muted-foreground" />
                                            <div>
                                                <p className="font-medium">Notifications par email</p>
                                                <p className="text-sm text-muted-foreground">
                                                    Recevoir des notifications par email
                                                </p>
                                            </div>
                                        </div>
                                        <Switch
                                            checked={emailNotifications}
                                            onCheckedChange={setEmailNotifications}
                                        />
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <Phone className="size-5 text-muted-foreground" />
                                            <div>
                                                <p className="font-medium">Notifications SMS</p>
                                                <p className="text-sm text-muted-foreground">
                                                    Recevoir des alertes par SMS
                                                </p>
                                            </div>
                                        </div>
                                        <Switch
                                            checked={smsNotifications}
                                            onCheckedChange={setSmsNotifications}
                                        />
                                    </div>
                                </div>

                                <div className="border-t pt-4 space-y-4">
                                    <h3 className="font-semibold">Types de notifications</h3>

                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="font-medium">Alertes d&apos;urgence</p>
                                            <p className="text-sm text-muted-foreground">
                                                Patients urgents nécessitant une attention immédiate
                                            </p>
                                        </div>
                                        <Switch
                                            checked={urgentAlerts}
                                            onCheckedChange={setUrgentAlerts}
                                        />
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="font-medium">Rappels de rendez-vous</p>
                                            <p className="text-sm text-muted-foreground">
                                                Notifications avant les consultations programmées
                                            </p>
                                        </div>
                                        <Switch
                                            checked={appointmentReminders}
                                            onCheckedChange={setAppointmentReminders}
                                        />
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="font-medium">Résultats d&apos;analyses</p>
                                            <p className="text-sm text-muted-foreground">
                                                Alertes quand les résultats de laboratoire sont disponibles
                                            </p>
                                        </div>
                                        <Switch
                                            checked={labResultsAlerts}
                                            onCheckedChange={setLabResultsAlerts}
                                        />
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="font-medium">Nouveaux messages</p>
                                            <p className="text-sm text-muted-foreground">
                                                Notifications pour les messages internes
                                            </p>
                                        </div>
                                        <Switch
                                            checked={newMessageAlerts}
                                            onCheckedChange={setNewMessageAlerts}
                                        />
                                    </div>
                                </div>

                                <div className="flex gap-3 pt-4">
                                    <Button onClick={handleSaveNotifications} className="gap-2">
                                        <Save className="size-4" />
                                        Enregistrer les préférences
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Schedule Tab */}
                    <TabsContent value="schedule" className="space-y-6 mt-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Calendar className="size-5" />
                                    Configuration des Horaires
                                </CardTitle>
                                <CardDescription>
                                    Définir vos heures de travail et disponibilités
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="grid md:grid-cols-3 gap-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="consultDuration">Durée consultation (min)</Label>
                                        <Select value={consultationDuration} onValueChange={setConsultationDuration}>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="15">15 minutes</SelectItem>
                                                <SelectItem value="30">30 minutes</SelectItem>
                                                <SelectItem value="45">45 minutes</SelectItem>
                                                <SelectItem value="60">60 minutes</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="breakDuration">Durée pause (min)</Label>
                                        <Select value={breakDuration} onValueChange={setBreakDuration}>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="5">5 minutes</SelectItem>
                                                <SelectItem value="10">10 minutes</SelectItem>
                                                <SelectItem value="15">15 minutes</SelectItem>
                                                <SelectItem value="30">30 minutes</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="maxPatients">Max patients/jour</Label>
                                        <Input
                                            id="maxPatients"
                                            type="number"
                                            value={maxPatientsPerDay}
                                            onChange={(e) => setMaxPatientsPerDay(e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <Label>Heures de travail</Label>
                                    <div className="grid md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="startTime">Heure début</Label>
                                            <Input id="startTime" type="time" defaultValue="08:00" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="endTime">Heure fin</Label>
                                            <Input id="endTime" type="time" defaultValue="17:00" />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label>Pause déjeuner</Label>
                                    <div className="grid md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="lunchStart">Début</Label>
                                            <Input id="lunchStart" type="time" defaultValue="12:00" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="lunchEnd">Fin</Label>
                                            <Input id="lunchEnd" type="time" defaultValue="14:00" />
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-3 pt-4">
                                    <Button onClick={handleSaveSchedule} className="gap-2">
                                        <Save className="size-4" />
                                        Enregistrer l&apos;horaire
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Consultation Tab */}
                    <TabsContent value="consultation" className="space-y-6 mt-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Video className="size-5" />
                                    Paramètres de Consultation
                                </CardTitle>
                                <CardDescription>
                                    Configuration de l&apos;interface de consultation
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label>Qualité vidéo</Label>
                                        <Select value={videoQuality} onValueChange={setVideoQuality}>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="sd">SD (Standard Definition)</SelectItem>
                                                <SelectItem value="hd">HD (High Definition)</SelectItem>
                                                <SelectItem value="fhd">Full HD</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="font-medium">Enregistrement automatique</p>
                                            <p className="text-sm text-muted-foreground">
                                                Enregistrer automatiquement toutes les consultations
                                            </p>
                                        </div>
                                        <Switch
                                            checked={autoRecord}
                                            onCheckedChange={setAutoRecord}
                                        />
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="font-medium">Afficher l&apos;historique patient</p>
                                            <p className="text-sm text-muted-foreground">
                                                Afficher automatiquement l&apos;historique médical
                                            </p>
                                        </div>
                                        <Switch
                                            checked={showPatientHistory}
                                            onCheckedChange={setShowPatientHistory}
                                        />
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="font-medium">Préparation obligatoire</p>
                                            <p className="text-sm text-muted-foreground">
                                                Exiger la préparation par l&apos;infirmière
                                            </p>
                                        </div>
                                        <Switch
                                            checked={requirePreparation}
                                            onCheckedChange={setRequirePreparation}
                                        />
                                    </div>
                                </div>

                                <div className="flex gap-3 pt-4">
                                    <Button className="gap-2">
                                        <Save className="size-4" />
                                        Enregistrer les paramètres
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
                                    Sécurité et Confidentialité
                                </CardTitle>
                                <CardDescription>
                                    Gérer la sécurité de votre compte
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {/* Password Change */}
                                <div className="space-y-4">
                                    <h3 className="font-semibold">Changer le mot de passe</h3>
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="currentPassword">Mot de passe actuel</Label>
                                            <div className="relative">
                                                <Input
                                                    id="currentPassword"
                                                    type={showPassword ? "text" : "password"}
                                                />
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="absolute right-0 top-0 h-full px-3"
                                                    onClick={() => setShowPassword(!showPassword)}
                                                >
                                                    {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                                                </Button>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="newPassword">Nouveau mot de passe</Label>
                                            <Input
                                                id="newPassword"
                                                type="password"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
                                            <Input
                                                id="confirmPassword"
                                                type="password"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Two-Factor Auth */}
                                <div className="border-t pt-6 space-y-4">
                                    <h3 className="font-semibold">Authentification à deux facteurs</h3>
                                    
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="font-medium">Activer 2FA</p>
                                            <p className="text-sm text-muted-foreground">
                                                Ajouter une couche de sécurité supplémentaire
                                            </p>
                                        </div>
                                        <Switch
                                            checked={twoFactorAuth}
                                            onCheckedChange={setTwoFactorAuth}
                                        />
                                    </div>
                                </div>

                                {/* Session Settings */}
                                <div className="border-t pt-6 space-y-4">
                                    <h3 className="font-semibold">Paramètres de session</h3>
                                    
                                    <div className="space-y-2">
                                        <Label>Délai d&apos;expiration (minutes)</Label>
                                        <Select value={sessionTimeout} onValueChange={setSessionTimeout}>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="15">15 minutes</SelectItem>
                                                <SelectItem value="30">30 minutes</SelectItem>
                                                <SelectItem value="60">1 heure</SelectItem>
                                                <SelectItem value="120">2 heures</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="flex gap-3 pt-4">
                                    <Button onClick={handleSaveSecurity} className="gap-2">
                                        <Save className="size-4" />
                                        Enregistrer les paramètres
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
                                    Préférences Régionales
                                </CardTitle>
                                <CardDescription>
                                    Langue, fuseau horaire et formats
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label>Langue</Label>
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
                                        <Label>Fuseau horaire</Label>
                                        <Select value={timezone} onValueChange={setTimezone}>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Africa/Douala">Afrique/Douala (GMT+1)</SelectItem>
                                                <SelectItem value="Africa/Yaounde">Afrique/Yaoundé (GMT+1)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Format de date</Label>
                                        <Select value={dateFormat} onValueChange={setDateFormat}>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="DD/MM/YYYY">JJ/MM/AAAA</SelectItem>
                                                <SelectItem value="MM/DD/YYYY">MM/JJ/AAAA</SelectItem>
                                                <SelectItem value="YYYY-MM-DD">AAAA-MM-JJ</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Format d&apos;heure</Label>
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

                                <div className="flex gap-3 pt-4">
                                    <Button className="gap-2">
                                        <Save className="size-4" />
                                        Enregistrer les préférences
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Data Management */}
                        <Card className="border-red-200">
                            <CardHeader>
                                <CardTitle className="text-red-600">Zone Dangereuse</CardTitle>
                                <CardDescription>
                                    Actions irréversibles sur votre compte
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center justify-between p-4 border rounded-lg">
                                    <div>
                                        <p className="font-medium">Exporter mes données</p>
                                        <p className="text-sm text-muted-foreground">
                                            Télécharger toutes vos données personnelles
                                        </p>
                                    </div>
                                    <Button variant="outline" className="gap-2">
                                        <Download className="size-4" />
                                        Exporter
                                    </Button>
                                </div>

                                <div className="flex items-center justify-between p-4 border border-red-200 rounded-lg">
                                    <div>
                                        <p className="font-medium text-red-600">Supprimer mon compte</p>
                                        <p className="text-sm text-muted-foreground">
                                            Supprimer définitivement votre compte
                                        </p>
                                    </div>
                                    <Button variant="destructive" className="gap-2">
                                        <Trash2 className="size-4" />
                                        Supprimer
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


