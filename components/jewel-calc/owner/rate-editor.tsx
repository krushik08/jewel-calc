"use client";

import { RotateCcw } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RateInput } from "@/components/jewel-calc/owner/rate-input";
import { CENTER_SIZES, METALS, STONE_TYPES } from "@/lib/constants";
import { usePricingStore } from "@/store/pricing-store";
import type { StoneType } from "@/types/pricing";

export function RateEditor() {
  const rates = usePricingStore((s) => s.rates);
  const setMetalRate = usePricingStore((s) => s.setMetalRate);
  const resetRates = usePricingStore((s) => s.resetRates);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-sm font-medium">Live Rate Editor</p>
          <p className="text-xs text-muted-foreground">Changes apply instantly to every item</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            resetRates();
            toast("All rates reset to defaults");
          }}
        >
          <RotateCcw /> Reset to Default
        </Button>
      </div>

      <Tabs defaultValue="metal">
        <TabsList className="w-full sm:w-fit">
          <TabsTrigger value="metal">Metal</TabsTrigger>
          {STONE_TYPES.map((s) => (
            <TabsTrigger key={s.key} value={s.key}>
              <span className="size-2 rounded-full" style={{ background: s.colorVar }} />
              {s.short === "LGD" ? "Lab Grown" : s.short}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="metal">
          <RateGrid caption="Metal price per gram">
            {METALS.map((m) => (
              <RateInput
                key={m.key}
                label={m.label}
                value={rates.metalPerGram[m.key]}
                onChange={(v) => setMetalRate(m.key, v)}
                suffix="/g"
                step={0.01}
              />
            ))}
          </RateGrid>
        </TabsContent>

        {STONE_TYPES.map((s) => (
          <TabsContent key={s.key} value={s.key}>
            <StoneRates stone={s.key} />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}

function StoneRates({ stone }: { stone: StoneType }) {
  const rates = usePricingStore((s) => s.rates.stones[stone]);
  const setCenterRate = usePricingStore((s) => s.setCenterRate);
  const setSideRate = usePricingStore((s) => s.setSideRate);

  return (
    <RateGrid caption="Center stone = price per stone · Side stones = price per carat">
      {CENTER_SIZES.map((size) => (
        <RateInput
          key={size}
          label={`${size} ct`}
          value={rates.center[size]}
          onChange={(v) => setCenterRate(stone, size, v)}
        />
      ))}
      <RateInput
        label="Side stones"
        value={rates.sidePerCarat}
        onChange={(v) => setSideRate(stone, v)}
        suffix="/ct"
      />
    </RateGrid>
  );
}

function RateGrid({ caption, children }: { caption: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border bg-card p-4">
      <p className="mb-3 text-xs text-muted-foreground">{caption}</p>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">{children}</div>
    </div>
  );
}
