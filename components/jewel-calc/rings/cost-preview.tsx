"use client";

import { CopyButton } from "@/components/jewel-calc/copy-button";
import { STONE_META } from "@/lib/constants";
import { formatUSD, toPlainAmount } from "@/lib/format";
import { calcCost, calcPrice } from "@/lib/pricing";
import { cn } from "@/lib/utils";
import { usePricingStore } from "@/store/pricing-store";
import type { RingDraft } from "@/types/pricing";

interface PreviewItem {
  label: string;
  value: string;
  detail?: string;
  tone?: "primary" | "success";
  /** Adds a copy button with this value. */
  copy?: string;
  ownerOnly?: boolean;
}

export function CostPreview({ draft }: { draft: RingDraft }) {
  const rates = usePricingStore((s) => s.rates);
  const params = usePricingStore((s) => s.params);
  const isOwner = usePricingStore((s) => s.isOwner);

  const cost = calcCost(draft, rates);
  const price = calcPrice(cost.total, params);
  const stone = STONE_META[draft.stoneType].short;
  const hasTotal = cost.total > 0;
  const dash = "—";

  const items: PreviewItem[] = [
    {
      label: "Metal cost",
      value: draft.grams > 0 ? formatUSD(cost.metal) : dash,
      detail:
        draft.grams > 0 ? `${draft.grams}g × ${formatUSD(rates.metalPerGram[draft.metal])}/g` : undefined,
    },
    {
      label: "Center stone",
      value: draft.centerSize ? formatUSD(cost.center) : dash,
      detail: draft.centerSize ? `${draft.centerSize} ct ${stone}` : undefined,
    },
    {
      label: "Side stones",
      value: draft.sideCarats > 0 ? formatUSD(cost.side) : dash,
      detail:
        draft.sideCarats > 0
          ? `${draft.sideCarats} ct × ${formatUSD(rates.stones[draft.stoneType].sidePerCarat)}/ct`
          : undefined,
    },
    { label: "Total cost", value: hasTotal ? formatUSD(cost.total) : dash, tone: "primary", ownerOnly: true },
    { label: "Selling price", value: hasTotal ? formatUSD(price.sell) : dash, tone: "primary" },
    {
      label: "MRP (listed)",
      value: hasTotal ? formatUSD(price.mrp) : dash,
      tone: "primary",
      copy: hasTotal ? toPlainAmount(price.mrp) : undefined,
    },
    {
      label: "Your profit",
      value: hasTotal ? formatUSD(price.profit) : dash,
      detail: hasTotal ? `${price.profitOnCost.toFixed(1)}% on cost` : undefined,
      tone: "success",
      ownerOnly: true,
    },
  ];

  return (
    <div className="rounded-lg bg-muted/70 p-4">
      <p className="mb-3 text-[11px] font-medium tracking-wider text-muted-foreground uppercase">
        Live Cost Breakdown
      </p>
      <dl className="grid grid-cols-2 gap-x-4 gap-y-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7">
        {items
          .filter((i) => isOwner || !i.ownerOnly)
          .map((i) => (
            <div key={i.label} className="min-w-0">
              <dt className="text-[11px] text-muted-foreground">{i.label}</dt>
              <dd
                className={cn(
                  "tabular text-base font-semibold",
                  i.tone === "primary" && "text-primary",
                  i.tone === "success" && "text-success"
                )}
              >
                <span className="inline-flex items-center gap-1">
                  {i.value}
                  {i.copy && <CopyButton value={i.copy} label="MRP" />}
                </span>
              </dd>
              {i.detail && <dd className="truncate text-[11px] text-muted-foreground">{i.detail}</dd>}
            </div>
          ))}
      </dl>
    </div>
  );
}
