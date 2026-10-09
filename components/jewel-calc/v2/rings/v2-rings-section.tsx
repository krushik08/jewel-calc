"use client";

import { useMemo, useState } from "react";
import {
  ArrowUpDown,
  Copy,
  Download,
  Filter,
  Gem,
  MoreVertical,
  Printer,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CopyButton } from "@/components/jewel-calc/copy-button";
import { SectionHeading } from "@/components/jewel-calc/layout/section-heading";
import { DeleteRingButton } from "@/components/jewel-calc/rings/delete-ring-button";
import { RingNameCell } from "@/components/jewel-calc/rings/ring-name-cell";
import { TONE_CLASS, visibleColumns } from "@/lib/columns";
import { METALS, STONE_META, STONE_TYPES } from "@/lib/constants";
import { exportRingsCSV } from "@/lib/csv";
import { cn } from "@/lib/utils";
import { usePricingStore } from "@/store/pricing-store";
import type { MetalKey, RingRow, StoneType } from "@/types/pricing";

type SortOption = "date-desc" | "name-asc" | "mrp-desc" | "mrp-asc" | "weight-desc" | "weight-asc";

export function V2RingsSection({ rows }: { rows: RingRow[] }) {
  const isOwner = usePricingStore((s) => s.isOwner);
  const deleteRings = usePricingStore((s) => s.deleteRings);
  const duplicateRing = usePricingStore((s) => s.duplicateRing);

  // Filters & Search
  const [search, setSearch] = useState("");
  const [metalFilter, setMetalFilter] = useState<string>("all");
  const [stoneFilter, setStoneFilter] = useState<string>("all");
  const [sortOption, setSortOption] = useState<SortOption>("date-desc");

  // Selection
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Filter & Sort Pipeline
  const filteredRows = useMemo(() => {
    let result = [...rows];

    // Search by name
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter((r) => r.ring.name.toLowerCase().includes(q));
    }

    // Metal filter
    if (metalFilter !== "all") {
      result = result.filter((r) => r.ring.metal === metalFilter);
    }

    // Stone filter
    if (stoneFilter !== "all") {
      result = result.filter((r) => r.ring.stoneType === stoneFilter);
    }

    // Sorting
    switch (sortOption) {
      case "name-asc":
        result.sort((a, b) => a.ring.name.localeCompare(b.ring.name));
        break;
      case "mrp-desc":
        result.sort((a, b) => b.price.mrp - a.price.mrp);
        break;
      case "mrp-asc":
        result.sort((a, b) => a.price.mrp - b.price.mrp);
        break;
      case "weight-desc":
        result.sort((a, b) => b.ring.grams - a.ring.grams);
        break;
      case "weight-asc":
        result.sort((a, b) => a.ring.grams - b.ring.grams);
        break;
      case "date-desc":
      default:
        // maintain default insertion order (last added at end or preserved)
        break;
    }

    return result;
  }, [rows, search, metalFilter, stoneFilter, sortOption]);

  const cols = visibleColumns(isOwner);

  // Selection helpers
  const allFilteredSelected =
    filteredRows.length > 0 && filteredRows.every((r) => selectedIds.includes(r.ring.id));

  const toggleSelectAll = () => {
    if (allFilteredSelected) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredRows.map((r) => r.ring.id));
    }
  };

  const toggleSelectOne = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleBulkDelete = () => {
    if (selectedIds.length === 0) return;
    deleteRings(selectedIds);
    setSelectedIds([]);
    toast.success(`Removed ${selectedIds.length} items from catalog`);
  };

  const handleExportSelected = () => {
    const toExport =
      selectedIds.length > 0
        ? rows.filter((r) => selectedIds.includes(r.ring.id))
        : filteredRows;
    exportRingsCSV(toExport, isOwner);
    toast.success(`Exported ${toExport.length} items to CSV`);
  };

  const hasActiveFilters = search || metalFilter !== "all" || stoneFilter !== "all";

  const clearFilters = () => {
    setSearch("");
    setMetalFilter("all");
    setStoneFilter("all");
  };

  return (
    <section className="space-y-4">
      {/* Heading & Top Actions */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-2xl font-bold tracking-tight">Catalog & Pricing Table</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Showing {filteredRows.length} of {rows.length} items
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 print:hidden">
          {selectedIds.length > 0 && (
            <Button
              variant="destructive"
              size="sm"
              onClick={handleBulkDelete}
              className="gap-1.5"
            >
              <Trash2 className="size-3.5" />
              <span>Delete ({selectedIds.length})</span>
            </Button>
          )}

          <Button
            variant="outline"
            size="sm"
            disabled={rows.length === 0}
            onClick={handleExportSelected}
            className="gap-1.5 hover:border-primary/40"
          >
            <Download className="size-3.5" />
            <span>CSV {selectedIds.length > 0 ? `(${selectedIds.length})` : "Export"}</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            disabled={rows.length === 0}
            onClick={() => window.print()}
            className="gap-1.5"
          >
            <Printer className="size-3.5" />
            <span className="hidden sm:inline">Print / PDF</span>
          </Button>
        </div>
      </div>

      {/* Filter, Search & Sort Control Bar */}
      <div className="rounded-xl border bg-card p-3 sm:p-4 shadow-xs print:hidden space-y-3">
        <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
          {/* Search Input */}
          <div className="relative">
            <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search items by name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-9 text-xs bg-card"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="size-3.5" />
              </button>
            )}
          </div>

          {/* Metal Filter */}
          <Select value={metalFilter} onValueChange={setMetalFilter}>
            <SelectTrigger className="h-9 text-xs bg-card">
              <SelectValue placeholder="All Metals" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Metals</SelectItem>
              {METALS.map((m) => (
                <SelectItem key={m.key} value={m.key}>
                  {m.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Stone Type Filter */}
          <Select value={stoneFilter} onValueChange={setStoneFilter}>
            <SelectTrigger className="h-9 text-xs bg-card">
              <SelectValue placeholder="All Diamond Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Diamond Types</SelectItem>
              {STONE_TYPES.map((s) => (
                <SelectItem key={s.key} value={s.key}>
                  {s.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Sort By */}
          <Select value={sortOption} onValueChange={(v) => setSortOption(v as SortOption)}>
            <SelectTrigger className="h-9 text-xs bg-card">
              <ArrowUpDown className="size-3.5 mr-1.5 text-muted-foreground" />
              <SelectValue placeholder="Sort Order" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="date-desc">Newest First</SelectItem>
              <SelectItem value="name-asc">Name (A → Z)</SelectItem>
              <SelectItem value="mrp-desc">MRP: High to Low</SelectItem>
              <SelectItem value="mrp-asc">MRP: Low to High</SelectItem>
              <SelectItem value="weight-desc">Weight: Heavy to Light</SelectItem>
              <SelectItem value="weight-asc">Weight: Light to Heavy</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Filter Pills & Reset */}
        {hasActiveFilters && (
          <div className="flex flex-wrap items-center gap-2 pt-1 border-t text-xs">
            <span className="text-muted-foreground text-[11px]">Active Filters:</span>
            {search && (
              <Badge variant="secondary" className="gap-1 text-[11px]">
                Search: &ldquo;{search}&rdquo;
                <X className="size-3 cursor-pointer" onClick={() => setSearch("")} />
              </Badge>
            )}
            {metalFilter !== "all" && (
              <Badge variant="secondary" className="gap-1 text-[11px]">
                Metal: {metalFilter}
                <X className="size-3 cursor-pointer" onClick={() => setMetalFilter("all")} />
              </Badge>
            )}
            {stoneFilter !== "all" && (
              <Badge variant="secondary" className="gap-1 text-[11px]">
                Stone: {STONE_META[stoneFilter as StoneType]?.label ?? stoneFilter}
                <X className="size-3 cursor-pointer" onClick={() => setStoneFilter("all")} />
              </Badge>
            )}
            <button
              type="button"
              onClick={clearFilters}
              className="text-[11px] font-medium text-primary hover:underline ml-auto"
            >
              Reset All Filters
            </button>
          </div>
        )}
      </div>

      {/* Main Table Content */}
      {rows.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-border/80 bg-card py-16 text-center">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Gem className="size-7" />
          </div>
          <p className="font-display text-xl font-bold mt-2">No items in catalog yet</p>
          <p className="text-sm text-muted-foreground max-w-sm">
            Use the form above to add single pieces or generate a complete 6-stone series in seconds.
          </p>
        </div>
      ) : filteredRows.length === 0 ? (
        <div className="rounded-xl border border-dashed p-8 text-center bg-card">
          <p className="text-sm text-muted-foreground">No items match your active search or filters.</p>
          <Button variant="link" size="sm" onClick={clearFilters} className="mt-1">
            Clear all filters
          </Button>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border bg-card shadow-sm shadow-primary/5">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent bg-muted/40">
                <TableHead className="w-10 text-center print:hidden">
                  <input
                    type="checkbox"
                    aria-label="Select all"
                    checked={allFilteredSelected}
                    onChange={toggleSelectAll}
                    className="size-4 rounded border-input text-primary accent-primary"
                  />
                </TableHead>
                <TableHead className="sticky left-0 z-10 min-w-56 bg-muted/80">Item Style</TableHead>
                {cols.map((c) => (
                  <TableHead key={c.id} className={cn(c.align === "right" && "text-right")}>
                    {c.header}
                  </TableHead>
                ))}
                <TableHead className="w-20 text-center print:hidden">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRows.map((row) => {
                const isSelected = selectedIds.includes(row.ring.id);
                return (
                  <TableRow
                    key={row.ring.id}
                    className={cn(
                      "transition-colors",
                      isSelected && "bg-primary/5 hover:bg-primary/10"
                    )}
                  >
                    {/* Checkbox */}
                    <TableCell className="text-center print:hidden">
                      <input
                        type="checkbox"
                        aria-label={`Select ${row.ring.name}`}
                        checked={isSelected}
                        onChange={() => toggleSelectOne(row.ring.id)}
                        className="size-4 rounded border-input text-primary accent-primary"
                      />
                    </TableCell>

                    {/* Ring Name Cell */}
                    <TableCell className="sticky left-0 z-10 max-w-72 bg-card whitespace-normal">
                      <RingNameCell ring={row.ring} />
                    </TableCell>

                    {/* Standard Config Columns */}
                    {cols.map((c) => (
                      <TableCell
                        key={c.id}
                        className={cn("tabular", c.align === "right" && "text-right", TONE_CLASS[c.tone])}
                      >
                        {c.copy ? (
                          <span className="inline-flex items-center gap-1">
                            {c.display(row)}
                            <CopyButton value={c.copy(row)} label={c.header} />
                          </span>
                        ) : (
                          c.display(row)
                        )}
                      </TableCell>
                    ))}

                    {/* Quick Row Actions */}
                    <TableCell className="text-center print:hidden">
                      <div className="flex items-center justify-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          title="Duplicate item"
                          onClick={() => {
                            duplicateRing(row.ring.id);
                            toast.success(`Duplicated "${row.ring.name}"`);
                          }}
                          className="size-7 text-muted-foreground hover:text-foreground"
                        >
                          <Copy className="size-3.5" />
                        </Button>
                        <DeleteRingButton id={row.ring.id} name={row.ring.name} />
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </section>
  );
}
