"use client";

import { useId, useMemo, useState } from "react";
import { Plus, RotateCcw, Sparkles } from "lucide-react";
import { toast } from "sonner";

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
import { CopyButton } from "@/components/jewel-calc/copy-button";
import { V2AllMetalsTable } from "@/components/jewel-calc/v2/rings/v2-all-metals-table";
import {
  CENTER_SIZES,
  DEFAULT_SINGLE_DRAFT,
  METAL_LABEL,
  METAL_WEIGHT_FACTOR,
  METALS,
  STONE_META,
  STONE_TYPES,
} from "@/lib/constants";
import { formatUSD, toNonNegative, toPlainAmount } from "@/lib/format";
import {
  calcAllMetalsComparison,
  calcCost,
  calcPrice,
  convertMetalWeight,
  type MetalComparisonRow,
} from "@/lib/pricing";
import { cn } from "@/lib/utils";
import { usePricingStore } from "@/store/pricing-store";
import type { CenterSize, MetalKey, RingDraft, SingleItemDraftState } from "@/types/pricing";

const NO_CENTER = "none";
const SIDE_CHIPS = ["0", "0.15", "0.30", "0.50"] as const;

export function V2AddSingleForm() {
  const formId = useId();
  const rates = usePricingStore((s) => s.rates);
  const params = usePricingStore((s) => s.params);
  const isOwner = usePricingStore((s) => s.isOwner);
  const addRing = usePricingStore((s) => s.addRing);
  const addRings = usePricingStore((s) => s.addRings);
  const form = usePricingStore((s) => s.singleDraft);
  const setSingleDraft = usePricingStore((s) => s.setSingleDraft);
  const resetSingleDraft = usePricingStore((s) => s.resetSingleDraft);

  const [priceViewMode, setPriceViewMode] = useState<"single" | "all-metals">("all-metals");

  const update = <K extends keyof SingleItemDraftState>(key: K, value: SingleItemDraftState[K]) =>
    setSingleDraft({ [key]: value });

  const changeMetal = (next: MetalKey) => {
    const grams = parseFloat(form.grams);
    if (Number.isFinite(grams) && grams > 0 && next !== form.metal) {
      const converted = convertMetalWeight(grams, form.metal, next);
      setSingleDraft({ metal: next, grams: String(converted) });
      toast(`Converted weight: ${grams}g → ${converted}g (${METAL_LABEL[next]})`);
    } else {
      update("metal", next);
    }
  };

  const draft: RingDraft = {
    kind: "single",
    name: form.name.trim() || "Item",
    metal: form.metal,
    grams: toNonNegative(form.grams),
    stoneType: form.stoneType,
    centerSize: form.centerSize === NO_CENTER ? null : form.centerSize,
    sideCarats: toNonNegative(form.sideCarats),
  };

  const cost = calcCost(draft, rates);
  const price = calcPrice(cost.total, params);

  // Live comparison across all 5 metals
  const allMetals = useMemo(() => {
    return calcAllMetalsComparison(
      {
        name: form.name.trim() || "Item",
        grams: toNonNegative(form.grams),
        stoneType: form.stoneType,
        centerSize: form.centerSize === NO_CENTER ? null : form.centerSize,
        sideCarats: toNonNegative(form.sideCarats),
        baseMetal: form.metal,
        kind: "single",
      },
      rates,
      params
    );
  }, [form, rates, params]);

  const handleAddAllMetals = () => {
    if (!form.name.trim()) return toast.error("Please enter an item name");
    if (toNonNegative(form.grams) <= 0) return toast.error("Please enter metal weight in grams");

    const drafts: RingDraft[] = allMetals.map((m) => ({
      ...m.draft,
      name: `${form.name.trim()} (${m.label})`,
    }));

    addRings(drafts);
    toast.success(`Added all 5 metal variants to catalog!`);
  };

  const handleAddSingleMetalVariant = (row: MetalComparisonRow) => {
    if (!form.name.trim()) return toast.error("Please enter an item name");
    addRing({
      ...row.draft,
      name: `${form.name.trim()} (${row.label})`,
    });
    toast.success(`Added ${row.label} variant to catalog!`);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return toast.error("Please enter an item name");
    if (draft.grams <= 0) return toast.error("Please enter metal weight in grams");

    addRing({
      ...draft,
      name: form.name.trim(),
    });

    // Keep metal & stone type for rapid repetitive entries
    setSingleDraft({
      ...DEFAULT_SINGLE_DRAFT,
      metal: form.metal,
      stoneType: form.stoneType,
    });
    toast.success("Item added to catalog");
  };

  const centerRates = rates.stones[form.stoneType].center;
  const isDirty =
    Boolean(form.name) ||
    Boolean(form.grams) ||
    form.centerSize !== NO_CENTER ||
    Boolean(form.sideCarats);

  return (
    <div className="space-y-6">
      <form onSubmit={submit} className="space-y-5">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* Name */}
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor={`${formId}-name`} className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Item Name / Style Code
            </Label>
            <Input
              id={`${formId}-name`}
              placeholder="e.g. 18K Emerald Cut Halo Ring"
              value={form.name}
              onChange={(e) => update("name", e.target.value)}
              className="bg-card font-medium"
            />
          </div>

          {/* Metal Type */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Metal Type
              </Label>
              <span className="text-[10px] text-primary font-medium">
                {METAL_WEIGHT_FACTOR[form.metal]}×
              </span>
            </div>
            <Select value={form.metal} onValueChange={(v) => changeMetal(v as MetalKey)}>
              <SelectTrigger className="bg-card">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {METALS.map((m) => (
                  <SelectItem key={m.key} value={m.key}>
                    {m.label} ({formatUSD(rates.metalPerGram[m.key])}/g)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Metal Weight */}
          <div className="space-y-1.5">
            <Label htmlFor={`${formId}-grams`} className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Metal Weight (g)
            </Label>
            <Input
              id={`${formId}-grams`}
              type="number"
              inputMode="decimal"
              min={0}
              step={0.01}
              placeholder="e.g. 4.25"
              value={form.grams}
              onChange={(e) => update("grams", e.target.value)}
              className="bg-card font-mono text-base font-semibold"
            />
          </div>

          {/* Stone Type */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Diamond / Stone Type
            </Label>
            <Select value={form.stoneType} onValueChange={(v) => update("stoneType", v as any)}>
              <SelectTrigger className="bg-card">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STONE_TYPES.map((s) => (
                  <SelectItem key={s.key} value={s.key}>
                    <div className="flex items-center gap-2">
                      <span className="size-2 rounded-full" style={{ background: s.colorVar }} />
                      <span>{s.label}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Center Stone */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Center Stone
            </Label>
            <Select
              value={form.centerSize}
              onValueChange={(v) => update("centerSize", v as any)}
            >
              <SelectTrigger className="bg-card">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={NO_CENTER}>No center stone</SelectItem>
                {CENTER_SIZES.map((size) => (
                  <SelectItem key={size} value={size}>
                    {size} ct · {formatUSD(centerRates[size])}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Side Stones with Quick Chips */}
          <div className="space-y-1.5 sm:col-span-2">
            <div className="flex items-center justify-between">
              <Label htmlFor={`${formId}-side`} className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Side Stones (Carats)
              </Label>
              <div className="flex items-center gap-1">
                {SIDE_CHIPS.map((chip) => (
                  <button
                    key={chip}
                    type="button"
                    onClick={() => update("sideCarats", chip === "0" ? "" : chip)}
                    className={cn(
                      "rounded px-1.5 py-0.5 text-[10px] font-semibold transition-colors",
                      (form.sideCarats === chip || (!form.sideCarats && chip === "0"))
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground hover:bg-muted-foreground/20"
                    )}
                  >
                    {chip}ct
                  </button>
                ))}
              </div>
            </div>
            <Input
              id={`${formId}-side`}
              type="number"
              inputMode="decimal"
              min={0}
              step={0.01}
              placeholder="e.g. 0.35"
              value={form.sideCarats}
              onChange={(e) => update("sideCarats", e.target.value)}
              className="bg-card font-mono text-base font-semibold"
            />
          </div>
        </div>

        {/* Live Output Section with All Metals at Once Toggle */}
        <div className="space-y-3 pt-1">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/60 pb-2">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-foreground">
                Pricing Breakdown
              </span>
              <span className="text-[11px] text-muted-foreground ml-2">
                Live output at current rates & formulas
              </span>
            </div>

            <div className="flex items-center rounded-lg border border-border/80 bg-muted/60 p-0.5 text-xs">
              <button
                type="button"
                onClick={() => setPriceViewMode("all-metals")}
                className={cn(
                  "rounded-md px-2.5 py-1 font-semibold transition-all cursor-pointer flex items-center gap-1.5",
                  priceViewMode === "all-metals"
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Sparkles className="size-3 text-amber-200" />
                <span>All 5 Metals at Once</span>
              </button>
              <button
                type="button"
                onClick={() => setPriceViewMode("single")}
                className={cn(
                  "rounded-md px-2.5 py-1 font-semibold transition-all cursor-pointer",
                  priceViewMode === "single"
                    ? "bg-card text-foreground shadow-xs border"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <span>{METAL_LABEL[form.metal]} Only</span>
              </button>
            </div>
          </div>

          {priceViewMode === "all-metals" ? (
            <V2AllMetalsTable
              rows={allMetals}
              selectedMetal={form.metal}
              onSelectMetal={(m) => changeMetal(m as MetalKey)}
              onAddSingle={handleAddSingleMetalVariant}
              onAddAll={handleAddAllMetals}
              itemName={form.name || "Item"}
            />
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6 rounded-xl border bg-muted/40 p-4">
              <div>
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Metal Cost</span>
                <p className="font-mono text-sm font-semibold text-foreground">
                  {draft.grams > 0 ? formatUSD(cost.metal) : "—"}
                </p>
              </div>
              <div>
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Stone Cost</span>
                <p className="font-mono text-sm font-semibold text-foreground">
                  {cost.center + cost.side > 0 ? formatUSD(cost.center + cost.side) : "—"}
                </p>
              </div>
              {isOwner && (
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Total Cost</span>
                  <p className="font-mono text-sm font-semibold text-foreground">
                    {cost.total > 0 ? formatUSD(cost.total) : "—"}
                  </p>
                </div>
              )}
              <div>
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Sell Price</span>
                <p className="font-mono text-sm font-semibold text-primary">
                  {cost.total > 0 ? formatUSD(price.sell) : "—"}
                </p>
              </div>
              <div>
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Listed MRP</span>
                <p className="font-mono text-sm font-bold text-foreground inline-flex items-center gap-1">
                  {cost.total > 0 ? formatUSD(price.mrp) : "—"}
                  {cost.total > 0 && <CopyButton value={toPlainAmount(price.mrp)} label="MRP" />}
                </p>
              </div>
              {isOwner && (
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Est. Profit</span>
                  <p className="font-mono text-sm font-bold text-success">
                    {cost.total > 0 ? `${formatUSD(price.profit)} (${price.profitOnCost.toFixed(0)}%)` : "—"}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center justify-end gap-2 pt-2">
          {isDirty && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                resetSingleDraft();
                toast("Single item form cleared");
              }}
            >
              <RotateCcw className="size-3.5" /> Clear
            </Button>
          )}

          <Button
            type="button"
            variant="outline"
            onClick={handleAddAllMetals}
            className="text-xs font-semibold hover:border-primary/50"
          >
            <Sparkles className="size-3.5 text-amber-500" />
            Add All 5 Metals to Catalog
          </Button>

          <Button type="submit" className="px-6 font-semibold shadow-md shadow-primary/20">
            <Plus className="size-4" /> Add {METAL_LABEL[form.metal]} to Catalog
          </Button>
        </div>
      </form>
    </div>
  );
}
