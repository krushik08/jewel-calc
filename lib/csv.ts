import { visibleColumns } from "@/lib/columns";
import type { RingRow } from "@/types/pricing";

const escape = (v: string | number) => `"${String(v).replace(/"/g, '""')}"`;

/** Exports only the columns the current viewer is allowed to see. */
export function exportRingsCSV(rows: RingRow[], isOwner: boolean) {
  const cols = visibleColumns(isOwner);
  const header = ["Item", ...cols.map((c) => c.header)];
  const body = rows.map((row) => [row.ring.name, ...cols.map((c) => c.csv(row))]);
  const csv = [header, ...body].map((line) => line.map(escape).join(",")).join("\n");

  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = `JewelCalc_Items_${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
