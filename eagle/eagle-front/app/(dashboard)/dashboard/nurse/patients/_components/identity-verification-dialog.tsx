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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Upload, FileText } from "lucide-react";
import type { IdentityVerificationData } from "@/types/nurse";

interface IdentityVerificationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: IdentityVerificationData;
  onDataChange: (data: IdentityVerificationData) => void;
  onUpload: () => void;
  onVerify: () => void;
}

export const IdentityVerificationDialog = memo(function IdentityVerificationDialog({
  open,
  onOpenChange,
  data,
  onDataChange,
  onUpload,
  onVerify,
}: IdentityVerificationDialogProps) {
  const handleFieldChange = useCallback(
    (field: keyof IdentityVerificationData, value: string) => {
      onDataChange({ ...data, [field]: value });
    },
    [data, onDataChange]
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Vérification d&apos;identité</DialogTitle>
          <DialogDescription>
            Téléversez un document d&apos;identité pour extraction automatique des données (OCR)
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="upload" className="w-full">
          <TabsList>
            <TabsTrigger value="upload">Téléversement</TabsTrigger>
            <TabsTrigger value="extracted" disabled={!data.extractedData}>
              Données extraites
            </TabsTrigger>
            <TabsTrigger value="search">Recherche</TabsTrigger>
          </TabsList>

          <TabsContent value="upload" className="space-y-4">
            <UploadTab onUpload={onUpload} />
          </TabsContent>

          <TabsContent value="extracted" className="space-y-4">
            <ExtractedDataTab data={data} onChange={handleFieldChange} />
          </TabsContent>

          <TabsContent value="search" className="space-y-4">
            <SearchTab onVerify={onVerify} onCancel={() => onOpenChange(false)} />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
});

// Sub-components

interface UploadTabProps {
  onUpload: () => void;
}

function UploadTab({ onUpload }: UploadTabProps) {
  return (
    <Card>
      <CardContent className="p-8">
        <div className="border-2 border-dashed rounded-lg p-8 text-center">
          <Upload className="size-12 mx-auto text-muted-foreground mb-4" />
          <p className="font-medium mb-2">Téléversez un document d&apos;identité</p>
          <p className="text-sm text-muted-foreground mb-4">
            Carte nationale d&apos;identité, Passeport (PDF, JPEG, PNG)
          </p>
          <Button onClick={onUpload}>
            <FileText className="size-4 mr-2" />
            Choisir un fichier
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

interface ExtractedDataTabProps {
  data: IdentityVerificationData;
  onChange: (field: keyof IdentityVerificationData, value: string) => void;
}

function ExtractedDataTab({ data, onChange }: ExtractedDataTabProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Données extraites par OCR</CardTitle>
        <CardDescription>
          Vérifiez et modifiez les données extraites si nécessaire
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Prénom</Label>
            <Input
              value={data.firstName}
              onChange={(e) => onChange("firstName", e.target.value)}
            />
          </div>
          <div>
            <Label>Nom</Label>
            <Input
              value={data.lastName}
              onChange={(e) => onChange("lastName", e.target.value)}
            />
          </div>
          <div>
            <Label>Date de naissance</Label>
            <Input
              type="date"
              value={data.birthDate}
              onChange={(e) => onChange("birthDate", e.target.value)}
            />
          </div>
          <div>
            <Label>Lieu de naissance</Label>
            <Input
              value={data.birthPlace}
              onChange={(e) => onChange("birthPlace", e.target.value)}
            />
          </div>
          <div>
            <Label>Numéro de document</Label>
            <Input
              value={data.documentNumber}
              onChange={(e) => onChange("documentNumber", e.target.value)}
            />
          </div>
          <div>
            <Label>Type de document</Label>
            <Select
              value={data.documentType}
              onValueChange={(value) => onChange("documentType", value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="CNI">CNI</SelectItem>
                <SelectItem value="Passeport">Passeport</SelectItem>
                <SelectItem value="Autre">Autre</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface SearchTabProps {
  onVerify: () => void;
  onCancel: () => void;
}

function SearchTab({ onVerify, onCancel }: SearchTabProps) {
  return (
    <Card>
      <CardContent className="p-8 text-center">
        <p className="text-muted-foreground mb-4">
          Recherche de correspondance dans la base de données...
        </p>
        <div className="space-y-2">
          <p className="font-medium">Aucune correspondance trouvée</p>
          <p className="text-sm text-muted-foreground">
            Voulez-vous créer un nouveau patient avec ces informations ?
          </p>
          <div className="flex gap-2 justify-center pt-4">
            <Button onClick={onVerify}>Créer nouveau patient</Button>
            <Button variant="outline" onClick={onCancel}>
              Annuler
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

