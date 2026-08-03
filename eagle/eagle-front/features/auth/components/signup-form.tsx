"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { UserPlus, Upload, FileText, MapPin, Phone, Mail, CheckCircle2, EyeOff, Eye, Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
// import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
// import { Badge } from "@/components/ui/badge";

type SignupFormData = {
  // Personal Information
  fullName: string;
  gender: string;
  dateOfBirth: string;
  nationality: string;
  phone: string;
  email: string;
  city: string;
  region: string;
  languages: string[];
  maritalStatus: string;
  whatsapp: string;
  
  // Professional Type
  professionalType: "doctor" | "nurse" | "";
  
  // For Doctors
  medicalLicenseNumber: string;
  issuingAuthority: string;
  yearOfRegistration: string;
  licenseStatus: string;
  
  // For Nurses
  nursingLicenseNumber: string;
  nursingIssuingAuthority: string;
  qualificationCertificate: string;
  nursingLicenseStatus: string;
  
  // Files
  profilePhoto: File | null;
  licenseDocument: File | null;
  certificateDocument: File | null;
};

export function SignupForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentTab, setCurrentTab] = useState("personal");
  const [formData, setFormData] = useState<SignupFormData>({
    fullName: "",
    gender: "",
    dateOfBirth: "",
    nationality: "",
    phone: "",
    email: "",
    city: "",
    region: "",
    languages: [],
    maritalStatus: "",
    whatsapp: "",
    professionalType: "",
    medicalLicenseNumber: "",
    issuingAuthority: "",
    yearOfRegistration: "",
    licenseStatus: "",
    nursingLicenseNumber: "",
    nursingIssuingAuthority: "",
    qualificationCertificate: "",
    nursingLicenseStatus: "",
    profilePhoto: null,
    licenseDocument: null,
    certificateDocument: null,
  });

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const languagesOptions = ["Français", "English", "Pidgin", "Bassa", "Duala", "Ewondo", "Fulfulde"];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updateField = (field: keyof SignupFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const toggleLanguage = (language: string) => {
    setFormData(prev => ({
      ...prev,
      languages: prev.languages.includes(language)
        ? prev.languages.filter(l => l !== language)
        : [...prev.languages, language]
    }));
  };

  const handleFileUpload = (field: "profilePhoto" | "licenseDocument" | "certificateDocument", file: File | null) => {
    updateField(field, file);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Validate passwords match
    if (password !== confirmPassword) {
      alert("Les mots de passe ne correspondent pas");
      setIsLoading(false);
      return;
    }

    // Validate required fields based on professional type
    if (formData.professionalType === "doctor") {
      if (!formData.medicalLicenseNumber || !formData.issuingAuthority || !formData.yearOfRegistration) {
        alert("Veuillez remplir tous les champs obligatoires pour les médecins");
        setIsLoading(false);
        return;
      }
    } else if (formData.professionalType === "nurse") {
      if (!formData.nursingLicenseNumber || !formData.nursingIssuingAuthority) {
        alert("Veuillez remplir tous les champs obligatoires pour les infirmiers");
        setIsLoading(false);
        return;
      }
    }

    // In a real app, this would submit to the backend
    console.log("Signup data:", { ...formData, password });
    
    setTimeout(() => {
      setIsLoading(false);
      // Show success message and redirect
      alert("Votre demande d'inscription a été soumise avec succès. Un administrateur validera votre compte sous peu.");
      router.push("/login?signup=success");
    }, 2000);
  };

  const canProceedToLicense = () => {
    return (
      formData.fullName &&
      formData.gender &&
      formData.dateOfBirth &&
      formData.nationality &&
      formData.phone &&
      formData.email &&
      formData.city &&
      formData.region &&
      formData.languages.length > 0 &&
      password &&
      confirmPassword
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="personal">Identification Personnelle</TabsTrigger>
          <TabsTrigger value="license" disabled={!canProceedToLicense()}>
            Licence & Vérification
          </TabsTrigger>
        </TabsList>

        {/* Personal Identification Tab */}
        <TabsContent value="personal" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserPlus className="size-5" />
                Informations Personnelles
              </CardTitle>
              <CardDescription>
                Remplissez vos informations de base (tous les champs marqués * sont obligatoires)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Full Name */}
              <div>
                <Label htmlFor="fullName">
                  Nom complet (tel que sur les documents officiels) *
                </Label>
                <Input
                  id="fullName"
                  value={formData.fullName}
                  onChange={(e) => updateField("fullName", e.target.value)}
                  placeholder="Jean Dupont"
                  required
                  className="mt-1"
                />
              </div>

              {/* Gender and Date of Birth */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="gender">Genre *</Label>
                  <Select value={formData.gender} onValueChange={(value) => updateField("gender", value)}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Sélectionner" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Homme</SelectItem>
                      <SelectItem value="female">Femme</SelectItem>
                      <SelectItem value="other">Autre</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="dateOfBirth">Date de naissance / Âge *</Label>
                  <Input
                    id="dateOfBirth"
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) => updateField("dateOfBirth", e.target.value)}
                    required
                    className="mt-1"
                  />
                </div>
              </div>

              {/* Nationality and Phone */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="nationality">Nationalité *</Label>
                  <Input
                    id="nationality"
                    value={formData.nationality}
                    onChange={(e) => updateField("nationality", e.target.value)}
                    placeholder="Camerounais(e)"
                    required
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Numéro de téléphone *</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Phone className="size-4 text-muted-foreground" />
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => updateField("phone", e.target.value)}
                      placeholder="+237 6XX XXX XXX"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Email */}
              <div>
                <Label htmlFor="email">Adresse email *</Label>
                <div className="flex items-center gap-2 mt-1">
                  <Mail className="size-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => updateField("email", e.target.value)}
                    placeholder="vous@exemple.cm"
                    required
                  />
                </div>
              </div>

              {/* City and Region */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="city">Ville de résidence *</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <MapPin className="size-4 text-muted-foreground" />
                    <Input
                      id="city"
                      value={formData.city}
                      onChange={(e) => updateField("city", e.target.value)}
                      placeholder="Douala"
                      required
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="region">Région de résidence *</Label>
                  <Select value={formData.region} onValueChange={(value) => updateField("region", value)}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Sélectionner une région" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="adamaoua">Adamaoua</SelectItem>
                      <SelectItem value="centre">Centre</SelectItem>
                      <SelectItem value="est">Est</SelectItem>
                      <SelectItem value="extreme-nord">Extrême-Nord</SelectItem>
                      <SelectItem value="littoral">Littoral</SelectItem>
                      <SelectItem value="nord">Nord</SelectItem>
                      <SelectItem value="nord-ouest">Nord-Ouest</SelectItem>
                      <SelectItem value="ouest">Ouest</SelectItem>
                      <SelectItem value="sud">Sud</SelectItem>
                      <SelectItem value="sud-ouest">Sud-Ouest</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Languages Spoken */}
              <div>
                <Label>Langues parlées *</Label>
                <p className="text-sm text-muted-foreground mb-2">
                  Sélectionnez toutes les langues que vous parlez
                </p>
                <div className="flex flex-wrap gap-2 mt-1">
                  {languagesOptions.map((lang) => (
                    <Button
                      key={lang}
                      type="button"
                      variant={formData.languages.includes(lang) ? "default" : "outline"}
                      size="sm"
                      onClick={() => toggleLanguage(lang)}
                    >
                      {lang}
                      {formData.languages.includes(lang) && (
                        <CheckCircle2 className="size-3 ml-1" />
                      )}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Profile Photo */}
              <div>
                <Label htmlFor="profilePhoto">Photo de profil professionnelle *</Label>
                <div className="mt-2 border-2 border-dashed rounded-lg p-6 text-center">
                  {formData.profilePhoto ? (
                    <div className="space-y-2">
                      <FileText className="size-8 mx-auto text-primary" />
                      <p className="text-sm font-medium">{formData.profilePhoto.name}</p>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleFileUpload("profilePhoto", null)}
                      >
                        Changer
                      </Button>
                    </div>
                  ) : (
                    <>
                      <Camera className="size-8 mx-auto text-muted-foreground mb-2" />
                      <p className="text-sm text-muted-foreground mb-2">
                        Cliquez pour télécharger une photo
                      </p>
                      <Input
                        id="profilePhoto"
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0] || null;
                          handleFileUpload("profilePhoto", file);
                        }}
                        className="hidden"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => document.getElementById("profilePhoto")?.click()}
                      >
                        <Upload className="size-4 mr-2" />
                        Choisir une photo
                      </Button>
                      <p className="text-xs text-muted-foreground mt-2">
                        JPG, PNG (max 5MB)
                      </p>
                    </>
                  )}
                </div>
              </div>

              <Separator />

              {/* Optional Fields */}
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-muted-foreground">Champs optionnels</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="maritalStatus">Statut matrimonial</Label>
                    <Select value={formData.maritalStatus} onValueChange={(value) => updateField("maritalStatus", value)}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Sélectionner" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="single">Célibataire</SelectItem>
                        <SelectItem value="married">Marié(e)</SelectItem>
                        <SelectItem value="divorced">Divorcé(e)</SelectItem>
                        <SelectItem value="widowed">Veuf(ve)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="whatsapp">Numéro WhatsApp</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <Phone className="size-4 text-muted-foreground" />
                      <Input
                        id="whatsapp"
                        type="tel"
                        value={formData.whatsapp}
                        onChange={(e) => updateField("whatsapp", e.target.value)}
                        placeholder="+237 6XX XXX XXX"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Password Fields */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="password">Mot de passe *</Label>
                  <div className="relative mt-1">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <div>
                  <Label htmlFor="confirmPassword">Confirmer le mot de passe *</Label>
                  <div className="relative mt-1">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Licensing & Verification Tab */}
        <TabsContent value="license" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="size-5" />
                Licence & Vérification
              </CardTitle>
              <CardDescription>
                Sélectionnez votre type de profession et remplissez les informations de licence
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Professional Type Selection */}
              <div>
                <Label>Type de profession *</Label>
                <div className="grid grid-cols-2 gap-4 mt-2">
                  <Button
                    type="button"
                    variant={formData.professionalType === "doctor" ? "default" : "outline"}
                    className="h-auto py-4 flex flex-col items-center gap-2"
                    onClick={() => updateField("professionalType", "doctor")}
                  >
                    <FileText className="size-6" />
                    <span className="font-medium">Médecin</span>
                  </Button>
                  <Button
                    type="button"
                    variant={formData.professionalType === "nurse" ? "default" : "outline"}
                    className="h-auto py-4 flex flex-col items-center gap-2"
                    onClick={() => updateField("professionalType", "nurse")}
                  >
                    <FileText className="size-6" />
                    <span className="font-medium">Infirmier(ère) / Sage-femme</span>
                  </Button>
                </div>
              </div>

              <Separator />

              {/* Doctor License Information */}
              {formData.professionalType === "doctor" && (
                <div className="space-y-4">
                  <h3 className="font-medium">Informations de licence médicale</h3>
                  
                  <div>
                    <Label htmlFor="medicalLicenseNumber">Numéro de licence médicale *</Label>
                    <Input
                      id="medicalLicenseNumber"
                      value={formData.medicalLicenseNumber}
                      onChange={(e) => updateField("medicalLicenseNumber", e.target.value)}
                      placeholder="CM-DOC-2024-001"
                      required
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="issuingAuthority">Autorité &apos;émission&apos; *</Label>
                    <Select value={formData.issuingAuthority} onValueChange={(value) => updateField("issuingAuthority", value)}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Sélectionner" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="onmc">Ordre National des Médecins du Cameroun (ONMC)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="yearOfRegistration">Année &apos;enregistrement&apos; *</Label>
                      <Input
                        id="yearOfRegistration"
                        type="number"
                        value={formData.yearOfRegistration}
                        onChange={(e) => updateField("yearOfRegistration", e.target.value)}
                        placeholder="2024"
                        min="1950"
                        max={new Date().getFullYear()}
                        required
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="licenseStatus">Statut de la licence *</Label>
                      <Select value={formData.licenseStatus} onValueChange={(value) => updateField("licenseStatus", value)}>
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Sélectionner" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="suspended">Suspendue</SelectItem>
                          <SelectItem value="expired">Expirée</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="licenseDocument">Téléverser le document de licence *</Label>
                    <div className="mt-2 border-2 border-dashed rounded-lg p-6 text-center">
                      {formData.licenseDocument ? (
                        <div className="space-y-2">
                          <FileText className="size-8 mx-auto text-primary" />
                          <p className="text-sm font-medium">{formData.licenseDocument.name}</p>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => handleFileUpload("licenseDocument", null)}
                          >
                            Changer
                          </Button>
                        </div>
                      ) : (
                        <>
                          <Upload className="size-8 mx-auto text-muted-foreground mb-2" />
                          <p className="text-sm text-muted-foreground mb-2">
                            PDF ou Image (max 10MB)
                          </p>
                          <Input
                            id="licenseDocument"
                            type="file"
                            accept=".pdf,image/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0] || null;
                              handleFileUpload("licenseDocument", file);
                            }}
                            className="hidden"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => document.getElementById("licenseDocument")?.click()}
                          >
                            <Upload className="size-4 mr-2" />
                            Choisir un fichier
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Nurse License Information */}
              {formData.professionalType === "nurse" && (
                <div className="space-y-4">
                  <h3 className="font-medium">Informations de licence infirmière</h3>
                  
                  <div>
                    <Label htmlFor="nursingLicenseNumber">Numéro de licence ou &apos;enregistrement&apos; *</Label>
                    <Input
                      id="nursingLicenseNumber"
                      value={formData.nursingLicenseNumber}
                      onChange={(e) => updateField("nursingLicenseNumber", e.target.value)}
                      placeholder="CM-NUR-2024-001"
                      required
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="nursingIssuingAuthority">Autorité &apos;émission&apos; *</Label>
                    <Select value={formData.nursingIssuingAuthority} onValueChange={(value) => updateField("nursingIssuingAuthority", value)}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Sélectionner" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="msp">Ministère de la Santé Publique</SelectItem>
                        <SelectItem value="cna">Cameroon Nurses Association</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="qualificationCertificate">Certificat de qualification (Diplôme/Degré)</Label>
                    <Input
                      id="qualificationCertificate"
                      value={formData.qualificationCertificate}
                      onChange={(e) => updateField("qualificationCertificate", e.target.value)}
                      placeholder="BTS, Licence, Master..."
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="nursingLicenseStatus">Statut de la licence *</Label>
                    <Select value={formData.nursingLicenseStatus} onValueChange={(value) => updateField("nursingLicenseStatus", value)}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Sélectionner" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="suspended">Suspendue</SelectItem>
                        <SelectItem value="expired">Expirée</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="certificateDocument">Téléverser le document de licence ou certificat *</Label>
                    <div className="mt-2 border-2 border-dashed rounded-lg p-6 text-center">
                      {formData.certificateDocument ? (
                        <div className="space-y-2">
                          <FileText className="size-8 mx-auto text-primary" />
                          <p className="text-sm font-medium">{formData.certificateDocument.name}</p>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => handleFileUpload("certificateDocument", null)}
                          >
                            Changer
                          </Button>
                        </div>
                      ) : (
                        <>
                          <Upload className="size-8 mx-auto text-muted-foreground mb-2" />
                          <p className="text-sm text-muted-foreground mb-2">
                            PDF ou Image (max 10MB)
                          </p>
                          <Input
                            id="certificateDocument"
                            type="file"
                            accept=".pdf,image/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0] || null;
                              handleFileUpload("certificateDocument", file);
                            }}
                            className="hidden"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => document.getElementById("certificateDocument")?.click()}
                          >
                            <Upload className="size-4 mr-2" />
                            Choisir un fichier
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {!formData.professionalType && (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="size-12 mx-auto mb-2 opacity-50" />
                  <p>Veuillez sélectionner votre type de profession ci-dessus</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Submit Button */}
      <div className="flex items-center justify-between pt-4">
        <Link href="/login" className="text-sm text-muted-foreground hover:text-foreground">
          Déjà un compte ? Se connecter
        </Link>
        <Button
          type="submit"
          className="bg-primary hover:bg-primary/90"
          disabled={isLoading || !canProceedToLicense() || !formData.professionalType}
        >
          {isLoading ? (
            "Envoi en cours..."
          ) : (
            <>
              Soumettre la demande
              <UserPlus className="w-4 h-4 ml-2" />
            </>
          )}
        </Button>
      </div>

      <p className="text-xs text-center text-muted-foreground">
        En soumettant ce formulaire, vous acceptez que votre demande soit examinée par un administrateur.
        Vous recevrez un email une fois votre compte validé.
      </p>
    </form>
  );
}







