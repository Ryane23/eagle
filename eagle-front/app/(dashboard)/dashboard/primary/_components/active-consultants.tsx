"use client";

import { memo, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Stethoscope, Users } from "lucide-react";
import type { ConsultantDisplay } from "@/types/dashboard";

// Re-export for backwards compatibility
export type Consultant = ConsultantDisplay;

type ActiveConsultantsProps = {
  consultants: Consultant[];
  searchQuery?: string;
  isLoading?: boolean;
};

const statusClasses: Record<string, string> = {
  "En consultation": "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  "Disponible": "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  "En pause": "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  "Absent": "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400",
};

function ActiveConsultantsComponent({
  consultants,
  searchQuery = "",
  isLoading = false,
}: ActiveConsultantsProps) {
  const router = useRouter();

  const filteredConsultants = useMemo(() => {
    if (!searchQuery) return consultants;

    const query = searchQuery.toLowerCase();
    return consultants.filter(
      (c) =>
        c.name.toLowerCase().includes(query) ||
        c.specialty.toLowerCase().includes(query) ||
        c.center.toLowerCase().includes(query)
    );
  }, [consultants, searchQuery]);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Stethoscope className="size-5 text-purple-600" />
          Consultants actifs
          <Badge variant="secondary" className="ml-1 text-xs">
            {consultants.length}
          </Badge>
        </CardTitle>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 text-xs"
          onClick={() => router.push("/dashboard/primary/schedule")}
        >
          Voir tous
        </Button>
      </CardHeader>
      <CardContent className="p-3">
        <ScrollArea className="h-[240px]">
          {isLoading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="p-2.5 flex items-center gap-3">
                  <Skeleton className="size-10 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {filteredConsultants.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="size-8 mx-auto text-muted-foreground mb-2 opacity-50" />
                  <p className="text-sm text-muted-foreground">
                    {searchQuery
                      ? `Aucun consultant trouvé pour "${searchQuery}"`
                      : "Aucun consultant actif"}
                  </p>
                </div>
              ) : (
                filteredConsultants.map((consultant) => (
                  <div
                    key={consultant.id}
                    className="p-2.5 flex items-center gap-3 hover:bg-muted/50 rounded-md transition-colors cursor-pointer"
                  >
                    <div className="size-10 rounded-full bg-purple-600 text-white flex items-center justify-center text-xs font-semibold shrink-0">
                      {consultant.photo}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-1">
                        <h4 className="text-sm font-semibold truncate">
                          {consultant.name}
                        </h4>
                        <Badge
                          variant="outline"
                          className={`text-[9px] px-1.5 py-0.5 ${
                            statusClasses[consultant.status]
                          }`}
                        >
                          {consultant.status}
                        </Badge>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {consultant.specialty}
                      </div>
                      <div className="text-[10px] text-muted-foreground mt-0.5">
                        {consultant.center} • {consultant.patients} patients
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

export const ActiveConsultants = memo(ActiveConsultantsComponent);

