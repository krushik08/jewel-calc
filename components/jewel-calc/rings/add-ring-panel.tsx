"use client";

import { Gem, Layers } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AddMultipleForm } from "@/components/jewel-calc/rings/add-multiple-form";
import { AddRingForm } from "@/components/jewel-calc/rings/add-ring-form";
import { DiscountControl } from "@/components/jewel-calc/rings/discount-control";
import { ITEM_KINDS } from "@/lib/constants";
import { usePricingStore } from "@/store/pricing-store";
import type { ItemKind } from "@/types/pricing";

const TABS: Record<ItemKind, { icon: React.ReactNode; form: React.ReactNode }> = {
  single: { icon: <Gem />, form: <AddRingForm /> },
  multiple: { icon: <Layers />, form: <AddMultipleForm /> },
};

/** "Add New Item" card: Single / Multiple tabs + the shared customer discount. */
export function AddRingPanel() {
  const activeTab = usePricingStore((s) => s.activeTab);
  const setActiveTab = usePricingStore((s) => s.setActiveTab);

  return (
    <Card className="print:hidden">
      <CardContent className="space-y-5">
        <Tabs
          value={activeTab}
          onValueChange={(val) => setActiveTab(val as ItemKind)}
          className="gap-5"
        >
          <TabsList className="w-full sm:w-fit">
            {ITEM_KINDS.map((k) => (
              <TabsTrigger key={k.key} value={k.key} className="sm:px-5">
                {TABS[k.key].icon}
                {k.label}
              </TabsTrigger>
            ))}
          </TabsList>

          {ITEM_KINDS.map((k) => (
            // forceMount + hidden keeps a half-filled form when switching tabs
            <TabsContent key={k.key} value={k.key} forceMount className="data-[state=inactive]:hidden">
              {TABS[k.key].form}
            </TabsContent>
          ))}
        </Tabs>

        <Separator />
        <DiscountControl />
      </CardContent>
    </Card>
  );
}

