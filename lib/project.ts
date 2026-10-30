/** Scene tree helpers, colours and data checks — pure, shared by client and BFF. */
import type { ContentPatch, Hotspot, Point, Project, Scene, Unit } from "./schema";

export const getScene = (p: Project, id: string) => p.scenes.find((s) => s.id === id);

/** Root → scene, following `parent`. */
export function sceneChain(p: Project, scene: Scene): Scene[] {
  const chain: Scene[] = [];
  for (let s: Scene | undefined = scene; s && !chain.includes(s); s = s.parent ? getScene(p, s.parent) : undefined)
    chain.unshift(s);
  return chain;
}

/** URL of a scene: its chain's ids below the root (root = "/"). */
export function scenePath(p: Project, id: string): string {
  const scene = getScene(p, id);
  if (!scene) return "/";
  const ids = sceneChain(p, scene).map((s) => s.id).filter((s) => s !== p.rootScene);
  return "/" + ids.join("/");
}

/** The scene at a URL, or undefined (→ 404). */
export function sceneFromPath(p: Project, segments: string[]): Scene | undefined {
  const scene = getScene(p, segments.at(-1) ?? p.rootScene);
  return scene && scenePath(p, scene.id) === "/" + segments.join("/") ? scene : undefined;
}

export function centroid(points: Point[]): Point {
  const n = points.length || 1;
  return [points.reduce((a, [x]) => a + x, 0) / n, points.reduce((a, [, y]) => a + y, 0) / n];
}

export const NEUTRAL = "#94a3b8";

export function hotspotColor(p: Project, h: Hotspot, colorBy?: string): string {
  if (!colorBy) return NEUTRAL;
  const value = h.categories?.[colorBy];
  return p.categories?.[colorBy]?.options.find((o) => o.value === value)?.color ?? NEUTRAL;
}

/** Content from the API laid over the project — text, images, data; the
 *  geometry is always project.json's. An entry with no matching shape is ignored. */
export function applyPatch(base: Project, patch: ContentPatch): Project {
  const p: Project = structuredClone(base);
  if (patch.project?.name) p.name = patch.project.name;
  for (const s of p.scenes) {
    Object.assign(s, defined(patch.scenes?.[s.id]));
    for (const h of s.hotspots ?? []) {
      const c = patch.hotspots?.[`${s.id}/${h.id}`];
      if (!c) continue;
      Object.assign(h, defined({ ...c, categories: undefined, values: undefined, info: undefined }));
      if (c.categories) h.categories = { ...h.categories, ...c.categories };
      if (c.values) h.values = { ...h.values, ...c.values };
      if (c.info) h.info = { ...h.info, ...c.info };
    }
    for (const m of s.markers ?? []) {
      const c = patch.markers?.[`${s.id}/${m.id}`];
      if (c) Object.assign(m, defined({ ...c, info: c.info && { ...m.info, ...c.info } }));
    }
  }
  return p;
}

/** Live units over a scene's hotspots (by id). */
export function withUnits(hotspots: Hotspot[], units: Unit[], sceneId: string): Hotspot[] {
  if (!units.length) return hotspots;
  const byId = new Map(units.filter((u) => !u.scene || u.scene === sceneId).map((u) => [u.id, u]));
  return hotspots.map((h) => {
    const u = byId.get(h.id);
    return u ? { ...h, categories: { ...h.categories, ...u.categories }, values: { ...h.values, ...u.values } } : h;
  });
}

const defined = <T extends object>(o: T | undefined) =>
  Object.fromEntries(Object.entries(o ?? {}).filter(([, v]) => v !== undefined)) as Partial<T>;

/** Mistakes in project.json, shown in the dev console. */
export function checkProject(p: Project): string[] {
  const problems: string[] = [];
  const ids = new Set(p.scenes.map((s) => s.id));
  const pct = (pt: Point) => pt.every((v) => typeof v === "number" && v >= 0 && v <= 100);
  if (!ids.has(p.rootScene)) problems.push(`rootScene "${p.rootScene}" is not a scene`);
  for (const s of p.scenes) {
    if (s.parent && !ids.has(s.parent)) problems.push(`scene "${s.id}": parent "${s.parent}" not found`);
    if (s.colorBy && !p.categories?.[s.colorBy]) problems.push(`scene "${s.id}": colorBy "${s.colorBy}" not a category`);
    for (const h of s.hotspots ?? []) {
      if (h.points.length < 3 || !h.points.every(pct)) problems.push(`${s.id}/${h.id}: needs ≥3 points in 0–100`);
      if (h.link && !ids.has(h.link)) problems.push(`${s.id}/${h.id}: link "${h.link}" not a scene`);
    }
    for (const m of s.markers ?? []) if (!pct(m.point)) problems.push(`${s.id}/${m.id}: point not in 0–100`);
  }
  return problems;
}
