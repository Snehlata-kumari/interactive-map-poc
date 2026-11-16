import type { ReactNode } from "react";

/** One keyboard key. */
export function Kbd({ children }: { children: ReactNode }) {
  return <kbd className="rounded border border-b-2 border-line bg-surface-muted px-1.5 font-sans text-xs">{children}</kbd>;
}
