"use client";

import { useState, useMemo } from "react";
import { EnhancedNurseDashboardHeader } from "@/components/nurse/enhanced-dashboard-header";
import { FloatingHelpButton } from "@/components/nurse/floating-help-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Search,
    Filter,
    Eye,
    Printer,
    Mail,
    Download,
    X,
    FileText,
    AlertCircle,
    Send,
    MessageCircle,
    File,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { useConsultationsQuery, useReportsQuery, usePrescriptionsQuery } from "@/hooks/queries";
import type { Consultation as ApiConsultation, Prescription, Report } from "@/types/api";

type DocumentType = "ordonnance" | "examen" | "transfert" | "signed";

type DocumentStatus = "non-traite" | "imprime" | "envoye" | "telecharge";

type Document = {
    id: string;
    type: DocumentType;
    title: string;
    priority: "normal" | "urgent";
    creationDate: string;
    status: DocumentStatus;
    consultationId: string;
    patientId: string;
    patientName: string;
};

type Consultation = {
    id: string;
    patientName: string;
    patientCode: string;
    specialty: string;
    doctor: string;
    date: string;
    time: string;
    documents: Document[];
};

type SignedDocument = {
    id: string;
    type: string;
    patientName: string;
    date: string;
    status: string;
};

function prescriptionToDocument(p: Prescription, patientName: string): Document {
    return {
        id: p.id,
        type: "ordonnance",
        title: `Ordonnance - ${p.medications?.length ?? 0} médicament(s)`,
        priority: "normal",
        creationDate: p.createdAt.split("T")[0],
        status: p.status === "dispensed" ? "envoye" : "non-traite",
        consultationId: p.consultationId,
        patientId: p.patientId,
        patientName: patientName || p.patientId,
    };
}

function reportToDocument(r: Report, patientName: string): Document {
    return {
        id: r.id,
        type: r.type === "consultation" ? "ordonnance" : r.type === "lab" || r.type === "imaging" ? "examen" : "transfert",
        title: r.title,
        priority: "normal",
        creationDate: r.createdAt.split("T")[0],
        status: r.status === "final" ? "envoye" : "non-traite",
        consultationId: r.consultationId || "",
        patientId: r.patientId,
        patientName: patientName || r.patientId,
    };
}

function mapApiConsultation(
    c: ApiConsultation,
    prescriptions: Prescription[],
    reports: Report[]
): Consultation {
    const dateObj = new Date(c.scheduledAt || c.createdAt);
    const patientName = c.patient ? `${c.patient.firstName} ${c.patient.lastName}` : c.patientId;
    const consPrescriptions = prescriptions.filter((p) => p.consultationId === c.id);
    const consReports = reports.filter((r) => r.consultationId === c.id);
    const documents: Document[] = [
        ...consPrescriptions.map((p) => prescriptionToDocument(p, patientName)),
        ...consReports.map((r) => reportToDocument(r, patientName)),
    ];
    return {
        id: c.id,
        patientName,
        patientCode: c.patientId,
        specialty: c.specialtyId || "Généraliste",
        doctor: c.doctor ? c.doctor.name : c.doctorId,
        date: dateObj.toISOString().split("T")[0],
        time: dateObj.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }),
        documents,
    };
}

export default function PostConsultationPage() {
    const { data: apiConsultations = [] } = useConsultationsQuery();
    const { data: apiReports = [] } = useReportsQuery();
    const { data: apiPrescriptions = [] } = usePrescriptionsQuery();
    const consultations = useMemo(
        () =>
            apiConsultations
                .filter((c) => c.status === "completed")
                .map((c) => mapApiConsultation(c, apiPrescriptions, apiReports)),
        [apiConsultations, apiPrescriptions, apiReports]
    );
    const signedDocuments: SignedDocument[] = useMemo(
        () =>
            apiReports
                .filter((r) => r.status === "final" || r.status === "amended")
                .map((r) => ({
                    id: r.id,
                    type: r.type || "Rapport",
                    patientName: r.patient ? `${r.patient.firstName} ${r.patient.lastName}` : r.patientId,
                    date: new Date(r.createdAt).toISOString().split("T")[0],
                    status: "Signé",
                })),
        [apiReports]
    );

    const [searchQuery, setSearchQuery] = useState("");
    const [sortBy, setSortBy] = useState("date");
    const [activeTab, setActiveTab] = useState<"all" | "ordonnances" | "examens" | "transferts" | "historique">("all");
    const [filtersOpen, setFiltersOpen] = useState(false);
    const [dateRange, setDateRange] = useState({ start: "", end: "" });
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
    const [previewOpen, setPreviewOpen] = useState(false);

    // Get all documents from consultations
    const allDocuments = consultations.flatMap(c => 
        c.documents.map(d => ({ ...d, consultation: c }))
    );

    // Filter documents based on active tab
    let filteredDocuments = allDocuments.filter(doc => {
        if (activeTab === "ordonnances" && doc.type !== "ordonnance") return false;
        if (activeTab === "examens" && doc.type !== "examen") return false;
        if (activeTab === "transferts" && doc.type !== "transfert") return false;
        if (activeTab === "historique") return false;
        return true;
    });

    // Filter by search and status
    filteredDocuments = filteredDocuments.filter(doc => {
        const matchesSearch = doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            doc.patientName.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === "all" || doc.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    // Sort documents
    filteredDocuments.sort((a, b) => {
        if (sortBy === "date") {
            return new Date(b.creationDate).getTime() - new Date(a.creationDate).getTime();
        }
        if (sortBy === "urgence") {
            if (a.priority === "urgent" && b.priority !== "urgent") return -1;
            if (a.priority !== "urgent" && b.priority === "urgent") return 1;
            return 0;
        }
        return 0;
    });

    const getStatusBadge = (status: DocumentStatus) => {
        switch (status) {
            case "non-traite":
                return <Badge variant="secondary">Non traité</Badge>;
            case "imprime":
                return <Badge variant="default">Imprimé</Badge>;
            case "envoye":
                return <Badge variant="default" className="bg-green-500">Envoyé</Badge>;
            case "telecharge":
                return <Badge variant="outline">Téléchargé</Badge>;
            default:
                return <Badge variant="secondary">{status}</Badge>;
        }
    };

    const getStatusColor = (status: DocumentStatus) => {
        switch (status) {
            case "non-traite":
                return "text-gray-500";
            case "imprime":
                return "text-blue-500";
            case "envoye":
                return "text-green-500";
            case "telecharge":
                return "text-purple-500";
            default:
                return "text-gray-500";
        }
    };

    const handlePreview = (document: Document) => {
        setSelectedDocument(document);
        setPreviewOpen(true);
    };

    const handlePrint = (document: Document) => {
        console.log("Printing document:", document.id);
        // In a real app, this would trigger print dialog
    };

    const handleSend = (document: Document, method: "email" | "whatsapp" | "app") => {
        console.log(`Sending document ${document.id} via ${method}`);
        // In a real app, this would send the document
    };

    const handleDownload = (document: Document) => {
        console.log("Downloading document:", document.id);
        // In a real app, this would download the PDF
    };

    const groupedByConsultation = consultations.filter(c => 
        c.documents.some(d => filteredDocuments.some(fd => fd.id === d.id))
    );

    return (
        <div className="flex flex-col h-full">
            <EnhancedNurseDashboardHeader
                nurseName="Sophie Ateba"
                clinic="Centre Principal - Yaoundé"
                clinicCode="CPY-001"
                clinicType="Centre Principal"
            />

            <div className="flex-1 p-6 space-y-6 overflow-y-auto">
                {/* Header */}
                <div>
                    <h1 className="text-2xl font-bold text-primary">Gestion Post-Consultation</h1>
                    <p className="text-muted-foreground">
                        Gérez les documents et suivez leur statut après les consultations
                    </p>
                </div>

                {/* Search and Filters Bar */}
                <Card>
                    <CardContent className="p-4">
                        <div className="flex flex-col md:flex-row gap-4">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                                <Input
                                    placeholder="Rechercher un patient ou un document..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-9"
                                />
                            </div>
                            <Select value={sortBy} onValueChange={setSortBy}>
                                <SelectTrigger className="w-full md:w-[180px]">
                                    <SelectValue placeholder="Trier par" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="date">Date</SelectItem>
                                    <SelectItem value="urgence">Urgence</SelectItem>
                                </SelectContent>
                            </Select>
                            <Button
                                variant="outline"
                                onClick={() => setFiltersOpen(!filtersOpen)}
                            >
                                <Filter className="size-4 mr-2" />
                                Filtres
                            </Button>
                        </div>

                        {/* Advanced Filters */}
                        {filtersOpen && (
                            <div className="mt-4 pt-4 border-t space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <Label>Date de début</Label>
                                        <Input
                                            type="date"
                                            value={dateRange.start}
                                            onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <Label>Date de fin</Label>
                                        <Input
                                            type="date"
                                            value={dateRange.end}
                                            onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <Label>Statut</Label>
                                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">Tous</SelectItem>
                                            <SelectItem value="non-traite">Non traité</SelectItem>
                                            <SelectItem value="imprime">Imprimé</SelectItem>
                                            <SelectItem value="envoye">Envoyé</SelectItem>
                                            <SelectItem value="telecharge">Téléchargé</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="flex gap-2">
                                    <Button onClick={() => {
                                        setDateRange({ start: "", end: "" });
                                        setStatusFilter("all");
                                    }}>
                                        Réinitialiser
                                    </Button>
                                    <Button onClick={() => setFiltersOpen(false)}>
                                        Appliquer
                                    </Button>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Tabs */}
                <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
                    <TabsList>
                        <TabsTrigger value="all">Tous</TabsTrigger>
                        <TabsTrigger value="ordonnances">Ordonnances</TabsTrigger>
                        <TabsTrigger value="examens">Examens</TabsTrigger>
                        <TabsTrigger value="transferts">Transferts</TabsTrigger>
                        <TabsTrigger value="historique">Historique signés</TabsTrigger>
                    </TabsList>

                    {/* Documents List */}
                    <TabsContent value={activeTab} className="space-y-4">
                        {activeTab !== "historique" ? (
                            <>
                                {groupedByConsultation.map((consultation) => (
                                    <Card key={consultation.id}>
                                        <CardHeader>
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <CardTitle className="flex items-center gap-2">
                                                        <Avatar className="size-8">
                                                            <AvatarFallback>
                                                                {consultation.patientName.split(" ").map(n => n[0]).join("").slice(0, 2)}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        {consultation.patientName}
                                                        <span className="text-sm font-normal text-muted-foreground">
                                                            ({consultation.patientCode})
                                                        </span>
                                                    </CardTitle>
                                                    <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                                                        <span>{consultation.specialty}</span>
                                                        <span>•</span>
                                                        <span>{consultation.doctor}</span>
                                                        <span>•</span>
                                                        <span>{consultation.date} à {consultation.time}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="space-y-3">
                                                {consultation.documents
                                                    .filter(d => filteredDocuments.some(fd => fd.id === d.id))
                                                    .map((document) => (
                                                        <div
                                                            key={document.id}
                                                            className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                                                        >
                                                            <div className="flex items-center gap-4 flex-1">
                                                                <FileText className={`size-5 ${getStatusColor(document.status)}`} />
                                                                <div className="flex-1">
                                                                    <div className="flex items-center gap-2">
                                                                        <p className="font-medium">{document.title}</p>
                                                                        {document.priority === "urgent" && (
                                                                            <AlertCircle className="size-4 text-orange-500" />
                                                                        )}
                                                                    </div>
                                                                    <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                                                                        <span>{document.creationDate}</span>
                                                                        {getStatusBadge(document.status)}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    onClick={() => handlePreview(document)}
                                                                >
                                                                    <Eye className="size-4" />
                                                                </Button>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    onClick={() => handlePrint(document)}
                                                                >
                                                                    <Printer className="size-4" />
                                                                </Button>
                                                                <DropdownMenu>
                                                                    <DropdownMenuTrigger asChild>
                                                                        <Button variant="ghost" size="icon">
                                                                            <Send className="size-4" />
                                                                        </Button>
                                                                    </DropdownMenuTrigger>
                                                                    <DropdownMenuContent>
                                                                        <DropdownMenuItem onClick={() => handleSend(document, "email")}>
                                                                            <Mail className="size-4 mr-2" />
                                                                            Email
                                                                        </DropdownMenuItem>
                                                                        <DropdownMenuItem onClick={() => handleSend(document, "whatsapp")}>
                                                                            <MessageCircle className="size-4 mr-2" />
                                                                            WhatsApp
                                                                        </DropdownMenuItem>
                                                                        <DropdownMenuItem onClick={() => handleSend(document, "app")}>
                                                                            <File className="size-4 mr-2" />
                                                                            App Patient
                                                                        </DropdownMenuItem>
                                                                    </DropdownMenuContent>
                                                                </DropdownMenu>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    onClick={() => handleDownload(document)}
                                                                >
                                                                    <Download className="size-4" />
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    ))}
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </>
                        ) : (
                            /* Signed Documents History */
                            <Card>
                                <CardHeader>
                                    <CardTitle>Documents signés</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Type</TableHead>
                                                <TableHead>Patient</TableHead>
                                                <TableHead>Date</TableHead>
                                                <TableHead>Statut</TableHead>
                                                <TableHead className="text-right">Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {signedDocuments.map((doc) => (
                                                <TableRow key={doc.id}>
                                                    <TableCell className="font-medium">{doc.type}</TableCell>
                                                    <TableCell>{doc.patientName}</TableCell>
                                                    <TableCell>{doc.date}</TableCell>
                                                    <TableCell>
                                                        <Badge variant="default" className="bg-green-500">
                                                            {doc.status}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <div className="flex items-center justify-end gap-2">
                                                            <Button variant="ghost" size="icon">
                                                                <Eye className="size-4" />
                                                            </Button>
                                                            <Button variant="ghost" size="icon">
                                                                <Download className="size-4" />
                                                            </Button>
                                                            <Button variant="ghost" size="icon">
                                                                <Printer className="size-4" />
                                                            </Button>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </CardContent>
                            </Card>
                        )}
                    </TabsContent>
                </Tabs>
            </div>

            {/* Document Preview Modal */}
            <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
                <DialogContent className="max-w-4xl max-h-[90vh]">
                    <DialogHeader>
                        <DialogTitle>
                            {selectedDocument?.title}
                        </DialogTitle>
                        <DialogDescription>
                            {selectedDocument?.patientName} • {selectedDocument?.creationDate}
                        </DialogDescription>
                    </DialogHeader>

                    {selectedDocument && (
                        <div className="space-y-4">
                            <ScrollArea className="h-[500px] border rounded-lg p-4">
                                <div className="space-y-4">
                                    <div>
                                        <h3 className="font-semibold mb-2">Document Preview</h3>
                                        <p className="text-sm text-muted-foreground">
                                            Le contenu du document apparaîtra ici. Dans une application réelle,
                                            cela afficherait le PDF ou le contenu formaté du document.
                                        </p>
                                    </div>
                                    <Separator />
                                    <div className="space-y-2">
                                        <p><strong>Type:</strong> {selectedDocument.type}</p>
                                        <p><strong>Patient:</strong> {selectedDocument.patientName}</p>
                                        <p><strong>Date de création:</strong> {selectedDocument.creationDate}</p>
                                        <p><strong>Statut:</strong> {selectedDocument.status}</p>
                                    </div>
                                </div>
                            </ScrollArea>

                            <div className="flex items-center justify-between pt-4 border-t">
                                <div className="flex gap-2">
                                    <Button variant="outline" onClick={() => handlePrint(selectedDocument)}>
                                        <Printer className="size-4 mr-2" />
                                        Imprimer
                                    </Button>
                                    <Button variant="outline" onClick={() => handleDownload(selectedDocument)}>
                                        <Download className="size-4 mr-2" />
                                        Télécharger PDF
                                    </Button>
                                </div>
                                <div className="flex gap-2">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="outline">
                                                <Send className="size-4 mr-2" />
                                                Envoyer
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent>
                                            <DropdownMenuItem onClick={() => handleSend(selectedDocument, "email")}>
                                                <Mail className="size-4 mr-2" />
                                                Par Email
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => handleSend(selectedDocument, "whatsapp")}>
                                                <MessageCircle className="size-4 mr-2" />
                                                Par WhatsApp
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => handleSend(selectedDocument, "app")}>
                                                <File className="size-4 mr-2" />
                                                Par App Patient
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                    <Button variant="outline" onClick={() => setPreviewOpen(false)}>
                                        <X className="size-4 mr-2" />
                                        Fermer
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* Floating Help Button */}
            <FloatingHelpButton />
        </div>
    );
}


