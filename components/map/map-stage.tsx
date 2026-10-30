"use client";

/**
 * Pan/zoom engine for one scene image. The image is fitted ("cover" or
 * "contain") into a base box; `children` are drawn in that box and scale with
 * the map (SVG hotspots), `chrome` is drawn unscaled on top (pins, tooltips —
 * they place themselves with `toScreen`). Drag / pinch / wheel / double-click /
 * keys (+ − 0, arrows) move it; `zoomTo` animates. A drag never fires a click.
 * `toScreen` converts image percent to a point in the stage.
 */
import Image from "next/image";
import {
  createContext, useCallback, useContext, useEffect, useImperativeHandle, useMemo, useRef, useState,
  type ReactNode, type Ref,
} from "react";
import type { Point } from "@/lib/schema";

const MAX_SCALE = 6;
const ZOOM_MS = 450;
/** Past this zoom the full-resolution image is layered on (progressive load). */
const HIRES_AT = 1.5;

interface View { scale: number; x: number; y: number }
export interface StageApi {
  view: View;
  /** The fitted image box at scale 1, px. */
  box: { w: number; h: number };
  ready: boolean;
  toScreen: (p: Point) => { x: number; y: number };
  zoomTo: (p: Point, scale: number) => Promise<void>;
  zoomBy: (factor: number) => void;
  reset: () => void;
}

const StageContext = createContext<StageApi | null>(null);
export function useStage() {
  const ctx = useContext(StageContext);
  if (!ctx) throw new Error("useStage outside <MapStage>");
  return ctx;
}

export function MapStage({ image, alt, size, fit = "cover", children, chrome, apiRef }: {
  image: string;
  alt: string;
  size?: [number, number];
  fit?: "cover" | "contain";
  children?: ReactNode;
  chrome?: ReactNode;
  /** The stage API for code outside the stage (e.g. zoom before navigating). */
  apiRef?: Ref<StageApi | null>;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [frame, setFrame] = useState({ w: 0, h: 0 });
  const [natural, setNatural] = useState<[number, number] | undefined>(size);
  const [rawView, setView] = useState<View>({ scale: 1, x: 0, y: 0 });
  const [animating, setAnimating] = useState(false);
  const [ready, setReady] = useState(false);
  const [hiresLoaded, setHiresLoaded] = useState(false);
  const [hiresWanted, setHiresWanted] = useState(false);
  if (!hiresWanted && rawView.scale > HIRES_AT) setHiresWanted(true);

  useEffect(() => {
    const el = ref.current!;
    const ro = new ResizeObserver(() => setFrame({ w: el.clientWidth, h: el.clientHeight }));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const [iw, ih] = natural ?? [16, 9];
  // "contain" on a phone would leave a strip of map: fill the screen instead (pan to see the rest).
  const fitScale = fit === "cover" || frame.w < 640 ? Math.max(frame.w / iw, frame.h / ih) : Math.min(frame.w / iw, frame.h / ih);
  const box = useMemo(() => ({ w: iw * fitScale || 0, h: ih * fitScale || 0 }), [iw, ih, fitScale]);

  /** Keeps the image covering the frame (or centred while smaller). */
  const clamp = useCallback((v: View): View => {
    const scale = Math.min(MAX_SCALE, Math.max(1, v.scale));
    const mx = Math.max(0, (box.w * scale - frame.w) / 2);
    const my = Math.max(0, (box.h * scale - frame.h) / 2);
    return { scale, x: Math.min(mx, Math.max(-mx, v.x)), y: Math.min(my, Math.max(-my, v.y)) };
  }, [box, frame]);
  // Clamped on read, so a resize (frame/box change) never leaves a gap.
  const view = useMemo(() => clamp(rawView), [clamp, rawView]);

  /** Zoom by `factor` keeping the frame point (fx, fy) still. */
  const zoomAt = useCallback((factor: number, fx: number, fy: number) =>
    setView((v) => {
      const scale = Math.min(MAX_SCALE, Math.max(1, v.scale * factor));
      const k = scale / v.scale;
      const cx = fx - frame.w / 2, cy = fy - frame.h / 2;
      return clamp({ scale, x: cx - (cx - v.x) * k, y: cy - (cy - v.y) * k });
    }), [clamp, frame]);

  const animate = useCallback((next: View) => new Promise<void>((done) => {
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    setAnimating(!reduce);
    setView(clamp(next));
    setTimeout(() => { setAnimating(false); done(); }, reduce ? 0 : ZOOM_MS);
  }), [clamp]);

  const api = useMemo<StageApi>(() => ({
    view, box, ready,
    toScreen: ([px, py]) => ({
      x: frame.w / 2 + view.x + ((px / 100) * box.w - box.w / 2) * view.scale,
      y: frame.h / 2 + view.y + ((py / 100) * box.h - box.h / 2) * view.scale,
    }),
    zoomTo: ([px, py], scale) =>
      animate({ scale, x: -((px / 100) * box.w - box.w / 2) * scale, y: -((py / 100) * box.h - box.h / 2) * scale }),
    zoomBy: (f) => zoomAt(f, frame.w / 2, frame.h / 2),
    reset: () => void animate({ scale: 1, x: 0, y: 0 }),
  }), [view, box, ready, frame, animate, zoomAt]);

  useImperativeHandle(apiRef, () => api, [api]);

  // Gestures: pointers (drag + pinch), wheel, keys.
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const moved = useRef(0);
  useEffect(() => {
    const el = ref.current!;
    const local = (e: { clientX: number; clientY: number }) => {
      const r = el.getBoundingClientRect();
      return { x: e.clientX - r.left, y: e.clientY - r.top };
    };
    const down = (e: PointerEvent) => {
      // The SVG placement box drags itself.
      if (e.button !== 0 || (e.target as Element).closest("[data-no-pan]")) return;
      pointers.current.set(e.pointerId, local(e));
      if (pointers.current.size === 1) moved.current = 0;
    };
    const move = (e: PointerEvent) => {
      const prev = pointers.current.get(e.pointerId);
      if (!prev) return;
      const p = local(e);
      const others = [...pointers.current].filter(([id]) => id !== e.pointerId).map(([, q]) => q);
      pointers.current.set(e.pointerId, p);
      moved.current += Math.hypot(p.x - prev.x, p.y - prev.y);
      if (moved.current > 4 && !el.hasPointerCapture(e.pointerId)) el.setPointerCapture(e.pointerId);
      if (others.length === 1) {
        const o = others[0];
        const factor = Math.hypot(p.x - o.x, p.y - o.y) / (Math.hypot(prev.x - o.x, prev.y - o.y) || 1);
        zoomAt(factor, (p.x + o.x) / 2, (p.y + o.y) / 2);
      } else setView((v) => clamp({ ...v, x: v.x + p.x - prev.x, y: v.y + p.y - prev.y }));
    };
    const up = (e: PointerEvent) => pointers.current.delete(e.pointerId);
    const click = (e: MouseEvent) => {
      if (moved.current > 4) { e.stopPropagation(); e.preventDefault(); }
    };
    const wheel = (e: WheelEvent) => {
      e.preventDefault();
      const p = local(e);
      zoomAt(Math.exp(-e.deltaY * (e.ctrlKey ? 0.01 : 0.0015)), p.x, p.y);
    };
    const dbl = (e: MouseEvent) => { const p = local(e); zoomAt(2, p.x, p.y); };
    const key = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      if (e.defaultPrevented || e.metaKey || e.ctrlKey || t.closest("input, textarea, select, [role=dialog]")) return;
      const pan = { ArrowLeft: [80, 0], ArrowRight: [-80, 0], ArrowUp: [0, 80], ArrowDown: [0, -80] }[e.key];
      if (e.key === "+" || e.key === "=") zoomAt(1.4, frame.w / 2, frame.h / 2);
      else if (e.key === "-") zoomAt(1 / 1.4, frame.w / 2, frame.h / 2);
      else if (e.key === "0") void animate({ scale: 1, x: 0, y: 0 });
      else if (pan && !t.closest(".hotspot")) setView((v) => clamp({ ...v, x: v.x + pan[0], y: v.y + pan[1] }));
      else return;
      e.preventDefault();
    };
    el.addEventListener("pointerdown", down);
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerup", up);
    el.addEventListener("pointercancel", up);
    el.addEventListener("click", click, true);
    el.addEventListener("wheel", wheel, { passive: false });
    el.addEventListener("dblclick", dbl);
    window.addEventListener("keydown", key);
    return () => {
      el.removeEventListener("pointerdown", down);
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerup", up);
      el.removeEventListener("pointercancel", up);
      el.removeEventListener("click", click, true);
      el.removeEventListener("wheel", wheel);
      el.removeEventListener("dblclick", dbl);
      window.removeEventListener("keydown", key);
    };
  }, [clamp, zoomAt, animate, frame]);

  // `sizes` = the box's share of the viewport: the browser fetches just that width.
  const vw = typeof window === "undefined" || !box.w ? 100 : Math.ceil((box.w / window.innerWidth) * 100);
  return (
    <StageContext.Provider value={api}>
      <div ref={ref} className="relative h-full w-full touch-none overflow-hidden bg-stage select-none" style={{ cursor: "grab" }}>
        <div
          className="absolute"
          style={{
            left: (frame.w - box.w) / 2, top: (frame.h - box.h) / 2, width: box.w, height: box.h,
            transform: `translate(${view.x}px, ${view.y}px) scale(${view.scale})`,
            transition: animating ? `transform ${ZOOM_MS}ms cubic-bezier(.4,0,.2,1)` : undefined,
            opacity: ready ? 1 : 0,
          }}
        >
          {box.w > 0 && <Image
            src={image} alt={alt} fill priority sizes={`${vw}vw`} draggable={false}
            className="pointer-events-none object-fill transition-opacity duration-300"
            onLoad={(e) => {
              if (!size) setNatural([e.currentTarget.naturalWidth, e.currentTarget.naturalHeight]);
              setReady(true);
            }}
          />}
          {hiresWanted && (
            <Image
              src={image} alt="" fill sizes={`${Math.min(400, vw * 3)}vw`} draggable={false}
              className="pointer-events-none object-fill transition-opacity duration-500"
              style={{ opacity: hiresLoaded ? 1 : 0 }}
              onLoad={() => setHiresLoaded(true)}
            />
          )}
          {ready && children}
        </div>
        {ready && chrome}
        {!ready && <div className="absolute inset-0 animate-pulse bg-surface-muted" aria-hidden />}
      </div>
    </StageContext.Provider>
  );
}
