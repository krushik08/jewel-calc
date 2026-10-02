"use client";

import { CopyButton } from "@/components/jewel-calc/copy-button";
import { DeleteRingButton } from "@/components/jewel-calc/rings/delete-ring-button";
import { RingNameCell } from "@/components/jewel-calc/rings/ring-name-cell";
import { TONE_CLASS, visibleColumns } from "@/lib/columns";
import { cn } from "@/lib/utils";
import type { RingRow } from "@/types/pricing";

/** Columns already shown in the name cell — skipped on mobile to save space. */
const SKIP_ON_MOBILE = new Set(["metal", "grams", "center", "sideCt"]);

/** Mobile layout (below md): one card per ring instead of a wide table. */
export function RingCardList({ rows, isOwner }: { rows: RingRow[]; isOwner: boolean }) {
  const cols = visibleColumns(isOwner).filter((c) => !SKIP_ON_MOBILE.has(c.id));

  return (
    <ul className="space-y-3">
      {rows.map((row) => (
        <li key={row.ring.id} className="rounded-xl border bg-card p-4 shadow-sm shadow-primary/5">
          <div className="flex items-start justify-between gap-2">
            <RingNameCell ring={row.ring} />
            <DeleteRingButton id={row.ring.id} name={row.ring.name} />
          </div>
          <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 border-t pt-3">
            {cols.map((c) => (
              <div key={c.id} className="flex items-baseline justify-between gap-2">
                <dt className="text-[11px] text-muted-foreground">{c.header}</dt>
                <dd className={cn("tabular inline-flex items-center gap-0.5 text-sm", TONE_CLASS[c.tone])}>
                  {c.display(row)}
                  {c.copy && <CopyButton value={c.copy(row)} label={c.header} className="-mr-1" />}
                </dd>
              </div>
            ))}
          </dl>
        </li>
      ))}
    </ul>
  );
}
