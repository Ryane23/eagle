"use client";

import { Button } from "@/components/ui/button";
import { HelpCircle } from "lucide-react";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";

export function FloatingHelpButton() {
    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button
                        size="lg"
                        className="fixed bottom-6 right-6 rounded-full size-14 shadow-lg z-50"
                        asChild
                    >
                        <a href="/dashboard/nurse/help">
                            <HelpCircle className="size-6" />
                        </a>
                    </Button>
                </TooltipTrigger>
                <TooltipContent side="left">
                    <p>Besoin d&apos;aide ?</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
}














