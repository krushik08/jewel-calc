"use client";

import { Check, Lock, Percent, ShieldCheck, Sparkles } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { RateEditor } from "@/components/jewel-calc/owner/rate-editor";
import { PARAM_LIMITS } from "@/lib/constants";
import { getMultipliers } from "@/lib/pricing";
import { cn } from "@/lib/utils";
import { usePricingStore } from "@/store/pricing-store";
import type { PricingParams } from "@/types/pricing";

const PROFIT_PRESETS = [
  { label: "Wholesale (30%)", value: 30 },
  { label: "Retail Standard (50%)", value: 50 },
  { label: "D2C Brand (75%)", value: 75 },
  { label: "Luxury (100%)", value: 100 },
] as const;

export function V2OwnerPanel() {
  const params = usePricingStore((s) => s.params);
  const setParam = usePricingStore((s) => s.setParam);
  const mult = getMultipliers(params);

  const applyProfitPreset = (val: number) => {
    setParam("targetProfit", val);
    toast.success(`Target profit set to ${val}%`);
  };

  return (
    <Card className="border-primary/30 bg-gradient-to-b from-accent/30 via-card to-card shadow-lg shadow-primary/5 print:hidden">
      <CardHeader className="pb-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-xs">
              <ShieldCheck className="size-5" />
            </div>
            <div>
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                Owner Pricing & Margin Control
                <Badge variant="outline" className="border-primary/40 bg-primary/10 text-primary text-[10px]">
                  Confidential
                </Badge>
              </CardTitle>
              <CardDescription className="text-xs">
                Real-time formula multipliers and live wholesale raw material rates
              </CardDescription>
            </div>
          </div>

          {/* Quick Margin Presets */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mr-1">
              Presets:
            </span>
            {PROFIT_PRESETS.map((preset) => (
              <button
                key={preset.value}
                type="button"
                onClick={() => applyProfitPreset(preset.value)}
                className={cn(
                  "rounded-md px-2.5 py-1 text-xs font-semibold transition-all",
                  params.targetProfit === preset.value
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "bg-muted/80 text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Sliders Grid */}
        <div className="grid gap-4 sm:grid-cols-3">
          {/* Target Profit */}
          <div className="rounded-xl border bg-card p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Target Profit on Cost
              </span>
              <span className="font-mono text-2xl font-extrabold text-primary">
                {params.targetProfit}%
              </span>
            </div>
            <Slider
              value={[params.targetProfit]}
              min={PARAM_LIMITS.targetProfit.min}
              max={PARAM_LIMITS.targetProfit.max}
              step={PARAM_LIMITS.targetProfit.step}
              onValueChange={([v]) => setParam("targetProfit", v)}
              aria-label="Target profit on cost"
            />
            <div className="flex justify-between text-[10px] text-muted-foreground">
              <span>{PARAM_LIMITS.targetProfit.min}% Min</span>
              <span>{PARAM_LIMITS.targetProfit.max}% Max</span>
            </div>
          </div>

          {/* Marketplace Commission */}
          <div className="rounded-xl border bg-card p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Marketplace Fee
              </span>
              <span className="font-mono text-2xl font-extrabold text-fee">
                {params.marketplaceFee}%
              </span>
            </div>
            <Slider
              value={[params.marketplaceFee]}
              min={PARAM_LIMITS.marketplaceFee.min}
              max={PARAM_LIMITS.marketplaceFee.max}
              step={PARAM_LIMITS.marketplaceFee.step}
              onValueChange={([v]) => setParam("marketplaceFee", v)}
              aria-label="Marketplace fee"
            />
            <div className="flex justify-between text-[10px] text-muted-foreground">
              <span>{PARAM_LIMITS.marketplaceFee.min}% Min</span>
              <span>{PARAM_LIMITS.marketplaceFee.max}% Max</span>
            </div>
          </div>

          {/* Customer Discount */}
          <div className="rounded-xl border bg-card p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Customer Discount
              </span>
              <span className="font-mono text-2xl font-extrabold text-primary">
                {params.discount}%
              </span>
            </div>
            <Slider
              value={[params.discount]}
              min={PARAM_LIMITS.discount.min}
              max={PARAM_LIMITS.discount.max}
              step={PARAM_LIMITS.discount.step}
              onValueChange={([v]) => setParam("discount", v)}
              aria-label="Customer discount"
            />
            <div className="flex justify-between text-[10px] text-muted-foreground">
              <span>{PARAM_LIMITS.discount.min}% Min</span>
              <span>{PARAM_LIMITS.discount.max}% Max</span>
            </div>
          </div>
        </div>

        {/* Live Multipliers & Pricing Formula Formula Breakdown */}
        <div className="grid gap-3 sm:grid-cols-3 rounded-xl bg-accent/40 border border-primary/20 p-4 text-center">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Sell Price Multiplier
            </p>
            <p className="tabular mt-1 text-2xl font-black text-foreground">
              {mult.sell.toFixed(3)}×
            </p>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Sell = Cost × {mult.sell.toFixed(3)}
            </p>
          </div>

          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              MRP Listed Multiplier
            </p>
            <p className="tabular mt-1 text-2xl font-black text-primary">
              {mult.mrp.toFixed(3)}×
            </p>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              MRP = Cost × {mult.mrp.toFixed(3)}
            </p>
          </div>

          <div className="text-left flex flex-col justify-center sm:border-l sm:pl-4">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Effective Net Margin
            </p>
            <p className="text-xs text-foreground mt-1 leading-relaxed">
              For every <strong>$100</strong> raw cost, list at{" "}
              <strong className="text-primary">${(100 * mult.mrp).toFixed(0)}</strong>, sell at{" "}
              <strong>${(100 * mult.sell).toFixed(0)}</strong>, and take home{" "}
              <strong className="text-success">${(100 * (1 + params.targetProfit / 100)).toFixed(0)}</strong>.
            </p>
          </div>
        </div>

        <Separator />

        {/* Rate Editor */}
        <RateEditor />
      </CardContent>
    </Card>
  );
}
