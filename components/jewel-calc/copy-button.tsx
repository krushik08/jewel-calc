"use client";

import { useEffect, useState } from "react";
import { Check, Copy } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * Writes text to the clipboard. The async Clipboard API only exists on secure
 * origins (https / localhost) — opening the dev server from a phone over the LAN
 * (http://192.168.x.x) needs the textarea fallback.
 */
async function writeClipboard(text: string) {
  if (navigator.clipboard && window.isSecureContext) {
    await navigator.clipboard.writeText(text);
    return;
  }
  const ta = document.createElement("textarea");
  ta.value = text;
  ta.setAttribute("readonly", "");
  ta.style.position = "fixed";
  ta.style.opacity = "0";
  document.body.appendChild(ta);
  ta.select();
  const ok = document.execCommand("copy");
  document.body.removeChild(ta);
  if (!ok) throw new Error("Copy command was rejected");
}

interface CopyButtonProps {
  /** Exact text placed on the clipboard. */
  value: string;
  /** What is being copied, for screen readers and the toast, e.g. "MRP". */
  label: string;
  className?: string;
}

/** Small icon button that copies a value and briefly shows a check mark. */
export function CopyButton({ value, label, className }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const t = setTimeout(() => setCopied(false), 1500);
    return () => clearTimeout(t);
  }, [copied]);

  const copy = async () => {
    try {
      await writeClipboard(value);
      setCopied(true);
      toast.success(`${label} copied: ${value}`);
    } catch {
      toast.error(`Couldn't copy ${label}. Select and copy it manually.`);
    }
  };

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon-xs"
      onClick={copy}
      aria-label={`Copy ${label} ${value}`}
      title={`Copy ${label}`}
      className={cn(
        "text-muted-foreground hover:text-primary print:hidden",
        copied && "text-success hover:text-success",
        className
      )}
    >
      {copied ? <Check /> : <Copy />}
    </Button>
  );
}
