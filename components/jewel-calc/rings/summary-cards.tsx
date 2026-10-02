"use client";

import { formatUSD } from "@/lib/format";
import { cn } from "@/lib/utils";
import { usePricingStore } from "@/store/pricing-store";
import type { RingRow } from "@/types/pricing";

export function SummaryCards({ rows }: { rows: RingRow[] }) {
  const isOwner = usePricingStore((s) => s.isOwner);
  const n = rows.length;
  const avg = (pick: (r: RingRow) => number) =>
    n ? formatUSD(rows.reduce((sum, r) => sum + pick(r), 0) / n) : "—";

  const stats = [
    { label: "Total Items", value: String(n), className: "text-foreground" },
    { label: "Avg Cost", value: avg((r) => r.cost.total), className: "text-foreground/80" },
    { label: "Avg MRP", value: avg((r) => r.price.mrp), className: "text-primary" },
    ...(isOwner
      ? [{ label: "Avg Profit", value: avg((r) => r.price.profit), className: "text-success" }]
      : []),
  ];

  return (
    <div className={cn("grid grid-cols-2 gap-3", isOwner ? "md:grid-cols-4" : "md:grid-cols-3")}>
      {stats.map((s) => (
        <div key={s.label} className="rounded-xl border bg-card p-4 text-center shadow-sm shadow-primary/5">
          <p className="text-[10px] tracking-wider text-muted-foreground uppercase">{s.label}</p>
          <p className={cn("tabular mt-1 text-2xl font-extrabold sm:text-3xl", s.className)}>
            {s.value}
          </p>
        </div>
      ))}
    </div>
  );
}
