import "server-only";
import projectJson from "@/data/project.json";
import { applyPatch } from "@/lib/project";
import type { ContentPatch, Project, Unit } from "@/lib/schema";
import { cached, fetchJson } from "./upstream";

/**
 * The BFF's two sources. Each upstream's own response shape is adapted to
 * ours in its normalize* function only — swap that for a new CMS / sales API.
 *   CONTENT_API_URL (+ CONTENT_API_TOKEN) → ContentPatch  (mock: data/mock-content.json)
 *   UNITS_API_URL   (+ UNITS_API_TOKEN)   → Unit[]        (mock: data/mock-units.json)
 */
const BASE = projectJson as unknown as Project;

const isObject = (v: unknown): v is Record<string, unknown> => !!v && typeof v === "object" && !Array.isArray(v);

/** Upstream content → ContentPatch. The mock already is one; a CMS
 *  (Contentful, Strapi…) would map its entries here. */
export function normalizeContent(raw: unknown): ContentPatch {
  if (!isObject(raw)) throw new Error("content API: expected an object");
  const pick = (k: string) => (isObject(raw[k]) ? (raw[k] as never) : undefined);
  return { project: pick("project"), scenes: pick("scenes"), hotspots: pick("hotspots"), markers: pick("markers") };
}

/** Upstream units → Unit[]. Accepts `[...]` or `{ units: [...] }`; on each
 *  item `id` (or `unitId`), optional `scene`, and every other field split by
 *  type: strings → categories (status: "sold"), numbers → values (price). */
export function normalizeUnits(raw: unknown): Unit[] {
  const list = Array.isArray(raw) ? raw : isObject(raw) && Array.isArray(raw.units) ? raw.units : [];
  return list.filter(isObject).flatMap((item) => {
    const { id, unitId, scene, ...rest } = item;
    const key = String(id ?? unitId ?? "");
    if (!key) return [];
    const unit: Unit = { id: key, categories: {}, values: {} };
    if (typeof scene === "string") unit.scene = scene;
    for (const [k, v] of Object.entries(rest)) {
      if (typeof v === "string") unit.categories![k] = v;
      else if (typeof v === "number") unit.values![k] = v;
    }
    return [unit];
  });
}

export const getProject = cached(60_000, async () =>
  applyPatch(BASE, normalizeContent(await fetchJson(process.env.CONTENT_API_URL, process.env.CONTENT_API_TOKEN, "mock-content.json"))),
);

export const getUnits = cached(30_000, async () =>
  normalizeUnits(await fetchJson(process.env.UNITS_API_URL, process.env.UNITS_API_TOKEN, "mock-units.json")),
);
