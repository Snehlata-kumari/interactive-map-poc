import { getUnits } from "@/lib/server/content";

/** BFF: live units (status, price…) normalized to Unit[]; `?scene=` narrows. */
export async function GET(request: Request) {
  const scene = new URL(request.url).searchParams.get("scene");
  try {
    const { value, stale } = await getUnits();
    const units = scene ? value.filter((u) => !u.scene || u.scene === scene) : value;
    return Response.json(units, { headers: { "Cache-Control": "no-store", "X-Content-Stale": String(stale) } });
  } catch (error) {
    console.error("[bff] /api/units:", error);
    return Response.json([], { status: 502 });
  }
}
