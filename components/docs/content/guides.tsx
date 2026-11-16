import { Code, Heading } from "../atoms";
import { Callout, CodeBlock, DataTable, FieldTable, KeyCombo, Steps } from "../molecules";
import { Section } from "./section";

export function Guides() {
  return (
    <>
      <Section id="import">
        <p>In the SVG editor (svg-footprint-generator) choose <b>JSON ▾ → Download backup (project + images)</b>, then:</p>
        <CodeBlock>{`npm run import-editor -- ~/Downloads/<project>.json`}</CodeBlock>
        <DataTable
          head={["Editor", "Becomes"]}
          rows={[
            ["Scene", <>A scene (parent = the scene whose shape links to it). The start scene becomes <Code>overview</Code>.</>],
            ["Polygon", "Hotspot"],
            ["Pin", "Marker"],
            ["Images", <>WebP (at most 4000 px wide) in <Code>public/projects/&lt;slug&gt;/</Code></>],
            [<Code key="d">details</Code>, <>Excel rows matched by id or label: status and typology (filters, colours), area / GFA / parking (sliders), other columns as card lines. Maps with data get <Code>colorBy</Code> and <Code>filters</Code>.</>],
          ]}
        />
        <Callout>
          <b>Re-importing is safe.</b> For matching ids only the geometry (points, image, size) is replaced; titles, data and cards are kept.
          The old file is saved as <Code>data/project.previous.json</Code>. The import prints how many Excel rows matched on each map.
        </Callout>
      </Section>

      <Section id="new-project">
        <Steps>
          <li>Move <Code>data/project.json</Code> and <Code>public/projects/&lt;old-slug&gt;/</Code> into <Code>archive/&lt;old-slug&gt;/</Code>.</li>
          <li>Run <Code>npm run import-editor -- &lt;new-backup.json&gt;</Code>.</li>
          <li>Add <Code>categories</Code> / <Code>values</Code> and hotspot data (for example from the Excel sheet).</li>
          <li>Check with <Code>npm run dev</Code> and the browser console.</li>
        </Steps>
        <Callout tone="warn">Skip step 1 and the importer keeps the old project&apos;s name, theme, categories and data for matching ids.</Callout>
        <p>A missing <Code>project.json</Code> is recreated empty, and the site shows &ldquo;No map data yet&rdquo; instead of breaking.</p>
      </Section>

      <Section id="align-svg">
        <p>Places shapes traced in Figma, Illustrator or Inkscape on a scene, whatever their size or coordinate system.</p>
        <Steps>
          <li>
            Turn on <b>Align SVG</b> (bottom left) or press <KeyCombo keys={["Alt", "Shift", "P"]} />. Always available in dev; a production
            build needs <Code>NEXT_PUBLIC_SVG_PLACEMENT=1</Code>.
          </li>
          <li>Open the scene and click <b>Load SVG…</b>. The shapes appear in a yellow box.</li>
          <li>Drag the box to move it; drag a corner to resize it (<KeyCombo keys={["Alt"]} /> resizes from the centre).</li>
          <li><b>Copy hotspots</b> and paste them into the scene&apos;s <Code>hotspots</Code>. Rename the ids and add labels.</li>
        </Steps>
        <Callout>Flatten transforms before exporting (&ldquo;Object to path&rdquo;). Curves are reduced to their end points.</Callout>
      </Section>

      <Section id="api">
        <p>
          Set <Code>NEXT_PUBLIC_CONTENT_SOURCE=api</Code> in <Code>.env.local</Code>. The browser then calls the site&apos;s own backend (BFF),
          which calls your upstream APIs, caches them, and keeps serving the last good copy if they fail.
        </p>
        <FieldTable
          head={["Endpoint", "Upstream env", "Without a URL", "Cache"]}
          rows={[
            ["/api/project", <><Code>CONTENT_API_URL</Code> + <Code>CONTENT_API_TOKEN</Code></>, <Code key="m">data/mock-content.json</Code>, "60 s"],
            ["/api/units", <><Code>UNITS_API_URL</Code> + <Code>UNITS_API_TOKEN</Code></>, <Code key="m">data/mock-units.json</Code>, "30 s"],
          ]}
        />
        <Heading level={3}>Content patch</Heading>
        <p>Overrides text, images and data, keyed by scene id, <Code>sceneId/hotspotId</Code> or <Code>sceneId/markerId</Code>:</p>
        <CodeBlock>{`{
  "scenes":   { "zone-1": { "title": "Zone One" } },
  "hotspots": { "zone-1/A-002": { "label": "Tower A", "info": { "description": "…" } } },
  "markers":  { "zone-1/school": { "icon": "https://cdn.example.com/school.png" } }
}`}</CodeBlock>
        <Heading level={3}>Units</Heading>
        <p>Live status and price. Text fields become categories and numbers become values. Refreshed every 60 s.</p>
        <CodeBlock>{`[{ "id": "A-002", "scene": "zone-1", "status": "sold", "price": 3200000 }]`}</CodeBlock>
        <Callout>
          A different API shape only needs mapping in <Code>normalizeContent</Code> / <Code>normalizeUnits</Code> (<Code>lib/server/content.ts</Code>).
          Remote image hosts must be listed in <Code>IMAGE_HOSTS</Code>.
        </Callout>
      </Section>
    </>
  );
}
