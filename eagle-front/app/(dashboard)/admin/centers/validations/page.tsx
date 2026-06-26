"use client";

import { useState } from "react";
import { DashboardHeader } from "@/components/layout/dashboard-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  // Building2,
  Search,
  CheckCircle,
  XCircle,
  Eye,
  User,
  Mail,
  Phone,
  // Calendar,
  FileText,
  Stethoscope,
  Download,
  Clock,
  MapPin,
  // Globe,
  // Camera,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

type PendingRegistration = {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  gender: string;
  dateOfBirth: string;
  nationality: string;
  city: string;
  region: string;
  languages: string[];
  professionalType: "doctor" | "nurse";
  // Doctor fields
  medicalLicenseNumber?: string;
  issuingAuthority?: string;
  yearOfRegistration?: string;
  licenseStatus?: string;
  // Nurse fields
  nursingLicenseNumber?: string;
  nursingIssuingAuthority?: string;
  qualificationCertificate?: string;
  nursingLicenseStatus?: string;
  submittedAt: string;
  center?: string;
  documents: {
    profilePhoto?: string;
    licenseDocument?: string;
    certificateDocument?: string;
  };
};

const mockPendingRegistrations: PendingRegistration[] = [
  {
    id: "reg-001",
    fullName: "Dr. Paul Mbarga",
    email: "paul.mbarga@example.cm",
    phone: "+237 6XX XXX XXX",
    gender: "male",
    dateOfBirth: "1985-05-15",
    nationality: "Camerounais",
    city: "Douala",
    region: "littoral",
    languages: ["Français", "English"],
    professionalType: "doctor",
    medicalLicenseNumber: "CM-DOC-2024-001",
    issuingAuthority: "onmc",
    yearOfRegistration: "2020",
    licenseStatus: "active",
    submittedAt: "2025-01-15 08:30",
    documents: {
      profilePhoto: "photo.jpg",
      licenseDocument: "license.pdf",
    },
  },
  {
    id: "reg-002",
    fullName: "Marie Kouam",
    email: "marie.kouam@example.cm",
    phone: "+237 6XX XXX XXX",
    gender: "female",
    dateOfBirth: "1990-03-22",
    nationality: "Camerounais",
    city: "Yaoundé",
    region: "centre",
    languages: ["Français", "Ewondo"],
    professionalType: "nurse",
    nursingLicenseNumber: "CM-NUR-2024-002",
    nursingIssuingAuthority: "msp",
    qualificationCertificate: "BTS Infirmier",
    nursingLicenseStatus: "active",
    submittedAt: "2025-01-15 09:15",
    documents: {
      profilePhoto: "photo.jpg",
      certificateDocument: "certificate.pdf",
    },
  },
  {
    id: "reg-003",
    fullName: "Dr. Jean Ndombi",
    email: "jean.ndombi@example.cm",
    phone: "+237 6XX XXX XXX",
    gender: "male",
    dateOfBirth: "1988-11-10",
    nationality: "Camerounais",
    city: "Bafoussam",
    region: "ouest",
    languages: ["Français", "English", "Pidgin"],
    professionalType: "doctor",
    medicalLicenseNumber: "CM-DOC-2024-003",
    issuingAuthority: "onmc",
    yearOfRegistration: "2018",
    licenseStatus: "active",
    submittedAt: "2025-01-14 14:20",
    documents: {
      profilePhoto: "photo.jpg",
      licenseDocument: "license.pdf",
    },
  },
];

export default function UserValidationsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [selectedRegistration, setSelectedRegistration] = useState<PendingRegistration | null>(null);
  const [validationDialogOpen, setValidationDialogOpen] = useState(false);
  const [pendingRegistrations, setPendingRegistrations] = useState(mockPendingRegistrations);
  const [validationData, setValidationData] = useState({
    role: "",
    center: "",
    network: "",
    notes: "",
  });

  const filteredRegistrations = pendingRegistrations.filter((reg) => {
    const matchesSearch =
      reg.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      reg.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      reg.phone.includes(searchQuery);
    const matchesType = filterType === "all" || reg.professionalType === filterType;
    return matchesSearch && matchesType;
  });

  const stats = {
    total: pendingRegistrations.length,
    doctors: pendingRegistrations.filter((r) => r.professionalType === "doctor").length,
    nurses: pendingRegistrations.filter((r) => r.professionalType === "nurse").length,
    pending: pendingRegistrations.length,
  };

  const handleViewDetails = (registration: PendingRegistration) => {
    setSelectedRegistration(registration);
    setValidationDialogOpen(true);
  };

  const handleValidate = (approved: boolean) => {
    if (!selectedRegistration) return;

    if (approved) {
      if (!validationData.role || !validationData.center) {
        toast.error("Veuillez sélectionner un rôle et un centre");
        return;
      }
      toast.success(
        `Inscription validée. ${selectedRegistration.fullName} a été assigné(e) au ${validationData.center}`
      );
    } else {
      toast.error(`Inscription rejetée pour ${selectedRegistration.fullName}`);
    }

    setPendingRegistrations(
      pendingRegistrations.filter((r) => r.id !== selectedRegistration.id)
    );
    setValidationDialogOpen(false);
    setSelectedRegistration(null);
    setValidationData({ role: "", center: "", network: "", notes: "" });
  };

  const mockCenters = [
    { id: "1", name: "Centre Principal - Yaoundé", code: "CPY-001", type: "PRIMARY" },
    { id: "2", name: "Centre Secondaire - Douala", code: "CSD-002", type: "SECONDARY" },
    { id: "3", name: "Centre Secondaire - Bafoussam", code: "CSB-003", type: "SECONDARY" },
    { id: "4", name: "Centre Secondaire - Maroua", code: "CSM-004", type: "SECONDARY" },
  ];

  const mockNetworks = [
    { id: "net-1", name: "Réseau Principal Yaoundé" },
    { id: "net-2", name: "Réseau Littoral" },
    { id: "net-3", name: "Réseau Ouest" },
  ];

  return (
    <div className="flex flex-col h-full">
      <DashboardHeader
        breadcrumbs={[
          { label: "Administration", href: "/admin" },
          { label: "Centres", href: "/admin/hospitals" },
          { label: "Validation des inscriptions" },
        ]}
      />

      <div className="flex-1 p-4 space-y-2 overflow-y-auto">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-primary flex items-center gap-2">
              <User className="size-5" />
              Validation des Inscriptions
            </h1>
            <p className="text-xs text-muted-foreground">
              Validez les demandes d&apos;inscription des professionnels de santé
            </p>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-4 gap-2">
          <Card>
            <CardContent className="p-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-full bg-blue-100">
                  <User className="size-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-xl font-bold">{stats.total}</p>
                  <p className="text-[10px] text-muted-foreground">Total en attente</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-full bg-purple-100">
                  <Stethoscope className="size-4 text-purple-600" />
                </div>
                <div>
                  <p className="text-xl font-bold">{stats.doctors}</p>
                  <p className="text-[10px] text-muted-foreground">Médecins</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-full bg-green-100">
                  <User className="size-4 text-green-600" />
                </div>
                <div>
                  <p className="text-xl font-bold">{stats.nurses}</p>
                  <p className="text-[10px] text-muted-foreground">Infirmiers</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-full bg-orange-100">
                  <Clock className="size-4 text-orange-600" />
                </div>
                <div>
                  <p className="text-xl font-bold">{stats.pending}</p>
                  <p className="text-[10px] text-muted-foreground">En attente</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-3">
            <div className="flex flex-wrap gap-2">
              <div className="flex-1 min-w-[200px]">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Rechercher par nom, email ou téléphone..."
                    className="pl-9"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les types</SelectItem>
                  <SelectItem value="doctor">Médecin</SelectItem>
                  <SelectItem value="nurse">Infirmier(ère)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Registrations List */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Demandes en attente de validation</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[calc(100vh-400px)]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Professionnel</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Localisation</TableHead>
                    <TableHead>Licence/Certificat</TableHead>
                    <TableHead>Date soumission</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRegistrations.map((registration) => (
                    <TableRow key={registration.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Avatar className="size-8">
                            <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                              {registration.fullName
                                .split(" ")
                                .map((n) => n[0])
                                .join("")
                                .slice(0, 2)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-sm">{registration.fullName}</p>
                            <p className="text-xs text-muted-foreground">{registration.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            registration.professionalType === "doctor" ? "default" : "secondary"
                          }
                        >
                          {registration.professionalType === "doctor" ? "Médecin" : "Infirmier(ère)"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-xs space-y-0.5">
                          <p className="flex items-center gap-1">
                            <Phone className="size-3" />
                            {registration.phone}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-xs">
                          <p className="flex items-center gap-1">
                            <MapPin className="size-3" />
                            {registration.city}
                          </p>
                          <p className="text-muted-foreground capitalize">{registration.region}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-xs">
                          {registration.professionalType === "doctor" ? (
                            <>
                              <p className="font-medium">{registration.medicalLicenseNumber}</p>
                              <p className="text-muted-foreground">
                                {registration.issuingAuthority === "onmc" ? "ONMC" : ""}
                              </p>
                            </>
                          ) : (
                            <>
                              <p className="font-medium">{registration.nursingLicenseNumber}</p>
                              <p className="text-muted-foreground">
                                {registration.nursingIssuingAuthority === "msp"
                                  ? "Min. Santé"
                                  : "CNA"}
                              </p>
                            </>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-xs text-muted-foreground">
                          <p>{new Date(registration.submittedAt).toLocaleDateString("fr-FR")}</p>
                          <p>{new Date(registration.submittedAt).toLocaleTimeString("fr-FR", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}</p>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 text-xs"
                          onClick={() => handleViewDetails(registration)}
                        >
                          <Eye className="size-3 mr-1" />
                          Voir détails
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredRegistrations.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        <User className="size-12 mx-auto text-muted-foreground mb-2 opacity-50" />
                        <p className="text-sm text-muted-foreground">
                          Aucune demande en attente
                        </p>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Validation Dialog */}
      <Dialog open={validationDialogOpen} onOpenChange={setValidationDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Détails de l&apos;inscription</DialogTitle>
            <DialogDescription>
              Examinez les informations et validez ou rejetez la demande
            </DialogDescription>
          </DialogHeader>

          {selectedRegistration && (
            <div className="space-y-6">
              {/* Personal Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Informations Personnelles</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start gap-4">
                    <Avatar className="size-16">
                      <AvatarFallback className="bg-primary text-primary-foreground text-lg">
                        {selectedRegistration.fullName
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Nom complet</p>
                        <p className="font-medium">{selectedRegistration.fullName}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Genre</p>
                        <p className="font-medium capitalize">
                          {selectedRegistration.gender === "male" ? "Homme" : "Femme"}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Date de naissance</p>
                        <p className="font-medium">
                          {new Date(selectedRegistration.dateOfBirth).toLocaleDateString("fr-FR")}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Nationalité</p>
                        <p className="font-medium">{selectedRegistration.nationality}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Email</p>
                        <div className="flex items-center gap-1">
                          <Mail className="size-3" />
                          <p className="font-medium">{selectedRegistration.email}</p>
                        </div>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Téléphone</p>
                        <div className="flex items-center gap-1">
                          <Phone className="size-3" />
                          <p className="font-medium">{selectedRegistration.phone}</p>
                        </div>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Ville</p>
                        <div className="flex items-center gap-1">
                          <MapPin className="size-3" />
                          <p className="font-medium">{selectedRegistration.city}</p>
                        </div>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Région</p>
                        <p className="font-medium capitalize">{selectedRegistration.region}</p>
                      </div>
                      <div className="col-span-2">
                        <p className="text-xs text-muted-foreground mb-1">Langues parlées</p>
                        <div className="flex flex-wrap gap-1">
                          {selectedRegistration.languages.map((lang) => (
                            <Badge key={lang} variant="outline" className="text-xs">
                              {lang}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Professional Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Informations Professionnelles</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {selectedRegistration.professionalType === "doctor" ? (
                    <>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Numéro de licence</p>
                          <p className="font-medium">{selectedRegistration.medicalLicenseNumber}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Autorité d&apos;émission</p>
                          <p className="font-medium">
                            {selectedRegistration.issuingAuthority === "onmc"
                              ? "Ordre National des Médecins du Cameroun (ONMC)"
                              : ""}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Année d&apos;enregistrement</p>
                          <p className="font-medium">{selectedRegistration.yearOfRegistration}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Statut de la licence</p>
                          <Badge
                            variant={
                              selectedRegistration.licenseStatus === "active"
                                ? "default"
                                : "secondary"
                            }
                          >
                            {selectedRegistration.licenseStatus === "active"
                              ? "Active"
                              : selectedRegistration.licenseStatus}
                          </Badge>
                        </div>
                      </div>
                      {selectedRegistration.documents.licenseDocument && (
                        <div className="flex items-center gap-2 p-2 bg-muted/50 rounded">
                          <FileText className="size-4" />
                          <span className="text-sm">{selectedRegistration.documents.licenseDocument}</span>
                          <Button variant="ghost" size="sm" className="ml-auto">
                            <Download className="size-3" />
                          </Button>
                        </div>
                      )}
                    </>
                  ) : (
                    <>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Numéro de licence</p>
                          <p className="font-medium">{selectedRegistration.nursingLicenseNumber}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Autorité d&apos;émission</p>
                          <p className="font-medium">
                            {selectedRegistration.nursingIssuingAuthority === "msp"
                              ? "Ministère de la Santé Publique"
                              : "Cameroon Nurses Association"}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Certificat de qualification</p>
                          <p className="font-medium">
                            {selectedRegistration.qualificationCertificate || "N/A"}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Statut de la licence</p>
                          <Badge
                            variant={
                              selectedRegistration.nursingLicenseStatus === "active"
                                ? "default"
                                : "secondary"
                            }
                          >
                            {selectedRegistration.nursingLicenseStatus === "active"
                              ? "Active"
                              : selectedRegistration.nursingLicenseStatus}
                          </Badge>
                        </div>
                      </div>
                      {selectedRegistration.documents.certificateDocument && (
                        <div className="flex items-center gap-2 p-2 bg-muted/50 rounded">
                          <FileText className="size-4" />
                          <span className="text-sm">
                            {selectedRegistration.documents.certificateDocument}
                          </span>
                          <Button variant="ghost" size="sm" className="ml-auto">
                            <Download className="size-3" />
                          </Button>
                        </div>
                      )}
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Validation Form */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Assignation</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-xs text-muted-foreground mb-2">Rôle à assigner *</p>
                    <Select
                      value={validationData.role}
                      onValueChange={(value) => setValidationData({ ...validationData, role: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner un rôle" />
                      </SelectTrigger>
                      <SelectContent>
                        {selectedRegistration.professionalType === "doctor" ? (
                          <>
                            <SelectItem value="doctor">Médecin</SelectItem>
                          </>
                        ) : (
                          <>
                            <SelectItem value="nurse">Infirmier(ère)</SelectItem>
                            <SelectItem value="superior_nurse">Infirmier(ère) Supérieur(e)</SelectItem>
                          </>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-2">Centre à assigner *</p>
                    <Select
                      value={validationData.center}
                      onValueChange={(value) => setValidationData({ ...validationData, center: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner un centre" />
                      </SelectTrigger>
                      <SelectContent>
                        {mockCenters.map((center) => (
                          <SelectItem key={center.id} value={center.id}>
                            {center.name} ({center.code})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-2">Réseau associé</p>
                    <Select
                      value={validationData.network}
                      onValueChange={(value) => setValidationData({ ...validationData, network: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner un réseau (optionnel)" />
                      </SelectTrigger>
                      <SelectContent>
                        {mockNetworks.map((network) => (
                          <SelectItem key={network.id} value={network.id}>
                            {network.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-2">Notes (optionnel)</p>
                    <Input
                      placeholder="Ajouter des notes..."
                      value={validationData.notes}
                      onChange={(e) => setValidationData({ ...validationData, notes: e.target.value })}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setValidationDialogOpen(false);
                setSelectedRegistration(null);
              }}
            >
              Annuler
            </Button>
            <Button
              variant="destructive"
              onClick={() => handleValidate(false)}
            >
              <XCircle className="size-4 mr-2" />
              Rejeter
            </Button>
            <Button onClick={() => handleValidate(true)}>
              <CheckCircle className="size-4 mr-2" />
              Valider et Assigner
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}







