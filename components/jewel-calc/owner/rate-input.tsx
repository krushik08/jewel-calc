"use client";

import { useEffect, useId, useState } from "react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface RateInputProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  suffix?: string;
  step?: number;
}

/**
 * Number field for a single rate. Keeps its own text so the user can clear the
 * box while typing; only valid, non-negative numbers are pushed to the store.
 */
export function RateInput({ label, value, onChange, suffix, step = 1 }: RateInputProps) {
  const id = useId();
  const [text, setText] = useState(String(value));

  // Sync when the value changes from outside (e.g. Reset to Default)
  useEffect(() => {
    setText((t) => (parseFloat(t) === value ? t : String(value)));
  }, [value]);

  return (
    <div className="space-y-1.5">
      <Label htmlFor={id} className="text-[10px]">
        {label}
      </Label>
      <div className="relative">
        <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-sm text-primary">
          $
        </span>
        <Input
          id={id}
          type="number"
          inputMode="decimal"
          min={0}
          step={step}
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            const n = parseFloat(e.target.value);
            if (Number.isFinite(n) && n >= 0) onChange(n);
          }}
          onBlur={() => setText(String(value))}
          className="tabular pr-10 pl-6"
        />
        {suffix && (
          <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-xs text-muted-foreground">
            {suffix}
          </span>
        )}
      </div>
    </div>
  );
}
