"use client";

import { Gem, Layers, Percent, TrendingUp, Wallet } from "lucide-react";

import { formatPct, formatUSD } from "@/lib/format";
import { cn } from "@/lib/utils";
import { usePricingStore } from "@/store/pricing-store";
import type { RingRow } from "@/types/pricing";

export function V2SummaryCards({ rows }: { rows: RingRow[] }) {
  const isOwner = usePricingStore((s) => s.isOwner);
  const n = rows.length;

  const totalMRP = rows.reduce((sum, r) => sum + r.price.mrp, 0);
  const totalCost = rows.reduce((sum, r) => sum + r.cost.total, 0);
  const totalProfit = rows.reduce((sum, r) => sum + r.price.profit, 0);
  const avgGrams = n ? rows.reduce((sum, r) => sum + r.ring.grams, 0) / n : 0;

  const avgCost = n ? totalCost / n : 0;
  const avgMRP = n ? totalMRP / n : 0;
  const avgProfit = n ? totalProfit / n : 0;
  const avgMargin = totalCost > 0 ? (totalProfit / totalCost) * 100 : 0;

  const cards = [
    {
      title: "Catalog Size",
      value: String(n),
      subtext: n === 1 ? "1 item listed" : `${n} items total`,
      icon: <Layers className="size-4 text-primary" />,
      highlight: "text-foreground",
    },
    {
      title: "Avg Metal Weight",
      value: n ? `${avgGrams.toFixed(2)}g` : "—",
      subtext: "Per item average",
      icon: <Gem className="size-4 text-amber-500" />,
      highlight: "text-foreground",
    },
    {
      title: "Average MRP",
      value: n ? formatUSD(avgMRP) : "—",
      subtext: n ? `Total listed: ${formatUSD(totalMRP)}` : "No items yet",
      icon: <TrendingUp className="size-4 text-primary" />,
      highlight: "text-primary",
    },
    ...(isOwner
      ? [
          {
            title: "Average Cost",
            value: n ? formatUSD(avgCost) : "—",
            subtext: n ? `Batch cost: ${formatUSD(totalCost)}` : "—",
            icon: <Wallet className="size-4 text-muted-foreground" />,
            highlight: "text-foreground/80",
          },
          {
            title: "Average Profit",
            value: n ? formatUSD(avgProfit) : "—",
            subtext: n ? `${formatPct(avgMargin, 1)} overall margin` : "—",
            icon: <Percent className="size-4 text-success" />,
            highlight: "text-success",
          },
        ]
      : []),
  ];

  return (
    <div
      className={cn(
        "grid gap-3 sm:gap-4",
        isOwner
          ? "grid-cols-2 sm:grid-cols-3 lg:grid-cols-5"
          : "grid-cols-1 sm:grid-cols-3"
      )}
    >
      {cards.map((card) => (
        <div
          key={card.title}
          className="relative overflow-hidden rounded-xl border border-border/70 bg-card p-4 shadow-sm shadow-primary/5 transition-all hover:border-primary/40 hover:shadow-md"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              {card.title}
            </span>
            <div className="flex size-7 items-center justify-center rounded-lg bg-muted/60">
              {card.icon}
            </div>
          </div>
          <p className={cn("tabular mt-2 text-2xl sm:text-3xl font-extrabold tracking-tight", card.highlight)}>
            {card.value}
          </p>
          <p className="mt-1 text-[11px] text-muted-foreground truncate">{card.subtext}</p>
        </div>
      ))}
    </div>
  );
}
