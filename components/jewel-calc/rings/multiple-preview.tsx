"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CopyButton } from "@/components/jewel-calc/copy-button";
import { formatUSD, toPlainAmount } from "@/lib/format";
import { calcCost, calcPrice } from "@/lib/pricing";
import { cn } from "@/lib/utils";
import { usePricingStore } from "@/store/pricing-store";
import type { RingDraft } from "@/types/pricing";

interface PreviewColumn {
  header: string;
  ownerOnly?: boolean;
  className?: string;
  value: (v: PreviewRow) => string;
  /** If set, a copy button is shown next to the value. */
  copy?: (v: PreviewRow) => string;
}

type PreviewRow = { draft: RingDraft; cost: number; sell: number; mrp: number; profit: number };

const COLUMNS: PreviewColumn[] = [
  { header: "Size", className: "font-semibold", value: ({ draft }) => `${draft.centerSize} ct` },
  { header: "Weight", value: ({ draft }) => `${draft.grams} g` },
  { header: "Side ct", value: ({ draft }) => (draft.sideCarats > 0 ? `${draft.sideCarats}` : "—") },
  { header: "Total cost", ownerOnly: true, value: ({ cost }) => formatUSD(cost) },
  { header: "Sell price", className: "text-primary font-medium", value: ({ sell }) => formatUSD(sell) },
  {
    header: "MRP",
    className: "font-semibold",
    value: ({ mrp }) => formatUSD(mrp),
    copy: ({ mrp }) => toPlainAmount(mrp),
  },
  { header: "Profit", ownerOnly: true, className: "text-success font-semibold", value: ({ profit }) => formatUSD(profit) },
];

/** Live price preview for all size variants before they're added. */
export function MultiplePreview({ drafts, show }: { drafts: RingDraft[]; show: boolean }) {
  const rates = usePricingStore((s) => s.rates);
  const params = usePricingStore((s) => s.params);
  const isOwner = usePricingStore((s) => s.isOwner);
  const cols = COLUMNS.filter((c) => isOwner || !c.ownerOnly);

  return (
    <div className="rounded-lg bg-muted/70 p-4">
      <p className="mb-3 text-[11px] font-medium tracking-wider text-muted-foreground uppercase">
        Live Price Preview · {drafts.length} sizes
      </p>

      {!show ? (
        <p className="py-4 text-center text-sm text-muted-foreground">
          Enter a starting weight to see prices for every size.
        </p>
      ) : (
        <div className="overflow-hidden rounded-md border bg-card">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                {cols.map((c, i) => (
                  <TableHead key={c.header} className={cn(i > 0 && "text-right")}>
                    {c.header}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {drafts.map((draft) => {
                const cost = calcCost(draft, rates).total;
                const price = calcPrice(cost, params);
                const row = { draft, cost, sell: price.sell, mrp: price.mrp, profit: price.profit };
                return (
                  <TableRow key={draft.centerSize}>
                    {cols.map((c, i) => (
                      <TableCell
                        key={c.header}
                        className={cn("tabular py-2", i > 0 && "text-right", c.className)}
                      >
                        {c.copy ? (
                          <span className="inline-flex items-center gap-1">
                            {c.value(row)}
                            <CopyButton value={c.copy(row)} label="MRP" />
                          </span>
                        ) : (
                          c.value(row)
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
