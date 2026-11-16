/**
 * The SVG editor's `details` (the Excel sheet loaded into the editor) →
 * plot data, category / value definitions and per-map filters.
 * Used by import-editor.mjs.
 */

export const slug = (s) => String(s).toLowerCase().replace(/([a-z])(\d)/g, "$1-$2").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const norm = (s) => String(s ?? "").trim().toLowerCase();
const human = (k) => k.replace(/_/g, " ").replace(/([a-z])([A-Z])/g, "$1 $2").replace(/^./, (c) => c.toUpperCase());

/** Default colours for the usual statuses; anything else takes the palette in turn. */
const STATUS_COLORS = {
  available: "#22c55e", booked: "#f59e0b", reserved: "#f59e0b", "on-hold": "#f59e0b",
  blocked: "#94a3b8", sold: "#ef4444", unavailable: "#ef4444", unassigned: "#64748b",
};
const PALETTE = ["#0ea5e9", "#a855f7", "#14b8a6", "#ec4899", "#84cc16", "#f97316"];

/** Detail columns → categories (filters, colours) and values (numbers). */
const CATEGORY_FIELDS = { status: ["status", "Status"], typology: ["mdTypology", "Typology"] };
const VALUE_FIELDS = {
  area: ["mdPlotArea", "Plot area", "m²"], gfa: ["gfa", "GFA", "m²"], parking: ["parking", "Parking"],
};
/** Columns used for matching or above; every other filled column becomes a card line. */
const SKIP = new Set(["hotspotId", "plotLabel", "extra", ...Object.values(CATEGORY_FIELDS).map(([f]) => f), ...Object.values(VALUE_FIELDS).map(([f]) => f)]);
const RANGE_ORDER = ["area", "gfa", "parking"];

/** Rows findable by their key, `hotspotId` or `plotLabel` (any case). */
export function indexDetails(details) {
  const index = new Map();
  for (const [key, row] of Object.entries(details ?? {}))
    for (const k of [key, row?.hotspotId, row?.plotLabel]) if (k && !index.has(norm(k))) index.set(norm(k), { key, row });
  return index;
}

/** The row for a shape: by its id, then by its label. */
export const findRow = (index, shape) => index.get(norm(shape.id)) ?? (shape.label ? index.get(norm(shape.label)) : undefined);

/** One row → { categories, values, rows } for a hotspot (empty parts left out). */
export function plotData(row) {
  const categories = {}, values = {}, rows = [];
  for (const [id, [field]] of Object.entries(CATEGORY_FIELDS)) if (row[field]) categories[id] = slug(row[field]);
  for (const [id, [field]] of Object.entries(VALUE_FIELDS)) if (typeof row[field] === "number") values[id] = row[field];
  const line = (label, v) => {
    const value = typeof v === "number" ? String(v) : typeof v === "string" ? v.trim() : "";
    if (value) rows.push({ label: human(label), value });
  };
  for (const [k, v] of Object.entries(row)) if (!SKIP.has(k)) line(k === "facadeOption" ? "Facade" : k, v);
  for (const [k, v] of Object.entries(row.extra ?? {})) line(k, v);
  return { categories, values, rows };
}

/** Definitions for what the matched rows use, added to the current ones:
 *  existing labels / colours are kept, new options are appended. */
export function definitions(used, prev = {}) {
  const categories = structuredClone(prev.categories ?? {});
  const values = structuredClone(prev.values ?? {});
  let extra = 0;
  for (const [id, [field, label]] of Object.entries(CATEGORY_FIELDS)) {
    const raw = [...new Set(used.map((r) => r[field]).filter(Boolean))];
    if (!raw.length) continue;
    const cat = (categories[id] ??= { label, options: [] });
    for (const text of raw) {
      const value = slug(text);
      if (cat.options.some((o) => o.value === value)) continue;
      const color = id === "status" ? STATUS_COLORS[value] ?? PALETTE[extra++ % PALETTE.length] : undefined;
      cat.options.push({ value, label: String(text).trim(), ...(color && { color }) });
    }
  }
  for (const [id, [field, label, unit]] of Object.entries(VALUE_FIELDS))
    if (!values[id] && used.some((r) => typeof r[field] === "number")) values[id] = { label, ...(unit && { unit }) };
  return { categories, values };
}

/** Colours + filters for a map whose plots have data, unless it already has its own. */
export function sceneFilters(scene) {
  if (scene.filters) return {};
  const has = (kind, id) => scene.hotspots?.some((h) => h[kind]?.[id] !== undefined);
  const categories = Object.keys(CATEGORY_FIELDS).filter((id) => has("categories", id));
  const ranges = RANGE_ORDER.filter((id) => has("values", id));
  if (!categories.length && !ranges.length) return {};
  return {
    ...(!scene.colorBy && categories.includes("status") && { colorBy: "status" }),
    filters: { categories, ranges, search: true },
  };
}
