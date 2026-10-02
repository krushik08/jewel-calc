"use client";

import { RotateCcw, Plus } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Field, MetalSelect, StoneTypeSelect } from "@/components/jewel-calc/rings/form-fields";
import { MultiplePreview } from "@/components/jewel-calc/rings/multiple-preview";
import { DEFAULT_MULTIPLE_DRAFT, METAL_LABEL, MULTIPLE_CENTER_SIZES } from "@/lib/constants";
import { formatUSD, toNonNegative } from "@/lib/format";
import { convertMetalWeight, steppedWeights } from "@/lib/pricing";
import { usePricingStore } from "@/store/pricing-store";
import type { CenterSize, MetalKey, MultipleItemsDraftState, RingDraft } from "@/types/pricing";

const id = (field: string) => `multiple-item-${field}`;
const COUNT = MULTIPLE_CENTER_SIZES.length;

/** One draft per fixed center size, with stepped weights. */
function toDrafts(f: MultipleItemsDraftState): RingDraft[] {
  const weights = steppedWeights(toNonNegative(f.baseGrams), toNonNegative(f.stepGrams), COUNT);
  return MULTIPLE_CENTER_SIZES.map((size, i) => ({
    kind: "multiple",
    name: f.name.trim(),
    metal: f.metal,
    grams: weights[i],
    stoneType: f.stoneType,
    centerSize: size,
    sideCarats: toNonNegative(f.sides?.[size]),
  }));
}

/**
 * "Multiple Items" tab: one design in 6 fixed center sizes.
 * Weight = base + step × position; side stones entered per size.
 */
export function AddMultipleForm() {
  const centerRates = usePricingStore((s) => s.rates.stones);
  const addRings = usePricingStore((s) => s.addRings);
  const form = usePricingStore((s) => s.multipleDraft);
  const setMultipleDraft = usePricingStore((s) => s.setMultipleDraft);
  const setMultipleSide = usePricingStore((s) => s.setMultipleSide);
  const resetMultipleDraft = usePricingStore((s) => s.resetMultipleDraft);

  const update = <K extends keyof MultipleItemsDraftState>(
    key: K,
    value: MultipleItemsDraftState[K]
  ) => setMultipleDraft({ [key]: value });

  /** Switching metal re-scales base and step by density (same design, different metal). */
  const changeMetal = (next: MetalKey) => {
    const base = parseFloat(form.baseGrams);
    if (!(Number.isFinite(base) && base > 0) || next === form.metal) return update("metal", next);

    const step = toNonNegative(form.stepGrams);
    const newBase = convertMetalWeight(base, form.metal, next);
    const newStep = convertMetalWeight(step, form.metal, next);
    setMultipleDraft({
      metal: next,
      baseGrams: String(newBase),
      stepGrams: form.stepGrams ? String(newStep) : "",
    });
    toast(`Weights converted to ${METAL_LABEL[next]}: ${base}g → ${newBase}g base`);
  };

  const drafts = toDrafts(form);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return toast.error("Please enter an item name");
    if (toNonNegative(form.baseGrams) <= 0) return toast.error("Please enter the starting weight");
    addRings(drafts);
    setMultipleDraft({ ...DEFAULT_MULTIPLE_DRAFT, metal: form.metal, stoneType: form.stoneType });
    toast.success(`${COUNT} items added to pricing table`);
  };

  const hasBase = toNonNegative(form.baseGrams) > 0;
  const rates = centerRates[form.stoneType].center;
  const isDirty =
    Boolean(form.name) ||
    Boolean(form.baseGrams) ||
    Boolean(form.stepGrams) ||
    Object.values(form.sides || {}).some(Boolean);

  return (
    <div className="space-y-5">
      <form onSubmit={submit} className="space-y-5">
        {/* Name — full width, top */}
        <Field label="Item name / style" htmlFor={id("name")}>
          <Input
            id={id("name")}
            placeholder="e.g. Classic Solitaire Series"
            value={form.name}
            onChange={(e) => update("name", e.target.value)}
          />
        </Field>

        {/* Shared settings */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <Field label="Metal type" className="col-span-2 sm:col-span-1">
            <MetalSelect value={form.metal} onChange={changeMetal} />
          </Field>
          <Field label="Center diamond type" className="col-span-2 sm:col-span-1">
            <StoneTypeSelect value={form.stoneType} onChange={(v) => update("stoneType", v)} />
          </Field>
          <Field label="Starting weight (g)" htmlFor={id("base")}>
            <Input
              id={id("base")}
              type="number"
              inputMode="decimal"
              min={0}
              step={0.01}
              placeholder="e.g. 3"
              value={form.baseGrams}
              onChange={(e) => update("baseGrams", e.target.value)}
            />
          </Field>
          <Field label="Add per size (g)" htmlFor={id("step")}>
            <Input
              id={id("step")}
              type="number"
              inputMode="decimal"
              min={0}
              step={0.01}
              placeholder="e.g. 0.5"
              value={form.stepGrams}
              onChange={(e) => update("stepGrams", e.target.value)}
            />
          </Field>
        </div>

        {/* One column per fixed size */}
        <div className="space-y-2">
          <Label>Sizes · side stones (ct)</Label>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {drafts.map((d) => {
              const size = d.centerSize as CenterSize;
              return (
                <div key={size} className="space-y-2 rounded-lg border bg-muted/40 p-3">
                  <div className="flex items-baseline justify-between gap-1">
                    <span className="tabular text-sm font-bold">{size} ct</span>
                    <span className="tabular text-[11px] text-muted-foreground">
                      {formatUSD(rates[size])}
                    </span>
                  </div>
                  <p className="tabular text-xs text-muted-foreground">
                    Weight{" "}
                    <span className="font-semibold text-primary">
                      {hasBase ? `${d.grams} g` : "—"}
                    </span>
                  </p>
                  <Input
                    type="number"
                    inputMode="decimal"
                    min={0}
                    step={0.01}
                    placeholder="Side ct"
                    aria-label={`Side stones for ${size} ct (carats)`}
                    value={form.sides?.[size] ?? ""}
                    onChange={(e) => setMultipleSide(size, e.target.value)}
                    className="tabular h-8 bg-card"
                  />
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex items-center justify-end gap-2">
          {isDirty && (
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                resetMultipleDraft();
                toast("Multiple items form cleared");
              }}
            >
              <RotateCcw className="size-4" /> Clear Form
            </Button>
          )}
          <Button type="submit" className="w-full sm:w-auto sm:px-8">
            <Plus /> Add {COUNT} Items
          </Button>
        </div>
      </form>

      <MultiplePreview drafts={drafts} show={hasBase} />
    </div>
  );
}
