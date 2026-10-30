/** Client-visible switches (NEXT_PUBLIC_*, inlined at build). */

/** "local": data/project.json only, no server needed.
 *  "api": the BFF's /api/project (project.json + content API) and live
 *  /api/units; falls back to project.json if the BFF fails. */
export const CONTENT_SOURCE: "local" | "api" =
  process.env.NEXT_PUBLIC_CONTENT_SOURCE === "api" ? "api" : "local";

/** How often live units are refreshed (ms). */
export const UNITS_REFRESH_MS = 60_000;
