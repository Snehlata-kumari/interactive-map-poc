import type { ReactNode } from "react";

/** Section (2) and sub-section (3) headings. */
export function Heading({ level = 2, children }: { level?: 2 | 3; children: ReactNode }) {
  return level === 2 ? (
    <h2 className="mb-3 text-2xl font-semibold tracking-tight">{children}</h2>
  ) : (
    <h3 className="pt-2 text-base font-semibold">{children}</h3>
  );
}
