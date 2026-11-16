import type { ReactNode } from "react";
import { cx } from "../../ui";

/** A highlighted note (`note`) or caution (`warn`). */
export function Callout({ tone = "note", children }: { tone?: "note" | "warn"; children: ReactNode }) {
  return (
    <div className={cx("rounded-e-control border-s-4 px-4 py-3 text-sm", tone === "note" ? "border-brand bg-brand/5" : "border-warn bg-warn/10")}>
      {children}
    </div>
  );
}
