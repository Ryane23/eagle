"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { HelpCircle, Phone, Mail, MessageSquare, Book } from "lucide-react";

export function FloatingHelpButton() {
    const [open, setOpen] = useState(false);

    return (
        <>
            <Button
                size="lg"
                className="fixed bottom-6 right-6 size-14 rounded-full shadow-lg hover:shadow-xl transition-shadow z-50"
                onClick={() => setOpen(true)}
            >
                <HelpCircle className="size-6" />
            </Button>

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <HelpCircle className="size-5" />
                            Centre d&apos;Aide
                        </DialogTitle>
                        <DialogDescription>
                            Comment pouvons-nous vous aider?
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-3">
                        <Button 
                            variant="outline" 
                            className="w-full justify-start gap-3 h-auto py-4"
                        >
                            <div className="p-2 bg-blue-100 rounded-lg">
                                <Book className="size-5 text-blue-600" />
                            </div>
                            <div className="text-left">
                                <p className="font-semibold">Guide d&apos;utilisation</p>
                                <p className="text-xs text-muted-foreground">
                                    Documentation et tutoriels
                                </p>
                            </div>
                        </Button>

                        <Button 
                            variant="outline" 
                            className="w-full justify-start gap-3 h-auto py-4"
                        >
                            <div className="p-2 bg-green-100 rounded-lg">
                                <MessageSquare className="size-5 text-green-600" />
                            </div>
                            <div className="text-left">
                                <p className="font-semibold">Chat en direct</p>
                                <p className="text-xs text-muted-foreground">
                                    Support technique disponible
                                </p>
                            </div>
                        </Button>

                        <Button 
                            variant="outline" 
                            className="w-full justify-start gap-3 h-auto py-4"
                        >
                            <div className="p-2 bg-orange-100 rounded-lg">
                                <Phone className="size-5 text-orange-600" />
                            </div>
                            <div className="text-left">
                                <p className="font-semibold">Assistance téléphonique</p>
                                <p className="text-xs text-muted-foreground">
                                    +237 6 XX XX XX XX
                                </p>
                            </div>
                        </Button>

                        <Button 
                            variant="outline" 
                            className="w-full justify-start gap-3 h-auto py-4"
                        >
                            <div className="p-2 bg-purple-100 rounded-lg">
                                <Mail className="size-5 text-purple-600" />
                            </div>
                            <div className="text-left">
                                <p className="font-semibold">Email</p>
                                <p className="text-xs text-muted-foreground">
                                    support@eagle.cm
                                </p>
                            </div>
                        </Button>
                    </div>

                    <div className="mt-4 p-3 bg-muted rounded-lg">
                        <p className="text-xs text-muted-foreground">
                            <strong>Horaires de support:</strong><br />
                            Lundi - Vendredi: 8h00 - 18h00<br />
                            Samedi: 9h00 - 13h00
                        </p>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}


