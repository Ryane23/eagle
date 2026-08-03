"use client";

import { memo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Filter, ArrowUpDown, Stethoscope, LayoutGrid, List } from "lucide-react";
import type { WaitingSortOption, WaitingFilterStatus, WaitingViewMode } from "@/types/waiting-room";

interface WaitingFiltersProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  sortBy: WaitingSortOption;
  onSortChange: (value: WaitingSortOption) => void;
  filterUrgency: string;
  onUrgencyChange: (value: string) => void;
  filterStatus: WaitingFilterStatus;
  onStatusChange: (value: WaitingFilterStatus) => void;
  filterSpecialty: string;
  onSpecialtyChange: (value: string) => void;
  specialties: string[];
  viewMode: WaitingViewMode;
  onViewModeChange: (mode: WaitingViewMode) => void;
}

export const WaitingFilters = memo(function WaitingFilters({
  searchQuery,
  onSearchChange,
  sortBy,
  onSortChange,
  filterUrgency,
  onUrgencyChange,
  filterStatus,
  onStatusChange,
  filterSpecialty,
  onSpecialtyChange,
  specialties,
  viewMode,
  onViewModeChange,
}: WaitingFiltersProps) {
  return (
    <Card>
      <CardContent className="pt-3">
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Rechercher par nom, motif ou centre..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
              />
            </div>
          </div>

          <Select value={filterSpecialty} onValueChange={onSpecialtyChange}>
            <SelectTrigger className="w-[180px]">
              <Stethoscope className="size-4 mr-2" />
              <SelectValue placeholder="Spécialité" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes spécialités</SelectItem>
              {specialties.map((spec) => (
                <SelectItem key={spec} value={spec}>
                  {spec}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={(v) => onSortChange(v as WaitingSortOption)}>
            <SelectTrigger className="w-[200px]">
              <ArrowUpDown className="size-4 mr-2" />
              <SelectValue placeholder="Trier par" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="urgency">Urgence</SelectItem>
              <SelectItem value="waitTime">Temps d&apos;attente</SelectItem>
              <SelectItem value="appointment">Heure RDV</SelectItem>
              <SelectItem value="name">Nom</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filterUrgency} onValueChange={onUrgencyChange}>
            <SelectTrigger className="w-[180px]">
              <Filter className="size-4 mr-2" />
              <SelectValue placeholder="Urgence" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes urgences</SelectItem>
              <SelectItem value="5">Niveau 5</SelectItem>
              <SelectItem value="4">Niveau 4</SelectItem>
              <SelectItem value="3">Niveau 3</SelectItem>
              <SelectItem value="2">Niveau 2</SelectItem>
              <SelectItem value="1">Niveau 1</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filterStatus} onValueChange={(v) => onStatusChange(v as WaitingFilterStatus)}>
            <SelectTrigger className="w-[180px]">
              <Filter className="size-4 mr-2" />
              <SelectValue placeholder="Statut" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous statuts</SelectItem>
              <SelectItem value="ready">Prêt</SelectItem>
              <SelectItem value="preparation">Préparation</SelectItem>
              <SelectItem value="waiting">En attente</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex rounded-md border border-input bg-background p-0.5">
            <Button
              variant={viewMode === "grid" ? "secondary" : "ghost"}
              size="sm"
              className="h-8 px-2"
              onClick={() => onViewModeChange("grid")}
              title="Vue grille"
            >
              <LayoutGrid className="size-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "secondary" : "ghost"}
              size="sm"
              className="h-8 px-2"
              onClick={() => onViewModeChange("list")}
              title="Vue liste"
            >
              <List className="size-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

