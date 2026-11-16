import projectJson from "@/data/project.json";
import type { Project } from "./schema";

/** data/project.json as a Project. An empty or partial file (`{}`) becomes an
 *  empty project, so the UI shows "No map data yet" instead of crashing. */
const json: unknown = projectJson;
const raw = (json && typeof json === "object" && !Array.isArray(json) ? json : {}) as Partial<Project>;

export const LOCAL_PROJECT: Project = {
  ...raw,
  name: typeof raw.name === "string" ? raw.name : "",
  rootScene: typeof raw.rootScene === "string" ? raw.rootScene : "",
  scenes: Array.isArray(raw.scenes) ? raw.scenes : [],
};
