"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { DashboardHeader } from "@/components/layout/dashboard-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import {
  UserPlus,
  User,
  Phone,
  FileText,
  Stethoscope,
  AlertTriangle,
  Upload,
  Camera,
  CheckCircle,
  ArrowLeft,
  ArrowRight,
  Save,
  Loader2,
} from "lucide-react";
import { useCreatePatient, useSpecialtiesQuery, useCreateTicket } from "@/hooks/queries";
import { useCreateUrgency } from "@/hooks/queries/use-urgencies-query";
import type { PatientGender, CreatePatientDto, CreateTicketDto } from "@/types/api";

export default function RegisterPatientPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);

  // TanStack Query mutations
  const createPatientMutation = useCreatePatient();
  const createUrgencyMutation = useCreateUrgency();
  const createTicketMutation = useCreateTicket();
  const { data: specialties = [] } = useSpecialtiesQuery(true);

  const isSubmitting =
    createPatientMutation.isPending ||
    createUrgencyMutation.isPending ||
    createTicketMutation.isPending;

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    dateOfBirth: "",
    gender: "" as PatientGender | "",
    idNumber: "",
    phone: "",
    email: "",
    address: "",
    emergencyContact: "",
    emergencyPhone: "",
    specialty: "",
    urgencyLevel: "3",
    reason: "",
    symptoms: "",
    allergies: "",
    currentMedications: "",
    medicalHistory: "",
  });

  const updateField = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    try {
      // Step 1: Create the patient (backend DTO has no gender; phone fields normalized in createPatient action)
      const patientData: CreatePatientDto = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        dateOfBirth: formData.dateOfBirth,
        idNumber: formData.idNumber,
        phone: formData.phone,
        email: formData.email || undefined,
        address: formData.address || undefined,
        emergencyContactName: formData.emergencyContact || undefined,
        emergencyContactPhone: formData.emergencyPhone || undefined,
      };

      const patient = await createPatientMutation.mutateAsync(patientData);

      // Step 2: Create urgency (backend ticket is created from urgency, not patient)
      const requestedSpecialty =
        specialties.find((s) => s.id === formData.specialty)?.name ?? "Médecine générale";
      const urgency = await createUrgencyMutation.mutateAsync({
        patientId: patient.id,
        reason: formData.reason,
        description: formData.symptoms || undefined,
        urgencyLevel: Number(formData.urgencyLevel) || 3,
        requestedSpecialty,
      });

      // Step 3: Create ticket from the urgency (backend expects urgencyId only)
      const ticket = await createTicketMutation.mutateAsync({
        urgencyId: urgency.id,
      });

      toast.success("Patient enregistré avec succès", {
        description: `Ticket #${ticket.ticketNumber} généré. Le patient apparaît dans la liste des patients.`,
      });

      router.push("/dashboard/secondary/patients");
    } catch (error) {
      // Errors are handled by individual mutations
      console.error("Registration failed:", error);
    }
  };

  const canProceed = () => {
    if (step === 1) {
      return formData.firstName && formData.lastName && formData.dateOfBirth && formData.gender && formData.idNumber;
    }
    if (step === 2) {
      return formData.phone;
    }
    if (step === 3) {
      return formData.specialty && formData.urgencyLevel && formData.reason;
    }
    return true;
  };

  // Use mock specialties as fallback if API fails
  const displaySpecialties = specialties.length > 0 ? specialties : [
    { id: "1", name: "Cardiologie", isActive: true },
    { id: "2", name: "Dermatologie", isActive: true },
    { id: "3", name: "Neurologie", isActive: true },
    { id: "4", name: "Pédiatrie", isActive: true },
    { id: "5", name: "Médecine générale", isActive: true },
    { id: "6", name: "Gynécologie", isActive: true },
    { id: "7", name: "Ophtalmologie", isActive: true },
    { id: "8", name: "ORL", isActive: true },
  ];

  return (
    <div className="flex flex-col h-full">
      <DashboardHeader
        breadcrumbs={[
          { label: "Tableau de bord", href: "/dashboard/secondary" },
          { label: "Nouveau patient" },
        ]}
      />

      <div className="flex-1 p-4 overflow-y-auto">
        <div className="max-w-3xl mx-auto space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-primary flex items-center gap-2">
                <UserPlus className="size-5" />
                Enregistrement patient
              </h1>
              <p className="text-xs text-muted-foreground">
                Créez un nouveau dossier patient et une demande de consultation
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between mb-6">
            {[1, 2, 3, 4].map((s) => (
              <div key={s} className="flex items-center">
                <div
                  className={`size-8 rounded-full flex items-center justify-center text-sm font-medium ${step >= s
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                    }`}
                >
                  {step > s ? <CheckCircle className="size-4" /> : s}
                </div>
                {s < 4 && (
                  <div
                    className={`w-16 md:w-24 h-1 mx-2 ${step > s ? "bg-primary" : "bg-muted"
                      }`}
                  />
                )}
              </div>
            ))}
          </div>

          {step === 1 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <User className="size-4" />
                  Informations personnelles
                </CardTitle>
                <CardDescription>Identité du patient</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="lastName">Nom *</Label>
                    <Input
                      id="lastName"
                      value={formData.lastName}
                      onChange={(e) => updateField("lastName", e.target.value)}
                      placeholder="KAMGA"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="firstName">Prénom *</Label>
                    <Input
                      id="firstName"
                      value={formData.firstName}
                      onChange={(e) => updateField("firstName", e.target.value)}
                      placeholder="Jean"
                      className="mt-1"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="dateOfBirth">Date de naissance *</Label>
                    <Input
                      id="dateOfBirth"
                      type="date"
                      value={formData.dateOfBirth}
                      onChange={(e) => updateField("dateOfBirth", e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>Genre *</Label>
                    <Select
                      value={formData.gender}
                      onValueChange={(v) => updateField("gender", v)}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Sélectionner" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="MALE">Homme</SelectItem>
                        <SelectItem value="FEMALE">Femme</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="idNumber">Numéro CNI / Passeport *</Label>
                  <div className="flex gap-2 mt-1">
                    <Input
                      id="idNumber"
                      value={formData.idNumber}
                      onChange={(e) => updateField("idNumber", e.target.value)}
                      placeholder="123456789"
                      className="flex-1"
                    />
                    <Button variant="outline" size="icon">
                      <Camera className="size-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Scannez ou saisissez le numéro d&apos;identification
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {step === 2 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Phone className="size-4" />
                  Coordonnées
                </CardTitle>
                <CardDescription>Comment contacter le patient</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="phone">Téléphone *</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => updateField("phone", e.target.value)}
                      placeholder="+237 6XX XXX XXX"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => updateField("email", e.target.value)}
                      placeholder="email@exemple.com"
                      className="mt-1"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="address">Adresse</Label>
                  <Textarea
                    id="address"
                    value={formData.address}
                    onChange={(e) => updateField("address", e.target.value)}
                    placeholder="Quartier, ville, région..."
                    className="mt-1"
                    rows={2}
                  />
                </div>

                <div className="border-t pt-4">
                  <h4 className="font-medium text-sm mb-3">Contact d&apos;urgence</h4>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="emergencyContact">Nom du contact</Label>
                      <Input
                        id="emergencyContact"
                        value={formData.emergencyContact}
                        onChange={(e) => updateField("emergencyContact", e.target.value)}
                        placeholder="Nom complet"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="emergencyPhone">Téléphone du contact</Label>
                      <Input
                        id="emergencyPhone"
                        type="tel"
                        value={formData.emergencyPhone}
                        onChange={(e) => updateField("emergencyPhone", e.target.value)}
                        placeholder="+237 6XX XXX XXX"
                        className="mt-1"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {step === 3 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Stethoscope className="size-4" />
                  Demande de consultation
                </CardTitle>
                <CardDescription>Détails de la consultation souhaitée</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label>Spécialité *</Label>
                    <Select
                      value={formData.specialty}
                      onValueChange={(v) => updateField("specialty", v)}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Sélectionner une spécialité" />
                      </SelectTrigger>
                      <SelectContent>
                        {displaySpecialties.map((s) => (
                          <SelectItem key={s.id} value={s.id}>
                            {s.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Niveau d&apos;urgence *</Label>
                    <Select
                      value={formData.urgencyLevel}
                      onValueChange={(v) => updateField("urgencyLevel", v)}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">
                          <div className="flex items-center gap-2">
                            <Badge className="bg-green-500">1</Badge>
                            Non urgent
                          </div>
                        </SelectItem>
                        <SelectItem value="2">
                          <div className="flex items-center gap-2">
                            <Badge className="bg-blue-500">2</Badge>
                            Faible
                          </div>
                        </SelectItem>
                        <SelectItem value="3">
                          <div className="flex items-center gap-2">
                            <Badge className="bg-yellow-500">3</Badge>
                            Modéré
                          </div>
                        </SelectItem>
                        <SelectItem value="4">
                          <div className="flex items-center gap-2">
                            <Badge className="bg-orange-500">4</Badge>
                            Urgent
                          </div>
                        </SelectItem>
                        <SelectItem value="5">
                          <div className="flex items-center gap-2">
                            <Badge className="bg-red-500">5</Badge>
                            Critique
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="reason">Motif de consultation *</Label>
                  <Textarea
                    id="reason"
                    value={formData.reason}
                    onChange={(e) => updateField("reason", e.target.value)}
                    placeholder="Décrivez brièvement le motif de la consultation..."
                    className="mt-1"
                    rows={2}
                  />
                </div>

                <div>
                  <Label htmlFor="symptoms">Symptômes observés</Label>
                  <Textarea
                    id="symptoms"
                    value={formData.symptoms}
                    onChange={(e) => updateField("symptoms", e.target.value)}
                    placeholder="Décrivez les symptômes..."
                    className="mt-1"
                    rows={3}
                  />
                </div>

                <div>
                  <Label className="flex items-center gap-2">
                    <Upload className="size-4" />
                    Documents (optionnel)
                  </Label>
                  <div className="mt-1 border-2 border-dashed rounded-lg p-6 text-center">
                    <Upload className="size-8 mx-auto text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">
                      Glissez des fichiers ici ou cliquez pour télécharger
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      PDF, images (max 10MB)
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {step === 4 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <FileText className="size-4" />
                  Antécédents médicaux
                </CardTitle>
                <CardDescription>Informations médicales importantes</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="allergies" className="flex items-center gap-2">
                    <AlertTriangle className="size-4 text-red-500" />
                    Allergies connues
                  </Label>
                  <Textarea
                    id="allergies"
                    value={formData.allergies}
                    onChange={(e) => updateField("allergies", e.target.value)}
                    placeholder="Listez les allergies connues (séparées par des virgules)..."
                    className="mt-1"
                    rows={2}
                  />
                </div>

                <div>
                  <Label htmlFor="currentMedications">Traitements en cours</Label>
                  <Textarea
                    id="currentMedications"
                    value={formData.currentMedications}
                    onChange={(e) => updateField("currentMedications", e.target.value)}
                    placeholder="Médicaments actuellement pris..."
                    className="mt-1"
                    rows={2}
                  />
                </div>

                <div>
                  <Label htmlFor="medicalHistory">Antécédents médicaux</Label>
                  <Textarea
                    id="medicalHistory"
                    value={formData.medicalHistory}
                    onChange={(e) => updateField("medicalHistory", e.target.value)}
                    placeholder="Maladies chroniques, opérations, hospitalisations (séparées par des virgules)..."
                    className="mt-1"
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>
          )}

          <div className="flex items-center justify-between pt-4">
            <Button
              variant="outline"
              onClick={() => setStep(step - 1)}
              disabled={step === 1 || isSubmitting}
            >
              <ArrowLeft className="size-4 mr-1.5" />
              Précédent
            </Button>

            {step < 4 ? (
              <Button onClick={() => setStep(step + 1)} disabled={!canProceed()}>
                Suivant
                <ArrowRight className="size-4 ml-1.5" />
              </Button>
            ) : (
              <Button onClick={handleSubmit} disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="size-4 mr-1.5 animate-spin" />
                    Enregistrement...
                  </>
                ) : (
                  <>
                    <Save className="size-4 mr-1.5" />
                    Enregistrer et créer ticket
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
