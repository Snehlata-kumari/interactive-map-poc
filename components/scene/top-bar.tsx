"use client";

import Link from "next/link";
import { Fragment } from "react";
import { sceneChain, scenePath } from "@/lib/project";
import type { Project, Scene } from "@/lib/schema";
import { PANEL, cx } from "../ui";
import { BackIcon, ChevronIcon } from "../ui/icons";

/** Back button + breadcrumb (root → this scene). */
export function TopBar({ project, scene }: { project: Project; scene: Scene }) {
  const chain = sceneChain(project, scene);
  const parent = chain.at(-2);
  return (
    <div className="pointer-events-none absolute start-4 top-4 z-10 flex max-w-[calc(100%-10rem)] items-center gap-2 md:max-w-[calc(100%-5rem)]">
      {parent && (
        <Link href={scenePath(project, parent.id)} aria-label={`Back to ${parent.title}`} className={cx(PANEL, "pointer-events-auto grid size-9 place-items-center rounded-control hover:bg-surface-muted")}>
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
                  <Link href={scenePath(project, s.id)} className="text-ink-muted hover:text-ink">{s.title}</Link>
                )}
              </li>
            </Fragment>
          ))}
        </ol>
      </nav>
    </div>
  );
}
