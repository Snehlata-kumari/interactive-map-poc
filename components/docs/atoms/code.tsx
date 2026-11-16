import type { ReactNode } from "react";

/** Inline code. */
export function Code({ children }: { children: ReactNode }) {
  return <code className="rounded bg-surface-muted px-1.5 py-0.5 font-mono text-[0.85em]">{children}</code>;
}
