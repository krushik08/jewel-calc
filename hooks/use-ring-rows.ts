"use client";

import { useMemo } from "react";

import { calcCost, calcPrice } from "@/lib/pricing";
import { usePricingStore } from "@/store/pricing-store";
import type { RingRow } from "@/types/pricing";

/** Rings joined with their live cost + price at the current rates and params. */
export function useRingRows(): RingRow[] {
  const rings = usePricingStore((s) => s.rings);
  const rates = usePricingStore((s) => s.rates);
  const params = usePricingStore((s) => s.params);

  return useMemo(
    () =>
      rings.map((ring) => {
        const cost = calcCost(ring, rates);
        return { ring, cost, price: calcPrice(cost.total, params) };
      }),
    [rings, rates, params]
  );
}
