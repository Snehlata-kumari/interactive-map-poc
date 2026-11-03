# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

Reusable interactive-map viewer (Next.js 16, React 19, Tailwind 4). README.md is the non-developer guide: keep it in sync with any change to the data format or env.

## Commands

`npm run dev` · `npm run build` · `npm run lint` · `npm run type-check` · `npm run import-editor -- <backup.json>` (SVG editor backup → `data/project.json` + `public/projects/<slug>/*.webp`; on re-import only geometry is replaced, all other data is kept by id). No test suite. Verify with `npm run lint && npm run type-check`; check data problems in the dev browser console (`[project.json] … problem(s)`). The import script backs up the old file to `data/project.previous.json`.

The shipped project is the editor export `~/Downloads/new-project.json` + its Excel data (titles, statuses, prices, cards). `data/mock-*.json` are the BFF's stand-in upstreams.

## Handover / switching projects

`HANDOVER.md` holds copy-paste prompts for a non-technical maintainer. Keep it in sync with the import flow. When following those prompts, use plain language, show a plan before bulk data edits, and never push without asking.

To replace the project: **first** move `data/project.json` and `public/projects/<slug>/` into `archive/<slug>/`, **then** run `import-editor`. If an old `project.json` exists, the importer keeps its `name`, `theme`, `categories` and `values`, plus all non-geometry data for matching ids, so old data would end up in the new project. After a clean import, `categories`/`values` are empty and plots render grey until they are defined. `data/mock-*.json` are keyed to the old ids. Excel data has no importer: map the columns to `categories` / `values` / `info` by hand, matching rows to hotspot ids, and confirm the mapping with the user first.

## Data flow

`NEXT_PUBLIC_CONTENT_SOURCE` (`lib/config.ts`, inlined at build; see `.env.example`) picks the mode:

- `local` (default): `ProjectProvider` uses the bundled `data/project.json`. No server code runs, so this mode must keep working on static hosting.
- `api`: `ProjectProvider` fetches `/api/project` (server: `applyPatch(project.json, normalizeContent(upstream))`, cached 60 s). If that fails it falls back to the bundled JSON. It polls `/api/units` every `UNITS_REFRESH_MS`.
- Units are merged on the client per scene in `SceneView` (`withUnits`): text fields become categories and number fields become values. `checkProject` runs only in dev. `theme.brand` sets `--color-brand` at runtime.

## Rules

- **Data, not code:** a project is `data/project.json` (types: `lib/schema.ts`). Never add routes/components per project. A new field goes into `lib/schema.ts`, `checkProject` (`lib/project.ts`) if it can be mistyped, and README.
- **Points are image percentages (0–100)**, never px. `HotspotLayer` draws in an `<svg viewBox="0 0 100 100" preserveAspectRatio="none">` inside the stage's image box; unscaled UI (pins, tooltips) positions itself with `useStage().toScreen`.
- **Geometry only from project.json.** The content API (`ContentPatch`) changes text/images/icons/data; `applyPatch` ignores keys without a shape.
- **External calls only in the BFF** (`lib/server/`, `import "server-only"`): `fetchJson` (timeout, token, mock fallback) + `cached` (TTL, last-good). Adapt an upstream's shape in `normalizeContent` / `normalizeUnits` only. The browser calls only `/api/project` and `/api/units`.
- **UI from the design system:** tokens in `app/globals.css` `@theme`, primitives in `components/ui/` (`PANEL`, `Button`, `IconButton`, `Checkbox`, `Chip`), icons in `components/ui/icons.tsx`. No hard-coded colours except data colours.
- **Accessibility:** hotspots are focusable `role="button"` polygons with an `aria-label`; the card is a non-modal dialog (focus on open, Esc closes). `MapStage` handles keys at window level but skips inputs and dialogs. Pass handlers by reference (read `data-id` off `currentTarget`), not closures over loop variables.
- **Images:** every `next/image` gets a `sizes`. `MapStage` loads the base image at its fitted width and adds a full-resolution layer only past `HIRES_AT` zoom. Remote hosts must be in `IMAGE_HOSTS` (`next.config.ts`).
- **React Compiler lint is on:** no setState inside effects, no ref reads during render (derive values; see `view = clamp(rawView)` in `MapStage`).
- Keep files short. A component over ~200 lines should be split.

## Map

- `components/map/map-stage.tsx`: pan/zoom state (`rawView`, clamped on read), gestures (drag, pinch, wheel, double-click, keys), `zoomTo` (CSS transition, honours reduced motion), and the stage API via `apiRef`. A drag of more than 4px swallows the following click.
- `components/scene/scene-view.tsx` composes a scene. Click order: card (info / categories / values) → `link` (`zoomTo`, then `router.push`) → `href` → zoom closer.
- SVG placement tool (`components/svg-placement/`): `PlacementSwitch` in the root layout (Alt+Shift+P; only in dev or with `NEXT_PUBLIC_SVG_PLACEMENT=1`) toggles a `useSyncExternalStore` store (`store.ts`, localStorage, box + SVG per scene id). `SceneView` lazy-loads `PlacementOverlay` (in the stage's image box, so it scales with the map) and `PlacementPanel` only while it's on. The box drags itself: `data-no-pan` stops `MapStage` from panning. Output = hotspots in image percent.
- Scene URLs are parent chains: `scenePath` / `sceneFromPath` / `sceneChain` in `lib/project.ts`.
