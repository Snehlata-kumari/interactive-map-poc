"use client";

import Link from "next/link";
import { Fragment } from "react";
import { chainPath } from "@/lib/project";
import type { Project, Scene } from "@/lib/schema";
import { PANEL, cx } from "../ui";
import { BackIcon, ChevronIcon } from "../ui/icons";

/** Back button + breadcrumb along the path the user took (root → this scene). */
export function TopBar({ project, chain }: { project: Project; chain: Scene[] }) {
  const scene = chain.at(-1);
  const parent = chain.at(-2);
  /** URL of the i-th step: the path up to it. */
  const pathTo = (i: number) => chainPath(project, chain.slice(0, i + 1));
  return (
    <div className="pointer-events-none absolute start-4 top-4 z-10 flex max-w-[calc(100%-10rem)] items-center gap-2 md:max-w-[calc(100%-5rem)]">
      {parent && (
        <Link href={pathTo(chain.length - 2)} aria-label={`Back to ${parent.title}`} className={cx(PANEL, "pointer-events-auto grid size-9 place-items-center rounded-control hover:bg-surface-muted")}>
          <BackIcon />
        </Link>
      )}
      <nav aria-label="Breadcrumb" className={cx(PANEL, "pointer-events-auto min-w-0 rounded-control px-3 py-2 text-sm")}>
        <ol className="flex min-w-0 items-center gap-1.5">
          {chain.map((s, i) => (
            <Fragment key={s.id}>
              {/* On a phone only the current scene shows; Back covers the rest. */}
              {i > 0 && <li aria-hidden className="hidden text-ink-muted sm:block"><ChevronIcon /></li>}
              <li className={s === scene ? "min-w-0 truncate" : "hidden shrink-0 sm:block"}>
                {s === scene ? (
                  <span aria-current="page" className="font-semibold">{s.title}</span>
                ) : (
                  <Link href={pathTo(i)} className="text-ink-muted hover:text-ink">{s.title}</Link>
                )}
              </li>
            </Fragment>
          ))}
        </ol>
      </nav>
    </div>
  );
}
