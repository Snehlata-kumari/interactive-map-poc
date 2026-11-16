import type { ReactNode } from "react";
import { Heading } from "../atoms";

/** One anchored section of the page (the sidebar links to its `id`). */
export function DocSection({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  return (
    <section id={id} className="scroll-mt-20 border-b border-line pb-8 last:border-b-0">
      <Heading>{title}</Heading>
      <div className="space-y-4 text-[15px] leading-relaxed">{children}</div>
    </section>
  );
}
