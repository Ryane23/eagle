"use client";

import { memo, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { ShieldAlert, Eye, ChevronDown, ChevronUp } from "lucide-react";
import { UrgencyCard, type PendingUrgency } from "./urgency-card";

type PendingUrgenciesProps = {
  urgencies: PendingUrgency[];
  searchQuery?: string;
  isLoading?: boolean;
};

function PendingUrgenciesComponent({
  urgencies,
  searchQuery = "",
  isLoading,
}: PendingUrgenciesProps) {
  const router = useRouter();
  const [isExpanded, setIsExpanded] = useState(false);

  const filteredUrgencies = useMemo(() => {
    if (!searchQuery) return urgencies;
    
    const query = searchQuery.toLowerCase();
    return urgencies.filter(
      (u) =>
        u.name.toLowerCase().includes(query) ||
        u.center.toLowerCase().includes(query) ||
        u.motif.toLowerCase().includes(query) ||
        u.requestedBy.toLowerCase().includes(query)
    );
  }, [urgencies, searchQuery]);

  const displayedUrgencies = isExpanded
    ? filteredUrgencies
    : filteredUrgencies.slice(0, 3);

  const hasMore = filteredUrgencies.length > 3;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <ShieldAlert className="size-5 text-red-600" />
          Urgences à valider
          <Badge variant="destructive" className="ml-1 text-xs">
            {urgencies.length}
          </Badge>
        </CardTitle>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 text-xs"
          onClick={() => router.push("/dashboard/primary/validation")}
        >
          <Eye className="size-3.5 mr-1" />
          Voir tout
        </Button>
      </CardHeader>
      <CardContent className="p-3">
        <ScrollArea className="h-[280px]">
          <div className="space-y-3">
            {isLoading ? (
              [...Array(3)].map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-3">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-5 w-12" />
                      </div>
                      <Skeleton className="h-3 w-full" />
                      <Skeleton className="h-3 w-3/4" />
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : filteredUrgencies.length === 0 && searchQuery ? (
              <div className="text-center py-8 text-sm text-muted-foreground">
                Aucune urgence trouvée pour &quot;{searchQuery}&quot;
              </div>
            ) : (
              displayedUrgencies.map((urgency) => (
                <UrgencyCard key={urgency.id} urgency={urgency} />
              ))
            )}
          </div>
        </ScrollArea>
        {hasMore && (
          <Button
            variant="ghost"
            size="sm"
            className="w-full h-8 text-xs mt-3"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? (
              <>
                Réduire
                <ChevronUp className="size-3.5 ml-1" />
              </>
            ) : (
              <>
                Voir {filteredUrgencies.length - 3} de plus
                <ChevronDown className="size-3.5 ml-1" />
              </>
            )}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

export const PendingUrgencies = memo(PendingUrgenciesComponent);

