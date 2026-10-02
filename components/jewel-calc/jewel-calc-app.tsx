"use client";

import { SectionHeading } from "@/components/jewel-calc/layout/section-heading";
import { AppFooter } from "@/components/jewel-calc/layout/app-footer";
import { AppHeader } from "@/components/jewel-calc/layout/app-header";
import { OwnerPanel } from "@/components/jewel-calc/owner/owner-panel";
import { AddRingPanel } from "@/components/jewel-calc/rings/add-ring-panel";
import { RingsSection } from "@/components/jewel-calc/rings/rings-section";
import { SummaryCards } from "@/components/jewel-calc/rings/summary-cards";
import { useHydratedStore } from "@/hooks/use-hydrated-store";
import { useRingRows } from "@/hooks/use-ring-rows";
import { usePricingStore } from "@/store/pricing-store";

export function JewelCalcApp() {
  const hydrated = useHydratedStore();
  const isOwner = usePricingStore((s) => s.isOwner);
  const rows = useRingRows();

  return (
    <div className="mx-auto flex min-h-dvh max-w-7xl flex-col gap-8 px-4 pt-6 sm:px-6 sm:pt-8 lg:px-8">
      <AppHeader />

      {!hydrated ? (
        <LoadingState />
      ) : (
        <main className="flex flex-1 flex-col gap-8">
          {isOwner && <OwnerPanel />}

          <section className="print:hidden">
            <SectionHeading>Add New Item</SectionHeading>
            <AddRingPanel />
          </section>

          <SummaryCards rows={rows} />
          <RingsSection rows={rows} />
        </main>
      )}

      <AppFooter />
    </div>
  );
}

function LoadingState() {
  return (
    <div className="flex-1 space-y-4" aria-busy="true" aria-label="Loading">
      {[180, 90, 240].map((h) => (
        <div key={h} className="animate-pulse rounded-xl bg-secondary" style={{ height: h }} />
      ))}
    </div>
  );
}
