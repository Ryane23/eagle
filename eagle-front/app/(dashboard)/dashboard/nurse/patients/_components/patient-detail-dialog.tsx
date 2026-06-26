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
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Edit, FileText } from "lucide-react";
import type { NursePatient } from "@/types/nurse";

interface PatientDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patient: NursePatient | null;
  onEdit?: () => void;
  onViewDPI?: () => void;
}

export const PatientDetailDialog = memo(function PatientDetailDialog({
  open,
  onOpenChange,
  patient,
  onEdit,
  onViewDPI,
}: PatientDetailDialogProps) {
  if (!patient) return null;

  const initials = patient.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Détails du patient</DialogTitle>
          <DialogDescription>{patient.patientCode}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <Avatar className="size-20">
              <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="text-xl font-bold">{patient.name}</h3>
              <p className="text-muted-foreground">
                {patient.age} ans, {patient.gender}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Code patient</Label>
              <p className="font-medium">{patient.patientCode}</p>
            </div>
            <div>
              <Label>Statut identité</Label>
              <div className="mt-1">
                {patient.identityVerified ? (
                  <Badge variant="default" className="bg-green-500">
                    Vérifié
                  </Badge>
                ) : (
                  <Badge variant="secondary">Non vérifié</Badge>
                )}
              </div>
            </div>
            {patient.phone && (
              <div>
                <Label>Téléphone</Label>
                <p className="font-medium">{patient.phone}</p>
              </div>
            )}
            {patient.email && (
              <div>
                <Label>Email</Label>
                <p className="font-medium">{patient.email}</p>
              </div>
            )}
            {patient.address && (
              <div className="col-span-2">
                <Label>Adresse</Label>
                <p className="font-medium">{patient.address}</p>
              </div>
            )}
            {patient.lastVisit && (
              <div>
                <Label>Dernière visite</Label>
                <p className="font-medium">{patient.lastVisit}</p>
              </div>
            )}
          </div>

          <div className="flex gap-2 pt-4 border-t">
            <Button variant="outline" className="flex-1" onClick={onEdit}>
              <Edit className="size-4 mr-2" />
              Modifier
            </Button>
            <Button variant="outline" className="flex-1" onClick={onViewDPI}>
              <FileText className="size-4 mr-2" />
              Voir DPI
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
});

