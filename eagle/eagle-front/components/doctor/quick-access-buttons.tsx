"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
    Users, 
    Plus, 
    FileText, 
    AlertTriangle, 
    Search,
    Filter
} from "lucide-react";

export function QuickAccessButtons() {
    return (
        <div className="flex flex-wrap items-center gap-1.5">
            <Button variant="outline" size="sm" className="gap-1 h-7 px-2">
                <Users className="size-3" />
                <span className="text-[10px]">Salle d&apos;attente</span>
            </Button>
            
            <Button size="sm" className="gap-1 h-7 px-2">
                <Plus className="size-3" />
                <span className="text-[10px]">Nouvelle Consultation</span>
            </Button>
            
            <Button variant="outline" size="sm" className="gap-1 h-7 px-2">
                <FileText className="size-3" />
                <span className="text-[10px]">Prescription</span>
            </Button>
            
            <Button variant="outline" size="sm" className="gap-1 h-7 px-2 relative">
                <AlertTriangle className="size-3" />
                <span className="text-[10px]">Urgences</span>
                <Badge className="ml-0.5 size-3.5 justify-center p-0 text-[9px] bg-red-500">
                    2
                </Badge>
            </Button>

            <div className="flex-1 min-w-[160px] flex gap-1.5 ml-auto">
                <div className="relative flex-1">
                    <Search className="absolute left-2 top-1/2 -translate-y-1/2 size-3 text-muted-foreground" />
                    <Input 
                        type="search" 
                        placeholder="Rechercher..." 
                        className="pl-7 h-7 text-[11px]"
                    />
                </div>
                <Button variant="outline" size="icon" className="h-7 w-7">
                    <Filter className="size-3" />
                </Button>
            </div>
        </div>
    );
}


