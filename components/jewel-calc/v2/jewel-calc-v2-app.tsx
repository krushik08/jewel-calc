"use client";

import { V2QuickSimulator } from "@/components/jewel-calc/v2/calculator/v2-quick-simulator";
import { V2OwnerPanel } from "@/components/jewel-calc/v2/owner/v2-owner-panel";
import { V2AddPanel } from "@/components/jewel-calc/v2/rings/v2-add-panel";
import { V2RingsSection } from "@/components/jewel-calc/v2/rings/v2-rings-section";
import { V2SummaryCards } from "@/components/jewel-calc/v2/rings/v2-summary-cards";
import { useRingRows } from "@/hooks/use-ring-rows";
import { usePricingStore } from "@/store/pricing-store";

export function JewelCalcV2App() {
  const isOwner = usePricingStore((s) => s.isOwner);
  const rows = useRingRows();

  return (
    <main className="flex flex-1 flex-col gap-8">
      {isOwner && <V2OwnerPanel />}

      <section className="print:hidden">
        <V2AddPanel />
      </section>

      <V2QuickSimulator />

      <V2SummaryCards rows={rows} />

      <V2RingsSection rows={rows} />
    </main>
  );
}
