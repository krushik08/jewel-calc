import { METAL_WEIGHT_FACTOR } from "@/lib/constants";
import type {
  MetalKey,
  CostBreakdown,
  PriceBreakdown,
  PricingParams,
  Rates,
  RingDraft,
  StoneRates,
} from "@/types/pricing";

/** Raw material cost of a ring at the current rates. */
export function calcCost(ring: RingDraft, rates: Rates): CostBreakdown {
  const stone = rates.stones[ring.stoneType] as StoneRates | undefined;
  const metal = (ring.grams || 0) * (rates.metalPerGram[ring.metal] ?? 0);
  const center = ring.centerSize ? stone?.center[ring.centerSize] ?? 0 : 0;
  const side = (ring.sideCarats || 0) * (stone?.sidePerCarat ?? 0);
  return { metal, center, side, total: metal + center + side };
}

/**
 * Sell = cost × (1 + profit) ÷ (1 − fee)   → after the marketplace fee you keep cost + profit
 * MRP  = sell ÷ (1 − discount)             → listed price that "discounts" down to sell
 */
export function getMultipliers({ discount, marketplaceFee, targetProfit }: PricingParams) {
  const sell = (1 + targetProfit / 100) / (1 - marketplaceFee / 100);
  const mrp = sell / (1 - discount / 100);
  return { sell, mrp };
}

export function calcPrice(cost: number, params: PricingParams): PriceBreakdown {
  const m = getMultipliers(params);
  const sell = cost * m.sell;
  const mrp = cost * m.mrp;
  const fee = sell * (params.marketplaceFee / 100);
  const receive = sell - fee;
  const profit = receive - cost;
  const profitOnCost = cost > 0 ? (profit / cost) * 100 : 0;
  return { sell, mrp, fee, receive, profit, profitOnCost };
}

const round2 = (n: number) => Math.round(n * 100) / 100;

/** Same design in another metal: scale grams by density ratio. */
export function convertMetalWeight(grams: number, from: MetalKey, to: MetalKey) {
  return round2((grams / METAL_WEIGHT_FACTOR[from]) * METAL_WEIGHT_FACTOR[to]);
}

/** Stepped weights for a size series, e.g. base 3, step 0.5, count 6 → 3, 3.5, 4, 4.5, 5, 5.5 */
export function steppedWeights(base: number, step: number, count: number) {
  return Array.from({ length: count }, (_, i) => round2(base + step * i));
}
