"use client";

import { RotateCcw, Plus } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CostPreview } from "@/components/jewel-calc/rings/cost-preview";
import { Field, MetalSelect, StoneTypeSelect } from "@/components/jewel-calc/rings/form-fields";
import { CENTER_SIZES, DEFAULT_SINGLE_DRAFT, METAL_LABEL } from "@/lib/constants";
import { formatUSD, toNonNegative } from "@/lib/format";
import { convertMetalWeight } from "@/lib/pricing";
import { usePricingStore } from "@/store/pricing-store";
import type { CenterSize, MetalKey, RingDraft, SingleItemDraftState } from "@/types/pricing";

const NO_CENTER = "none";
const id = (field: string) => `single-item-${field}`;

const toDraft = (f: SingleItemDraftState): RingDraft => ({
  kind: "single",
  name: f.name.trim(),
  metal: f.metal,
  grams: toNonNegative(f.grams),
  stoneType: f.stoneType,
  centerSize: f.centerSize === NO_CENTER ? null : f.centerSize,
  sideCarats: toNonNegative(f.sideCarats),
});

/** "Single Item" tab: one item, any center size, one weight. */
export function AddRingForm() {
  const rates = usePricingStore((s) => s.rates);
  const addRing = usePricingStore((s) => s.addRing);
  const form = usePricingStore((s) => s.singleDraft);
  const setSingleDraft = usePricingStore((s) => s.setSingleDraft);
  const resetSingleDraft = usePricingStore((s) => s.resetSingleDraft);

  const update = <K extends keyof SingleItemDraftState>(key: K, value: SingleItemDraftState[K]) =>
    setSingleDraft({ [key]: value });

  /** Switching metal re-scales the weight by density (same design, different metal). */
  const changeMetal = (next: MetalKey) => {
    const grams = parseFloat(form.grams);
    if (Number.isFinite(grams) && grams > 0 && next !== form.metal) {
      const converted = convertMetalWeight(grams, form.metal, next);
      setSingleDraft({ metal: next, grams: String(converted) });
      toast(`Weight converted: ${grams}g → ${converted}g (${METAL_LABEL[next]})`);
    } else {
      update("metal", next);
    }
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const draft = toDraft(form);
    if (!draft.name) return toast.error("Please enter an item name");
    if (draft.grams <= 0) return toast.error("Please enter metal weight in grams");
    addRing(draft);
    // Keep metal + stone type for faster batch entry
    setSingleDraft({ ...DEFAULT_SINGLE_DRAFT, metal: form.metal, stoneType: form.stoneType });
    toast.success("Item added to pricing table");
  };

  const centerRates = rates.stones[form.stoneType].center;
  const isDirty =
    Boolean(form.name) ||
    Boolean(form.grams) ||
    form.centerSize !== NO_CENTER ||
    Boolean(form.sideCarats);

  return (
    <div className="space-y-5">
      <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Field label="Item name / style" htmlFor={id("name")} className="sm:col-span-2">
          <Input
            id={id("name")}
            placeholder="e.g. 18K Solitaire Diamond Ring"
            value={form.name}
            onChange={(e) => update("name", e.target.value)}
          />
        </Field>

        <Field label="Metal type">
          <MetalSelect value={form.metal} onChange={changeMetal} />
        </Field>

        <Field label="Metal weight (g)" htmlFor={id("grams")}>
          <Input
            id={id("grams")}
            type="number"
            inputMode="decimal"
            min={0}
            step={0.01}
            placeholder="e.g. 5.5"
            value={form.grams}
            onChange={(e) => update("grams", e.target.value)}
          />
        </Field>

        <Field label="Center diamond type">
          <StoneTypeSelect value={form.stoneType} onChange={(v) => update("stoneType", v)} />
        </Field>

        <Field label="Center stone">
          <Select
            value={form.centerSize}
            onValueChange={(v) => update("centerSize", v as SingleItemDraftState["centerSize"])}
          >
            <SelectTrigger aria-label="Center stone">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={NO_CENTER}>No center stone</SelectItem>
              {CENTER_SIZES.map((size) => (
                <SelectItem key={size} value={size}>
                  {size} ct — {formatUSD(centerRates[size])}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>

        <Field label="Side stones (ct)" htmlFor={id("side")}>
          <Input
            id={id("side")}
            type="number"
            inputMode="decimal"
            min={0}
            step={0.01}
            placeholder="e.g. 0.30"
            value={form.sideCarats}
            onChange={(e) => update("sideCarats", e.target.value)}
          />
        </Field>

        <div className="flex items-end gap-2">
          <Button type="submit" className="flex-1">
            <Plus /> Add Item
          </Button>
          {isDirty && (
            <Button
              type="button"
              variant="outline"
              size="icon"
              title="Clear single item form"
              onClick={() => {
                resetSingleDraft();
                toast("Form cleared");
              }}
            >
              <RotateCcw className="size-4" />
              <span className="sr-only">Clear Form</span>
            </Button>
          )}
        </div>
      </form>

      <CostPreview draft={toDraft(form)} />
    </div>
  );
}
