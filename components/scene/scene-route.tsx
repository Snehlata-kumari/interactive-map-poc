"use client";

import { notFound } from "next/navigation";
import { chainFromPath, chainPath, getScene } from "@/lib/project";
import { useProject } from "../project-provider";
import { ProjectMessage } from "./project-message";
import { SceneView } from "./scene-view";

/** URL segments → scene (404 for an unknown path; a message when the project
 *  itself has nothing to show). */
export function SceneRoute({ segments }: { segments: string[] }) {
  const { project } = useProject();
  if (!project.scenes?.length)
    return (
      <ProjectMessage title="No map data yet">
        <p>This project doesn’t have any scenes to show.</p>
        <p>
          To add one, run <code>npm run import-editor -- &lt;backup.json&gt;</code>
        </p>
      </ProjectMessage>
    );
  if (!getScene(project, project.rootScene))
    return (
      <ProjectMessage title="The map can’t be shown">
        <p>
          The start scene <code>{project.rootScene ? `“${project.rootScene}”` : "(not set)"}</code> doesn’t
          exist in <code>data/project.json</code>.
        </p>
        <p>Set <code>rootScene</code> to the id of one of its scenes.</p>
      </ProjectMessage>
    );
  const chain = chainFromPath(project, segments);
  if (!chain) notFound();
  const scene = chain.at(-1)!;
  // Keyed per URL: a new scene (or the same one reached another way) starts
  // with fresh zoom, filters and card.
  return (
    <>
      <title>{`${scene.title} · ${project.name}`}</title>
      <SceneView key={chainPath(project, chain)} chain={chain} />
    </>
  );
}
