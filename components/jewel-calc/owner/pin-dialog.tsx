"use client";

import { useEffect, useState } from "react";
import { Delete } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { OWNER_PIN } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { usePricingStore } from "@/store/pricing-store";

const PIN_LENGTH = 4;
const KEYS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "clear", "0", "back"] as const;

interface PinDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PinDialog({ open, onOpenChange }: PinDialogProps) {
  const login = usePricingStore((s) => s.login);
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");

  // Reset each time the dialog opens
  useEffect(() => {
    if (open) {
      setPin("");
      setError("");
    }
  }, [open]);

  // Check once 4 digits are entered
  useEffect(() => {
    if (pin.length !== PIN_LENGTH) return;
    const t = setTimeout(() => {
      if (pin === OWNER_PIN) {
        login();
        onOpenChange(false);
        toast.success("Owner mode activated");
      } else {
        setError("Incorrect PIN. Try again.");
        setPin("");
      }
    }, 180);
    return () => clearTimeout(t);
  }, [pin, login, onOpenChange]);

  const press = (key: (typeof KEYS)[number]) => {
    setError("");
    if (key === "clear") return setPin("");
    if (key === "back") return setPin((p) => p.slice(0, -1));
    setPin((p) => (p.length < PIN_LENGTH ? p + key : p));
  };

  // Physical keyboard support
  const onKeyDown = (e: React.KeyboardEvent) => {
    if (/^\d$/.test(e.key)) press(e.key as (typeof KEYS)[number]);
    else if (e.key === "Backspace") press("back");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent onKeyDown={onKeyDown}>
        <DialogHeader>
          <DialogTitle>Owner Login</DialogTitle>
          <DialogDescription>Enter your 4-digit PIN to access profit settings</DialogDescription>
        </DialogHeader>

        <div className="flex justify-center gap-3" aria-label={`${pin.length} of 4 digits entered`}>
          {Array.from({ length: PIN_LENGTH }, (_, i) => (
            <span
              key={i}
              className={cn(
                "size-3.5 rounded-full border-2 transition-colors",
                i < pin.length ? "border-primary bg-primary" : "border-input"
              )}
            />
          ))}
        </div>

        <div className="mx-auto grid w-full max-w-[240px] grid-cols-3 gap-2">
          {KEYS.map((key) => (
            <Button
              key={key}
              type="button"
              variant="secondary"
              className="h-12 text-lg font-semibold active:scale-95"
              onClick={() => press(key)}
              aria-label={key === "back" ? "Backspace" : key === "clear" ? "Clear" : key}
            >
              {key === "back" ? <Delete /> : key === "clear" ? <span className="text-xs">CLR</span> : key}
            </Button>
          ))}
        </div>

        <p className="h-4 text-center text-xs text-destructive" role="alert">
          {error}
        </p>
      </DialogContent>
    </Dialog>
  );
}
