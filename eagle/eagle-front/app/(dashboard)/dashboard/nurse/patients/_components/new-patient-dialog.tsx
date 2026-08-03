"use client";

import { memo, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Specialty } from "@/types/api";
import type { NewPatientFormData } from "@/types/nurse";
import { INITIAL_PATIENT_FORM_DATA } from "@/types/nurse";
import { AlertCircle } from "lucide-react";

interface NewPatientDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  formData: NewPatientFormData;
  specialties: Specialty[];
  isSubmitting?: boolean;
  errorMessage?: string | null;
  onFormChange: (data: NewPatientFormData) => void;
  onSubmit: () => void;
}

export const NewPatientDialog = memo(function NewPatientDialog({
  open,
  onOpenChange,
  formData,
  specialties,
  isSubmitting = false,
  errorMessage,
  onFormChange,
  onSubmit,
}: NewPatientDialogProps) {
  const change = useCallback(
    (field: keyof NewPatientFormData, value: string) => {
      onFormChange({ ...formData, [field]: value });
    },
    [formData, onFormChange],
  );

  const handleCancel = useCallback(() => {
    onOpenChange(false);
    onFormChange(INITIAL_PATIENT_FORM_DATA);
  }, [onOpenChange, onFormChange]);

  const canSubmit =
    formData.firstName.trim() &&
    formData.lastName.trim() &&
    formData.dateOfBirth &&
    formData.gender &&
    formData.idNumber.trim() &&
    formData.phone.trim();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Enregistrer un patient</DialogTitle>
          <DialogDescription>
            Créez le dossier administratif. L&apos;arrivée sera confirmée depuis la
            Salle d&apos;attente avant la préparation.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="identity" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="identity">Patient</TabsTrigger>
            <TabsTrigger value="background">Antécédents</TabsTrigger>
            <TabsTrigger value="visit">Arrivée</TabsTrigger>
          </TabsList>

          <TabsContent value="identity" className="mt-4 space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="patient-first-name">Prénom *</Label>
                <Input
                  id="patient-first-name"
                  value={formData.firstName}
                  onChange={(event) => change("firstName", event.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="patient-last-name">Nom *</Label>
                <Input
                  id="patient-last-name"
                  value={formData.lastName}
                  onChange={(event) => change("lastName", event.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="patient-birth-date">Date de naissance *</Label>
                <Input
                  id="patient-birth-date"
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(event) => change("dateOfBirth", event.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Sexe *</Label>
                <Select
                  value={formData.gender}
                  onValueChange={(value) => change("gender", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MALE">Homme</SelectItem>
                    <SelectItem value="FEMALE">Femme</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Situation matrimoniale</Label>
                <Select
                  value={formData.maritalStatus}
                  onValueChange={(value) => change("maritalStatus", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SINGLE">Célibataire</SelectItem>
                    <SelectItem value="MARRIED">Marié(e)</SelectItem>
                    <SelectItem value="DIVORCED">Divorcé(e)</SelectItem>
                    <SelectItem value="WIDOWED">Veuf / Veuve</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="patient-id-number">CNI / Identifiant *</Label>
                <Input
                  id="patient-id-number"
                  value={formData.idNumber}
                  onChange={(event) => change("idNumber", event.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="patient-phone">Téléphone *</Label>
                <Input
                  id="patient-phone"
                  value={formData.phone}
                  onChange={(event) => change("phone", event.target.value)}
                  placeholder="+237 6XX XXX XXX"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="patient-email">Email</Label>
                <Input
                  id="patient-email"
                  type="email"
                  value={formData.email}
                  onChange={(event) => change("email", event.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="patient-address">Adresse</Label>
              <Input
                id="patient-address"
                value={formData.address}
                onChange={(event) => change("address", event.target.value)}
              />
            </div>
          </TabsContent>

          <TabsContent value="background" className="mt-4 space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Diabétique</Label>
                <Select
                  value={formData.diabetic}
                  onValueChange={(value) => change("diabetic", value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="no">Non</SelectItem>
                    <SelectItem value="yes">Oui</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Allergies médicamenteuses</Label>
                <Select
                  value={formData.hasDrugAllergies}
                  onValueChange={(value) => change("hasDrugAllergies", value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="no">Non</SelectItem>
                    <SelectItem value="yes">Oui</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            {formData.hasDrugAllergies === "yes" && (
              <div className="space-y-2">
                <Label htmlFor="patient-allergies">Détails des allergies *</Label>
                <Textarea
                  id="patient-allergies"
                  value={formData.allergyDetails}
                  onChange={(event) =>
                    change("allergyDetails", event.target.value)
                  }
                  rows={3}
                />
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="patient-chronic-conditions">
                Maladies chroniques existantes
              </Label>
              <Textarea
                id="patient-chronic-conditions"
                value={formData.chronicConditions}
                onChange={(event) =>
                  change("chronicConditions", event.target.value)
                }
                rows={4}
              />
            </div>
          </TabsContent>

          <TabsContent value="visit" className="mt-4 space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Type d&apos;arrivée prévue</Label>
                <Select
                  value={formData.visitType}
                  onValueChange={(value) => change("visitType", value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="WALK_IN">Sans rendez-vous</SelectItem>
                    <SelectItem value="APPOINTMENT">Rendez-vous</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Spécialité demandée</Label>
                <Select
                  value={formData.specialtyId}
                  onValueChange={(value) => change("specialtyId", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner" />
                  </SelectTrigger>
                  <SelectContent>
                    {specialties.map((specialty) => (
                      <SelectItem key={specialty.id} value={specialty.id}>
                        {specialty.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="rounded-md border bg-muted/30 p-3 text-sm">
              Ces informations seront confirmées lors du marquage d&apos;arrivée.
              Le patient ne rejoint pas la file tant que son arrivée n&apos;est pas
              validée.
            </div>
          </TabsContent>
        </Tabs>

        {errorMessage && (
          <div
            role="alert"
            className="flex items-start gap-2 rounded-md border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive"
          >
            <AlertCircle className="mt-0.5 size-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <div className="mt-4 flex gap-2 border-t pt-4">
          <Button
            onClick={onSubmit}
            className="flex-1"
            disabled={
              isSubmitting ||
              !canSubmit ||
              (formData.hasDrugAllergies === "yes" &&
                !formData.allergyDetails.trim())
            }
          >
            {isSubmitting ? "Enregistrement..." : "Enregistrer et créer la visite"}
          </Button>
          <Button variant="outline" onClick={handleCancel} disabled={isSubmitting}>
            Annuler
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
});
