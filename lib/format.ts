const usd = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export const formatUSD = (n: number) => usd.format(Number.isFinite(n) ? n : 0);

export const formatPct = (n: number, digits = 0) => `${n.toFixed(digits)}%`;

/** Parses a numeric input; returns fallback for empty / invalid / negative values. */
export function toNonNegative(value: string, fallback = 0) {
  const n = parseFloat(value);
  return Number.isFinite(n) && n >= 0 ? n : fallback;
}

/** Plain amount for pasting into price fields: 1291.67 (no $ sign, no commas). */
export const toPlainAmount = (n: number) => (Number.isFinite(n) ? n : 0).toFixed(2);
