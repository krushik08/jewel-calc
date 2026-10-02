"use client";

import { useState } from "react";
import { AlertTriangle, Layers, RotateCcw, Sparkles, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { usePricingStore } from "@/store/pricing-store";

export function ResetDialog() {
  const [open, setOpen] = useState(false);

  const ringsCount = usePricingStore((s) => s.rings.length);
  const singleDraft = usePricingStore((s) => s.singleDraft);
  const multipleDraft = usePricingStore((s) => s.multipleDraft);

  const resetAll = usePricingStore((s) => s.resetAll);
  const clearRings = usePricingStore((s) => s.clearRings);
  const resetSingleDraft = usePricingStore((s) => s.resetSingleDraft);
  const resetMultipleDraft = usePricingStore((s) => s.resetMultipleDraft);
  const resetRates = usePricingStore((s) => s.resetRates);
  const resetParams = usePricingStore((s) => s.resetParams);

  const hasSingleDraft =
    Boolean(singleDraft.name) ||
    Boolean(singleDraft.grams) ||
    singleDraft.centerSize !== "none" ||
    Boolean(singleDraft.sideCarats);

  const hasMultipleDraft =
    Boolean(multipleDraft.name) ||
    Boolean(multipleDraft.baseGrams) ||
    Boolean(multipleDraft.stepGrams) ||
    Object.values(multipleDraft.sides || {}).some(Boolean);

  const hasAnyDraft = hasSingleDraft || hasMultipleDraft;

  const handleResetAll = () => {
    resetAll();
    setOpen(false);
    toast.success("Calculator reset to factory defaults");
  };

  const handleClearTable = () => {
    clearRings();
    setOpen(false);
    toast.success("Pricing table cleared");
  };

  const handleClearForms = () => {
    resetSingleDraft();
    resetMultipleDraft();
    setOpen(false);
    toast.success("Item forms cleared");
  };

  const handleResetRatesAndSettings = () => {
    resetRates();
    resetParams();
    setOpen(false);
    toast.success("Rates and profit settings reset to defaults");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="hover:border-destructive/40 hover:bg-destructive/10 hover:text-destructive"
          title="Reset calculator data & forms"
        >
          <RotateCcw className="size-4" />
          <span>Reset</span>
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-left">
          <div className="flex items-center gap-2">
            <div className="flex size-9 items-center justify-center rounded-lg bg-destructive/10 text-destructive">
              <AlertTriangle className="size-5" />
            </div>
            <div>
              <DialogTitle className="text-xl">Reset Calculator</DialogTitle>
              <DialogDescription>
                Restore calculator back to defaults or clear specific sections.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="my-2 space-y-3 rounded-lg border bg-muted/40 p-3 text-xs">
          <p className="font-semibold text-foreground">Current Status:</p>
          <div className="grid grid-cols-2 gap-2 text-muted-foreground">
            <div className="flex items-center justify-between rounded bg-card px-2.5 py-1.5 border">
              <span>Items in Table:</span>
              <span className="font-semibold text-foreground">{ringsCount}</span>
            </div>
            <div className="flex items-center justify-between rounded bg-card px-2.5 py-1.5 border">
              <span>Draft Inputs:</span>
              <span className="font-semibold text-foreground">
                {hasAnyDraft ? "Active" : "Clean"}
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Button
            variant="destructive"
            className="w-full justify-start gap-2 h-11 text-sm font-semibold"
            onClick={handleResetAll}
          >
            <Sparkles className="size-4" />
            Reset Everything to Factory Defaults
          </Button>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
            <Button
              variant="outline"
              size="sm"
              className="justify-start gap-2 h-9 text-xs"
              disabled={ringsCount === 0}
              onClick={handleClearTable}
            >
              <Trash2 className="size-3.5 text-muted-foreground" />
              Clear Table Only ({ringsCount})
            </Button>

            <Button
              variant="outline"
              size="sm"
              className="justify-start gap-2 h-9 text-xs"
              disabled={!hasAnyDraft}
              onClick={handleClearForms}
            >
              <RotateCcw className="size-3.5 text-muted-foreground" />
              Clear Form Drafts
            </Button>
          </div>

          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start gap-2 h-8 text-xs text-muted-foreground"
            onClick={handleResetRatesAndSettings}
          >
            <Layers className="size-3.5" />
            Reset Custom Rates & Margins Only
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
