import { Code } from "../atoms";
import { Bullets, Callout, CodeBlock, FieldTable, Steps } from "../molecules";
import { Section } from "./section";

export function ProjectData() {
  return (
    <>
      <Section id="project-file">
        <p>Lives at <Code>data/project.json</Code>. Full types with comments: <Code>lib/schema.ts</Code>.</p>
        <CodeBlock>{`{
  "name": "New Project",
  "rootScene": "overview",
  "theme": { "brand": "#0f766e" },
  "categories": { "status": { "label": "Status", "options": [
    { "value": "available", "label": "Available", "color": "#16a34a" } ] } },
  "values": { "area": { "label": "Plot area", "unit": "m²" } },
  "scenes": []
}`}</CodeBlock>
        <FieldTable
          head={["Field", "Required", "Description"]}
          rows={[
            ["name", "yes", "Project name (page title)."],
            ["rootScene", "yes", <>Id of the scene shown at <Code>/</Code>.</>],
            ["theme.brand", "no", "Brand colour for buttons and highlights."],
            ["categories", "no", "Text dimensions (status, type…) for colours and filters."],
            ["values", "no", "Number fields (area, price…) for card rows and range filters."],
            ["scenes", "yes", "List of scenes."],
          ]}
        />
      </Section>

      <Section id="scenes">
        <CodeBlock>{`{
  "id": "zone-1", "parent": "masterplan", "title": "Zone 1",
  "image": "/projects/new-project/zone-1.webp", "size": [3465, 2131],
  "fit": "contain", "hotspotStyle": "fill", "colorBy": "status",
  "filters": { "categories": ["status"], "ranges": ["area"], "search": true },
  "hotspots": [], "markers": []
}`}</CodeBlock>
        <FieldTable
          head={["Field", "Description"]}
          rows={[
            ["id", "Unique. Also the URL segment."],
            ["parent", "Default scene this one opens from. Omit for the root. A scene can also be linked from other scenes; the breadcrumb follows the route taken."],
            ["title", "Shown in the breadcrumb."],
            ["image", <>Image path in <Code>public/</Code>. WebP, about 4000 px wide.</>],
            ["size", <><Code>[width, height]</Code> in px, so the map lays out before the image loads.</>],
            ["fit", <><Code>cover</Code> (default) fills the screen; <Code>contain</Code> shows it all (floor plans).</>],
            ["hotspotStyle", <><Code>fill</Code> coloured plots · <Code>outline</Code> zones · <Code>hidden</Code> until hover.</>],
            ["colorBy", "Category id used for colours and the legend."],
            ["filters", "Which categories / ranges to filter by, and whether to show search."],
          ]}
        />
      </Section>

      <Section id="hotspots">
        <p><b>Hotspots</b> are clickable polygons. <b>Markers</b> are pins with an optional icon.</p>
        <CodeBlock>{`"hotspots": [{
  "id": "A-002", "label": "Building 1",
  "points": [[14.55, 83.86], [15.47, 88.35], [20.1, 87.2], [19.3, 82.9]],
  "categories": { "status": "available" },
  "values": { "area": 900 },
  "link": "building-1",
  "info": {
    "title": "Building 1", "image": "/projects/x/b1.webp", "description": "…",
    "rows": [{ "label": "View", "value": "Park" }],
    "cta": { "label": "Brochure", "href": "https://…" }
  }
}],
"markers": [{
  "id": "school", "label": "School", "point": [40, 40],
  "icon": "/projects/x/school.png", "info": { "description": "…" }
}]`}</CodeBlock>
        <FieldTable
          head={["Field", "Description"]}
          rows={[
            ["id", "Unique within the scene. API content and live units match on it."],
            ["points / point", <><Code>[x, y]</Code> in percent of the image. Hotspots need at least 3 points.</>],
            ["label", "Tooltip and accessible name."],
            ["link", "Scene id to zoom into."],
            ["href", "Any URL (http opens in a new tab)."],
            ["categories / values", "Data for colours, filters and the card."],
            ["info", <>Details card: <Code>title</Code>, <Code>subtitle</Code>, <Code>image</Code>, <Code>description</Code>, <Code>rows</Code>, <Code>cta</Code>.</>],
          ]}
        />
        <Callout><b>Pixels → percent:</b> <Code>x = px / imageWidth × 100</Code>, <Code>y = py / imageHeight × 100</Code>.</Callout>
      </Section>

      <Section id="categories">
        <p>Defined once at the top of <Code>project.json</Code>, then used by any hotspot.</p>
        <CodeBlock>{`"categories": {
  "status": { "label": "Status", "options": [
    { "value": "available", "label": "Available", "color": "#16a34a" },
    { "value": "sold",      "label": "Sold",      "color": "#dc2626" } ] }
},
"values": {
  "price": { "label": "Price", "unit": "₹" }
}`}</CodeBlock>
        <Bullets>
          <li><b>Categories</b> → colour (through the scene&apos;s <Code>colorBy</Code>), legend and checkbox filters.</li>
          <li><b>Values</b> → rows in the card and range filters.</li>
        </Bullets>
        <Callout tone="warn">Plots without a defined category render <b>grey</b>. That is expected after a clean import.</Callout>
      </Section>

      <Section id="click">
        <Steps>
          <li>Has <Code>info</Code>, categories or values → opens the <b>details card</b> (its <b>Explore</b> button follows <Code>link</Code> / <Code>href</Code>).</li>
          <li>Otherwise has <Code>link</Code> → zooms in and opens that scene.</li>
          <li>Otherwise has <Code>href</Code> → opens the URL.</li>
          <li>Otherwise → zooms closer.</li>
        </Steps>
      </Section>
    </>
  );
}
