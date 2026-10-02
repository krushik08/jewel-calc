import { METAL_LABEL, STONE_META } from "@/lib/constants";
import { formatPct, formatUSD, toPlainAmount } from "@/lib/format";
import type { RingRow } from "@/types/pricing";

export type ColumnTone = "default" | "cost" | "sell" | "mrp" | "fee" | "receive" | "profit";

export interface RingColumn {
  id: string;
  header: string;
  /** Hidden from Employee View (table, mobile cards AND CSV export). */
  ownerOnly: boolean;
  tone: ColumnTone;
  align: "left" | "right";
  /** Formatted value for the UI. */
  display: (row: RingRow) => string;
  /** Raw value for CSV. */
  csv: (row: RingRow) => string | number;
  /** If set, a copy button is shown next to the value (table + mobile cards). */
  copy?: (row: RingRow) => string;
}

export function centerLabel(row: RingRow) {
  const { centerSize, stoneType } = row.ring;
  return centerSize ? `${centerSize} ct ${STONE_META[stoneType].short}` : "None";
}

/**
 * Single source of truth for which figures exist and who can see them.
 * Flip `ownerOnly` to change what employees see — table, cards and CSV all follow.
 */
export const RING_COLUMNS: RingColumn[] = [
  {
    id: "metal",
    header: "Metal",
    ownerOnly: false,
    tone: "default",
    align: "left",
    display: (r) => METAL_LABEL[r.ring.metal],
    csv: (r) => METAL_LABEL[r.ring.metal],
  },
  {
    id: "grams",
    header: "Wt (g)",
    ownerOnly: false,
    tone: "default",
    align: "right",
    display: (r) => `${r.ring.grams}g`,
    csv: (r) => r.ring.grams,
  },
  {
    id: "metalCost",
    header: "Metal $",
    ownerOnly: true,
    tone: "cost",
    align: "right",
    display: (r) => formatUSD(r.cost.metal),
    csv: (r) => r.cost.metal.toFixed(2),
  },
  {
    id: "center",
    header: "Center Stone",
    ownerOnly: false,
    tone: "default",
    align: "right",
    display: (r) => (r.ring.centerSize ? `${r.ring.centerSize} ct` : "—"),
    csv: (r) => centerLabel(r),
  },
  {
    id: "sideCt",
    header: "Side cts",
    ownerOnly: true,
    tone: "default",
    align: "right",
    display: (r) => (r.ring.sideCarats > 0 ? `${r.ring.sideCarats} ct` : "—"),
    csv: (r) => r.ring.sideCarats,
  },
  {
    id: "sideCost",
    header: "Side $",
    ownerOnly: true,
    tone: "cost",
    align: "right",
    display: (r) => (r.ring.sideCarats > 0 ? formatUSD(r.cost.side) : "—"),
    csv: (r) => r.cost.side.toFixed(2),
  },
  {
    id: "totalCost",
    header: "Total Cost",
    ownerOnly: false, // matches original. Set true to stop employees deriving your profit.
    tone: "cost",
    align: "right",
    display: (r) => formatUSD(r.cost.total),
    csv: (r) => r.cost.total.toFixed(2),
  },
  {
    id: "sell",
    header: "Sell Price",
    ownerOnly: false,
    tone: "sell",
    align: "right",
    display: (r) => formatUSD(r.price.sell),
    csv: (r) => r.price.sell.toFixed(2),
  },
  {
    id: "mrp",
    header: "MRP Listed",
    ownerOnly: false,
    tone: "mrp",
    align: "right",
    display: (r) => formatUSD(r.price.mrp),
    csv: (r) => r.price.mrp.toFixed(2),
    copy: (r) => toPlainAmount(r.price.mrp),
  },
  {
    id: "fee",
    header: "Mkt Fee",
    ownerOnly: false,
    tone: "fee",
    align: "right",
    display: (r) => formatUSD(r.price.fee),
    csv: (r) => r.price.fee.toFixed(2),
  },
  {
    id: "receive",
    header: "You Receive",
    ownerOnly: false,
    tone: "receive",
    align: "right",
    display: (r) => formatUSD(r.price.receive),
    csv: (r) => r.price.receive.toFixed(2),
  },
  {
    id: "profit",
    header: "Profit $",
    ownerOnly: true,
    tone: "profit",
    align: "right",
    display: (r) => formatUSD(r.price.profit),
    csv: (r) => r.price.profit.toFixed(2),
  },
  {
    id: "profitOnCost",
    header: "Profit on Cost",
    ownerOnly: true,
    tone: "profit",
    align: "right",
    display: (r) => formatPct(r.price.profitOnCost, 1),
    csv: (r) => formatPct(r.price.profitOnCost, 1),
  },
];

export const visibleColumns = (isOwner: boolean) =>
  RING_COLUMNS.filter((c) => isOwner || !c.ownerOnly);

export const TONE_CLASS: Record<ColumnTone, string> = {
  default: "text-foreground/80",
  cost: "text-foreground/80",
  sell: "text-primary font-medium",
  mrp: "text-foreground font-semibold",
  fee: "text-fee",
  receive: "text-success",
  profit: "text-success font-semibold",
};
