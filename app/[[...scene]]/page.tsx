import { SceneRoute } from "@/components/scene/scene-route";

/** Every scene: `/` = root, `/masterplan/phase-1` = its parent chain. */
export default async function ScenePage({ params }: { params: Promise<{ scene?: string[] }> }) {
  const { scene = [] } = await params;
  return <SceneRoute segments={scene} />;
}
