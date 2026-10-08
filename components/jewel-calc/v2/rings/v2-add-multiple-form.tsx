"use client";

import { useId, useMemo, useState } from "react";
import {
  Check,
  CheckCheck,
  Copy,
  Layers,
  Plus,
  RotateCcw,
  Sparkles,
  TableProperties,
  Wand2,
} from "lucide-react";
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
import { CopyButton } from "@/components/jewel-calc/copy-button";
import {
  CENTER_SIZES,
  METAL_LABEL,
  METAL_WEIGHT_FACTOR,
  METALS,
  STONE_META,
  STONE_TYPES,
} from "@/lib/constants";
import { formatUSD, toNonNegative, toPlainAmount } from "@/lib/format";
import { calcCost, calcPrice, convertMetalWeight, steppedWeights } from "@/lib/pricing";
import { cn } from "@/lib/utils";
import { usePricingStore } from "@/store/pricing-store";
import type { CenterSize, MetalKey, RingDraft, StoneType } from "@/types/pricing";

interface VariantRowState {
  size: CenterSize;
  enabled: boolean;
  overrideWeight: string; // empty if using stepped weight
  sideCarats: string;
}

const ALL_METALS_KEYS: MetalKey[] = ["silver", "10k", "14k", "18k", "platinum"];

const SIDE_PRESETS = [
  { label: "Solitaire (0ct)", value: "0" },
  { label: "Pavé (0.15ct)", value: "0.15" },
  { label: "Halo (0.35ct)", value: "0.35" },
  { label: "Bold (0.60ct)", value: "0.60" },
] as const;

const STEP_CHIPS = ["0.25", "0.50", "0.75", "1.00"] as const;

export function V2AddMultipleForm() {
  const formId = useId();
  const rates = usePricingStore((s) => s.rates);
  const params = usePricingStore((s) => s.params);
  const isOwner = usePricingStore((s) => s.isOwner);
  const addRings = usePricingStore((s) => s.addRings);

  // Form states
  const [name, setName] = useState("");
  const [metal, setMetal] = useState<MetalKey>("18k");
  const [stoneType, setStoneType] = useState<StoneType>("lab");
  const [baseGrams, setBaseGrams] = useState("3.0");
  const [stepGrams, setStepGrams] = useState("0.5");
  const [bulkSideInput, setBulkSideInput] = useState("");

  // Metal View Mode: "all-metals" (Cross-metal grid) vs "single" (active metal detail)
  const [metalScope, setMetalScope] = useState<"single" | "all-metals">("all-metals");
  const [tableTab, setTableTab] = useState<"matrix" | "detailed">("matrix");

  // Which metals to include when batch adding in "All Metals" mode
  const [selectedMetals, setSelectedMetals] = useState<Record<MetalKey, boolean>>({
    silver: true,
    "10k": true,
    "14k": true,
    "18k": true,
    platinum: true,
  });

  // Detailed variant overrides per size
  const [variants, setVariants] = useState<Record<CenterSize, VariantRowState>>(() => {
    return Object.fromEntries(
      CENTER_SIZES.map((size) => [
        size,
        { size, enabled: true, overrideWeight: "", sideCarats: "" },
      ])
    ) as Record<CenterSize, VariantRowState>;
  });

  // Calculate default stepped weights based on enabled sizes order
  const calculatedRows = useMemo(() => {
    const base = toNonNegative(baseGrams, 0);
    const step = toNonNegative(stepGrams, 0);
    const defaultWeights = steppedWeights(base, step, CENTER_SIZES.length);

    return CENTER_SIZES.map((size, index) => {
      const v = variants[size] || {
        size,
        enabled: true,
        overrideWeight: "",
        sideCarats: "",
      };
      const autoWeight = defaultWeights[index] ?? base;
      const weight =
        v.overrideWeight && toNonNegative(v.overrideWeight, 0) > 0
          ? toNonNegative(v.overrideWeight)
          : autoWeight;
      const sideCarats = toNonNegative(v.sideCarats, 0);

      const draft: RingDraft = {
        kind: "multiple",
        name: name.trim() || "Item Series",
        metal,
        stoneType,
        grams: weight,
        centerSize: size,
        sideCarats,
      };

      const cost = calcCost(draft, rates);
      const price = calcPrice(cost.total, params);

      // Also compute all 5 metals for this specific size variant
      const metalVariants = ALL_METALS_KEYS.map((mKey) => {
        const convertedWeight = convertMetalWeight(weight, metal, mKey);
        const mDraft: RingDraft = {
          kind: "multiple",
          name: `${name.trim() || "Item Series"} (${METAL_LABEL[mKey]})`,
          metal: mKey,
          stoneType,
          grams: convertedWeight,
          centerSize: size,
          sideCarats,
        };
        const mCost = calcCost(mDraft, rates);
        const mPrice = calcPrice(mCost.total, params);
        return {
          metal: mKey,
          label: METAL_LABEL[mKey],
          weight: convertedWeight,
          cost: mCost,
          price: mPrice,
          draft: mDraft,
        };
      });

      return {
        size,
        enabled: v.enabled,
        weight,
        isCustomWeight: Boolean(v.overrideWeight),
        sideCarats,
        cost,
        price,
        draft,
        metalVariants,
      };
    });
  }, [baseGrams, stepGrams, variants, name, metal, stoneType, rates, params]);

  const activeRows = calculatedRows.filter((r) => r.enabled);
  const activeMetalsList = ALL_METALS_KEYS.filter((m) => selectedMetals[m]);

  // Metal switcher with auto density scaling
  const handleMetalChange = (nextMetal: MetalKey) => {
    const currentBase = parseFloat(baseGrams);
    if (Number.isFinite(currentBase) && currentBase > 0 && nextMetal !== metal) {
      const newBase = convertMetalWeight(currentBase, metal, nextMetal);
      const currentStep = toNonNegative(stepGrams, 0);
      const newStep = currentStep > 0 ? convertMetalWeight(currentStep, metal, nextMetal) : 0;

      setMetal(nextMetal);
      setBaseGrams(String(newBase));
      if (currentStep > 0) setStepGrams(String(newStep));
      toast(`Converted weights to ${METAL_LABEL[nextMetal]} (${METAL_WEIGHT_FACTOR[nextMetal]}× density)`);
    } else {
      setMetal(nextMetal);
    }
  };

  // Toggle individual size variant
  const toggleVariant = (size: CenterSize) => {
    setVariants((prev) => ({
      ...prev,
      [size]: { ...prev[size], enabled: !prev[size].enabled },
    }));
  };

  // Toggle metal selection for batch adding
  const toggleMetalSelect = (m: MetalKey) => {
    setSelectedMetals((prev) => ({
      ...prev,
      [m]: !prev[m],
    }));
  };

  const setAllMetals = (enabled: boolean) => {
    setSelectedMetals(
      Object.fromEntries(ALL_METALS_KEYS.map((m) => [m, enabled])) as Record<MetalKey, boolean>
    );
  };

  // Select / Deselect All Sizes
  const setAllVariants = (enabled: boolean) => {
    setVariants((prev) => {
      const next = { ...prev };
      for (const size of CENTER_SIZES) {
        next[size] = { ...next[size], enabled };
      }
      return next;
    });
  };

  // Quick Side Stones Fill
  const applySideToAll = (val: string) => {
    setVariants((prev) => {
      const next = { ...prev };
      for (const size of CENTER_SIZES) {
        if (next[size].enabled) {
          next[size] = { ...next[size], sideCarats: val };
        }
      }
      return next;
    });
    toast.success(`Applied ${val ? `${val} ct` : "0 ct"} side stones to all active sizes`);
  };

  // Individual variant updates
  const updateVariantSide = (size: CenterSize, sideCarats: string) => {
    setVariants((prev) => ({
      ...prev,
      [size]: { ...prev[size], sideCarats },
    }));
  };

  const updateVariantWeight = (size: CenterSize, overrideWeight: string) => {
    setVariants((prev) => ({
      ...prev,
      [size]: { ...prev[size], overrideWeight },
    }));
  };

  // Clear form
  const handleReset = () => {
    setName("");
    setBaseGrams("3.0");
    setStepGrams("0.5");
    setBulkSideInput("");
    setVariants(
      Object.fromEntries(
        CENTER_SIZES.map((size) => [
          size,
          { size, enabled: true, overrideWeight: "", sideCarats: "" },
        ])
      ) as Record<CenterSize, VariantRowState>
    );
    toast("Multiple items form cleared");
  };

  // Copy Complete Multi-Metal Price Grid
  const copyCrossMetalGrid = () => {
    const header = ["Size", "Side ct", ...ALL_METALS_KEYS.map((m) => METAL_LABEL[m])].join("\t");
    const body = activeRows.map((r) => {
      const cells = [
        `${r.size} ct`,
        r.sideCarats ? `${r.sideCarats} ct` : "0 ct",
        ...r.metalVariants.map((mv) => `${formatUSD(mv.price.mrp)} (${mv.weight}g)`),
      ];
      return cells.join("\t");
    });
    const tableText = `${name.trim() || "Item Series"} [${STONE_META[stoneType].label}]\n${header}\n${body.join("\n")}`;
    navigator.clipboard.writeText(tableText);
    toast.success("Cross-Metal price matrix copied to clipboard (ready for Excel / Docs)");
  };

  // Submit batch to table
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return toast.error("Please enter a collection / series name");
    if (activeRows.length === 0) return toast.error("Please enable at least one size variant");
    if (toNonNegative(baseGrams, 0) <= 0) return toast.error("Please enter a valid starting weight");

    let draftsToAdd: RingDraft[] = [];

    if (metalScope === "all-metals") {
      if (activeMetalsList.length === 0) return toast.error("Please select at least one metal");

      // For every active size × every active metal
      for (const row of activeRows) {
        for (const mv of row.metalVariants) {
          if (selectedMetals[mv.metal]) {
            draftsToAdd.push({
              ...mv.draft,
              name: `${name.trim()} - ${row.size}ct (${mv.label})`,
            });
          }
        }
      }
      addRings(draftsToAdd);
      toast.success(
        `Added all ${draftsToAdd.length} items (${activeRows.length} Sizes × ${activeMetalsList.length} Metals) to catalog!`
      );
    } else {
      // Single metal mode
      draftsToAdd = activeRows.map((r) => ({
        ...r.draft,
        name: `${name.trim()} - ${r.size}ct`,
      }));
      addRings(draftsToAdd);
      toast.success(`Added ${draftsToAdd.length} items (${METAL_LABEL[metal]}) to catalog!`);
    }
  };

  const centerRates = rates.stones[stoneType].center;

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Configuration Header Card */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* Collection Name */}
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor={`${formId}-name`} className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Series / Collection Name
            </Label>
            <Input
              id={`${formId}-name`}
              placeholder="e.g. Royal Solitaire Series"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="font-medium bg-card"
            />
          </div>

          {/* Base Metal Type */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Base Reference Metal
              </Label>
              <span className="text-[10px] text-primary font-medium">
                {METAL_WEIGHT_FACTOR[metal]}× Density
              </span>
            </div>
            <Select value={metal} onValueChange={(v) => handleMetalChange(v as MetalKey)}>
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

          {/* Center Stone Type */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Diamond / Stone Type
            </Label>
            <Select value={stoneType} onValueChange={(v) => setStoneType(v as StoneType)}>
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
        </div>

        {/* Stepped Weights Engine */}
        <div className="rounded-xl border bg-accent/25 p-4 sm:p-5 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/60 pb-3">
            <div>
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Layers className="size-4 text-primary" /> Stepped Weight Calculation
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Automatically scales base weight as stone size increases (auto-converted to other metals)
              </p>
            </div>
            <div className="text-xs text-muted-foreground">
              Base: <span className="font-mono text-primary font-semibold">{METAL_LABEL[metal]}</span>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-1.5">
              <Label htmlFor={`${formId}-base`} className="text-xs font-medium">
                Starting Weight for 0.50 ct (g)
              </Label>
              <Input
                id={`${formId}-base`}
                type="number"
                inputMode="decimal"
                step={0.05}
                min={0}
                placeholder="e.g. 3.0"
                value={baseGrams}
                onChange={(e) => setBaseGrams(e.target.value)}
                className="bg-card font-mono text-base font-semibold"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor={`${formId}-step`} className="text-xs font-medium">
                  Add Per Size (g)
                </Label>
                <div className="flex items-center gap-1">
                  {STEP_CHIPS.map((chip) => (
                    <button
                      key={chip}
                      type="button"
                      onClick={() => setStepGrams(chip)}
                      className={cn(
                        "rounded px-1.5 py-0.5 text-[10px] font-semibold transition-colors",
                        stepGrams === chip
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground hover:bg-muted-foreground/20"
                      )}
                    >
                      +{chip}g
                    </button>
                  ))}
                </div>
              </div>
              <Input
                id={`${formId}-step`}
                type="number"
                inputMode="decimal"
                step={0.05}
                min={0}
                placeholder="e.g. 0.5"
                value={stepGrams}
                onChange={(e) => setStepGrams(e.target.value)}
                className="bg-card font-mono text-base font-semibold"
              />
            </div>

            <div className="space-y-1.5 sm:col-span-2 lg:col-span-1">
              <Label className="text-xs font-medium">Base Weight Span</Label>
              <div className="flex h-9 items-center justify-between rounded-md border bg-card px-3 text-sm">
                <span className="text-xs text-muted-foreground">0.50ct → 5.00ct:</span>
                <span className="font-mono font-bold text-primary">
                  {activeRows.length > 0
                    ? `${activeRows[0].weight}g → ${activeRows[activeRows.length - 1].weight}g`
                    : "—"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Global Side Stones Auto-Fill Bar */}
        <div className="rounded-xl border bg-card p-4 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Wand2 className="size-4 text-primary" />
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Quick Fill Side Stones
              </span>
            </div>
            <span className="text-xs text-muted-foreground">
              Rate: <span className="font-semibold text-foreground">{formatUSD(rates.stones[stoneType].sidePerCarat)}/ct</span>
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {SIDE_PRESETS.map((preset) => (
              <Button
                key={preset.label}
                type="button"
                variant="outline"
                size="sm"
                className="h-8 text-xs font-medium hover:border-primary/50 hover:bg-primary/5"
                onClick={() => applySideToAll(preset.value)}
              >
                {preset.label}
              </Button>
            ))}

            <div className="flex items-center gap-1.5 ml-auto">
              <Input
                type="number"
                inputMode="decimal"
                step={0.01}
                min={0}
                placeholder="Custom ct"
                value={bulkSideInput}
                onChange={(e) => setBulkSideInput(e.target.value)}
                className="h-8 w-24 text-xs font-mono bg-card"
              />
              <Button
                type="button"
                size="sm"
                variant="secondary"
                className="h-8 text-xs"
                onClick={() => {
                  if (!bulkSideInput) return toast.error("Enter a carat value first");
                  applySideToAll(bulkSideInput);
                }}
              >
                Apply to All
              </Button>
            </div>
          </div>
        </div>

        {/* Size Selection Chips & Controls */}
        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Active Center Sizes ({activeRows.length}/{CENTER_SIZES.length} Selected)
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setAllVariants(true)}
                className="text-xs font-medium text-primary hover:underline"
              >
                Select All
              </button>
              <span className="text-muted-foreground text-xs">·</span>
              <button
                type="button"
                onClick={() => setAllVariants(false)}
                className="text-xs font-medium text-muted-foreground hover:text-foreground"
              >
                Clear All
              </button>
            </div>
          </div>

          {/* Size Pills */}
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
            {CENTER_SIZES.map((size) => {
              const active = variants[size]?.enabled ?? true;
              const rate = centerRates[size];
              return (
                <button
                  key={size}
                  type="button"
                  onClick={() => toggleVariant(size)}
                  className={cn(
                    "flex flex-col items-start gap-1 rounded-lg border p-2.5 text-left transition-all",
                    active
                      ? "border-primary bg-primary/10 shadow-xs ring-1 ring-primary/20"
                      : "border-border/60 bg-muted/30 opacity-60 hover:opacity-100"
                  )}
                >
                  <div className="flex w-full items-center justify-between">
                    <span className="font-bold text-sm text-foreground">{size} ct</span>
                    <span
                      className={cn(
                        "flex size-4 items-center justify-center rounded-full text-[10px]",
                        active ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                      )}
                    >
                      {active ? <Check className="size-2.5" /> : null}
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-muted-foreground">
                    Stone: {formatUSD(rate)}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Metal Scope & Matrix Selection Toolbar */}
        <div className="rounded-xl border bg-card p-4 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-foreground">
                Pricing Display Mode:
              </span>
              <div className="flex items-center rounded-lg border border-border/80 bg-muted/60 p-0.5 text-xs">
                <button
                  type="button"
                  onClick={() => {
                    setMetalScope("all-metals");
                    setTableTab("matrix");
                  }}
                  className={cn(
                    "rounded-md px-3 py-1 font-semibold transition-all cursor-pointer flex items-center gap-1.5",
                    metalScope === "all-metals"
                      ? "bg-primary text-primary-foreground shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <Sparkles className="size-3 text-amber-200" />
                  <span>All Metals at Once</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setMetalScope("single");
                    setTableTab("detailed");
                  }}
                  className={cn(
                    "rounded-md px-3 py-1 font-semibold transition-all cursor-pointer",
                    metalScope === "single"
                      ? "bg-card text-foreground shadow-xs border"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <span>{METAL_LABEL[metal]} Only</span>
                </button>
              </div>
            </div>

            {metalScope === "all-metals" && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={copyCrossMetalGrid}
                className="h-8 text-xs gap-1.5"
              >
                <Copy className="size-3.5" /> Copy All Metals Grid
              </Button>
            )}
          </div>

          {/* Metal checkboxes when in All Metals mode */}
          {metalScope === "all-metals" && (
            <div className="pt-2 border-t flex flex-wrap items-center justify-between gap-2 text-xs">
              <span className="text-muted-foreground text-[11px] font-medium">
                Include in Catalog Addition:
              </span>
              <div className="flex flex-wrap items-center gap-2">
                {ALL_METALS_KEYS.map((m) => {
                  const checked = selectedMetals[m];
                  return (
                    <button
                      key={m}
                      type="button"
                      onClick={() => toggleMetalSelect(m)}
                      className={cn(
                        "rounded-md px-2.5 py-1 text-xs font-semibold transition-all flex items-center gap-1.5 border",
                        checked
                          ? "border-primary/50 bg-primary/10 text-primary"
                          : "border-border/60 bg-muted/30 text-muted-foreground opacity-60"
                      )}
                    >
                      <span className={cn("size-2 rounded-full", checked ? "bg-primary" : "bg-muted-foreground")} />
                      <span>{METAL_LABEL[m]}</span>
                    </button>
                  );
                })}
                <span className="text-muted-foreground">·</span>
                <button
                  type="button"
                  onClick={() => setAllMetals(true)}
                  className="text-primary hover:underline font-medium text-[11px]"
                >
                  All
                </button>
                <button
                  type="button"
                  onClick={() => setAllMetals(false)}
                  className="text-muted-foreground hover:text-foreground text-[11px]"
                >
                  None
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Matrix or Detailed Table */}
        {metalScope === "all-metals" && tableTab === "matrix" ? (
          /* CROSS-METAL ALL-AT-ONCE PRICING GRID */
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                  <Sparkles className="size-4 text-primary" /> Cross-Metal Pricing Matrix (All Sizes × All Metals)
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  View listed MRPs across Silver, 10K, 14K, 18K, and Platinum in one clean grid
                </p>
              </div>
            </div>

            <div className="overflow-x-auto rounded-xl border bg-card shadow-xs">
              <table className="w-full text-left text-sm">
                <thead className="border-b bg-muted/50 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                  <tr>
                    <th className="py-2.5 px-3">Size</th>
                    <th className="py-2.5 px-3">Side ct</th>
                    {ALL_METALS_KEYS.map((m) => (
                      <th key={m} className="py-2.5 px-3 text-right">
                        <div>
                          <span>{METAL_LABEL[m]}</span>
                          <span className="block text-[10px] text-muted-foreground font-normal lowercase">
                            {METAL_WEIGHT_FACTOR[m]}×
                          </span>
                        </div>
                      </th>
                    ))}
                    <th className="py-2.5 px-3 text-center">Active</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {calculatedRows.map((row) => {
                    const active = row.enabled;
                    return (
                      <tr
                        key={row.size}
                        className={cn(
                          "transition-colors",
                          active ? "hover:bg-muted/30" : "bg-muted/10 opacity-40"
                        )}
                      >
                        {/* Size */}
                        <td className="py-2.5 px-3 font-bold text-foreground whitespace-nowrap">
                          <span className="inline-flex items-center gap-1.5">
                            <span
                              className="size-2 rounded-full"
                              style={{ background: STONE_META[stoneType].colorVar }}
                            />
                            {row.size} ct
                          </span>
                          <span className="block text-[11px] font-normal text-muted-foreground font-mono">
                            Stone: {formatUSD(row.cost.center)}
                          </span>
                        </td>

                        {/* Side Stones with inline input */}
                        <td className="py-2 px-3">
                          <div className="flex items-center gap-1 max-w-[85px]">
                            <Input
                              type="number"
                              inputMode="decimal"
                              step={0.01}
                              min={0}
                              disabled={!active}
                              value={variants[row.size]?.sideCarats ?? ""}
                              placeholder="0"
                              onChange={(e) => updateVariantSide(row.size, e.target.value)}
                              className="h-7 px-2 font-mono text-xs bg-card"
                            />
                            <span className="text-[11px] text-muted-foreground">ct</span>
                          </div>
                        </td>

                        {/* 5 Metal Cells */}
                        {row.metalVariants.map((mv) => (
                          <td key={mv.metal} className="py-2 px-3 text-right">
                            <div className="font-mono font-bold text-xs text-foreground inline-flex items-center justify-end gap-1">
                              <span>{formatUSD(mv.price.mrp)}</span>
                              <CopyButton value={toPlainAmount(mv.price.mrp)} label={`${mv.label} ${row.size}ct MRP`} />
                            </div>
                            <div className="text-[10px] text-muted-foreground font-mono">
                              <span>{mv.weight}g</span>
                              {isOwner && (
                                <span className="text-success font-semibold ml-1">
                                  (+{formatUSD(mv.price.profit)})
                                </span>
                              )}
                            </div>
                          </td>
                        ))}

                        {/* Active toggle */}
                        <td className="py-2.5 px-3 text-center">
                          <button
                            type="button"
                            onClick={() => toggleVariant(row.size)}
                            className={cn(
                              "rounded px-2 py-0.5 text-[11px] font-semibold transition-colors",
                              active
                                ? "bg-primary/10 text-primary hover:bg-primary/20"
                                : "bg-muted text-muted-foreground hover:bg-muted-foreground/20"
                            )}
                          >
                            {active ? "On" : "Off"}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          /* DETAILED SINGLE-METAL BREAKDOWN TABLE */
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-foreground">
                Detailed Breakdown — {METAL_LABEL[metal]} ({activeRows.length} ready)
              </h3>
              <span className="text-xs text-muted-foreground">
                Click weights or side cts to customize individual sizes
              </span>
            </div>

            <div className="overflow-x-auto rounded-xl border bg-card shadow-xs">
              <table className="w-full text-left text-sm">
                <thead className="border-b bg-muted/50 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                  <tr>
                    <th className="py-2.5 px-3">Size</th>
                    <th className="py-2.5 px-3">Weight (g)</th>
                    <th className="py-2.5 px-3">Center Stone $</th>
                    <th className="py-2.5 px-3">Side Stones (ct)</th>
                    {isOwner && <th className="py-2.5 px-3 text-right">Cost $</th>}
                    <th className="py-2.5 px-3 text-right">Sell Price</th>
                    <th className="py-2.5 px-3 text-right">MRP Listed</th>
                    {isOwner && <th className="py-2.5 px-3 text-right">Profit</th>}
                    <th className="py-2.5 px-3 text-center">Active</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {calculatedRows.map((row) => {
                    const active = row.enabled;
                    return (
                      <tr
                        key={row.size}
                        className={cn(
                          "transition-colors",
                          active ? "hover:bg-muted/30" : "bg-muted/10 opacity-40"
                        )}
                      >
                        {/* Size */}
                        <td className="py-2.5 px-3 font-bold text-foreground whitespace-nowrap">
                          <span className="inline-flex items-center gap-1.5">
                            <span
                              className="size-2 rounded-full"
                              style={{ background: STONE_META[stoneType].colorVar }}
                            />
                            {row.size} ct
                          </span>
                        </td>

                        {/* Weight with inline edit */}
                        <td className="py-2 px-3">
                          <div className="flex items-center gap-1 max-w-[90px]">
                            <Input
                              type="number"
                              inputMode="decimal"
                              step={0.1}
                              min={0}
                              disabled={!active}
                              value={variants[row.size]?.overrideWeight ?? ""}
                              placeholder={String(row.weight)}
                              onChange={(e) => updateVariantWeight(row.size, e.target.value)}
                              className="h-7 px-2 font-mono text-xs bg-card"
                            />
                            <span className="text-[11px] text-muted-foreground">g</span>
                          </div>
                        </td>

                        {/* Center Stone Cost */}
                        <td className="py-2.5 px-3 font-mono text-xs text-muted-foreground">
                          {formatUSD(row.cost.center)}
                        </td>

                        {/* Side Stones with inline edit */}
                        <td className="py-2 px-3">
                          <div className="flex items-center gap-1 max-w-[90px]">
                            <Input
                              type="number"
                              inputMode="decimal"
                              step={0.01}
                              min={0}
                              disabled={!active}
                              value={variants[row.size]?.sideCarats ?? ""}
                              placeholder="0"
                              onChange={(e) => updateVariantSide(row.size, e.target.value)}
                              className="h-7 px-2 font-mono text-xs bg-card"
                            />
                            <span className="text-[11px] text-muted-foreground">ct</span>
                          </div>
                        </td>

                        {/* Cost (owner only) */}
                        {isOwner && (
                          <td className="py-2.5 px-3 text-right font-mono text-xs font-medium text-muted-foreground">
                            {formatUSD(row.cost.total)}
                          </td>
                        )}

                        {/* Sell Price */}
                        <td className="py-2.5 px-3 text-right font-mono text-xs font-semibold text-primary">
                          {formatUSD(row.price.sell)}
                        </td>

                        {/* MRP Listed with Copy Button */}
                        <td className="py-2.5 px-3 text-right font-mono text-xs font-bold text-foreground">
                          <span className="inline-flex items-center justify-end gap-1">
                            {formatUSD(row.price.mrp)}
                            <CopyButton value={toPlainAmount(row.price.mrp)} label="MRP" />
                          </span>
                        </td>

                        {/* Profit (owner only) */}
                        {isOwner && (
                          <td className="py-2.5 px-3 text-right font-mono text-xs font-semibold text-success">
                            {formatUSD(row.price.profit)}
                          </td>
                        )}

                        {/* Active toggle */}
                        <td className="py-2.5 px-3 text-center">
                          <button
                            type="button"
                            onClick={() => toggleVariant(row.size)}
                            className={cn(
                              "rounded px-2 py-0.5 text-[11px] font-semibold transition-colors",
                              active
                                ? "bg-primary/10 text-primary hover:bg-primary/20"
                                : "bg-muted text-muted-foreground hover:bg-muted-foreground/20"
                            )}
                          >
                            {active ? "On" : "Off"}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Live Batch Summary Bar & Action Button */}
        <div className="flex flex-col gap-4 rounded-xl border bg-gradient-to-r from-accent/50 to-primary/5 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="border-primary/40 bg-primary/10 text-primary font-bold">
                {metalScope === "all-metals"
                  ? `${activeRows.length * activeMetalsList.length} Items Total (${activeRows.length} Sizes × ${activeMetalsList.length} Metals)`
                  : `${activeRows.length} Variants Ready`}
              </Badge>
              <span className="text-xs text-muted-foreground">
                {name.trim() || "Item Series"} · {STONE_META[stoneType].label}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              {metalScope === "all-metals" ? (
                <span>
                  Metals included:{" "}
                  <strong className="text-foreground">
                    {activeMetalsList.map((m) => METAL_LABEL[m]).join(", ") || "None"}
                  </strong>
                </span>
              ) : (
                <span>
                  MRP Range ({METAL_LABEL[metal]}):{" "}
                  <strong className="font-mono text-foreground">
                    {activeRows.length > 0
                      ? `${formatUSD(activeRows[0].price.mrp)} – ${formatUSD(activeRows[activeRows.length - 1].price.mrp)}`
                      : "$0.00"}
                  </strong>
                </span>
              )}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleReset}
              className="text-xs"
            >
              <RotateCcw className="size-3.5" /> Clear
            </Button>

            {metalScope === "all-metals" ? (
              <Button
                type="submit"
                size="default"
                disabled={activeRows.length === 0 || activeMetalsList.length === 0}
                className="px-6 font-semibold shadow-md shadow-primary/20"
              >
                <Plus className="size-4" /> Add All {activeRows.length * activeMetalsList.length} Items to Catalog
              </Button>
            ) : (
              <Button
                type="submit"
                size="default"
                disabled={activeRows.length === 0}
                className="px-6 font-semibold shadow-md shadow-primary/20"
              >
                <Plus className="size-4" /> Add {activeRows.length} Items ({METAL_LABEL[metal]}) to Catalog
              </Button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}
