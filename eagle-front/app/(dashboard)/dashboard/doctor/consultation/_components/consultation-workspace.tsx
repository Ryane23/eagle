"use client";

import { memo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { FileText, Mic, Pill, TestTube } from "lucide-react";
import type { ConsultationTab, ConsultationNotes } from "@/types/consultation";

interface ConsultationWorkspaceProps {
  activeTab: ConsultationTab;
  notes: ConsultationNotes;
  onTabChange: (tab: ConsultationTab) => void;
  onNotesChange: <K extends keyof ConsultationNotes>(field: K, value: ConsultationNotes[K]) => void;
  onSave: () => void;
  onSaveDraft: () => void;
}

export const ConsultationWorkspace = memo(function ConsultationWorkspace({
  activeTab,
  notes,
  onTabChange,
  onNotesChange,
  onSave,
  onSaveDraft,
}: ConsultationWorkspaceProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="size-5" />
          Espace de Consultation
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={(v) => onTabChange(v as ConsultationTab)}>
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="notes">Notes</TabsTrigger>
            <TabsTrigger value="diagnosis">Diagnostic</TabsTrigger>
            <TabsTrigger value="prescription">Ordonnance</TabsTrigger>
            <TabsTrigger value="exams">Examens</TabsTrigger>
            <TabsTrigger value="followup">Suivi</TabsTrigger>
          </TabsList>

          <TabsContent value="notes" className="space-y-4 mt-4">
            <NotesTab
              value={notes.notes}
              onChange={(v) => onNotesChange("notes", v)}
            />
          </TabsContent>

          <TabsContent value="diagnosis" className="space-y-4 mt-4">
            <DiagnosisTab
              value={notes.diagnosis}
              onChange={(v) => onNotesChange("diagnosis", v)}
            />
          </TabsContent>

          <TabsContent value="prescription" className="space-y-4 mt-4">
            <PrescriptionTab
              value={notes.prescription}
              onChange={(v) => onNotesChange("prescription", v)}
            />
          </TabsContent>

          <TabsContent value="exams" className="space-y-4 mt-4">
            <ExamsTab
              value={notes.labTests}
              onChange={(v) => onNotesChange("labTests", v)}
            />
          </TabsContent>

          <TabsContent value="followup" className="space-y-4 mt-4">
            <FollowUpTab
              notes={notes.followUpNotes}
              date={notes.followUpDate}
              onNotesChange={(v) => onNotesChange("followUpNotes", v)}
              onDateChange={(v) => onNotesChange("followUpDate", v)}
            />
          </TabsContent>
        </Tabs>

        <div className="mt-6 flex gap-3">
          <Button className="flex-1 gap-2" onClick={onSave}>
            <FileText className="size-4" />
            Enregistrer
          </Button>
          <Button variant="outline" className="flex-1" onClick={onSaveDraft}>
            Brouillon
          </Button>
        </div>
      </CardContent>
    </Card>
  );
});

// Sub-components for each tab

interface NotesTabProps {
  value: string;
  onChange: (value: string) => void;
}

function NotesTab({ value, onChange }: NotesTabProps) {
  return (
    <>
      <div>
        <label className="text-sm font-medium mb-2 block">
          Notes de consultation
        </label>
        <Textarea
          placeholder="Saisir vos observations, symptômes, examen clinique..."
          className="min-h-[200px]"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      </div>
      <div className="flex gap-2">
        <Button variant="outline" className="gap-2">
          <FileText className="size-4" />
          Modèle
        </Button>
        <Button variant="outline" className="gap-2">
          <Mic className="size-4" />
          Dictée vocale
        </Button>
      </div>
    </>
  );
}

interface DiagnosisTabProps {
  value: string;
  onChange: (value: string) => void;
}

function DiagnosisTab({ value, onChange }: DiagnosisTabProps) {
  return (
    <>
      <div>
        <label className="text-sm font-medium mb-2 block">
          Diagnostic
        </label>
        <Textarea
          placeholder="Diagnostic principal et différentiel..."
          className="min-h-[150px]"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      </div>
      <div>
        <label className="text-sm font-medium mb-2 block">
          Code CIM-10
        </label>
        <Input placeholder="Rechercher code CIM-10..." />
      </div>
    </>
  );
}

interface PrescriptionTabProps {
  value: string;
  onChange: (value: string) => void;
}

function PrescriptionTab({ value, onChange }: PrescriptionTabProps) {
  return (
    <>
      <div>
        <label className="text-sm font-medium mb-2 block flex items-center gap-2">
          <Pill className="size-4" />
          Médicaments prescrits
        </label>
        <Textarea
          placeholder="Ex: Paracétamol 500mg - 3x/jour pendant 5 jours..."
          className="min-h-[150px]"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      </div>
      <div className="flex gap-2">
        <Button className="gap-2">
          <Pill className="size-4" />
          Ajouter médicament
        </Button>
        <Button variant="outline">
          Vérifier interactions
        </Button>
      </div>
    </>
  );
}

interface ExamsTabProps {
  value: string;
  onChange: (value: string) => void;
}

function ExamsTab({ value, onChange }: ExamsTabProps) {
  return (
    <>
      <div>
        <label className="text-sm font-medium mb-2 block flex items-center gap-2">
          <TestTube className="size-4" />
          Examens demandés
        </label>
        <Textarea
          placeholder="Analyses sanguines, imagerie, etc..."
          className="min-h-[150px]"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <Button variant="outline" className="justify-start">
          Analyses sanguines
        </Button>
        <Button variant="outline" className="justify-start">
          Imagerie
        </Button>
        <Button variant="outline" className="justify-start">
          ECG
        </Button>
        <Button variant="outline" className="justify-start">
          Autre examen
        </Button>
      </div>
    </>
  );
}

interface FollowUpTabProps {
  notes: string;
  date?: string;
  onNotesChange: (value: string) => void;
  onDateChange: (value: string) => void;
}

function FollowUpTab({ notes, date, onNotesChange, onDateChange }: FollowUpTabProps) {
  return (
    <>
      <div>
        <label className="text-sm font-medium mb-2 block">
          Instructions de suivi
        </label>
        <Textarea
          placeholder="Prochain rendez-vous, recommandations, surveillance..."
          className="min-h-[150px]"
          value={notes}
          onChange={(e) => onNotesChange(e.target.value)}
        />
      </div>
      <div>
        <label className="text-sm font-medium mb-2 block">
          Prochain rendez-vous
        </label>
        <Input
          type="date"
          value={date || ""}
          onChange={(e) => onDateChange(e.target.value)}
        />
      </div>
    </>
  );
}

