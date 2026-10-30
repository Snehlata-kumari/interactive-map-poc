#!/usr/bin/env node
/**
 * Imports a project from the SVG editor (svg-footprint-generator) into
 * data/project.json + public/projects/<slug>/.
 *
 *   npm run import-editor -- ~/Downloads/new-project.json
 *
 * Input: the editor's "Download backup (project + images)" file (images
 * embedded as data URLs). Images are converted to WebP (≤ 4000 px wide).
 *
 * Mapping: scene → scene (parent = the scene whose shape links to it; id and
 * title from that shape's label); polygon → hotspot; pin → marker; lines are
 * skipped. Editor `details` keyed by a hotspot id become its status / typology
 * and area / gfa.
 *
 * Re-importing keeps your data: for every scene / hotspot / marker with the
 * same id, everything but the geometry (points, image, size) is kept from the
 * current data/project.json, as are its categories, values and theme. The old
 * file is saved as data/project.previous.json.
 */
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const ROOT = path.resolve(import.meta.dirname, "..");
const DATA = path.join(ROOT, "data", "project.json");
const fail = (msg) => (console.error(`✖ ${msg}`), process.exit(1));

const file = process.argv[2];
if (!file) fail("Usage: npm run import-editor -- <editor-backup.json>");
const src = JSON.parse(fs.readFileSync(file, "utf8"));
if (!Array.isArray(src.scenes)) fail("Not an editor project (no scenes).");

const slug = (s) => String(s).toLowerCase().replace(/([a-z])(\d)/g, "$1-$2").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const name = slug(src.title || path.basename(file, ".json"));
const outDir = path.join(ROOT, "public", "projects", name);
fs.mkdirSync(outDir, { recursive: true });

// Scene ids/titles from the label of the shape that opens them; parents from links.
const parentOf = {}, labelOf = {};
for (const s of src.scenes) for (const sh of s.shapes ?? []) if (sh.link) [parentOf[sh.link], labelOf[sh.link]] = [s.id, sh.label];
const used = new Set();
const idOf = Object.fromEntries(src.scenes.map((s) => {
  let id = s.id === src.startScene ? "overview" : slug(labelOf[s.id] ?? s.title) || "scene";
  while (used.has(id)) id += "-2";
  used.add(id);
  return [s.id, id];
}));

/** An embedded image → public/projects/<name>/<scene>.webp (its URL). */
async function saveImage(ref, sceneId) {
  const data = src.images?.[ref] ?? ref;
  const match = /^data:[^;]+;base64,(.+)$/.exec(data);
  if (!match) fail(`Scene "${sceneId}": image ${String(ref).slice(0, 40)} is not embedded — use the editor's backup download.`);
  await sharp(Buffer.from(match[1], "base64")).resize({ width: 4000, withoutEnlargement: true }).webp({ quality: 80 }).toFile(path.join(outDir, `${sceneId}.webp`));
  return `/projects/${name}/${sceneId}.webp`;
}

const pct = (pts) => pts.map(([x, y]) => [Math.round(x * 100) / 100, Math.round(y * 100) / 100]);
const details = src.details ?? {};
const fromDetails = (d) => d && {
  categories: Object.fromEntries([["status", d.status && slug(d.status)], ["typology", d.mdTypology && slug(d.mdTypology)]].filter(([, v]) => v)),
  values: Object.fromEntries([["area", d.mdPlotArea], ["gfa", d.gfa]].filter(([, v]) => typeof v === "number")),
};

const scenes = [];
for (const s of src.scenes) {
  const id = idOf[s.id];
  const shapes = s.shapes ?? [];
  const hotspots = shapes.filter((sh) => sh.kind === "polygon" && sh.points?.length >= 3).map((sh) => ({
    id: sh.id, label: sh.label || sh.id, points: pct(sh.points),
    ...(sh.link && idOf[sh.link] && { link: idOf[sh.link] }),
    ...(sh.url && { href: sh.url }),
    ...fromDetails(details[sh.id]),
  }));
  const markers = shapes.filter((sh) => sh.kind === "pin" && sh.points?.length).map((sh) => ({ id: sh.id, label: sh.label || sh.id, point: pct(sh.points)[0] }));
  scenes.push({
    id, ...(parentOf[s.id] && { parent: idOf[parentOf[s.id]] }),
    title: s.id === src.startScene ? src.title || "Overview" : labelOf[s.id] ?? s.title,
    image: await saveImage(s.image, id), size: [s.width, s.height],
    ...(hotspots.length ? { hotspotStyle: "fill" } : { fit: "contain" }),
    ...(hotspots.length && { hotspots }), ...(markers.length && { markers }),
  });
}

// Keep the current file's data for everything that matches by id.
const old = fs.existsSync(DATA) ? JSON.parse(fs.readFileSync(DATA, "utf8")) : null;
const keep = (fresh, prev, geometry) => (prev ? { ...prev, ...Object.fromEntries(geometry.map((k) => [k, fresh[k]])), id: fresh.id } : fresh);
const merged = scenes.map((s) => {
  const prev = old?.scenes?.find((p) => p.id === s.id);
  const byId = (list, k) => new Map((list ?? []).map((x) => [x.id, x])).get(k);
  return {
    ...keep(s, prev, ["image", "size", "parent"]),
    ...(s.hotspots && { hotspots: s.hotspots.map((h) => keep(h, byId(prev?.hotspots, h.id), ["points", "link"])) }),
    ...(s.markers && { markers: s.markers.map((m) => keep(m, byId(prev?.markers, m.id), ["point"])) }),
  };
});
const project = {
  name: old?.name ?? src.title ?? name,
  rootScene: idOf[src.startScene] ?? merged[0].id,
  ...(old?.theme && { theme: old.theme }),
  categories: old?.categories ?? {},
  values: old?.values ?? {},
  scenes: merged,
};

if (old) fs.copyFileSync(DATA, path.join(ROOT, "data", "project.previous.json"));
fs.writeFileSync(DATA, JSON.stringify(project, null, 1) + "\n");
const count = (k) => merged.reduce((n, s) => n + (s[k]?.length ?? 0), 0);
console.log(`✔ ${merged.length} scenes, ${count("hotspots")} hotspots, ${count("markers")} markers → data/project.json, images → public/projects/${name}/`);
