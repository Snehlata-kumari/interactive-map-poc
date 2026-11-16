import type { Metadata } from "next";
import { GettingStarted } from "@/components/docs/content/getting-started";
import { Guides } from "@/components/docs/content/guides";
import { DOC_NAV } from "@/components/docs/content/nav";
import { ProjectData } from "@/components/docs/content/project-data";
import { Reference } from "@/components/docs/content/reference";
import { DocsLayout } from "@/components/docs/templates";
import pkg from "@/package.json";

export const metadata: Metadata = {
  title: "Documentation · Interactive Map Platform",
  description: "How to set up, configure and feed data to the interactive map viewer.",
};

/** Page (atomic "page" level): the DocsLayout template filled with content.
 *  A static route, so it wins over the scene catch-all. */
export default function DocumentationPage() {
  return (
    <DocsLayout
      nav={DOC_NAV}
      header={{
        title: "Interactive Map Platform",
        subtitle: "Documentation",
        version: pkg.version,
        home: "/documentation",
        back: { label: "Open the map", href: "/" },
      }}
    >
      <GettingStarted />
      <ProjectData />
      <Guides />
      <Reference />
    </DocsLayout>
  );
}
