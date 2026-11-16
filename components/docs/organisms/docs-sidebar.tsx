"use client";

import { useEffect, useState } from "react";
import { cx } from "../../ui";
import { MenuIcon } from "../../ui/icons";
import { NavGroup } from "../molecules";

export type NavConfig = { group: string; items: { id: string; title: string }[] }[];

/** Sidebar that highlights the section being read; a drop-down menu on phones. */
export function DocsSidebar({ nav }: { nav: NavConfig }) {
  const [active, setActive] = useState(nav[0]?.items[0]?.id);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        const hit = entries.find((e) => e.isIntersecting);
        if (hit) setActive(hit.target.id);
      },
      { rootMargin: "-80px 0px -70% 0px" },
    );
    for (const g of nav) for (const i of g.items) {
      const el = document.getElementById(i.id);
      if (el) obs.observe(el);
    }
    return () => obs.disconnect();
  }, [nav]);

  const close = () => setOpen(false);
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls="docs-nav"
        aria-label="Sections"
        className="fixed end-4 top-3 z-30 grid size-9 place-items-center rounded-control border border-line bg-surface hover:bg-surface-muted md:hidden"
      >
        <MenuIcon />
      </button>
      <nav
        id="docs-nav"
        aria-label="Documentation"
        className={cx(
          "fixed inset-x-0 top-15 bottom-0 z-20 overflow-y-auto bg-surface p-4 text-sm md:sticky md:block md:h-[calc(100dvh-3.75rem)] md:border-e md:border-line md:py-6",
          !open && "hidden",
        )}
      >
        {nav.map((g) => <NavGroup key={g.group} label={g.group} items={g.items} active={active} onNavigate={close} />)}
      </nav>
    </>
  );
}
