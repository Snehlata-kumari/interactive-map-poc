import type { Metadata, Viewport } from "next";
import { ProjectProvider } from "@/components/project-provider";
import { PlacementSwitch } from "@/components/svg-placement/placement-switch";
import projectJson from "@/data/project.json";
import "./globals.css";

export const metadata: Metadata = {
  title: projectJson.name || "Interactive map",
  description: "Interactive map",
};
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        <ProjectProvider>{children}</ProjectProvider>
        {/* SVG placement tool toggle (dev, or NEXT_PUBLIC_SVG_PLACEMENT=1). */}
        <PlacementSwitch />
      </body>
    </html>
  );
}
