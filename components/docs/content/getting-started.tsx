import { Code } from "../atoms";
import { Bullets, Callout, CodeBlock } from "../molecules";
import { FeatureGrid } from "../organisms";
import { Section } from "./section";

const FEATURES = [
  { title: "Pan & zoom", text: "Drag, pinch, wheel, double-click and keyboard." },
  { title: "Clickable plots", text: "SVG hotspots with tooltips, colours and detail cards." },
  { title: "Filters", text: "By status, type, area, price, built from the data." },
  { title: "Live data", text: "Optional API for content and unit status / price." },
];

export function GettingStarted() {
  return (
    <>
      <Section id="introduction">
        <p className="text-lg text-ink-muted">
          A reusable &ldquo;zoom into the map&rdquo; viewer for real-estate sales: city → masterplan → phase → plot → floor plan.
        </p>
        <p>
          Every project is <b>images + one JSON file</b>. A new project never needs new pages or components; you swap the data.
        </p>
        <FeatureGrid items={FEATURES} />
        <p className="text-sm text-ink-muted">Built with Next.js 16, React 19, TypeScript and Tailwind 4.</p>
      </Section>

      <Section id="quick-start">
        <p>Requires <b>Node.js 20+</b>.</p>
        <CodeBlock>{`npm install
npm run dev            # http://localhost:3000`}</CodeBlock>
        <p>Production build:</p>
        <CodeBlock>{`npm run build
npm start`}</CodeBlock>
        <p>Load your own map (an SVG-editor backup file):</p>
        <CodeBlock>{`npm run import-editor -- ~/Downloads/my-project.json`}</CodeBlock>
        <Callout>Not a developer? <Code>HANDOVER.md</Code> in the repo has copy-paste prompts for every task.</Callout>
      </Section>

      <Section id="how-it-works">
        <CodeBlock>{`data/project.json ──┐                        ┌─ /api/project  (project.json + content API)
  (shapes + data)   ├─ CONTENT_SOURCE=local  │
                    │  or =api ──────────────┼─ /api/units    (live status / price)
                    ▼                        │
           ProjectProvider ──► SceneView ──► MapStage (pan/zoom) + HotspotLayer (SVG)
                                         └─► Markers, Filters, Info card, Top bar`}</CodeBlock>
        <Bullets>
          <li><b>A project is a tree of scenes.</b> Each scene is one image with clickable shapes on it.</li>
          <li><b>Points are percentages</b> (0–100) of the image, never pixels, so shapes fit any screen.</li>
          <li><b>URLs follow the path you took:</b> <Code>/</Code>, <Code>/masterplan</Code>, <Code>/masterplan/phase-1</Code>. A scene linked from several places keeps your route, so Back returns the way you came.</li>
          <li><b>Shapes only come from <Code>project.json</Code>.</b> An API may change text, images and data, never geometry.</li>
        </Bullets>
      </Section>
    </>
  );
}
