"use client";

import { useState } from "react";
import { Gem, Lock, LogOut } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PinDialog } from "@/components/jewel-calc/owner/pin-dialog";
import { ResetDialog } from "@/components/jewel-calc/layout/reset-dialog";
import { cn } from "@/lib/utils";
import { usePricingStore } from "@/store/pricing-store";

export function AppHeader() {
  const isOwner = usePricingStore((s) => s.isOwner);
  const logout = usePricingStore((s) => s.logout);
  const [pinOpen, setPinOpen] = useState(false);

  return (
    <header className="flex flex-wrap items-center justify-between gap-4 border-b pb-5 print:hidden">
      <div className="flex items-center gap-3">
        <div className="flex size-11 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-[oklch(0.72_0.14_300)] text-primary-foreground shadow-md shadow-primary/25">
          <Gem className="size-5" />
        </div>
        <div>
          <h1 className="font-display text-2xl leading-none sm:text-3xl">Jewel Calc</h1>
          <p className="mt-1 text-sm text-muted-foreground">From cost to MRP, in seconds.</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <ResetDialog />
        <Badge
          variant="outline"
          className={cn(
            "px-3 py-1",
            isOwner ? "border-primary/30 bg-accent text-accent-foreground" : "bg-card"
          )}
        >
          {isOwner ? "Owner Mode" : "Employee View"}
        </Badge>
        {isOwner ? (
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              logout();
              toast("Logged out");
            }}
          >
            <LogOut /> Logout
          </Button>
        ) : (
          <Button size="sm" onClick={() => setPinOpen(true)}>
            <Lock /> Owner Login
          </Button>
        )}
      </div>

      <PinDialog open={pinOpen} onOpenChange={setPinOpen} />
    </header>
  );
}

