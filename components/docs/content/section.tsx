import type { ReactNode } from "react";
import { DocSection } from "../organisms";
import { DOC_NAV } from "./nav";

const TITLES = new Map(DOC_NAV.flatMap((g) => g.items.map((i) => [i.id, i.title])));

/** A DocSection whose title comes from the sidebar config, so the two never drift. */
export function Section({ id, children }: { id: string; children: ReactNode }) {
  return <DocSection id={id} title={TITLES.get(id) ?? id}>{children}</DocSection>;
}
