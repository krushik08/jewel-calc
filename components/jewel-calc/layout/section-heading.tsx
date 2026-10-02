import type { ReactNode } from "react";

export function SectionHeading({ children, action }: { children: ReactNode; action?: ReactNode }) {
  return (
    <div className="mb-3 flex items-center gap-3">
      <h2 className="font-display text-xl text-foreground">{children}</h2>
      <div className="h-px flex-1 bg-border" />
      {action}
    </div>
  );
}
