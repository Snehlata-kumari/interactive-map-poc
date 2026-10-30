"use client";

import { useEffect } from "react";
import { PANEL, cx } from "../ui";
import { PLACEMENT_AVAILABLE, placement, usePlacement } from "./store";

/** The SVG placement tool's on/off switch, mounted once in the root layout
 *  (also Alt+Shift+P). Renders nothing outside dev / NEXT_PUBLIC_SVG_PLACEMENT=1. */
export function PlacementSwitch() {
  const { enabled } = usePlacement();

  useEffect(() => {
    if (!PLACEMENT_AVAILABLE) return;
    const onKey = (e: KeyboardEvent) => {
      // e.code: Alt/Option rewrites e.key on macOS.
      if (e.altKey && e.shiftKey && !e.ctrlKey && !e.metaKey && e.code === "KeyP") {
        e.preventDefault();
        placement.toggle();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  if (!PLACEMENT_AVAILABLE) return null;
  return (
    <button
      type="button"
      role="switch"
      aria-checked={enabled}
      onClick={placement.toggle}
      title="Toggle SVG placement (Alt+Shift+P)"
      className={cx(PANEL, "fixed bottom-4 left-18 z-40 flex h-9 items-center gap-2 rounded-full px-3 text-xs font-medium hover:bg-surface-muted")}
    >
      <span aria-hidden className={cx("relative h-4 w-7 rounded-full transition-colors", enabled ? "bg-yellow-400" : "bg-line")}>
        <span className={cx("absolute top-0.5 size-3 rounded-full bg-white shadow transition-[left]", enabled ? "left-3.5" : "left-0.5")} />
      </span>
      Align SVG
    </button>
  );
}
