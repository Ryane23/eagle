"use client";

import { memo, useMemo, useCallback } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Building } from "lucide-react";
import { EmptyState } from "@/components/shared";
import { CenterCard, type Center } from "./center-card";

type CentersListProps = {
  centers: Center[];
  activeTab: "all" | "online" | "offline";
  onTabChange: (tab: "all" | "online" | "offline") => void;
  searchQuery: string;
  onClearSearch: () => void;
  selectedCenter: string | number | null;
  onSelectCenter: (centerId: string | number | null) => void;
  favoriteIds: (string | number)[];
  onToggleFavorite: (centerId: string | number) => void;
  centersOnline: number;
  centersOffline: number;
  isLoading?: boolean;
};

function CentersListComponent({
  centers,
  activeTab,
  onTabChange,
  searchQuery,
  onClearSearch,
  selectedCenter,
  onSelectCenter,
  favoriteIds,
  onToggleFavorite,
  centersOnline,
  centersOffline,
  isLoading,
}: CentersListProps) {
  const filteredCenters = useMemo(() => {
    let result = centers;

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (center) =>
          center.name.toLowerCase().includes(query) ||
          center.code.toLowerCase().includes(query) ||
          center.type.toLowerCase().includes(query)
      );
    }

    // Filter by tab
    if (activeTab === "online") {
      result = result.filter((center) => center.status === "online");
    } else if (activeTab === "offline") {
      result = result.filter((center) => center.status === "offline");
    }

    return result;
  }, [centers, searchQuery, activeTab]);

  const isFavorite = useCallback(
    (centerId: string | number) => favoriteIds.includes(centerId),
    [favoriteIds]
  );

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Building className="size-5 text-blue-600" />
          Centres du Réseau
        </CardTitle>
        <div className="flex gap-1.5">
          <Button
            variant={activeTab === "all" ? "default" : "outline"}
            size="sm"
            className="h-8 text-xs"
            onClick={() => onTabChange("all")}
          >
            Tous ({centers.length})
          </Button>
          <Button
            variant={activeTab === "online" ? "default" : "outline"}
            size="sm"
            className="h-8 text-xs"
            onClick={() => onTabChange("online")}
          >
            En ligne ({centersOnline})
          </Button>
          <Button
            variant={activeTab === "offline" ? "default" : "outline"}
            size="sm"
            className="h-8 text-xs"
            onClick={() => onTabChange("offline")}
          >
            Hors ligne ({centersOffline})
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-3">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[...Array(4)].map((_, i) => (
              <Card key={i}>
                <CardContent className="p-3">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Skeleton className="size-8 rounded-lg" />
                      <div className="flex-1 space-y-1">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-20" />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Skeleton className="h-6 w-16" />
                      <Skeleton className="h-6 w-16" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredCenters.length === 0 ? (
          <EmptyState
            variant="search"
            icon={Building}
            title={
              searchQuery
                ? `Aucun centre trouvé pour "${searchQuery}"`
                : activeTab === "online"
                  ? "Aucun centre en ligne"
                  : activeTab === "offline"
                    ? "Aucun centre hors ligne"
                    : "Aucun centre disponible"
            }
            action={
              searchQuery
                ? { label: "Effacer la recherche", onClick: onClearSearch }
                : undefined
            }
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {filteredCenters.map((center) => (
              <CenterCard
                key={center.id}
                center={center}
                isSelected={selectedCenter === center.id}
                isFavorite={isFavorite(center.id)}
                onSelect={onSelectCenter}
                onToggleFavorite={onToggleFavorite}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export const CentersList = memo(CentersListComponent);

