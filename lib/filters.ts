/** Filter state and matching for a scene's hotspots. */
import type { Hotspot } from "./schema";

export interface FilterState {
  /** Category id → selected values (empty = any). */
  categories: Record<string, string[]>;
  /** Value id → [min, max]. */
  ranges: Record<string, [number, number]>;
  query: string;
}

export const EMPTY_FILTERS: FilterState = { categories: {}, ranges: {}, query: "" };

export const isActive = (f: FilterState) =>
  !!f.query.trim() || Object.values(f.categories).some((v) => v.length) || Object.keys(f.ranges).length > 0;

export function matches(h: Hotspot, f: FilterState): boolean {
  for (const [cat, selected] of Object.entries(f.categories))
    if (selected.length && !selected.includes(h.categories?.[cat] ?? "")) return false;
  for (const [id, [min, max]] of Object.entries(f.ranges)) {
    const v = h.values?.[id];
    if (v === undefined || v < min || v > max) return false;
  }
  const q = f.query.trim().toLowerCase();
  return !q || h.id.toLowerCase().includes(q) || !!h.label?.toLowerCase().includes(q);
}

/** [min, max] of a value over hotspots, or null when none has it. */
export function bounds(hotspots: Hotspot[], id: string): [number, number] | null {
  const vs = hotspots.map((h) => h.values?.[id]).filter((v): v is number => typeof v === "number");
  return vs.length ? [Math.min(...vs), Math.max(...vs)] : null;
}

/** How many hotspots have each value of a category. */
export function counts(hotspots: Hotspot[], cat: string): Record<string, number> {
  const out: Record<string, number> = {};
  for (const h of hotspots) {
    const v = h.categories?.[cat];
    if (v) out[v] = (out[v] ?? 0) + 1;
  }
  return out;
}
