"use client";

import { Slider } from "@/components/ui/slider";
import { PARAM_LIMITS } from "@/lib/constants";
import { getMultipliers } from "@/lib/pricing";
import { usePricingStore } from "@/store/pricing-store";
import type { PricingParams } from "@/types/pricing";

const CONTROLS: { key: keyof PricingParams; label: string }[] = [
  { key: "discount", label: "Discount to Customer" },
  { key: "marketplaceFee", label: "Marketplace Commission" },
  { key: "targetProfit", label: "Target Profit on Cost" },
];

export function PricingControls() {
  const params = usePricingStore((s) => s.params);
  const setParam = usePricingStore((s) => s.setParam);
  const mult = getMultipliers(params);

  return (
    <div className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-3">
        {CONTROLS.map(({ key, label }) => {
          const { min, max, step } = PARAM_LIMITS[key];
          return (
            <div key={key} className="rounded-lg border bg-card p-4">
              <p className="text-[11px] font-medium tracking-wider text-muted-foreground uppercase">
                {label}
              </p>
              <p className="tabular my-2 text-3xl font-extrabold text-primary">
                {params[key]}%
              </p>
              <Slider
                value={[params[key]]}
                min={min}
                max={max}
                step={step}
                onValueChange={([v]) => setParam(key, v)}
                aria-label={label}
              />
              <div className="mt-1.5 flex justify-between text-[10px] text-muted-foreground">
                <span>{min}%</span>
                <span>{max}%</span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid gap-3 rounded-lg bg-accent/60 p-4 text-center sm:grid-cols-3">
        <Multiplier label="MRP Multiplier" value={`${mult.mrp.toFixed(3)}×`} />
        <Multiplier label="Sell Price Multiplier" value={`${mult.sell.toFixed(3)}×`} />
        <div>
          <p className="text-[10px] tracking-wider text-muted-foreground uppercase">Formula</p>
          <p className="tabular mt-1 text-xs leading-relaxed text-accent-foreground">
            MRP = Cost × {mult.mrp.toFixed(3)}
            <br />
            Sell = Cost × {mult.sell.toFixed(3)}
          </p>
        </div>
      </div>
    </div>
  );
}

function Multiplier({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] tracking-wider text-muted-foreground uppercase">{label}</p>
      <p className="tabular text-2xl font-extrabold text-accent-foreground">{value}</p>
    </div>
  );
}
