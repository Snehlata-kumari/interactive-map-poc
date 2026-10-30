"use client";

/**
 * One scene: its image on the pan/zoom stage, hotspots (+ live units),
 * markers, filters, legend and the details card. Click: card when there are
 * details → else zoom into `link` → else open `href` → else zoom closer.
 */
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useCallback, useMemo, useRef, useState } from "react";
import { EMPTY_FILTERS, matches, type FilterState } from "@/lib/filters";
import { centroid, hotspotColor, scenePath, withUnits } from "@/lib/project";
import type { Hotspot, Marker, Point, Scene } from "@/lib/schema";
import { HotspotLayer } from "../map/hotspot-layer";
import { MapStage, type StageApi } from "../map/map-stage";
import { MarkerLayer, Tooltip } from "../map/marker-layer";
import { ZoomControls } from "../map/zoom-controls";
import { useProject } from "../project-provider";
import { PLACEMENT_AVAILABLE, usePlacement } from "../svg-placement/store";
import { Button, IconButton, PANEL, cx } from "../ui";
import { CloseIcon, FilterIcon } from "../ui/icons";
import { FilterPanel, Legend } from "./filter-panel";
import { InfoCard, type CardContent } from "./info-card";
import { TopBar } from "./top-bar";

type Target = { link?: string; href?: string; at: Point };

// The SVG placement tool loads only while its switch is on.
const PlacementOverlay = dynamic(() => import("../svg-placement/svg-placement").then((m) => m.PlacementOverlay), { ssr: false });
const PlacementPanel = dynamic(() => import("../svg-placement/svg-placement").then((m) => m.PlacementPanel), { ssr: false });

export function SceneView({ scene }: { scene: Scene }) {
  const { project, units } = useProject();
  const router = useRouter();
  const stage = useRef<StageApi | null>(null);
  const [filters, setFilters] = useState<FilterState>(EMPTY_FILTERS);
  const [hovered, setHovered] = useState<string | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const placing = usePlacement().enabled && PLACEMENT_AVAILABLE;

  const hotspots = useMemo(() => withUnits(scene.hotspots ?? [], units, scene.id), [scene, units]);
  const markers = scene.markers ?? [];
  const drawn = useMemo(
    () => hotspots.map((h) => ({ ...h, color: hotspotColor(project, h, scene.colorBy), dimmed: !matches(h, filters) })),
    [hotspots, project, scene.colorBy, filters],
  );
  const shown = drawn.filter((h) => !h.dimmed).length;
  const hasFilters = !!(scene.filters?.categories?.length || scene.filters?.ranges?.length || scene.filters?.search);

  /** Zoom toward the target, then navigate (or just zoom closer). */
  const follow = useCallback(async ({ link, href, at }: Target) => {
    if (link) {
      await stage.current?.zoomTo(at, 3);
      router.push(scenePath(project, link));
    } else if (href) {
      if (/^https?:/.test(href)) window.open(href, "_blank", "noopener");
      else router.push(href);
    } else void stage.current?.zoomTo(at, Math.max(2.5, (stage.current?.view.scale ?? 1) * 1.6));
  }, [project, router]);

  const find = (id: string): (Hotspot | Marker) | undefined => hotspots.find((h) => h.id === id) ?? markers.find((m) => m.id === id);
  const at = (x: Hotspot | Marker): Point => ("points" in x ? centroid(x.points) : x.point);

  const activate = (id: string) => {
    const x = find(id);
    if (!x) return;
    const hasData = "points" in x && (Object.keys(x.categories ?? {}).length || Object.keys(x.values ?? {}).length);
    if (x.info || hasData) setSelected(id);
    else void follow({ link: x.link, href: "href" in x ? x.href : undefined, at: at(x) });
  };

  const closeCard = useCallback(() => setSelected(null), []);
  const picked = selected ? find(selected) : undefined;
  const card: CardContent | null = picked
    ? {
        title: "label" in picked && picked.label ? picked.label : picked.id,
        info: picked.info,
        categories: "categories" in picked ? picked.categories : undefined,
        values: "values" in picked ? picked.values : undefined,
        action: picked.link ? "Explore" : "href" in picked && picked.href ? "Open" : undefined,
      }
    : null;
  const followPicked = () => {
    if (picked) void follow({ link: picked.link, href: "href" in picked ? picked.href : undefined, at: at(picked) });
  };
  const tip = hovered ? hotspots.find((h) => h.id === hovered) : undefined;

  const filterPanel = (
    <FilterPanel project={project} scene={scene} hotspots={hotspots} value={filters} onChange={setFilters} shown={shown} />
  );

  return (
    <main className="flex h-dvh overflow-hidden">
      <h1 className="sr-only">{project.name} — {scene.title}</h1>
      {hasFilters && <aside className="hidden w-80 shrink-0 overflow-y-auto border-e border-line bg-surface pt-16 md:block" aria-label="Filters">{filterPanel}</aside>}
      <div className="relative min-w-0 flex-1">
        <MapStage
          apiRef={stage} image={scene.image} alt={scene.title} size={scene.size} fit={scene.fit}
          chrome={
            <>
              <MarkerLayer markers={markers} selectedId={selected} onActivate={activate} />
              {tip && <Tooltip text={tip.label ?? tip.id} at={centroid(tip.points)} />}
              <ZoomControls />
              {scene.colorBy && <div className="absolute inset-x-0 bottom-4 flex justify-center px-16"><Legend project={project} categoryId={scene.colorBy} /></div>}
            </>
          }
        >
          <HotspotLayer hotspots={drawn} style={scene.hotspotStyle} activeId={hovered} selectedId={selected} onActivate={activate} onHover={setHovered} />
          {placing && <PlacementOverlay sceneId={scene.id} />}
        </MapStage>

        <TopBar project={project} scene={scene} />
        <div className="absolute end-4 top-4 z-10 flex gap-2">
          {hasFilters && <Button className="md:hidden" onClick={() => setFiltersOpen(true)}><FilterIcon /> Filters</Button>}
        </div>
        {filtersOpen && (
          <div role="dialog" aria-label="Filters" className={cx(PANEL, "absolute inset-x-2 bottom-2 z-30 max-h-[75dvh] overflow-y-auto md:hidden")}>
            <div className="flex justify-end p-2 pb-0"><IconButton label="Close filters" variant="ghost" onClick={() => setFiltersOpen(false)}><CloseIcon /></IconButton></div>
            {filterPanel}
          </div>
        )}
        {placing && <PlacementPanel sceneId={scene.id} />}
        {card && !placing && <InfoCard project={project} content={card} onClose={closeCard} onAction={followPicked} />}
      </div>
    </main>
  );
}
