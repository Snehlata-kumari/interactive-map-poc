import { getProject } from "@/lib/server/content";

/** BFF: data/project.json with the content API's text/images/data on top.
 *  Fails soft — the client falls back to its bundled project.json. */
export async function GET() {
  try {
    const { value, stale } = await getProject();
    return Response.json(value, { headers: { "Cache-Control": "no-store", "X-Content-Stale": String(stale) } });
  } catch (error) {
    console.error("[bff] /api/project:", error);
    return Response.json({ error: "content unavailable" }, { status: 502 });
  }
}
