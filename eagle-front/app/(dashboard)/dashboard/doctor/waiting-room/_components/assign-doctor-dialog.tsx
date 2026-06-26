"use client";

import { memo } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Send } from "lucide-react";
import type { Doctor } from "@/types/waiting-room";

interface AssignDoctorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  doctors: Doctor[];
  selectedDoctor: string;
  onDoctorChange: (doctorId: string) => void;
  onConfirm: () => void;
  patientSpecialty?: string;
  isPending?: boolean;
  hasConsultation?: boolean;
}

export const AssignDoctorDialog = memo(function AssignDoctorDialog({
  open,
  onOpenChange,
  doctors,
  selectedDoctor,
  onDoctorChange,
  onConfirm,
  patientSpecialty,
  isPending = false,
  hasConsultation = true,
}: AssignDoctorDialogProps) {
  const filteredDoctors = patientSpecialty
    ? doctors.filter((d) => d.specialty === patientSpecialty)
    : doctors;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Assigner un médecin</DialogTitle>
          <DialogDescription>
            Sélectionnez un médecin pour ce patient. Les autres médecins seront notifiés.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <Select value={selectedDoctor} onValueChange={onDoctorChange}>
            <SelectTrigger>
              <SelectValue placeholder="Sélectionner un médecin" />
            </SelectTrigger>
            <SelectContent>
              {filteredDoctors.map((doctor) => (
                <SelectItem key={doctor.id} value={doctor.id}>
                  {doctor.name} - {doctor.specialty}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {!hasConsultation && (
            <p className="text-sm text-destructive">
              Impossible d&apos;assigner : consultation non trouvée.
            </p>
          )}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
              Annuler
            </Button>
            <Button
              onClick={onConfirm}
              disabled={!selectedDoctor || isPending || !hasConsultation}
            >
              <Send className="size-4 mr-2" />
              {isPending ? "Assignation..." : "Assigner et notifier"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
});

