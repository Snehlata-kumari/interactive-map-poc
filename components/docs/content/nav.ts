import type { NavConfig } from "../organisms";

/** The docs sidebar, and the source of every section title. Each `id` is a <Section id> on the page. */
export const DOC_NAV: NavConfig = [
  {
    group: "Getting started",
    items: [
      { id: "introduction", title: "Introduction" },
      { id: "quick-start", title: "Quick start" },
      { id: "how-it-works", title: "How it works" },
    ],
  },
  {
    group: "Project data",
    items: [
      { id: "project-file", title: "project.json" },
      { id: "scenes", title: "Scenes" },
      { id: "hotspots", title: "Hotspots & markers" },
      { id: "categories", title: "Categories & values" },
      { id: "click", title: "What a click does" },
    ],
  },
  {
    group: "Guides",
    items: [
      { id: "import", title: "Import from the SVG editor" },
      { id: "new-project", title: "Switching projects" },
      { id: "align-svg", title: "Align SVG tool" },
      { id: "api", title: "Content from an API" },
    ],
  },
  {
    group: "Reference",
    items: [
      { id: "commands", title: "Commands" },
      { id: "env", title: "Environment variables" },
      { id: "keyboard", title: "Keyboard & accessibility" },
      { id: "structure", title: "Folder structure" },
      { id: "troubleshooting", title: "Troubleshooting" },
    ],
  },
];
