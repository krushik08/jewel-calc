"use client";

import { useState } from "react";
import { Gem, Lock, LogOut, Sparkles } from "lucide-react";
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
  const appVersion = usePricingStore((s) => s.appVersion);
  const setAppVersion = usePricingStore((s) => s.setAppVersion);
  const [pinOpen, setPinOpen] = useState(false);

  return (
    <header className="flex flex-wrap items-center justify-between gap-4 border-b pb-5 print:hidden">
      <div className="flex items-center gap-3">
        <div
          className={cn(
            "flex size-11 items-center justify-center rounded-xl text-primary-foreground shadow-md transition-all",
            appVersion === "v2"
              ? "bg-gradient-to-br from-primary via-[oklch(0.68_0.21_50)] to-amber-500 shadow-primary/30"
              : "bg-gradient-to-br from-primary to-[oklch(0.72_0.14_300)] shadow-primary/25"
          )}
        >
          <Gem className="size-5" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-display text-2xl leading-none sm:text-3xl">Jewel Calc</h1>
            <Badge
              variant="outline"
              className={cn(
                "text-[10px] font-bold px-1.5 py-0",
                appVersion === "v2"
                  ? "border-primary/40 bg-primary/10 text-primary"
                  : "border-purple-300 bg-purple-50 text-purple-700"
              )}
            >
              {appVersion === "v2" ? "V2 Pro" : "V1"}
            </Badge>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">From cost to MRP, in seconds.</p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {/* Version Switcher */}
        <div className="flex items-center rounded-lg border border-border/80 bg-muted/50 p-0.5 shadow-xs">
          <button
            type="button"
            onClick={() => {
              setAppVersion("v1");
              toast("Switched to V1 (Classic Purple)");
            }}
            className={cn(
              "flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-semibold transition-all cursor-pointer",
              appVersion === "v1"
                ? "bg-card text-foreground shadow-xs border"
                : "text-muted-foreground hover:text-foreground"
            )}
            title="Switch to V1 (Classic Purple)"
          >
            <span className="size-2 rounded-full bg-purple-500" />
            <span>V1</span>
            <span className="hidden sm:inline text-[10px] text-muted-foreground font-normal">Classic</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setAppVersion("v2");
              toast.success("Switched to V2 (Sunset Orange Edition)");
            }}
            className={cn(
              "flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-semibold transition-all cursor-pointer",
              appVersion === "v2"
                ? "bg-primary text-primary-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            )}
            title="Switch to V2 (Warm Orange Edition with Clean Multiple Items)"
          >
            <Sparkles className="size-3 text-amber-200" />
            <span>V2</span>
            <span className="hidden sm:inline text-[10px] opacity-90 font-normal">Orange</span>
          </button>
        </div>

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

