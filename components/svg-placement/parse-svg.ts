import type { Point } from "@/lib/schema";

/** An SVG file's shapes in its own coordinates (its viewBox). */
export interface PlacementSvg {
  view: [number, number, number, number];
  /** Each shape's `d` (for drawing) and on-curve vertices (for points). */
  shapes: { d: string; vertices: Point[] }[];
}

const PATH_PARAMS: Record<string, number> = { m: 2, l: 2, h: 1, v: 1, c: 6, s: 4, q: 4, t: 2, a: 7 };
const round = (n: number) => Math.round(n * 1000) / 1000;
const NUMBER = /[-+]?(?:\d*\.\d+|\d+\.?)(?:e[-+]?\d+)?/gi;

/** A path's vertices: every command's end point (curves reduced to their
 *  end points — fine for straight-edged plots). */
function pathVertices(d: string): Point[] {
  const tokens = d.match(/[a-df-z]|[-+]?(?:\d*\.\d+|\d+\.?)(?:e[-+]?\d+)?/gi) ?? [];
  const out: Point[] = [];
  let [x, y, sx, sy, cmd, i] = [0, 0, 0, 0, "", 0];
  while (i < tokens.length) {
    if (/[a-z]/i.test(tokens[i])) {
      cmd = tokens[i++];
      if (cmd.toLowerCase() === "z") [x, y] = [sx, sy];
      continue;
    }
    const lower = cmd.toLowerCase();
    const n = PATH_PARAMS[lower];
    if (!n) { i++; continue; }
    const args = tokens.slice(i, i + n).map(Number);
    if (args.length < n || args.some(Number.isNaN)) break;
    i += n;
    const rel = cmd === lower;
    if (lower === "h") x = rel ? x + args[0] : args[0];
    else if (lower === "v") y = rel ? y + args[0] : args[0];
    else [x, y] = [rel ? x + args[n - 2] : args[n - 2], rel ? y + args[n - 1] : args[n - 1]];
    if (lower === "m") {
      [sx, sy] = [x, y];
      cmd = rel ? "l" : "L"; // extra pairs after a moveto are linetos
    }
    out.push([round(x), round(y)]);
  }
  const [first, last] = [out[0], out.at(-1)];
  if (out.length > 1 && first[0] === last![0] && first[1] === last![1]) out.pop();
  return out;
}

const num = (el: Element, name: string) => parseFloat(el.getAttribute(name) ?? "0") || 0;

/** Every path / polygon / polyline / rect of an SVG file, or null when it has
 *  none. Element `transform`s are ignored — flatten them before exporting. */
export function parseSvg(markup: string): PlacementSvg | null {
  const doc = new DOMParser().parseFromString(markup, "image/svg+xml");
  const svg = doc.querySelector("svg");
  if (!svg || doc.querySelector("parsererror")) return null;
  const vb = (svg.getAttribute("viewBox") ?? "").trim().split(/[\s,]+/).map(Number);
  const view = (vb.length === 4 && vb.every(Number.isFinite) ? vb : [0, 0, num(svg, "width"), num(svg, "height")]) as PlacementSvg["view"];
  if (!(view[2] > 0 && view[3] > 0)) return null;

  const shapes: PlacementSvg["shapes"] = [];
  for (const el of svg.querySelectorAll("path, polygon, polyline, rect")) {
    if (el.closest("defs, clipPath, mask, symbol, pattern")) continue;
    const tag = el.tagName.toLowerCase();
    let vertices: Point[];
    if (tag === "path") vertices = pathVertices(el.getAttribute("d") ?? "");
    else if (tag === "rect") {
      const [x, y, w, h] = [num(el, "x"), num(el, "y"), num(el, "width"), num(el, "height")];
      vertices = [[x, y], [x + w, y], [x + w, y + h], [x, y + h]];
    } else {
      const n = (el.getAttribute("points")?.match(NUMBER) ?? []).map(Number);
      vertices = Array.from({ length: Math.floor(n.length / 2) }, (_, k) => [n[2 * k], n[2 * k + 1]] as Point);
    }
    if (vertices.length < 3) continue; // a hotspot needs an area
    const d = tag === "path" ? el.getAttribute("d")! : `M${vertices.map((p) => p.join(" ")).join("L")}Z`;
    shapes.push({ d, vertices });
  }
  return shapes.length ? { view, shapes } : null;
}
