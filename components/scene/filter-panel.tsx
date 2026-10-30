"use client";

import type { ChangeEvent } from "react";
import { bounds, counts, isActive, type FilterState } from "@/lib/filters";
import type { Hotspot, Project, Scene } from "@/lib/schema";
import { Button, Checkbox, SectionTitle } from "../ui";
import { SearchIcon } from "../ui/icons";

/** The scene's configured filters (scene.filters): search, category
 *  checkboxes with counts, min/max ranges. */
export function FilterPanel({ project, scene, hotspots, value, onChange, shown }: {
  project: Project;
  scene: Scene;
  hotspots: Hotspot[];
  value: FilterState;
  onChange: (next: FilterState) => void;
  shown: number;
}) {
  const config = scene.filters ?? {};
  const toggle = (e: ChangeEvent<HTMLInputElement>) => {
    const [cat, option] = e.currentTarget.name.split(":");
    const current = value.categories[cat] ?? [];
    const next = e.currentTarget.checked ? [...current, option] : current.filter((v) => v !== option);
    onChange({ ...value, categories: { ...value.categories, [cat]: next } });
  };
  const setRange = (id: string, range: [number, number], full: [number, number]) => {
    const ranges = { ...value.ranges };
    if (range[0] <= full[0] && range[1] >= full[1]) delete ranges[id];
    else ranges[id] = range;
    onChange({ ...value, ranges });
  };

  return (
    <div className="space-y-5 p-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-ink-muted" aria-live="polite">Showing {shown} of {hotspots.length}</p>
        {isActive(value) && <Button variant="ghost" onClick={() => onChange({ categories: {}, ranges: {}, query: "" })}>Clear</Button>}
      </div>

      {config.search !== false && (
        <label className="flex h-9 items-center gap-2 rounded-control border border-line px-2.5 focus-within:border-brand">
          <SearchIcon />
          <input
            type="search" placeholder="Search by name or id" aria-label="Search" value={value.query}
            onChange={(e) => onChange({ ...value, query: e.target.value })}
            className="h-full flex-1 bg-transparent text-sm outline-none"
          />
        </label>
      )}

      {(config.categories ?? []).map((cat) => {
        const category = project.categories?.[cat];
        if (!category) return null;
        const n = counts(hotspots, cat);
        return (
          <fieldset key={cat}>
            <SectionTitle>{category.label}</SectionTitle>
            {category.options.map((o) => (
              <Checkbox
                key={o.value} name={`${cat}:${o.value}`} label={o.label} color={o.color} count={n[o.value] ?? 0}
                checked={value.categories[cat]?.includes(o.value) ?? false} onChange={toggle}
              />
            ))}
          </fieldset>
        );
      })}

      {(config.ranges ?? []).map((id) => {
        const field = project.values?.[id];
        const full = bounds(hotspots, id);
        if (!field || !full || full[0] === full[1]) return null;
        const [lo, hi] = value.ranges[id] ?? full;
        const unit = field.unit ? ` ${field.unit}` : "";
        return (
          <fieldset key={id}>
            <SectionTitle>{field.label}</SectionTitle>
            <div className="flex justify-between text-xs tabular-nums text-ink-muted">
              <span>{lo.toLocaleString()}{unit}</span><span>{hi.toLocaleString()}{unit}</span>
            </div>
            <input
              type="range" aria-label={`${field.label} minimum`} min={full[0]} max={full[1]} value={lo} className="w-full accent-(--color-brand)"
              onChange={(e) => setRange(id, [Math.min(+e.target.value, hi), hi], full)}
            />
            <input
              type="range" aria-label={`${field.label} maximum`} min={full[0]} max={full[1]} value={hi} className="w-full accent-(--color-brand)"
              onChange={(e) => setRange(id, [lo, Math.max(+e.target.value, lo)], full)}
            />
          </fieldset>
        );
      })}
    </div>
  );
}

/** Colour key for `scene.colorBy`. */
export function Legend({ project, categoryId }: { project: Project; categoryId: string }) {
  const category = project.categories?.[categoryId];
  if (!category) return null;
  return (
    <ul className="pointer-events-auto flex flex-wrap items-center gap-x-4 gap-y-1 rounded-full border border-line bg-surface/95 px-4 py-2 text-xs shadow-panel" aria-label={`${category.label} legend`}>
      {category.options.map((o) => (
        <li key={o.value} className="flex items-center gap-1.5">
          <span className="size-2.5 rounded-full" style={{ background: o.color }} aria-hidden />
          {o.label}
        </li>
      ))}
    </ul>
  );
}
