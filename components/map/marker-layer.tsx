"use client";

import Image from "next/image";
import type { Marker } from "@/lib/schema";
import { PANEL, cx } from "../ui";
import { useStage } from "./map-stage";

/** Length (px) of the line from a pin's label down to its point. */
const STEM = 18;

/** Fixed-size pins (schools, malls…) placed with `toScreen`, so they stay
 *  readable at any zoom. Clicking one opens its card or zooms into `link`. */
export function MarkerLayer({ markers, selectedId, onActivate }: {
  markers: Marker[];
  selectedId?: string | null;
  onActivate: (id: string) => void;
}) {
  const { toScreen } = useStage();
  return (
    <>
      {markers.map((m) => {
        const { x, y } = toScreen(m.point);
        return (
          <button
            key={m.id}
            type="button"
            data-id={m.id}
            onClick={(e) => onActivate(e.currentTarget.dataset.id!)}
            aria-pressed={m.id === selectedId}
            className={cx(PANEL, "absolute flex -translate-x-1/2 -translate-y-full items-center gap-1.5 rounded-full py-1 ps-1 pe-3 text-xs font-semibold whitespace-nowrap hover:bg-surface-muted", m.id === selectedId && "ring-2 ring-brand")}
            style={{ left: x, top: y - STEM }}
          >
            {/* Stem from the pill down to the exact point, with a dot on it. */}
            <span
              aria-hidden
              className="pointer-events-none absolute top-full left-1/2 w-0.5 -translate-x-1/2 bg-ink/80 ring-1 ring-surface/80"
              style={{ height: STEM }}
            >
              <span className="absolute bottom-0 left-1/2 size-2 -translate-x-1/2 translate-y-1/2 rounded-full bg-brand ring-2 ring-surface" />
            </span>
            {m.icon ? (
              <Image src={m.icon} alt="" width={22} height={22} sizes="22px" className="size-[22px] rounded-full" />
            ) : (
              <span className="size-[22px] rounded-full bg-brand" aria-hidden />
            )}
            {m.label}
          </button>
        );
      })}
    </>
  );
}

/** The hovered/focused hotspot's name, above its centroid. */
export function Tooltip({ text, at }: { text: string; at: [number, number] }) {
  const { toScreen } = useStage();
  const { x, y } = toScreen(at);
  return (
    <div
      role="tooltip"
      className="pointer-events-none absolute -translate-x-1/2 -translate-y-full rounded-control bg-ink/90 px-2.5 py-1 text-xs font-medium whitespace-nowrap text-white shadow-panel"
      style={{ left: x, top: y - 8 }}
    >
      {text}
    </div>
  );
}
