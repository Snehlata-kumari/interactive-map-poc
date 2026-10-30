"use client";

import type { KeyboardEvent, MouseEvent } from "react";
import type { Hotspot } from "@/lib/schema";

export interface DrawnHotspot extends Hotspot {
  color: string;
  /** Filtered out: drawn faint and not focusable. */
  dimmed?: boolean;
}

/** Clickable SVG polygons over the image (viewBox = image percentages, so
 *  they scale with the map). Each is a focusable button named by its label;
 *  hover/focus highlights it and reports it for the tooltip. */
export function HotspotLayer({ hotspots, style = "fill", activeId, selectedId, onActivate, onHover }: {
  hotspots: DrawnHotspot[];
  style?: "fill" | "outline" | "hidden";
  activeId?: string | null;
  selectedId?: string | null;
  onActivate: (id: string) => void;
  onHover: (id: string | null) => void;
}) {
  const idOf = (e: { currentTarget: Element }) => e.currentTarget.getAttribute("data-id")!;
  const click = (e: MouseEvent<SVGPolygonElement>) => onActivate(idOf(e));
  const key = (e: KeyboardEvent<SVGPolygonElement>) => {
    if (e.key !== "Enter" && e.key !== " ") return;
    e.preventDefault();
    onActivate(idOf(e));
  };
  const enter = (e: { currentTarget: Element }) => onHover(idOf(e));
  const leave = () => onHover(null);

  return (
    <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 size-full overflow-visible">
      {hotspots.map((h) => {
        const lit = h.id === activeId || h.id === selectedId;
        const rest = style === "fill" ? 0.45 : 0;
        return (
          <polygon
            key={h.id}
            data-id={h.id}
            points={h.points.map((p) => p.join(",")).join(" ")}
            role="button"
            tabIndex={h.dimmed ? -1 : 0}
            aria-label={h.label ?? h.id}
            aria-pressed={h.id === selectedId}
            className="hotspot cursor-pointer transition-[fill-opacity,stroke-opacity] duration-150"
            vectorEffect="non-scaling-stroke"
            fill={h.color}
            fillOpacity={h.dimmed ? 0.08 : lit ? 0.7 : rest}
            stroke={style === "fill" ? h.color : "#fff"}
            strokeOpacity={h.dimmed ? 0.2 : lit || style === "outline" ? 1 : style === "fill" ? 0.9 : 0}
            strokeWidth={lit ? 2.5 : 1.25}
            style={{ pointerEvents: h.dimmed ? "none" : "auto" }}
            onClick={click}
            onKeyDown={key}
            onPointerEnter={enter}
            onPointerLeave={leave}
            onFocus={enter}
            onBlur={leave}
          />
        );
      })}
    </svg>
  );
}
