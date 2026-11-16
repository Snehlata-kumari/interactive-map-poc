import type { Metadata } from "next";
import { ProjectProvider } from "@/components/project-provider";
import { PlacementSwitch } from "@/components/svg-placement/placement-switch";
import { LOCAL_PROJECT } from "@/lib/local-project";

export const metadata: Metadata = {
  title: LOCAL_PROJECT.name || "Interactive map",
};

/** The map's routes only: project data + the SVG placement switch. Pages
 *  outside this group (e.g. /documentation) never load data/project.json. */
export default function MapLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProjectProvider>
      {children}
      {/* SVG placement tool toggle (dev, or NEXT_PUBLIC_SVG_PLACEMENT=1). */}
      <PlacementSwitch />
    </ProjectProvider>
  );
}
