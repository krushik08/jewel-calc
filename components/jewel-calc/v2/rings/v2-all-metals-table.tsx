"use client";

import { Check, Copy, Gem, Plus, Sparkles } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CopyButton } from "@/components/jewel-calc/copy-button";
import { formatUSD, toPlainAmount } from "@/lib/format";
import type { MetalComparisonRow } from "@/lib/pricing";
import { cn } from "@/lib/utils";
import { usePricingStore } from "@/store/pricing-store";

interface V2AllMetalsTableProps {
  rows: MetalComparisonRow[];
  selectedMetal?: string;
  onSelectMetal?: (metal: string) => void;
  onAddSingle?: (row: MetalComparisonRow) => void;
  onAddAll?: () => void;
  itemName?: string;
}

export function V2AllMetalsTable({
  rows,
  selectedMetal,
  onSelectMetal,
  onAddSingle,
  onAddAll,
  itemName = "Item",
}: V2AllMetalsTableProps) {
  const isOwner = usePricingStore((s) => s.isOwner);

  const copyAllMRPs = () => {
    const summary = rows
      .map((r) => `${r.label}: ${formatUSD(r.price.mrp)} (${r.grams}g)`)
      .join(" · ");
    const text = `${itemName} — All Metals MRP: ${summary}`;
    navigator.clipboard.writeText(text);
    toast.success("Copied all 5 metal MRPs to clipboard");
  };

  return (
    <div className="space-y-3 rounded-xl border bg-card p-4 shadow-xs">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/60 pb-3">
        <div className="flex items-center gap-2">
          <div className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Sparkles className="size-4" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-foreground">All Metals Price Comparison</h4>
            <p className="text-[11px] text-muted-foreground">
              Scaled by density ratios relative to your base specifications
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={copyAllMRPs}
            className="h-8 text-xs gap-1.5 hover:border-primary/40"
          >
            <Copy className="size-3.5" />
            <span>Copy All MRPs</span>
          </Button>

          {onAddAll && (
            <Button
              type="button"
              size="sm"
              onClick={onAddAll}
              className="h-8 text-xs font-semibold gap-1.5 shadow-xs"
            >
              <Plus className="size-3.5" />
              <span>Add All 5 Metals to Catalog</span>
            </Button>
          )}
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50 text-[11px] font-semibold text-muted-foreground uppercase">
              <TableHead className="py-2.5 px-3">Metal Purity</TableHead>
              <TableHead className="py-2.5 px-3 text-right">Density</TableHead>
              <TableHead className="py-2.5 px-3 text-right">Weight (g)</TableHead>
              <TableHead className="py-2.5 px-3 text-right">Metal Rate</TableHead>
              <TableHead className="py-2.5 px-3 text-right">Metal $</TableHead>
              {isOwner && <TableHead className="py-2.5 px-3 text-right">Total Cost</TableHead>}
              <TableHead className="py-2.5 px-3 text-right">Sell Price</TableHead>
              <TableHead className="py-2.5 px-3 text-right">Listed MRP</TableHead>
              {isOwner && <TableHead className="py-2.5 px-3 text-right">Est. Profit</TableHead>}
              {onAddSingle && <TableHead className="py-2.5 px-3 text-center">Action</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => {
              const isCurrent = row.metal === selectedMetal;
              return (
                <TableRow
                  key={row.metal}
                  className={cn(
                    "transition-colors",
                    isCurrent && "bg-primary/5 hover:bg-primary/10 font-medium"
                  )}
                >
                  {/* Metal Name */}
                  <TableCell className="py-2.5 px-3 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-foreground text-sm">{row.label}</span>
                      {isCurrent && (
                        <Badge variant="outline" className="text-[10px] border-primary/40 bg-primary/10 text-primary py-0 px-1.5">
                          Selected
                        </Badge>
                      )}
                    </div>
                  </TableCell>

                  {/* Density */}
                  <TableCell className="py-2.5 px-3 text-right font-mono text-xs text-muted-foreground">
                    {row.densityFactor.toFixed(2)}×
                  </TableCell>

                  {/* Weight */}
                  <TableCell className="py-2.5 px-3 text-right font-mono text-xs font-bold text-foreground">
                    {row.grams} g
                  </TableCell>

                  {/* Metal Rate */}
                  <TableCell className="py-2.5 px-3 text-right font-mono text-xs text-muted-foreground">
                    {formatUSD(row.ratePerGram)}/g
                  </TableCell>

                  {/* Metal Cost */}
                  <TableCell className="py-2.5 px-3 text-right font-mono text-xs text-muted-foreground">
                    {formatUSD(row.cost.metal)}
                  </TableCell>

                  {/* Total Cost (owner only) */}
                  {isOwner && (
                    <TableCell className="py-2.5 px-3 text-right font-mono text-xs font-semibold text-foreground/80">
                      {formatUSD(row.cost.total)}
                    </TableCell>
                  )}

                  {/* Sell Price */}
                  <TableCell className="py-2.5 px-3 text-right font-mono text-xs font-semibold text-primary">
                    {formatUSD(row.price.sell)}
                  </TableCell>

                  {/* MRP Listed */}
                  <TableCell className="py-2.5 px-3 text-right font-mono text-xs font-black text-foreground">
                    <span className="inline-flex items-center justify-end gap-1">
                      {formatUSD(row.price.mrp)}
                      <CopyButton value={toPlainAmount(row.price.mrp)} label={`${row.label} MRP`} />
                    </span>
                  </TableCell>

                  {/* Profit (owner only) */}
                  {isOwner && (
                    <TableCell className="py-2.5 px-3 text-right font-mono text-xs font-bold text-success">
                      {formatUSD(row.price.profit)}
                    </TableCell>
                  )}

                  {/* Add action */}
                  {onAddSingle && (
                    <TableCell className="py-2.5 px-3 text-center">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => onAddSingle(row)}
                        className="h-7 text-xs font-medium hover:text-primary hover:bg-primary/10"
                        title={`Add ${row.label} variant to catalog`}
                      >
                        <Plus className="size-3" /> Add
                      </Button>
                    </TableCell>
                  )}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
