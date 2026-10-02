import { Badge } from "@/components/ui/badge";
import { METAL_LABEL, STONE_META } from "@/lib/constants";
import type { Ring } from "@/types/pricing";

export function RingNameCell({ ring }: { ring: Ring }) {
  const meta = [
    `${ring.grams}g metal`,
    ring.centerSize && `${ring.centerSize} ct ${STONE_META[ring.stoneType].short}`,
    ring.sideCarats > 0 && `${ring.sideCarats} ct sides`,
  ].filter(Boolean);

  return (
    <div className="min-w-0">
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="text-sm leading-tight font-bold break-words">
          {ring.name}
        </span>
        <Badge variant="secondary" className="text-[10px]">
          {METAL_LABEL[ring.metal]}
        </Badge>
        {ring.kind === "multiple" && (
          <Badge variant="outline" className="border-primary/30 text-[10px] text-primary">
            Multiple
          </Badge>
        )}
      </div>
      <p className="mt-0.5 text-[11px] text-muted-foreground">{meta.join(" · ")}</p>
    </div>
  );
}
