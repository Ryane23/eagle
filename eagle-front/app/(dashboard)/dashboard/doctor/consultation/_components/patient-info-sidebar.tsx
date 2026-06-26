"use client";

import { memo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  User,
  Clock,
  Activity,
  Heart,
  Thermometer,
  Droplet,
  FileText,
  Pill,
  AlertTriangle,
  Eye,
  TestTube,
  CheckCircle2,
} from "lucide-react";
import type { ConsultationPatient } from "@/types/consultation";
import { getUrgencyColor } from "@/types/consultation";

interface PatientInfoSidebarProps {
  patient: ConsultationPatient;
}

export const PatientInfoSidebar = memo(function PatientInfoSidebar({
  patient,
}: PatientInfoSidebarProps) {
  const urgencyColor = getUrgencyColor(patient.urgencyLevel);

  return (
    <div className="space-y-2">
      <PatientSummaryCard patient={patient} urgencyColor={urgencyColor} />
      <VitalSignsCard vitalSigns={patient.vitalSigns} />
      <MedicalHistoryCard history={patient.medicalHistory} />
      <CurrentMedicationsCard medications={patient.currentMedications} />
      <AllergiesCard allergies={patient.allergies} />
      <QuickActionsCard />
    </div>
  );
});

// Sub-components

interface PatientSummaryCardProps {
  patient: ConsultationPatient;
  urgencyColor: string;
}

function PatientSummaryCard({ patient, urgencyColor }: PatientSummaryCardProps) {
  return (
    <Card className="border-blue-200">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center justify-between">
          <span className="flex items-center gap-2">
            <User className="size-4" />
            Informations Patient
          </span>
          <Badge className={urgencyColor}>
            Urgence {patient.urgencyLevel}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <h3 className="text-lg font-bold">{patient.name}</h3>
          <p className="text-sm text-muted-foreground">
            {patient.age} ans • {patient.gender === "M" ? "Homme" : "Femme"}
          </p>
        </div>
        <div className="p-3 bg-muted rounded-lg">
          <p className="text-xs font-semibold text-muted-foreground mb-1">
            Motif de consultation
          </p>
          <p className="text-sm">{patient.reason}</p>
        </div>
        {(patient.arrivalTime || patient.waitTime !== undefined || patient.nurse) && (
          <div className="space-y-2 pt-2 border-t">
            {patient.arrivalTime && (
              <div className="flex items-center gap-2 text-xs">
                <Clock className="size-3 text-muted-foreground" />
                <span className="text-muted-foreground">Arrivée:</span>
                <span className="font-medium">{patient.arrivalTime}</span>
              </div>
            )}
            {patient.waitTime !== undefined && (
              <div className="flex items-center gap-2 text-xs">
                <Clock className="size-3 text-orange-500" />
                <span className="text-muted-foreground">Temps d&apos;attente:</span>
                <span className="font-medium text-orange-600">{patient.waitTime} min</span>
              </div>
            )}
            {patient.nurse && (
              <div className="flex items-center gap-2 text-xs">
                <User className="size-3 text-muted-foreground" />
                <span className="text-muted-foreground">Préparé par:</span>
                <span className="font-medium">{patient.nurse}</span>
              </div>
            )}
            {patient.room && (
              <div className="flex items-center gap-2 text-xs">
                <CheckCircle2 className="size-3 text-green-500" />
                <span className="text-muted-foreground">Salle:</span>
                <span className="font-medium">{patient.room}</span>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface VitalSignsCardProps {
  vitalSigns?: ConsultationPatient["vitalSigns"];
}

function VitalSignsCard({ vitalSigns }: VitalSignsCardProps) {
  if (!vitalSigns) return null;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Activity className="size-4" />
          Signes Vitaux
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          {vitalSigns.bloodPressure && (
            <div className="p-3 bg-muted rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <Heart className="size-4 text-red-500" />
                <p className="text-xs text-muted-foreground">Tension</p>
              </div>
              <p className="font-bold">{vitalSigns.bloodPressure}</p>
            </div>
          )}
          {vitalSigns.heartRate && (
            <div className="p-3 bg-muted rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <Activity className="size-4 text-blue-500" />
                <p className="text-xs text-muted-foreground">Pouls</p>
              </div>
              <p className="font-bold">{vitalSigns.heartRate} bpm</p>
            </div>
          )}
          {vitalSigns.temperature && (
            <div className="p-3 bg-muted rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <Thermometer className="size-4 text-orange-500" />
                <p className="text-xs text-muted-foreground">Temp.</p>
              </div>
              <p className={`font-bold ${vitalSigns.temperature > 38 ? 'text-red-600' : ''}`}>
                {vitalSigns.temperature}°C
              </p>
            </div>
          )}
          {vitalSigns.weight && (
            <div className="p-3 bg-muted rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <Droplet className="size-4 text-purple-500" />
                <p className="text-xs text-muted-foreground">Poids</p>
              </div>
              <p className="font-bold">{vitalSigns.weight} kg</p>
            </div>
          )}
          {vitalSigns.oxygenSaturation && (
            <div className="p-3 bg-muted rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <Activity className="size-4 text-green-500" />
                <p className="text-xs text-muted-foreground">SpO2</p>
              </div>
              <p className={`font-bold ${vitalSigns.oxygenSaturation < 95 ? 'text-red-600' : ''}`}>
                {vitalSigns.oxygenSaturation}%
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

interface MedicalHistoryCardProps {
  history?: string[];
}

function MedicalHistoryCard({ history }: MedicalHistoryCardProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <FileText className="size-4" />
          Antécédents
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {history && history.length > 0 ? (
          <div>
            <p className="text-xs font-semibold text-muted-foreground mb-2">
              Historique médical
            </p>
            <ul className="space-y-1">
              {history.map((item, idx) => (
                <li key={idx} className="text-sm flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">Aucun antécédent médical enregistré</p>
        )}
      </CardContent>
    </Card>
  );
}

interface CurrentMedicationsCardProps {
  medications?: string[];
}

function CurrentMedicationsCard({ medications }: CurrentMedicationsCardProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Pill className="size-4" />
          Traitement actuel
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {medications && medications.length > 0 ? (
          medications.map((med, idx) => (
            <div key={idx} className="p-2 bg-blue-50 dark:bg-blue-950 rounded text-sm">
              {med}
            </div>
          ))
        ) : (
          <p className="text-sm text-muted-foreground">Aucun traitement en cours</p>
        )}
      </CardContent>
    </Card>
  );
}

interface AllergiesCardProps {
  allergies?: string[];
}

function AllergiesCard({ allergies }: AllergiesCardProps) {
  return (
    <Card className="border-red-200">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2 text-red-600">
          <AlertTriangle className="size-4" />
          Allergies
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {allergies && allergies.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {allergies.map((allergy, idx) => (
              <Badge key={idx} variant="destructive">
                {allergy}
              </Badge>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">Aucune allergie connue</p>
        )}
      </CardContent>
    </Card>
  );
}

function QuickActionsCard() {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Actions Rapides</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <Button variant="outline" className="w-full justify-start gap-2">
          <Eye className="size-4" />
          Dossier complet
        </Button>
        <Button variant="outline" className="w-full justify-start gap-2">
          <FileText className="size-4" />
          Consultations précédentes
        </Button>
        <Button variant="outline" className="w-full justify-start gap-2">
          <TestTube className="size-4" />
          Résultats d&apos;examens
        </Button>
      </CardContent>
    </Card>
  );
}

