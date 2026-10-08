"use client";

import { Gem, Layers, Sparkles } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DiscountControl } from "@/components/jewel-calc/rings/discount-control";
import { V2AddMultipleForm } from "@/components/jewel-calc/v2/rings/v2-add-multiple-form";
import { V2AddSingleForm } from "@/components/jewel-calc/v2/rings/v2-add-single-form";
import { usePricingStore } from "@/store/pricing-store";
import type { ItemKind } from "@/types/pricing";

export function V2AddPanel() {
  const activeTab = usePricingStore((s) => s.activeTab);
  const setActiveTab = usePricingStore((s) => s.setActiveTab);

  return (
    <Card className="border-border/80 shadow-md shadow-primary/5 print:hidden">
      <CardContent className="space-y-6 pt-6">
        <Tabs
          value={activeTab}
          onValueChange={(val) => setActiveTab(val as ItemKind)}
          className="gap-6"
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <TabsList className="bg-muted/70 p-1 w-full sm:w-auto">
              <TabsTrigger
                value="multiple"
                className="gap-2 sm:px-6 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all"
              >
                <Layers className="size-4" />
                <span className="font-semibold">Multiple Items (Series)</span>
                <span className="rounded-full bg-primary-foreground/20 px-1.5 py-0.2 text-[10px] font-bold">
                  Clean UX
                </span>
              </TabsTrigger>
              <TabsTrigger
                value="single"
                className="gap-2 sm:px-6 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all"
              >
                <Gem className="size-4" />
                <span className="font-semibold">Single Item</span>
              </TabsTrigger>
            </TabsList>

            <span className="text-xs text-muted-foreground hidden lg:inline">
              Configure items with live metal density conversions & instant market pricing
            </span>
          </div>

          <TabsContent value="multiple" forceMount className="data-[state=inactive]:hidden pt-2">
            <V2AddMultipleForm />
          </TabsContent>

          <TabsContent value="single" forceMount className="data-[state=inactive]:hidden pt-2">
            <V2AddSingleForm />
          </TabsContent>
        </Tabs>

        <Separator />
        <DiscountControl />
      </CardContent>
    </Card>
  );
}
