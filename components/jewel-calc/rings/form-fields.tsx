"use client";

import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { METALS, STONE_TYPES } from "@/lib/constants";
import { formatUSD } from "@/lib/format";
import { cn } from "@/lib/utils";
import { usePricingStore } from "@/store/pricing-store";
import type { MetalKey, StoneType } from "@/types/pricing";

/** Label + control wrapper used by both add-item forms. */
export function Field({
  label,
  htmlFor,
  className,
  children,
}: {
  label: string;
  htmlFor?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("space-y-2", className)}>
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
    </div>
  );
}

/** Metal dropdown showing the live $/g rate. */
export function MetalSelect({
  value,
  onChange,
}: {
  value: MetalKey;
  onChange: (metal: MetalKey) => void;
}) {
  const metalPerGram = usePricingStore((s) => s.rates.metalPerGram);
  return (
    <Select value={value} onValueChange={(v) => onChange(v as MetalKey)}>
      <SelectTrigger aria-label="Metal type">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {METALS.map((m) => (
          <SelectItem key={m.key} value={m.key}>
            {m.label} ({formatUSD(metalPerGram[m.key])}/g)
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

/** Center diamond type dropdown (Lab Grown / Moissanite / Old Mine Cut). */
export function StoneTypeSelect({
  value,
  onChange,
}: {
  value: StoneType;
  onChange: (stone: StoneType) => void;
}) {
  return (
    <Select value={value} onValueChange={(v) => onChange(v as StoneType)}>
      <SelectTrigger aria-label="Center diamond type">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {STONE_TYPES.map((s) => (
          <SelectItem key={s.key} value={s.key}>
            <span className="size-2 rounded-full" style={{ background: s.colorVar }} />
            {s.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
