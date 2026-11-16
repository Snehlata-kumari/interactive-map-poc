import type { ReactNode } from "react";

/** A small brand-tinted pill (version, tag). */
export function Badge({ children }: { children: ReactNode }) {
  return <span className="rounded-full bg-brand/10 px-2 py-0.5 text-xs font-medium text-brand">{children}</span>;
}
