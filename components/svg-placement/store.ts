"use client";

import { useSyncExternalStore } from "react";

/** An authoring aid: in `next dev`, or a build with NEXT_PUBLIC_SVG_PLACEMENT=1
 *  (inlined, so other builds never load the tool). */
export const PLACEMENT_AVAILABLE =
  process.env.NODE_ENV === "development" || process.env.NEXT_PUBLIC_SVG_PLACEMENT === "1";

/** Where the SVG sits over the image, in percent of the image. */
export interface PlacementBox { left: number; top: number; width: number; height: number }

export const DEFAULT_BOX: PlacementBox = { left: 10, top: 10, width: 80, height: 80 };

/** Shared by the layout switch and every scene; per scene id, kept in
 *  localStorage so a box survives reloads and navigation. */
interface PlacementState {
  enabled: boolean;
  boxes: Record<string, PlacementBox>;
  /** SVG markup loaded for a scene. */
  svgs: Record<string, string>;
}

const STORAGE_KEY = "svg-placement";
const INITIAL: PlacementState = { enabled: false, boxes: {}, svgs: {} };
let state: PlacementState | null = null;
let timer: ReturnType<typeof setTimeout> | undefined;
const listeners = new Set<() => void>();

function read(): PlacementState {
  if (state) return state;
  try {
    state = { ...INITIAL, ...JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}") };
  } catch {
    state = INITIAL; // storage blocked or corrupt
  }
  return state!;
}

function write(next: PlacementState) {
  state = next;
  listeners.forEach((l) => l());
  // Debounced: a drag writes on every pointermove.
  clearTimeout(timer);
  timer = setTimeout(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // quota / blocked: kept for this session only
    }
  }, 300);
}

const subscribe = (l: () => void) => (listeners.add(l), () => void listeners.delete(l));
const omit = <T,>(r: Record<string, T>, k: string) => Object.fromEntries(Object.entries(r).filter(([key]) => key !== k));

export const usePlacement = () => useSyncExternalStore(subscribe, read, () => INITIAL);

export const placement = {
  toggle: () => write({ ...read(), enabled: !read().enabled }),
  setBox: (scene: string, box: PlacementBox) => write({ ...read(), boxes: { ...read().boxes, [scene]: box } }),
  resetBox: (scene: string) => write({ ...read(), boxes: omit(read().boxes, scene) }),
  loadSvg: (scene: string, svg: string) => write({ ...read(), svgs: { ...read().svgs, [scene]: svg }, boxes: omit(read().boxes, scene) }),
  unloadSvg: (scene: string) => write({ ...read(), svgs: omit(read().svgs, scene), boxes: omit(read().boxes, scene) }),
};
