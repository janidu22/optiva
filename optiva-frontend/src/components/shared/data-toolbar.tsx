import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Search, X, ArrowUpDown } from "lucide-react";
import { useCallback, useState } from "react";

interface SortOption {
  label: string;
  value: string;
}

interface DataToolbarProps {
  // Search
  showSearch?: boolean;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
  // Date range
  showDateRange?: boolean;
  dateFrom?: string;
  dateTo?: string;
  onDateFromChange?: (value: string) => void;
  onDateToChange?: (value: string) => void;
  // Sort
  showSort?: boolean;
  sortOptions?: SortOption[];
  sortBy?: string;
  sortDir?: "asc" | "desc";
  onSortByChange?: (value: string) => void;
  onSortDirChange?: (value: "asc" | "desc") => void;
  // Extra filters (slot)
  children?: React.ReactNode;
  // Reset
  onReset?: () => void;
}

export function DataToolbar({
  showSearch,
  searchValue = "",
  onSearchChange,
  searchPlaceholder = "Search...",
  showDateRange,
  dateFrom = "",
  dateTo = "",
  onDateFromChange,
  onDateToChange,
  showSort,
  sortOptions = [],
  sortBy = "",
  sortDir = "desc",
  onSortByChange,
  onSortDirChange,
  children,
  onReset,
}: DataToolbarProps) {
  const [localSearch, setLocalSearch] = useState(searchValue);

  const handleSearchSubmit = useCallback(
    (e?: React.FormEvent) => {
      e?.preventDefault();
      onSearchChange?.(localSearch);
    },
    [localSearch, onSearchChange],
  );

  const hasActiveFilters = searchValue || dateFrom || dateTo;

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center pb-4 border-b">
      {showSearch && (
        <form
          onSubmit={handleSearchSubmit}
          className="flex items-center gap-2 flex-1 min-w-[200px] max-w-sm"
        >
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={searchPlaceholder}
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              onBlur={() => handleSearchSubmit()}
              className="h-9 pl-8"
            />
          </div>
        </form>
      )}

      {showDateRange && (
        <div className="flex flex-wrap items-center gap-2">
          <Input
            type="date"
            value={dateFrom}
            onChange={(e) => onDateFromChange?.(e.target.value)}
            className="h-9 w-[130px] sm:w-[140px]"
            placeholder="From"
          />
          <span className="text-muted-foreground text-sm">to</span>
          <Input
            type="date"
            value={dateTo}
            onChange={(e) => onDateToChange?.(e.target.value)}
            className="h-9 w-[130px] sm:w-[140px]"
            placeholder="To"
          />
        </div>
      )}

      {showSort && sortOptions.length > 0 && (
        <div className="flex items-center gap-2">
          <Select value={sortBy} onValueChange={(v) => onSortByChange?.(v)}>
            <SelectTrigger className="h-9 w-[140px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              {sortOptions.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            size="icon"
            className="h-9 w-9"
            onClick={() =>
              onSortDirChange?.(sortDir === "asc" ? "desc" : "asc")
            }
            title={sortDir === "asc" ? "Ascending" : "Descending"}
          >
            <ArrowUpDown className="h-4 w-4" />
          </Button>
        </div>
      )}

      {children}

      {hasActiveFilters && onReset && (
        <Button variant="ghost" size="sm" onClick={onReset} className="h-9">
          <X className="h-4 w-4 mr-1" /> Clear
        </Button>
      )}
    </div>
  );
}
