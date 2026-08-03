"use client";

import { memo } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Siren, AlertTriangle, Activity, ArrowDown } from "lucide-react";

interface UrgencyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (urgencyLevel: number) => void;
}

export const UrgencyDialog = memo(function UrgencyDialog({
  open,
  onOpenChange,
  onSelect,
}: UrgencyDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Modifier le niveau d&apos;urgence</DialogTitle>
          <DialogDescription>
            Sélectionnez le nouveau niveau d&apos;urgence pour ce patient
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3 py-4">
          <Button
            variant="outline"
            className="w-full justify-start gap-3 h-auto py-4 border-red-300 hover:bg-red-50"
            onClick={() => onSelect(5)}
          >
            <Siren className="size-5 text-red-600" />
            <div className="text-left">
              <p className="font-semibold">Niveau 5 - Critique</p>
              <p className="text-xs text-muted-foreground">Mise en danger immédiat</p>
            </div>
          </Button>

          <Button
            variant="outline"
            className="w-full justify-start gap-3 h-auto py-4 border-orange-300 hover:bg-orange-50"
            onClick={() => onSelect(4)}
          >
            <AlertTriangle className="size-5 text-orange-600" />
            <div className="text-left">
              <p className="font-semibold">Niveau 4 - Urgent</p>
              <p className="text-xs text-muted-foreground">Nécessite attention rapide</p>
            </div>
          </Button>

          <Button
            variant="outline"
            className="w-full justify-start gap-3 h-auto py-4 border-yellow-300 hover:bg-yellow-50"
            onClick={() => onSelect(3)}
          >
            <Activity className="size-5 text-yellow-600" />
            <div className="text-left">
              <p className="font-semibold">Niveau 3 - Modéré</p>
              <p className="text-xs text-muted-foreground">Peut attendre raisonnablement</p>
            </div>
          </Button>

          <Button
            variant="outline"
            className="w-full justify-start gap-3 h-auto py-4"
            onClick={() => onSelect(2)}
          >
            <ArrowDown className="size-5 text-blue-600" />
            <div className="text-left">
              <p className="font-semibold">Niveau 2 - Faible</p>
              <p className="text-xs text-muted-foreground">Non urgent</p>
            </div>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
});

