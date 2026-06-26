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
import { HeartPulse } from "lucide-react";
import type { NewPatientFormData } from "@/types/nurse";
import { INITIAL_PATIENT_FORM_DATA, calculateBMI } from "@/types/nurse";

interface NewPatientDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  formData: NewPatientFormData;
  onFormChange: (data: NewPatientFormData) => void;
  onSubmit: () => void;
}

export const NewPatientDialog = memo(function NewPatientDialog({
  open,
  onOpenChange,
  formData,
  onFormChange,
  onSubmit,
}: NewPatientDialogProps) {
  const handleFieldChange = useCallback(
    (field: keyof NewPatientFormData, value: string) => {
      onFormChange({ ...formData, [field]: value });
    },
    [formData, onFormChange]
  );

  const handleCancel = useCallback(() => {
    onOpenChange(false);
    onFormChange(INITIAL_PATIENT_FORM_DATA);
  }, [onOpenChange, onFormChange]);

  const bmi = calculateBMI(formData.weight, formData.height);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Créer un nouveau patient</DialogTitle>
          <DialogDescription>
            Remplissez les informations pour créer un nouveau patient dans le système
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="info" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="info">Informations Patient</TabsTrigger>
            <TabsTrigger value="vitals">Signes Vitaux & Problème</TabsTrigger>
          </TabsList>

          <TabsContent value="info" className="space-y-4 mt-4">
            <PatientInfoForm formData={formData} onChange={handleFieldChange} />
          </TabsContent>

          <TabsContent value="vitals" className="space-y-4 mt-4">
            <VitalSignsForm formData={formData} onChange={handleFieldChange} bmi={bmi} />
          </TabsContent>
        </Tabs>

        <div className="flex gap-2 pt-4 border-t mt-4">
          <Button onClick={onSubmit} className="flex-1">
            Créer le patient
          </Button>
          <Button variant="outline" onClick={handleCancel}>
            Annuler
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
});

// Sub-components

interface PatientInfoFormProps {
  formData: NewPatientFormData;
  onChange: (field: keyof NewPatientFormData, value: string) => void;
}

function PatientInfoForm({ formData, onChange }: PatientInfoFormProps) {
  return (
    <>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="firstName">Prénom *</Label>
          <Input
            id="firstName"
            value={formData.firstName}
            onChange={(e) => onChange("firstName", e.target.value)}
            placeholder="Prénom"
          />
        </div>
        <div>
          <Label htmlFor="lastName">Nom *</Label>
          <Input
            id="lastName"
            value={formData.lastName}
            onChange={(e) => onChange("lastName", e.target.value)}
            placeholder="Nom"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="dateOfBirth">Date de naissance *</Label>
          <Input
            id="dateOfBirth"
            type="date"
            value={formData.dateOfBirth}
            onChange={(e) => onChange("dateOfBirth", e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="gender">Genre *</Label>
          <Select value={formData.gender} onValueChange={(value) => onChange("gender", value)}>
            <SelectTrigger>
              <SelectValue placeholder="Sélectionner" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="M">Homme</SelectItem>
              <SelectItem value="F">Femme</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="phone">Téléphone</Label>
        <Input
          id="phone"
          value={formData.phone}
          onChange={(e) => onChange("phone", e.target.value)}
          placeholder="+237 6XX XXX XXX"
        />
      </div>

      <div>
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) => onChange("email", e.target.value)}
          placeholder="email@example.com"
        />
      </div>

      <div>
        <Label htmlFor="address">Adresse</Label>
        <Input
          id="address"
          value={formData.address}
          onChange={(e) => onChange("address", e.target.value)}
          placeholder="Ville, Pays"
        />
      </div>
    </>
  );
}

interface VitalSignsFormProps {
  formData: NewPatientFormData;
  onChange: (field: keyof NewPatientFormData, value: string) => void;
  bmi: string | null;
}

function VitalSignsForm({ formData, onChange, bmi }: VitalSignsFormProps) {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
          <HeartPulse className="size-4 text-red-500" />
          Signes Vitaux
        </h3>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <Label className="text-xs">Tension (mmHg)</Label>
            <div className="flex gap-1">
              <Input
                type="number"
                value={formData.bloodPressureSystolic}
                onChange={(e) => onChange("bloodPressureSystolic", e.target.value)}
                placeholder="120"
                className="text-sm"
              />
              <span className="self-center text-muted-foreground">/</span>
              <Input
                type="number"
                value={formData.bloodPressureDiastolic}
                onChange={(e) => onChange("bloodPressureDiastolic", e.target.value)}
                placeholder="80"
                className="text-sm w-20"
              />
            </div>
          </div>
          <div>
            <Label className="text-xs">Pouls (bpm)</Label>
            <Input
              type="number"
              value={formData.heartRate}
              onChange={(e) => onChange("heartRate", e.target.value)}
              placeholder="72"
              className="text-sm"
            />
          </div>
          <div>
            <Label className="text-xs">Température (°C)</Label>
            <Input
              type="number"
              step="0.1"
              value={formData.temperature}
              onChange={(e) => onChange("temperature", e.target.value)}
              placeholder="37.0"
              className="text-sm"
            />
          </div>
          <div>
            <Label className="text-xs">Respiratoire (/min)</Label>
            <Input
              type="number"
              value={formData.respiratoryRate}
              onChange={(e) => onChange("respiratoryRate", e.target.value)}
              placeholder="16"
              className="text-sm"
            />
          </div>
          <div>
            <Label className="text-xs">SpO₂ (%)</Label>
            <Input
              type="number"
              value={formData.oxygenSaturation}
              onChange={(e) => onChange("oxygenSaturation", e.target.value)}
              placeholder="98"
              className="text-sm"
            />
          </div>
          <div>
            <Label className="text-xs">Poids (kg)</Label>
            <Input
              type="number"
              step="0.1"
              value={formData.weight}
              onChange={(e) => onChange("weight", e.target.value)}
              placeholder="75"
              className="text-sm"
            />
          </div>
          <div>
            <Label className="text-xs">Taille (cm)</Label>
            <Input
              type="number"
              value={formData.height}
              onChange={(e) => onChange("height", e.target.value)}
              placeholder="170"
              className="text-sm"
            />
          </div>
        </div>
        {bmi && (
          <div className="mt-3 p-2 bg-muted rounded text-xs">
            <strong>IMC:</strong> {bmi}
          </div>
        )}
      </div>

      {/* Problem/Reason for Visit */}
      <div>
        <Label htmlFor="problem" className="text-sm">
          Problème / Raison de consultation *
        </Label>
        <Textarea
          id="problem"
          value={formData.problem}
          onChange={(e) => onChange("problem", e.target.value)}
          placeholder="Décrivez le problème ou la raison de la consultation..."
          className="min-h-[80px] mt-2 text-sm"
        />
      </div>
    </div>
  );
}

