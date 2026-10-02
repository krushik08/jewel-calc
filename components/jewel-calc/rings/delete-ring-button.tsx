"use client";

import { Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { usePricingStore } from "@/store/pricing-store";

export function DeleteRingButton({ id, name }: { id: string; name: string }) {
  const removeRing = usePricingStore((s) => s.removeRing);
  return (
    <Button
      variant="ghost"
      size="icon-sm"
      className="text-fee hover:bg-fee-soft hover:text-fee print:hidden"
      aria-label={`Remove ${name}`}
      onClick={() => {
        removeRing(id);
        toast("Item removed");
      }}
    >
      <Trash2 />
    </Button>
  );
}
