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
import { DeleteRingButton } from "@/components/jewel-calc/rings/delete-ring-button";
import { RingNameCell } from "@/components/jewel-calc/rings/ring-name-cell";
import { TONE_CLASS, visibleColumns } from "@/lib/columns";
import { cn } from "@/lib/utils";
import type { RingRow } from "@/types/pricing";

/** Desktop / tablet layout (md and up). */
export function RingsTable({ rows, isOwner }: { rows: RingRow[]; isOwner: boolean }) {
  const cols = visibleColumns(isOwner);

  return (
    <div className="overflow-hidden rounded-xl border bg-card shadow-sm shadow-primary/5">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="sticky left-0 z-10 min-w-56 bg-muted">Item</TableHead>
            {cols.map((c) => (
              <TableHead key={c.id} className={cn(c.align === "right" && "text-right")}>
                {c.header}
              </TableHead>
            ))}
            <TableHead className="w-12 print:hidden">
              <span className="sr-only">Actions</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.ring.id}>
              <TableCell className="sticky left-0 z-10 max-w-72 bg-card whitespace-normal">
                <RingNameCell ring={row.ring} />
              </TableCell>
              {cols.map((c) => (
                <TableCell
                  key={c.id}
                  className={cn("tabular", c.align === "right" && "text-right", TONE_CLASS[c.tone])}
                >
                  {c.copy ? (
                    <span className="inline-flex items-center gap-1">
                      {c.display(row)}
                      <CopyButton value={c.copy(row)} label={c.header} />
                    </span>
                  ) : (
                    c.display(row)
                  )}
                </TableCell>
              ))}
              <TableCell className="text-center print:hidden">
                <DeleteRingButton id={row.ring.id} name={row.ring.name} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
