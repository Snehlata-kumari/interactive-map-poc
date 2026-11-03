# Interactive Map Platform

A reusable "zoom into the map" viewer for real-estate sales: city → masterplan →
phase → plot → floor plan. A new project is **new images + a new
`data/project.json`**. You don't need new code or new pages.

> **Not a developer?** Use [HANDOVER.md](HANDOVER.md): copy-paste prompts for
> Claude Code that cover every task, from setup to swapping in a new project.

```bash
npm install
npm run dev          # http://localhost:3000
npm run build && npm start
npm run lint         # eslint
npm run type-check   # tsc
npm run import-editor -- ~/Downloads/new-project.json   # shapes + images from the SVG editor
```

## How it fits together

```
data/project.json ──┐                       ┌─ /api/project  (BFF: project.json + content API)
   (geometry +      ├─ CONTENT_SOURCE=local │
    default data)   │  or =api ─────────────┼─ /api/units    (BFF: live status/price)
                    ▼                       │
            ProjectProvider ──► SceneView ──► MapStage (pan/zoom) + HotspotLayer (SVG)
                                         ├─► MarkerLayer, FilterPanel, InfoCard, TopBar
                                         └─► SVG placement tool ("Align SVG" switch)
```

- **Shapes always come from `data/project.json`.** Points are `[x, y]` percentages
  (0–100) of the scene image, so they fit any screen.
- **Text, images, icons and unit data can come from an API** (see *Content from an API*).
- Every scene's URL is its parent chain: `/`, `/masterplan`, `/masterplan/phase-1`.

The shipped project ("New Project": World → India → Masterplan → Zone 1 →
Building 1 → floors) is the SVG editor export of `new-project.json`, with
statuses, prices and card details from its Excel sheet. Its images are in
`public/projects/new-project/`.

## `data/project.json`

Types with comments: `lib/schema.ts`. The shape:

```jsonc
{
  "name": "New Project",
  "rootScene": "overview",                   // the scene at "/"
  "theme": { "brand": "#0f766e" },           // optional brand colour
  "categories": {                            // filters + colours
    "status": { "label": "Status", "options": [
      { "value": "available", "label": "Available", "color": "#16a34a" } ] }
  },
  "values": { "area": { "label": "Plot area", "unit": "m²" } },   // numbers: card rows + range filters
  "scenes": [{
    "id": "zone-1", "parent": "masterplan", "title": "Zone 1",
    "image": "/projects/new-project/zone-1.webp", "size": [3465, 2131],
    "fit": "contain",                        // "cover" (default) | "contain"
    "hotspotStyle": "fill",                  // "fill" | "outline" | "hidden"
    "colorBy": "status",                     // colour + legend
    "filters": { "categories": ["status"], "ranges": ["area"], "search": true },
    "hotspots": [{
      "id": "A-002", "label": "Building 1",
      "points": [[14.55, 83.86], [15.47, 88.35], [20.1, 87.2], [19.3, 82.9]],
      "categories": { "status": "available" }, "values": { "area": 900 },
      "link": "building-1",                  // zoom into a scene, or "href": "https://…"
      "info": { "title": "…", "image": "…", "description": "…",
                "rows": [{ "label": "View", "value": "Park" }],
                "cta": { "label": "Brochure", "href": "https://…" } }
    }],
    "markers": [{ "id": "school", "label": "School", "point": [40, 40],
                  "icon": "/projects/x/school.png", "info": { "description": "…" } }]
  }]
}
```

**What a click does:** it opens the details card if the hotspot has `info`,
categories or values. Otherwise it zooms into `link`, or opens `href`, or just
zooms closer. The card's **Explore** button follows `link` or `href`.

In dev, mistakes in the file (a bad parent, a link to a missing scene, a point
outside 0–100) are listed in the browser console.

## Making a new project

**From the SVG editor (recommended).** Draw the scenes and shapes in the editor
(svg-footprint-generator). Choose **JSON ▾ → Download backup (project +
images)**, then run:

```bash
npm run import-editor -- ~/Downloads/<project>.json
```

- **Images:** saved as WebP (at most 4000 px wide) in `public/projects/<project>/`.
- **Scenes:** each one's parent is the scene whose shape links to it, and its id
  and title come from that shape's label.
- **Shapes:** polygons become hotspots and pins become markers.
- **Plot details:** editor `details` keyed by a hotspot id become its
  status, typology, area and GFA.

**Re-importing keeps your data.** For every scene, hotspot and marker with the
same id, only the geometry (points, image, size) is replaced. Titles,
categories, values, filters and cards stay. The old file is saved as
`data/project.previous.json`.

**Starting empty.** If `data/project.json` is missing, `npm run dev`, `build`
and `type-check` write an empty project first, and the site shows "No map data
yet" instead of breaking. If `rootScene` isn't one of the scenes, the site says
so. Importing into an empty project counts as a clean import. If you delete the
file while `npm run dev` is running, restart it.

**By hand.** Put the images in `public/<project>/` (WebP, around 4000 px wide)
and write `data/project.json`. Points are percentages of the image:
`x / imageWidth × 100`, `y / imageHeight × 100`.

### Aligning an SVG layer (the "Align SVG" switch)

Use this for plots traced in Figma, Illustrator or Inkscape, at any size or
position. It works whatever coordinate system the SVG was drawn in.

1. Turn on **Align SVG**, the switch at the bottom left (or press Alt+Shift+P).
   It's there in `npm run dev`; a production build needs
   `NEXT_PUBLIC_SVG_PLACEMENT=1`.
2. Open the scene, then use **Load SVG…** in the panel. Every path, polygon and
   rect becomes a yellow shape inside a box.
3. Drag the box to move it, and drag a corner to resize it (hold Alt/Option to
   resize from the centre). Pan and zoom the map to check the fit closely.
4. **Copy hotspots** gives the shapes as `[{ "id": "zone-1-001", "points": [...] }, …]`.
   Paste them into the scene's `hotspots`, then rename the ids and add labels and data.
   **Copy box** gives the box itself. **Reset** puts the box back; **Unload**
   removes the SVG.

The box and the SVG are remembered per scene in your browser. Flatten element
`transform`s before exporting ("Object to path"), and note that curves are
reduced to their end points.

## Content from an API (`NEXT_PUBLIC_CONTENT_SOURCE=api`)

Copy `.env.example` to `.env.local`. With `api`, the browser asks the BFF
(Backend for Frontend: the site's own `app/api/*` endpoints). The BFF calls the
upstream APIs, converts their responses, caches them, and keeps serving the last
good copy if they fail:

| Endpoint | Upstream (server-only env) | Without a URL | Cache |
|---|---|---|---|
| `/api/project` | `CONTENT_API_URL` (+ `CONTENT_API_TOKEN`) | `data/mock-content.json` | 60 s |
| `/api/units` | `UNITS_API_URL` (+ `UNITS_API_TOKEN`) | `data/mock-units.json` | 30 s |

- **Content** is a `ContentPatch` (`lib/schema.ts`): titles and images per scene,
  labels/data/`info` per `"sceneId/hotspotId"`, and labels/icons/`info` per
  `"sceneId/markerId"`. It is laid over `project.json`. An entry with no matching
  shape is ignored.
- **Units** are a list: `{ "id": "p1-001", "scene": "phase-1", "status": "sold", "price": 3200000 }`.
  Text fields become categories and number fields become values. The browser
  refreshes them every 60 s.
- **A different CMS or sales API** only needs its shape mapped in
  `normalizeContent` / `normalizeUnits` (`lib/server/content.ts`).
- Images from another host must be listed in `IMAGE_HOSTS`.
- If the BFF is down, the site shows plain `project.json`.

`local` mode needs no server code at all. It suits static hosting, or clients
whose setup can't run server-side routes.

## What's in Phase 1

| Plan item | Where |
|---|---|
| Next.js + TypeScript + Tailwind, reusable components | `app/`, `components/` |
| Design system | tokens `app/globals.css`, primitives `components/ui/`, icons `components/ui/icons.tsx` |
| BFF (aggregation, normalisation, caching, errors) | `app/api/*`, `lib/server/` |
| Data schema | `lib/schema.ts`, `data/project.json` |
| Map viewer (zoom, pan, navigation) | `components/map/map-stage.tsx`, `components/scene/` |
| SVG hotspots, highlight, tooltip, card | `hotspot-layer.tsx`, `marker-layer.tsx`, `info-card.tsx` |
| Dynamic filters | `filter-panel.tsx`, `lib/filters.ts` |
| Responsive + accessibility | side panels on desktop, sheets on mobile; keyboard-operable map |
| Image optimisation | `next/image` with sizes, priority, a full-resolution layer loaded only on zoom |
| SVG placeholder / placement tool | `components/svg-placement/` (switch in `app/layout.tsx`); editor import `scripts/import-editor.mjs` |

**Keyboard:** Tab reaches every hotspot and pin. Enter or Space opens it.
`+` / `−` / `0` zoom, the arrow keys pan, and Esc closes the card.
