"use client";

import { useEffect, useState } from "react";
import { Check, Tag } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PARAM_LIMITS } from "@/lib/constants";
import { usePricingStore } from "@/store/pricing-store";

const { min, max } = PARAM_LIMITS.discount;

export function DiscountControl() {
  const discount = usePricingStore((s) => s.params.discount);
  const setParam = usePricingStore((s) => s.setParam);
  const [draft, setDraft] = useState(String(discount));

  useEffect(() => setDraft(String(discount)), [discount]);

  const apply = () => {
    const n = parseFloat(draft);
    if (!Number.isFinite(n) || n < min || n > max) {
      toast.error(`Enter a valid discount (${min}–${max}%)`);
      return;
    }
    setParam("discount", n);
    toast.success(`Discount saved: ${n}%`);
  };

  const dirty = draft !== String(discount);

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-stretch">
      <div className="flex items-center gap-3 rounded-lg border-2 border-dashed border-primary/40 bg-accent/60 px-4 py-2.5">
        <Tag className="size-5 text-primary" />
        <div>
          <p className="text-[10px] tracking-wider text-muted-foreground uppercase">Customer Discount</p>
          <p className="tabular text-3xl leading-none font-extrabold text-primary">{discount}%</p>
          <p className="text-[10px] text-muted-foreground">Applied to all listed prices</p>
        </div>
      </div>

      <form
        className="flex flex-wrap items-center gap-2 rounded-lg border bg-card px-4 py-2.5"
        onSubmit={(e) => {
          e.preventDefault();
          apply();
        }}
      >
        <label htmlFor="cust-disc" className="text-[11px] tracking-wider text-muted-foreground uppercase">
          Set discount
        </label>
        <div className="relative">
          <Input
            id="cust-disc"
            type="number"
            inputMode="numeric"
            min={min}
            max={max}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            className="tabular w-20 pr-6 text-center font-semibold"
          />
          <span className="pointer-events-none absolute top-1/2 right-2.5 -translate-y-1/2 text-xs text-muted-foreground">
            %
          </span>
        </div>
        <Button type="submit" size="sm" disabled={!dirty}>
          <Check /> Save
        </Button>
      </form>
    </div>
  );
}
