import type { ComponentProps, ReactNode } from "react";
import { DocsHeader, DocsSidebar, type NavConfig } from "../organisms";

/** Template: header on top, sidebar on the left, content on the right. */
export function DocsLayout({ header, nav, children }: { header: ComponentProps<typeof DocsHeader>; nav: NavConfig; children: ReactNode }) {
  return (
    <div className="min-h-dvh bg-surface">
      <DocsHeader {...header} />
      <div className="mx-auto grid max-w-6xl md:grid-cols-[15rem_minmax(0,1fr)]">
        <DocsSidebar nav={nav} />
        <main className="max-w-3xl space-y-8 px-4 py-8 md:px-12">{children}</main>
      </div>
    </div>
  );
}
