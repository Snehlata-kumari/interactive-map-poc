import type { MouseEventHandler, ReactNode } from "react";
import { cx } from "../../ui";

/** A sidebar link; `active` marks the section being read. */
export function NavLink({ href, active, onClick, children }: { href: string; active?: boolean; onClick?: MouseEventHandler<HTMLAnchorElement>; children: ReactNode }) {
  return (
    <a
      href={href}
      onClick={onClick}
      aria-current={active ? "location" : undefined}
      className={cx("block rounded-control px-2.5 py-1.5", active ? "bg-brand/10 font-semibold text-brand" : "text-ink hover:bg-surface-muted")}
    >
      {children}
    </a>
  );
}
