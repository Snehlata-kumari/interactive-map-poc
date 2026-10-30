/**
 * The data schema: one project = a tree of scenes (data/project.json).
 * Every point is [x, y] in PERCENT (0–100) of the scene image, never pixels,
 * so overlays line up at any screen size. Geometry lives only in
 * project.json; an API may override text/images/icons/data (ContentPatch).
 */

export type Point = [number, number];

export interface Project {
  name: string;
  /** Scene shown at `/`. */
  rootScene: string;
  /** Overrides the design-system brand colour (`--color-brand`). */
  theme?: { brand?: string };
  /** Filterable dimensions (status, type…); hotspots pick one value each. */
  categories?: Record<string, Category>;
  /** Numeric fields (area, price…): card rows and range filters. */
  values?: Record<string, ValueField>;
  scenes: Scene[];
}

export interface Category {
  label: string;
  options: { value: string; label: string; color?: string }[];
}

export interface ValueField {
  label: string;
  unit?: string;
}

export interface Scene {
  /** Unique; also its URL segment (`/masterplan/phase-1`). */
  id: string;
  /** The scene this one is opened from (breadcrumb, Back). Omit for the root. */
  parent?: string;
  title: string;
  image: string;
  /** "cover" (default) fills the screen, cropping; "contain" shows it all
   *  (plot grids, floor plans). */
  fit?: "cover" | "contain";
  /** Source image size in px; lets the map lay out before the image loads. */
  size?: [number, number];
  /** "fill" coloured plots, "outline" zones, "hidden" until hovered. */
  hotspotStyle?: "fill" | "outline" | "hidden";
  /** Category id the hotspots are coloured by (and shown as a legend). */
  colorBy?: string;
  filters?: { categories?: string[]; ranges?: string[]; search?: boolean };
  hotspots?: Hotspot[];
  markers?: Marker[];
}

export interface Hotspot {
  /** Unique in its scene; API content and live units match on it. */
  id: string;
  points: Point[];
  /** Accessible name and tooltip. Default: the id. */
  label?: string;
  /** Scene id to zoom into. */
  link?: string;
  /** Any other URL (http opens in a new tab). */
  href?: string;
  categories?: Record<string, string>;
  values?: Record<string, number>;
  /** A details card opened on click (its button then follows link/href). */
  info?: Info;
}

export interface Marker {
  id: string;
  point: Point;
  label: string;
  /** Image URL shown in the pin. */
  icon?: string;
  link?: string;
  info?: Info;
}

export interface Info {
  title?: string;
  subtitle?: string;
  image?: string;
  description?: string;
  rows?: { label: string; value: string }[];
  cta?: { label: string; href: string };
}

/** What the content API may change — never geometry. Keys are scene ids,
 *  and `sceneId/hotspotId` / `sceneId/markerId`. */
export interface ContentPatch {
  project?: { name?: string };
  scenes?: Record<string, { title?: string; image?: string }>;
  hotspots?: Record<string, Partial<Pick<Hotspot, "label" | "categories" | "values" | "info" | "href">>>;
  markers?: Record<string, Partial<Pick<Marker, "label" | "icon" | "info">>>;
}

/** Live unit data (status, price…), matched to a hotspot by id. */
export interface Unit {
  id: string;
  scene?: string;
  categories?: Record<string, string>;
  values?: Record<string, number>;
}
