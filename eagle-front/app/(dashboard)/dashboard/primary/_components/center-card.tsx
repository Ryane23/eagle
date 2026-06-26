"use client";

import { memo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Clock,
  Wifi,
  WifiOff,
  Star,
  StarOff,
  Eye,
  MessageSquare,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import type { CenterDisplay } from "@/types/dashboard";

// Re-export for backwards compatibility
export type Center = CenterDisplay;

type CenterCardProps = {
  center: Center;
  isSelected: boolean;
  isFavorite: boolean;
  onSelect: (centerId: string | number | null) => void;
  onToggleFavorite: (centerId: string | number) => void;
};

const alertLevelClasses = {
  normal: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  warning: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  issue: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
};

const alertLevelTexts = {
  normal: "Normal",
  warning: "Attention",
  issue: "Problème",
};

function CenterCardComponent({
  center,
  isSelected,
  isFavorite,
  onSelect,
  onToggleFavorite,
}: CenterCardProps) {
  const router = useRouter();

  const handleClick = useCallback(() => {
    onSelect(isSelected ? null : center.id);
  }, [center.id, isSelected, onSelect]);

  const handleFavoriteClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onToggleFavorite(center.id);
    },
    [center.id, onToggleFavorite]
  );

  const handleViewDetails = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      router.push(`/dashboard/primary/centers?center=${center.id}`);
    },
    [center.id, router]
  );

  const handleContact = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      router.push(`/dashboard/primary/notifications?center=${center.id}`);
    },
    [center.id, router]
  );

  const renderTrendBadge = () => {
    if (center.trend === "up") {
      return <TrendingUp className="size-3 text-red-500" />;
    } else if (center.trend === "down") {
      return <TrendingDown className="size-3 text-green-500" />;
    }
    return null;
  };

  return (
    <Card
      className={`cursor-pointer transition-all hover:shadow-md ${
        isSelected ? "border-primary border-2 bg-primary/5" : ""
      }`}
      onClick={handleClick}
    >
      <CardContent className="p-3">
        <div className="flex justify-between items-start mb-2">
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="text-sm font-bold">{center.name}</h3>
              <button
                onClick={handleFavoriteClick}
                className="text-muted-foreground hover:text-yellow-500"
              >
                {isFavorite ? (
                  <Star className="size-3 fill-yellow-500 text-yellow-500" />
                ) : (
                  <StarOff className="size-3" />
                )}
              </button>
            </div>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-[10px] text-muted-foreground">
                {center.code}
              </span>
              <Badge
                variant="outline"
                className={`text-[9px] px-1.5 py-0 ${alertLevelClasses[center.alertLevel]}`}
              >
                {alertLevelTexts[center.alertLevel]}
              </Badge>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Badge
              variant="outline"
              className={`text-[9px] px-1.5 py-0 ${
                center.status === "online"
                  ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                  : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
              }`}
            >
              {center.status === "online" ? (
                <>
                  <Wifi className="size-2.5 mr-0.5" /> En ligne
                </>
              ) : (
                <>
                  <WifiOff className="size-2.5 mr-0.5" /> Hors ligne
                </>
              )}
            </Badge>
            {center.status === "online" && (
              <Badge variant="outline" className="text-[9px] px-1.5 py-0">
                {center.bandwidth} Mbps
              </Badge>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 mb-2">
          <div className="p-2 rounded bg-muted/50 text-center">
            <div className="text-[10px] text-muted-foreground">
              Patients en attente
            </div>
            <div className="font-bold text-sm flex items-center justify-center gap-1">
              <span>{center.waitingPatients}</span>
              {renderTrendBadge()}
            </div>
          </div>
          <div className="p-2 rounded bg-muted/50 text-center">
            <div className="text-[10px] text-muted-foreground">
              Consultants actifs
            </div>
            <div className="font-bold text-sm">{center.consultants}</div>
          </div>
        </div>

        <div className="flex justify-between items-center pt-2 border-t text-[10px] text-muted-foreground">
          <div className="flex items-center gap-1">
            <Clock className="size-3" />
            Dernière mise à jour: {center.lastUpdate}
          </div>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="size-6"
              onClick={handleViewDetails}
              title="Voir les détails"
            >
              <Eye className="size-3" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="size-6"
              onClick={handleContact}
              title="Contacter le centre"
            >
              <MessageSquare className="size-3" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export const CenterCard = memo(CenterCardComponent);

