"use client";

import { useState, useMemo } from "react";
import { EnhancedNurseDashboardHeader } from "@/components/nurse/enhanced-dashboard-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
    HelpCircle,
    Search,
    Book,
    Video,
    Mail,
    MessageSquare,
    Phone,
    FileText,
    ChevronRight,
} from "lucide-react";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { useFaqsQuery, useFaqSearchQuery } from "@/hooks/queries";

const CATEGORY_LABELS: Record<string, string> = {
    general: "Général",
    account: "Compte",
    consultations: "Consultations",
    urgencies: "Urgences",
    prescriptions: "Ordonnances",
    technical: "Technique",
    billing: "Facturation",
    privacy: "Confidentialité",
};

const supportContacts = [
    {
        type: "Email",
        value: "support@eagle.cm",
        icon: Mail,
        description: "Pour toute question ou assistance",
    },
    {
        type: "Téléphone",
        value: "+237 XXX XXX XXX",
        icon: Phone,
        description: "Support technique disponible 24/7",
    },
    {
        type: "Chat",
        value: "Chat en direct",
        icon: MessageSquare,
        description: "Parlez avec un agent en temps réel",
    },
];

export default function HelpPage() {
    const [searchQuery, setSearchQuery] = useState("");

    const { data: faqs = [], isLoading } = useFaqsQuery();
    const { data: searchResults } = useFaqSearchQuery(searchQuery);

    const faqCategories = useMemo(() => {
        const items = searchQuery.length >= 2 ? (searchResults ?? []) : faqs;
        const byCategory = items.reduce<Record<string, typeof faqs>>((acc, faq) => {
            const cat = faq.category || "general";
            if (!acc[cat]) acc[cat] = [];
            acc[cat].push(faq);
            return acc;
        }, {});
        return Object.entries(byCategory).map(([category, items]) => ({
            title: CATEGORY_LABELS[category] || category,
            items: items.map((f) => ({ question: f.question, answer: f.answer })),
        }));
    }, [faqs, searchResults, searchQuery]);

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
                <div className="text-center space-y-4">
                    <div className="flex justify-center">
                        <div className="p-4 rounded-full bg-primary/10">
                            <HelpCircle className="size-12 text-primary" />
                        </div>
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-primary">Centre d&apos;aide</h1>
                        <p className="text-muted-foreground mt-2">
                            Trouvez des réponses à vos questions et obtenez de l&apos;assistance
                        </p>
                    </div>
                </div>

                {/* Search */}
                <Card>
                    <CardContent className="p-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-muted-foreground" />
                            <Input
                                placeholder="Rechercher dans l&apos;aide..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10 h-12 text-lg"
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Quick Links */}
                <div className="grid md:grid-cols-3 gap-4">
                    <Card className="cursor-pointer hover:shadow-lg transition-shadow">
                        <CardContent className="p-6 text-center">
                            <Book className="size-8 mx-auto text-primary mb-3" />
                            <h3 className="font-semibold mb-2">Documentation</h3>
                            <p className="text-sm text-muted-foreground">
                                Guides complets et manuels d&apos;utilisation
                            </p>
                        </CardContent>
                    </Card>
                    <Card className="cursor-pointer hover:shadow-lg transition-shadow">
                        <CardContent className="p-6 text-center">
                            <Video className="size-8 mx-auto text-primary mb-3" />
                            <h3 className="font-semibold mb-2">Tutoriels vidéo</h3>
                            <p className="text-sm text-muted-foreground">
                                Apprenez avec nos vidéos explicatives
                            </p>
                        </CardContent>
                    </Card>
                    <Card className="cursor-pointer hover:shadow-lg transition-shadow">
                        <CardContent className="p-6 text-center">
                            <FileText className="size-8 mx-auto text-primary mb-3" />
                            <h3 className="font-semibold mb-2">FAQ</h3>
                            <p className="text-sm text-muted-foreground">
                                Questions fréquemment posées
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* FAQ */}
                <div className="space-y-4">
                    <h2 className="text-2xl font-bold">Questions fréquentes</h2>
                    {isLoading ? (
                        <Card>
                            <CardContent className="py-12 text-center text-muted-foreground">
                                Chargement...
                            </CardContent>
                        </Card>
                    ) : (
                        faqCategories.map((category, categoryIndex) => (
                        <Card key={categoryIndex}>
                            <CardHeader>
                                <CardTitle>{category.title}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <Accordion type="single" collapsible className="w-full">
                                    {category.items.map((item, itemIndex) => (
                                        <AccordionItem
                                            key={itemIndex}
                                            value={`item-${categoryIndex}-${itemIndex}`}
                                        >
                                            <AccordionTrigger className="text-left">
                                                {item.question}
                                            </AccordionTrigger>
                                            <AccordionContent className="text-muted-foreground">
                                                {item.answer}
                                            </AccordionContent>
                                        </AccordionItem>
                                    ))}
                                </Accordion>
                            </CardContent>
                        </Card>
                    ))
                    )}
                </div>

                {/* Support Contacts */}
                <Card>
                    <CardHeader>
                        <CardTitle>Besoin d&apos;aide supplémentaire ?</CardTitle>
                        <CardDescription>
                            Contactez notre équipe de support
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid md:grid-cols-3 gap-4">
                            {supportContacts.map((contact, index) => {
                                const Icon = contact.icon;
                                return (
                                    <Card key={index} className="cursor-pointer hover:shadow-md transition-shadow">
                                        <CardContent className="p-6">
                                            <div className="flex items-center gap-4">
                                                <div className="p-3 rounded-lg bg-primary/10">
                                                    <Icon className="size-6 text-primary" />
                                                </div>
                                                <div className="flex-1">
                                                    <h3 className="font-semibold">{contact.type}</h3>
                                                    <p className="text-sm text-muted-foreground">
                                                        {contact.value}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground mt-1">
                                                        {contact.description}
                                                    </p>
                                                </div>
                                                <ChevronRight className="size-5 text-muted-foreground" />
                                            </div>
                                        </CardContent>
                                    </Card>
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}













