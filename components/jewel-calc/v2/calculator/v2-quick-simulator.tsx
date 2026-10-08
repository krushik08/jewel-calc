"use client";

import { useState } from "react";
import { Calculator, ChevronDown, ChevronUp, Copy, Sparkles } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CENTER_SIZES, METALS, STONE_META, STONE_TYPES } from "@/lib/constants";
import { formatUSD, toNonNegative, toPlainAmount } from "@/lib/format";
import { calcAllMetalsComparison, calcCost, calcPrice } from "@/lib/pricing";
import { cn } from "@/lib/utils";
import { usePricingStore } from "@/store/pricing-store";
import type { CenterSize, MetalKey, RingDraft, StoneType } from "@/types/pricing";

export function V2QuickSimulator() {
  const [open, setOpen] = useState(false);
  const rates = usePricingStore((s) => s.rates);
  const params = usePricingStore((s) => s.params);
  const isOwner = usePricingStore((s) => s.isOwner);

  const [metal, setMetal] = useState<MetalKey>("18k");
  const [stoneType, setStoneType] = useState<StoneType>("lab");
  const [centerSize, setCenterSize] = useState<CenterSize | "none">("1.00");
  const [grams, setGrams] = useState("3.5");
  const [sideCarats, setSideCarats] = useState("0.25");

  const [viewMode, setViewMode] = useState<"single" | "all-metals">("all-metals");

  const draft: RingDraft = {
    kind: "single",
    name: "Quick Quote",
    metal,
    grams: toNonNegative(grams),
    stoneType,
    centerSize: centerSize === "none" ? null : centerSize,
    sideCarats: toNonNegative(sideCarats),
  };

  const cost = calcCost(draft, rates);
  const price = calcPrice(cost.total, params);

  const allMetals = calcAllMetalsComparison(
    {
      name: "Quick Quote",
      grams: toNonNegative(grams),
      stoneType,
      centerSize: centerSize === "none" ? null : centerSize,
      sideCarats: toNonNegative(sideCarats),
      baseMetal: metal,
      kind: "single",
    },
    rates,
    params
  );

  const copySummary = () => {
    if (viewMode === "all-metals") {
      const stoneStr = centerSize === "none" ? "No center" : `${centerSize}ct ${STONE_META[stoneType].short}`;
      const sidesStr = sideCarats ? ` + ${sideCarats}ct sides` : "";
      const lines = allMetals.map(
        (m) => `${m.label} (${m.grams}g): MRP ${formatUSD(m.price.mrp)} (Sell: ${formatUSD(m.price.sell)})`
      );
      const text = `Quick Quote [${stoneStr}${sidesStr}]:\n${lines.join("\n")}`;
      navigator.clipboard.writeText(text);
      toast.success("All 5 metals quote copied to clipboard");
    } else {
      const text = `Quote: ${metal.toUpperCase()} (${grams}g) with ${
        centerSize === "none" ? "No center" : `${centerSize}ct ${STONE_META[stoneType].short}`
      }${sideCarats ? ` + ${sideCarats}ct sides` : ""} → Listed MRP: ${formatUSD(price.mrp)}, Selling Price: ${formatUSD(price.sell)}`;
      navigator.clipboard.writeText(text);
      toast.success("Quote summary copied to clipboard");
    }
  };

  return (
    <div className="rounded-xl border border-dashed border-primary/40 bg-accent/20 p-4 shadow-xs print:hidden">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Calculator className="size-4" />
          </div>
          <div>
            <span className="text-xs font-bold text-foreground">Instant Quote Simulator</span>
            <span className="text-[11px] text-muted-foreground ml-2 hidden sm:inline">
              Calculate quick on-the-spot numbers without saving
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {open && (
            <div className="flex items-center rounded-lg border bg-muted/60 p-0.5 text-xs">
              <button
                type="button"
                onClick={() => setViewMode("all-metals")}
                className={cn(
                  "rounded-md px-2 py-0.5 text-[11px] font-semibold transition-all cursor-pointer flex items-center gap-1",
                  viewMode === "all-metals"
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Sparkles className="size-3" />
                <span>All Metals</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode("single")}
                className={cn(
                  "rounded-md px-2 py-0.5 text-[11px] font-semibold transition-all cursor-pointer",
                  viewMode === "single"
                    ? "bg-card text-foreground shadow-xs border"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <span>Single</span>
              </button>
            </div>
          )}

          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-xs font-semibold gap-1 text-primary"
            onClick={() => setOpen(!open)}
          >
            {open ? "Hide Simulator" : "Open Simulator"}
            {open ? <ChevronUp className="size-3.5" /> : <ChevronDown className="size-3.5" />}
          </Button>
        </div>
      </div>

      {open && (
        <div className="mt-4 pt-4 border-t space-y-4">
          <div className="grid gap-3 grid-cols-2 sm:grid-cols-5">
            <div>
              <Label className="text-[10px] uppercase font-bold text-muted-foreground">Base Metal</Label>
              <Select value={metal} onValueChange={(v) => setMetal(v as MetalKey)}>
                <SelectTrigger className="h-8 text-xs bg-card mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {METALS.map((m) => (
                    <SelectItem key={m.key} value={m.key}>
                      {m.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-[10px] uppercase font-bold text-muted-foreground">Weight (g)</Label>
              <Input
                type="number"
                inputMode="decimal"
                step={0.1}
                value={grams}
                onChange={(e) => setGrams(e.target.value)}
                className="h-8 text-xs font-mono bg-card mt-1"
              />
            </div>

            <div>
              <Label className="text-[10px] uppercase font-bold text-muted-foreground">Stone Type</Label>
              <Select value={stoneType} onValueChange={(v) => setStoneType(v as StoneType)}>
                <SelectTrigger className="h-8 text-xs bg-card mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STONE_TYPES.map((s) => (
                    <SelectItem key={s.key} value={s.key}>
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-[10px] uppercase font-bold text-muted-foreground">Center Size</Label>
              <Select value={centerSize} onValueChange={(v) => setCenterSize(v as any)}>
                <SelectTrigger className="h-8 text-xs bg-card mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {CENTER_SIZES.map((size) => (
                    <SelectItem key={size} value={size}>
                      {size} ct
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-[10px] uppercase font-bold text-muted-foreground">Side Stones (ct)</Label>
              <Input
                type="number"
                inputMode="decimal"
                step={0.05}
                value={sideCarats}
                onChange={(e) => setSideCarats(e.target.value)}
                className="h-8 text-xs font-mono bg-card mt-1"
              />
            </div>
          </div>

          {viewMode === "all-metals" ? (
            <div className="space-y-2">
              <div className="grid grid-cols-1 sm:grid-cols-5 gap-2.5">
                {allMetals.map((m) => (
                  <div
                    key={m.metal}
                    className="rounded-lg border bg-card p-3 shadow-2xs space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-foreground">{m.label}</span>
                      <span className="font-mono text-[11px] text-muted-foreground">{m.grams}g</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-muted-foreground block">Listed MRP</span>
                      <span className="font-mono font-extrabold text-sm text-foreground">
                        {formatUSD(m.price.mrp)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1 border-t">
                      <span>Sell: {formatUSD(m.price.sell)}</span>
                      {isOwner && <span className="text-success font-semibold">+{formatUSD(m.price.profit)}</span>}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-end pt-1">
                <Button size="sm" variant="outline" className="h-8 text-xs gap-1.5" onClick={copySummary}>
                  <Copy className="size-3.5" /> Copy All 5 Metals Quote
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg bg-card border p-3">
              <div className="flex flex-wrap items-center gap-4 text-xs font-mono">
                {isOwner && (
                  <div>
                    <span className="text-[10px] text-muted-foreground uppercase block font-sans">Cost</span>
                    <span className="font-semibold text-foreground">{formatUSD(cost.total)}</span>
                  </div>
                )}
                <div>
                  <span className="text-[10px] text-muted-foreground uppercase block font-sans">Sell Price</span>
                  <span className="font-bold text-primary">{formatUSD(price.sell)}</span>
                </div>
                <div>
                  <span className="text-[10px] text-muted-foreground uppercase block font-sans">MRP Listed</span>
                  <span className="font-extrabold text-foreground text-sm">{formatUSD(price.mrp)}</span>
                </div>
                {isOwner && (
                  <div>
                    <span className="text-[10px] text-muted-foreground uppercase block font-sans">Est. Profit</span>
                    <span className="font-bold text-success">{formatUSD(price.profit)}</span>
                  </div>
                )}
              </div>

              <Button size="sm" variant="outline" className="h-8 text-xs gap-1.5" onClick={copySummary}>
                <Copy className="size-3.5" /> Copy Summary
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
