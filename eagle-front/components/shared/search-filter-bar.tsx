"use client";

import { memo, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Filter } from "lucide-react";

export type FilterOption = {
  value: string;
  label: string;
};

export type SortOption = {
  value: string;
  label: string;
};

export type SearchFilterBarProps = {
  searchValue: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  filters?: {
    value: string;
    onChange: (value: string) => void;
    options: FilterOption[];
    placeholder?: string;
    showIcon?: boolean;
  }[];
  sortOptions?: {
    value: string;
    onChange: (value: string) => void;
    options: SortOption[];
    placeholder?: string;
  };
  className?: string;
  cardless?: boolean;
};

function SearchFilterBarComponent({
  searchValue,
  onSearchChange,
  searchPlaceholder = "Rechercher...",
  filters,
  sortOptions,
  className,
  cardless = false,
}: SearchFilterBarProps) {
  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onSearchChange(e.target.value);
    },
    [onSearchChange]
  );

  const content = (
    <div className={`flex flex-wrap gap-1.5 ${cardless ? className : ""}`}>
      <div className="flex-1 min-w-[180px]">
        <div className="relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
          <Input
            type="search"
            placeholder={searchPlaceholder}
            className="pl-8 h-8 text-xs"
            value={searchValue}
            onChange={handleSearchChange}
          />
        </div>
      </div>

      {sortOptions && (
        <Select value={sortOptions.value} onValueChange={sortOptions.onChange}>
          <SelectTrigger className="w-[160px] h-8 text-xs">
            <SelectValue placeholder={sortOptions.placeholder || "Trier par"} />
          </SelectTrigger>
          <SelectContent>
            {sortOptions.options.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {filters?.map((filter, index) => (
        <Select key={index} value={filter.value} onValueChange={filter.onChange}>
          <SelectTrigger className="w-[150px] h-8 text-xs">
            {filter.showIcon && <Filter className="size-3.5 mr-1.5" />}
            <SelectValue placeholder={filter.placeholder || "Filtrer"} />
          </SelectTrigger>
          <SelectContent>
            {filter.options.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ))}
    </div>
  );

  if (cardless) {
    return content;
  }

  return (
    <Card className={className}>
      <CardContent className="pt-2">{content}</CardContent>
    </Card>
  );
}

export const SearchFilterBar = memo(SearchFilterBarComponent);

