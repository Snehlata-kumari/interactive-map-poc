import { Code, Kbd } from "../atoms";
import { CodeBlock, DataTable, FieldTable, KeyCombo } from "../molecules";
import { Section } from "./section";

export function Reference() {
  return (
    <>
      <Section id="commands">
        <FieldTable
          head={["Command", "What it does"]}
          rows={[
            ["npm run dev", "Start the dev server on port 3000."],
            ["npm run build", "Production build."],
            ["npm start", "Serve the production build."],
            ["npm run lint", "ESLint."],
            ["npm run type-check", "TypeScript check."],
            ["npm run import-editor -- <file>", "Import an SVG-editor backup."],
          ]}
        />
      </Section>

      <Section id="env">
        <p>Copy <Code>.env.example</Code> to <Code>.env.local</Code>. All are optional.</p>
        <FieldTable
          head={["Variable", "Default", "Description"]}
          rows={[
            ["NEXT_PUBLIC_CONTENT_SOURCE", <Code key="d">local</Code>, <><Code>local</Code> = only <Code>project.json</Code> (works on static hosting). <Code>api</Code> = use the BFF.</>],
            ["CONTENT_API_URL / _TOKEN", "mock", "Content API (server only)."],
            ["UNITS_API_URL / _TOKEN", "mock", "Live units API (server only)."],
            ["IMAGE_HOSTS", <Code key="d">images.ctfassets.net</Code>, "Comma-separated hosts allowed for remote images."],
            ["NEXT_PUBLIC_SVG_PLACEMENT", "off", <><Code>1</Code> enables the Align SVG tool in production.</>],
          ]}
        />
        <p className="text-sm text-ink-muted"><Code>NEXT_PUBLIC_*</Code> values are fixed at build time. Rebuild after changing them.</p>
      </Section>

      <Section id="keyboard">
        <DataTable
          head={["Key", "Action"]}
          rows={[
            [<Kbd key="k">Tab</Kbd>, "Move between hotspots and pins."],
            [<><Kbd>Enter</Kbd> / <Kbd>Space</Kbd></>, "Open the focused hotspot or pin."],
            [<><Kbd>+</Kbd> <Kbd>−</Kbd> <Kbd>0</Kbd></>, "Zoom in, zoom out, reset."],
            ["Arrow keys", "Pan."],
            [<Kbd key="k">Esc</Kbd>, "Close the card."],
            [<KeyCombo key="k" keys={["Alt", "Shift", "P"]} />, "Toggle the Align SVG tool."],
          ]}
        />
        <p>Panels sit beside the map on desktop and become bottom sheets on phones. Reduced-motion settings are respected.</p>
      </Section>

      <Section id="structure">
        <CodeBlock>{`app/                        routes, /api/project + /api/units (BFF), /documentation
components/map/             MapStage: pan, zoom, gestures
components/scene/           SceneView, hotspots, markers, filters, info card
components/svg-placement/   Align SVG tool
components/ui/              design-system primitives + icons
components/docs/            this page: atoms → molecules → organisms → templates, + content
lib/schema.ts               data types
lib/project.ts              scene paths + data checks
lib/server/                 upstream fetching, caching, normalising
data/project.json           the project
public/projects/            scene images
scripts/                    import-editor, ensure-project`}</CodeBlock>
      </Section>

      <Section id="troubleshooting">
        <p>In dev, data mistakes are listed in the browser console as <Code>[project.json] … problem(s)</Code>.</p>
        <DataTable
          head={["You see", "Likely cause", "Fix"]}
          rows={[
            ["“No map data yet”", <><Code>project.json</Code> has no scenes.</>, <>Run <Code>import-editor</Code>.</>],
            ["A root-scene message", <><Code>rootScene</Code> isn&apos;t a scene id.</>, "Set it to an existing id."],
            ["All plots grey", <>No <Code>categories</Code> or <Code>colorBy</Code>.</>, <>Define categories and set <Code>colorBy</Code>.</>],
            ["A shape in the wrong place", "Points in pixels, not percent.", "Convert them to 0–100."],
            ["A click goes nowhere", <><Code>link</Code> points to a missing scene.</>, "Check the console list."],
            ["A remote image fails", "Its host isn't allowed.", <>Add it to <Code>IMAGE_HOSTS</Code>.</>],
            ["API data not showing", <>Source is <Code>local</Code>, or ids don&apos;t match.</>, <>Set <Code>api</Code> and rebuild; match hotspot ids.</>],
          ]}
        />
      </Section>
    </>
  );
}
