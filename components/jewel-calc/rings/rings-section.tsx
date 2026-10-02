"use client";

import { Download, Gem, Printer } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { SectionHeading } from "@/components/jewel-calc/layout/section-heading";
import { RingCardList } from "@/components/jewel-calc/rings/ring-card-list";
import { RingsTable } from "@/components/jewel-calc/rings/rings-table";
import { exportRingsCSV } from "@/lib/csv";
import { usePricingStore } from "@/store/pricing-store";
import type { RingRow } from "@/types/pricing";

export function RingsSection({ rows }: { rows: RingRow[] }) {
  const isOwner = usePricingStore((s) => s.isOwner);
  const empty = rows.length === 0;

  return (
    <section>
      <SectionHeading
        action={
          <div className="flex gap-2 print:hidden">
            <Button
              variant="outline"
              size="sm"
              disabled={empty}
              onClick={() => {
                exportRingsCSV(rows, isOwner);
                toast.success("CSV exported");
              }}
            >
              <Download /> <span className="hidden sm:inline">Export</span> CSV
            </Button>
            <Button size="sm" disabled={empty} onClick={() => window.print()}>
              <Printer /> <span className="hidden sm:inline">Print /</span> PDF
            </Button>
          </div>
        }
      >
        Pricing Table
      </SectionHeading>

      {empty ? (
        <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed bg-card py-14 text-center">
          <Gem className="size-8 text-primary/60" />
          <p className="font-display text-lg">No items yet</p>
          <p className="text-sm text-muted-foreground">Add your first item above.</p>
        </div>
      ) : (
        <>
          <div className="hidden md:block print:block">
            <RingsTable rows={rows} isOwner={isOwner} />
          </div>
          <div className="md:hidden print:hidden">
            <RingCardList rows={rows} isOwner={isOwner} />
          </div>
        </>
      )}
    </section>
  );
}
