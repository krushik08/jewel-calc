"use client";

import { useEffect, useState } from "react";

import { usePricingStore } from "@/store/pricing-store";

/** Loads persisted state from localStorage once the component has mounted. */
export function useHydratedStore() {
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const unsub = usePricingStore.persist.onFinishHydration(() => setHydrated(true));
    usePricingStore.persist.rehydrate();
    if (usePricingStore.persist.hasHydrated()) setHydrated(true);
    return unsub;
  }, []);

  return hydrated;
}
