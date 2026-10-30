"use client";

import { notFound } from "next/navigation";
import { sceneFromPath } from "@/lib/project";
import { useProject } from "../project-provider";
import { SceneView } from "./scene-view";

/** URL segments → scene (404 for an unknown path). */
export function SceneRoute({ segments }: { segments: string[] }) {
  const { project } = useProject();
  const scene = sceneFromPath(project, segments);
  if (!scene) notFound();
  // Keyed per scene: a new scene starts with fresh zoom, filters and card.
  return (
    <>
      <title>{`${scene.title} · ${project.name}`}</title>
      <SceneView key={scene.id} scene={scene} />
    </>
  );
}
