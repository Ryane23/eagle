"use client";

import { memo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Phone, Mail, CheckCircle2, Eye, Edit } from "lucide-react";
import type { NursePatient } from "@/types/nurse";

interface PatientsTableProps {
  patients: NursePatient[];
  onViewPatient: (patient: NursePatient) => void;
  onEditPatient?: (patient: NursePatient) => void;
}

export const PatientsTable = memo(function PatientsTable({
  patients,
  onViewPatient,
  onEditPatient,
}: PatientsTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Liste des patients</CardTitle>
        <CardDescription>
          {patients.length} patient(s) trouvé(s)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Patient</TableHead>
              <TableHead>Code</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Dernière visite</TableHead>
              <TableHead>Statut identité</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {patients.map((patient) => (
              <PatientRow
                key={patient.id}
                patient={patient}
                onView={() => onViewPatient(patient)}
                onEdit={onEditPatient ? () => onEditPatient(patient) : undefined}
              />
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
});

interface PatientRowProps {
  patient: NursePatient;
  onView: () => void;
  onEdit?: () => void;
}

function PatientRow({ patient, onView, onEdit }: PatientRowProps) {
  const initials = patient.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2);

  return (
    <TableRow>
      <TableCell>
        <div className="flex items-center gap-3">
          <Avatar className="size-10">
            <AvatarFallback className="bg-primary text-primary-foreground">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium">{patient.name}</p>
            <p className="text-sm text-muted-foreground">
              {patient.age} ans, {patient.gender}
            </p>
          </div>
        </div>
      </TableCell>
      <TableCell>
        <Badge variant="outline">{patient.patientCode}</Badge>
      </TableCell>
      <TableCell>
        <div className="text-sm">
          {patient.phone && (
            <div className="flex items-center gap-1">
              <Phone className="size-3" />
              <span>{patient.phone}</span>
            </div>
          )}
          {patient.email && (
            <div className="flex items-center gap-1">
              <Mail className="size-3" />
              <span className="text-muted-foreground">{patient.email}</span>
            </div>
          )}
        </div>
      </TableCell>
      <TableCell>
        {patient.lastVisit ? (
          <span className="text-sm">{patient.lastVisit}</span>
        ) : (
          <span className="text-sm text-muted-foreground">Jamais</span>
        )}
      </TableCell>
      <TableCell>
        {patient.identityVerified ? (
          <Badge variant="default" className="bg-green-500">
            <CheckCircle2 className="size-3 mr-1" />
            Vérifié
          </Badge>
        ) : (
          <Badge variant="secondary">Non vérifié</Badge>
        )}
      </TableCell>
      <TableCell className="text-right">
        <div className="flex items-center justify-end gap-2">
          <Button variant="ghost" size="icon" onClick={onView}>
            <Eye className="size-4" />
          </Button>
          {onEdit && (
            <Button variant="ghost" size="icon" onClick={onEdit}>
              <Edit className="size-4" />
            </Button>
          )}
        </div>
      </TableCell>
    </TableRow>
  );
}

