"use client";

/**
 * SVG placement tool (switch in the root layout): load an SVG layer — plots
 * traced in Figma / Illustrator / Inkscape — over the scene image, drag the
 * yellow box to move it and a corner to resize (Alt/Option: from the centre),
 * then "Copy hotspots" gives every shape as project.json hotspots in image
 * percentages. Box and SVG are kept per scene (./store.ts).
 */
import { useRef, useState, type ChangeEvent, type PointerEvent } from "react";
import type { Point } from "@/lib/schema";
import { useStage } from "../map/map-stage";
import { Button, PANEL, cx } from "../ui";
import { parseSvg, type PlacementSvg } from "./parse-svg";
import { DEFAULT_BOX, placement, usePlacement, type PlacementBox } from "./store";

const MIN_SIZE = 2;
type Mode = "move" | "tl" | "tr" | "bl" | "br";
const HANDLES: { mode: Mode; at: string; cursor: string }[] = [
  { mode: "tl", at: "-top-1.5 -left-1.5", cursor: "cursor-nwse-resize" },
  { mode: "tr", at: "-top-1.5 -right-1.5", cursor: "cursor-nesw-resize" },
  { mode: "bl", at: "-bottom-1.5 -left-1.5", cursor: "cursor-nesw-resize" },
  { mode: "br", at: "-bottom-1.5 -right-1.5", cursor: "cursor-nwse-resize" },
];

const parsed = new Map<string, PlacementSvg | null>();
/** The scene's loaded SVG (parsed once per markup) and its box. */
function useScenePlacement(sceneId: string) {
  const { boxes, svgs } = usePlacement();
  const markup = svgs[sceneId];
  if (markup !== undefined && !parsed.has(markup)) parsed.set(markup, parseSvg(markup));
  return { markup, svg: markup === undefined ? null : parsed.get(markup) ?? null, box: boxes[sceneId] ?? DEFAULT_BOX };
}

/** The box's shapes as image percentages. */
function toPercent(svg: PlacementSvg, box: PlacementBox) {
  const [vx, vy, vw, vh] = svg.view;
  const r = (v: number) => Math.round(v * 100) / 100;
  return svg.shapes.map((s) => s.vertices.map(([x, y]): Point => [r(box.left + ((x - vx) / vw) * box.width), r(box.top + ((y - vy) / vh) * box.height)]));
}

/** Corner `mode` dragged by (dx, dy) percent: its two edges move (Alt: both, about the centre). */
function resize(b: PlacementBox, mode: Mode, dx: number, dy: number, fromCentre: boolean): PlacementBox {
  const [left, top] = [mode === "tl" || mode === "bl", mode === "tl" || mode === "tr"];
  if (fromCentre) {
    const width = Math.max(MIN_SIZE, b.width + 2 * (left ? -dx : dx));
    const height = Math.max(MIN_SIZE, b.height + 2 * (top ? -dy : dy));
    return { left: b.left + (b.width - width) / 2, top: b.top + (b.height - height) / 2, width, height };
  }
  const width = Math.max(MIN_SIZE, b.width + (left ? -dx : dx));
  const height = Math.max(MIN_SIZE, b.height + (top ? -dy : dy));
  return { left: left ? b.left + b.width - width : b.left, top: top ? b.top + b.height - height : b.top, width, height };
}

/** The draggable SVG — inside the stage's image box, so it pans/zooms with the map. */
export function PlacementOverlay({ sceneId }: { sceneId: string }) {
  const { view, box: image } = useStage();
  const { svg, box } = useScenePlacement(sceneId);
  const drag = useRef<{ mode: Mode; x: number; y: number; start: PlacementBox } | null>(null);
  if (!svg) return null;

  const begin = (e: PointerEvent<HTMLElement>) => {
    e.stopPropagation();
    e.currentTarget.setPointerCapture(e.pointerId);
    drag.current = { mode: e.currentTarget.dataset.mode as Mode, x: e.clientX, y: e.clientY, start: box };
  };
  const move = (e: PointerEvent<HTMLElement>) => {
    const d = drag.current;
    if (!d) return;
    const dx = ((e.clientX - d.x) / view.scale / image.w) * 100;
    const dy = ((e.clientY - d.y) / view.scale / image.h) * 100;
    placement.setBox(sceneId, d.mode === "move" ? { ...d.start, left: d.start.left + dx, top: d.start.top + dy } : resize(d.start, d.mode, dx, dy, e.altKey));
  };
  const end = () => (drag.current = null);
  const handlers = { onPointerDown: begin, onPointerMove: move, onPointerUp: end, onPointerCancel: end };

  return (
    <div
      data-no-pan data-mode="move" {...handlers}
      className="absolute cursor-move touch-none border-2 border-yellow-300"
      style={{ left: `${box.left}%`, top: `${box.top}%`, width: `${box.width}%`, height: `${box.height}%` }}
    >
      <svg viewBox={svg.view.join(" ")} preserveAspectRatio="none" className="size-full overflow-visible">
        {svg.shapes.map((s, i) => (
          <path key={i} d={s.d} fill="#FFDF41" fillOpacity={0.5} stroke="#9B8C3D" strokeWidth={1} vectorEffect="non-scaling-stroke" />
        ))}
      </svg>
      {HANDLES.map((h) => (
        <div key={h.mode} data-no-pan data-mode={h.mode} {...handlers} className={cx("absolute size-3 touch-none rounded-sm border border-white bg-yellow-400", h.at, h.cursor)} />
      ))}
    </div>
  );
}

/** Load / unload, readout and copy — fixed-size, over the map. */
export function PlacementPanel({ sceneId }: { sceneId: string }) {
  const { markup, svg, box } = useScenePlacement(sceneId);
  const [copied, setCopied] = useState<string | null>(null);
  const file = useRef<HTMLInputElement>(null);

  const copy = async (what: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(what);
      setTimeout(() => setCopied(null), 1500);
    } catch {
      // clipboard blocked: the values are in the panel to copy by hand
    }
  };
  const onFile = async (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.currentTarget.files?.[0];
    e.currentTarget.value = ""; // picking the same file again still fires
    if (f) placement.loadSvg(sceneId, await f.text());
  };
  const r = (v: number) => Math.round(v * 100) / 100;
  const boxText = JSON.stringify({ left: r(box.left), top: r(box.top), width: r(box.width), height: r(box.height) });
  const hotspots = svg
    ? "[\n" + toPercent(svg, box).map((points, i) => `  ${JSON.stringify({ id: `${sceneId}-${String(i + 1).padStart(3, "0")}`, points })}`).join(",\n") + "\n]"
    : "";

  return (
    <div data-no-pan role="region" aria-label="SVG placement" className={cx(PANEL, "absolute end-4 top-20 z-30 w-72 space-y-2 p-3 text-xs")}>
      <p className="font-semibold">Align SVG · {sceneId}</p>
      <p className="text-ink-muted">
        {svg
          ? `${svg.shapes.length} shapes. Drag the yellow box to move · a corner to resize · hold Alt/Option to resize from the centre.`
          : markup !== undefined ? "Couldn’t read shapes from that SVG — load another." : "Load an SVG layer to align it over this image."}
      </p>
      {svg && <code className="block rounded-control bg-surface-muted p-2 font-mono text-[11px] break-all">{boxText}</code>}
      <div className="flex flex-wrap gap-2">
        {svg && (
          <>
            <Button variant="primary" onClick={() => copy("hotspots", hotspots)}>{copied === "hotspots" ? "Copied" : "Copy hotspots"}</Button>
            <Button variant="ghost" onClick={() => copy("box", boxText)}>{copied === "box" ? "Copied" : "Copy box"}</Button>
            <Button variant="ghost" onClick={() => placement.resetBox(sceneId)}>Reset</Button>
          </>
        )}
        <Button variant="ghost" onClick={() => file.current?.click()}>Load SVG…</Button>
        {markup !== undefined && <Button variant="ghost" onClick={() => placement.unloadSvg(sceneId)}>Unload</Button>}
        <input ref={file} type="file" accept=".svg,image/svg+xml" className="hidden" onChange={onFile} />
      </div>
    </div>
  );
}
