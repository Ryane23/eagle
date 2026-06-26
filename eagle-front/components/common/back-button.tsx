"use client";

import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export function BackButton() {
  return (
    <Button 
      variant="outline" 
      className="gap-2"
      onClick={() => window.history.back()}
    >
      <ArrowLeft className="w-4 h-4" />
      Page précédente
    </Button>
  );
}

