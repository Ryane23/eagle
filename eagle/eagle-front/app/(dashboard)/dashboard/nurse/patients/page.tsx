"use client";

import { useState, useCallback, useMemo } from "react";
import { EnhancedNurseDashboardHeader } from "@/components/nurse/enhanced-dashboard-header";
import { FloatingHelpButton } from "@/components/nurse/floating-help-button";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Plus, ScanLine, AlertCircle } from "lucide-react";
import { useDebounce } from "@/hooks";
import {
  usePatientsQuery,
  useCreatePatient,
  useSpecialtiesQuery,
  useUploadFile,
} from "@/hooks/queries";
import { toast } from "sonner";
import {
  PatientsTable,
  NewPatientDialog,
  IdentityVerificationDialog,
  PatientDetailDialog,
} from "./_components";
import type {
  NursePatient,
  NewPatientFormData,
  IdentityVerificationData,
} from "@/types/nurse";
import { INITIAL_PATIENT_FORM_DATA, INITIAL_IDENTITY_DATA } from "@/types/nurse";
import { parseApiDate } from "@/lib/utils";
import type { Patient } from "@/types/api";
import { normalizePhone } from "@/actions/patients";

function validateNewPatient(data: NewPatientFormData): string | null {
  if (data.firstName.trim().length < 2) {
    return "Le prénom doit contenir au moins 2 caractères.";
  }
  if (data.lastName.trim().length < 2) {
    return "Le nom doit contenir au moins 2 caractères.";
  }
  if (!data.dateOfBirth) {
    return "La date de naissance est obligatoire.";
  }
  const dateOfBirth = new Date(`${data.dateOfBirth}T00:00:00`);
  if (
    Number.isNaN(dateOfBirth.getTime()) ||
    dateOfBirth.getTime() > Date.now()
  ) {
    return "La date de naissance doit être une date valide dans le passé.";
  }
  if (data.idNumber.trim().length < 5) {
    return "La CNI ou l'identifiant doit contenir au moins 5 caractères.";
  }
  const phone = normalizePhone(data.phone);
  if (!/^\+[1-9]\d{7,14}$/.test(phone)) {
    return "Le téléphone doit contenir un numéro valide, par exemple +237 699 123 456.";
  }
  const email = data.email.trim();
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return "L'adresse email n'est pas valide.";
  }
  if (
    data.hasDrugAllergies === "yes" &&
    !data.allergyDetails.trim()
  ) {
    return "Précisez les allergies médicamenteuses du patient.";
  }
  return null;
}

// Map API Patient to NursePatient display type (normalize Firestore timestamps)
function mapPatientToNursePatient(patient: Patient): NursePatient {
  const dob = parseApiDate(patient.dateOfBirth);
  const age = dob
    ? Math.floor((Date.now() - dob.getTime()) / (365.25 * 24 * 60 * 60 * 1000))
    : 0;
  const lastVisit = parseApiDate(patient.updatedAt)?.toLocaleDateString("fr-FR");
  const createdAt = parseApiDate(patient.createdAt)?.toISOString() ?? (typeof patient.createdAt === "string" ? patient.createdAt : "");

  return {
    id: patient.id,
    patientCode: patient.idNumber || patient.id.slice(0, 10).toUpperCase(),
    name: `${patient.firstName} ${patient.lastName}`,
    age,
    gender: patient.gender === "FEMALE" ? "Femme" : "Homme",
    phone: patient.phone || "N/A",
    email: patient.email || "",
    address: patient.address || "",
    bloodType: patient.bloodType || "N/A",
    allergies: patient.allergies || [],
    medicalHistory: patient.medicalHistory || [],
    currentMedications: patient.currentMedications || [],
    emergencyContact: patient.emergencyContactName 
      ? { name: patient.emergencyContactName, phone: patient.emergencyContactPhone || "" }
      : undefined,
    createdAt,
    lastVisit: lastVisit ?? undefined,
    status: patient.isActive ? "active" : "inactive",
  };
}

export default function PatientsPage() {
  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebounce(searchQuery, 300);

  // Dialog states
  const [newPatientOpen, setNewPatientOpen] = useState(false);
  const [identityVerificationOpen, setIdentityVerificationOpen] = useState(false);
  const [patientDetailOpen, setPatientDetailOpen] = useState(false);

  // Selected patient for detail view
  const [selectedPatient, setSelectedPatient] = useState<NursePatient | null>(null);

  // Form states
  const [newPatientData, setNewPatientData] = useState<NewPatientFormData>(INITIAL_PATIENT_FORM_DATA);
  const [newPatientError, setNewPatientError] = useState<string | null>(null);
  const [identityData, setIdentityData] = useState<IdentityVerificationData>(INITIAL_IDENTITY_DATA);

  // TanStack Query
  const { data: patients = [], isLoading, error } = usePatientsQuery();
  const { data: specialties = [] } = useSpecialtiesQuery(true);
  const createPatientMutation = useCreatePatient();

  // Map and filter patients based on search
  const filteredPatients = useMemo(() => {
    const query = debouncedSearch.toLowerCase();
    return patients
      .map(mapPatientToNursePatient)
      .filter(
        (patient) =>
          patient.name.toLowerCase().includes(query) ||
          patient.patientCode.toLowerCase().includes(query)
      );
  }, [patients, debouncedSearch]);

  // Handlers
  const handleCreatePatient = useCallback(async () => {
    const validationError = validateNewPatient(newPatientData);
    if (validationError) {
      setNewPatientError(validationError);
      toast.error(validationError);
      return;
    }
    setNewPatientError(null);
    try {
      await createPatientMutation.mutateAsync({
        firstName: newPatientData.firstName.trim(),
        lastName: newPatientData.lastName.trim(),
        dateOfBirth: newPatientData.dateOfBirth,
        gender: newPatientData.gender as "MALE" | "FEMALE",
        maritalStatus: newPatientData.maritalStatus
          ? (newPatientData.maritalStatus as
              | "SINGLE"
              | "MARRIED"
              | "DIVORCED"
              | "WIDOWED")
          : undefined,
        idNumber: newPatientData.idNumber.trim(),
        phone: normalizePhone(newPatientData.phone),
        email: newPatientData.email.trim().toLowerCase() || undefined,
        address: newPatientData.address.trim() || undefined,
        diabetic: newPatientData.diabetic === "yes",
        hasDrugAllergies: newPatientData.hasDrugAllergies === "yes",
        allergyDetails:
          newPatientData.hasDrugAllergies === "yes"
            ? newPatientData.allergyDetails.trim()
            : undefined,
        chronicConditions:
          newPatientData.chronicConditions.trim() || undefined,
      });
      setNewPatientOpen(false);
      setNewPatientData(INITIAL_PATIENT_FORM_DATA);
      setNewPatientError(null);
      toast.success("Patient enregistré", {
        description:
          "Confirmez son arrivée depuis la Salle d'attente avant la préparation.",
      });
    } catch (error) {
      setNewPatientError(
        error instanceof Error
          ? error.message
          : "Erreur lors de l'enregistrement du patient",
      );
    }
  }, [newPatientData, createPatientMutation]);

  const handleVerifyIdentity = useCallback(() => {
    console.log("Verifying identity with OCR:", identityData);
    // TODO: Implement OCR verification API
    setIdentityVerificationOpen(false);
    toast.info("Vérification d'identité en cours...");
  }, [identityData]);

  const uploadFileMutation = useUploadFile();

  const handleUploadDocument = useCallback(() => {
    // Create a file input and trigger it for document upload
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*,application/pdf";
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        uploadFileMutation.mutate(
          { file, entityType: "patient" },
          {
            onSuccess: () => toast.success("Document téléchargé avec succès"),
            onError: () => toast.error("Erreur lors du téléchargement"),
          }
        );
      }
    };
    input.click();
    // Also simulate OCR extraction for identity
    setIdentityData({
      ...identityData,
      firstName: "Jean",
      lastName: "Kamga",
      birthDate: "1979-05-15",
      birthPlace: "Douala",
      documentNumber: "123456789",
      documentType: "CNI",
      extractedData: { status: "success" },
    });
    toast.success("Document analysé avec succès");
  }, [identityData, uploadFileMutation]);

  const handleViewPatient = useCallback((patient: NursePatient) => {
    setSelectedPatient(patient);
    setPatientDetailOpen(true);
  }, []);

  if (error) {
    return (
      <div className="flex flex-col h-full">
        <EnhancedNurseDashboardHeader />
        <div className="flex-1 p-6 flex items-center justify-center">
          <div className="text-center">
            <AlertCircle className="size-12 mx-auto text-destructive mb-4" />
            <h2 className="text-lg font-semibold mb-2">Erreur de chargement</h2>
            <p className="text-muted-foreground">{error.message}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <EnhancedNurseDashboardHeader />

      <div className="flex-1 p-6 space-y-6 overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-primary">Patients</h1>
            <p className="text-muted-foreground">
              Gestion et visualisation de la liste des patients
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setIdentityVerificationOpen(true)}>
              <ScanLine className="size-4 mr-2" />
              Vérifier identité
            </Button>
            <Button
              onClick={() => {
                setNewPatientError(null);
                setNewPatientOpen(true);
              }}
            >
              <Plus className="size-4 mr-2" />
              Nouveau patient
            </Button>
          </div>
        </div>

        {/* Search */}
        <Card>
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher un patient par nom ou code..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </CardContent>
        </Card>

        {/* Patients Table */}
        {isLoading ? (
          <Card>
            <CardContent className="p-4">
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <Skeleton className="size-10 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-48" />
                    </div>
                    <Skeleton className="h-8 w-20" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ) : (
          <PatientsTable
            patients={filteredPatients}
            onViewPatient={handleViewPatient}
          />
        )}
      </div>

      {/* Dialogs */}
      <NewPatientDialog
        open={newPatientOpen}
        onOpenChange={(open) => {
          setNewPatientOpen(open);
          if (!open) setNewPatientError(null);
        }}
        formData={newPatientData}
        specialties={specialties}
        isSubmitting={
          createPatientMutation.isPending
        }
        errorMessage={newPatientError}
        onFormChange={(data) => {
          setNewPatientData(data);
          setNewPatientError(null);
        }}
        onSubmit={handleCreatePatient}
      />

      <IdentityVerificationDialog
        open={identityVerificationOpen}
        onOpenChange={setIdentityVerificationOpen}
        data={identityData}
        onDataChange={setIdentityData}
        onUpload={handleUploadDocument}
        onVerify={handleVerifyIdentity}
      />

      <PatientDetailDialog
        open={patientDetailOpen}
        onOpenChange={setPatientDetailOpen}
        patient={selectedPatient}
      />

      <FloatingHelpButton />
    </div>
  );
}
