"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import projectJson from "@/data/project.json";
import { CONTENT_SOURCE, UNITS_REFRESH_MS } from "@/lib/config";
import { checkProject } from "@/lib/project";
import type { Project, Unit } from "@/lib/schema";
import { Spinner } from "./ui/spinner";

const LOCAL = projectJson as unknown as Project;
const ProjectContext = createContext<{ project: Project; units: Unit[] } | null>(null);

export function useProject() {
  const ctx = useContext(ProjectContext);
  if (!ctx) throw new Error("useProject outside <ProjectProvider>");
  return ctx;
}

/** Loads the project once — project.json ("local") or the BFF ("api", falling
 *  back to project.json) — and, in api mode, keeps live units fresh. */
export function ProjectProvider({ children }: { children: ReactNode }) {
  const [project, setProject] = useState<Project | null>(CONTENT_SOURCE === "local" ? LOCAL : null);
  const [units, setUnits] = useState<Unit[]>([]);

  useEffect(() => {
    if (CONTENT_SOURCE !== "api") return;
    fetch("/api/project")
      .then((r) => (r.ok ? (r.json() as Promise<Project>) : Promise.reject(new Error(`BFF ${r.status}`))))
      .catch((error) => {
        console.warn("[content] BFF failed, showing data/project.json:", error);
        return LOCAL;
      })
      .then(setProject);
    const loadUnits = () =>
      fetch("/api/units")
        .then((r) => (r.ok ? r.json() : []))
        .then(setUnits)
        .catch(() => {}); // keep the last units
    loadUnits();
    const timer = setInterval(loadUnits, UNITS_REFRESH_MS);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!project || process.env.NODE_ENV === "production") return;
    const problems = checkProject(project);
    if (problems.length) console.warn(`[project.json] ${problems.length} problem(s):\n- ${problems.join("\n- ")}`);
  }, [project]);

  useEffect(() => {
    if (project?.theme?.brand) document.documentElement.style.setProperty("--color-brand", project.theme.brand);
  }, [project]);

  if (!project) return <Spinner />;
  return <ProjectContext.Provider value={{ project, units }}>{children}</ProjectContext.Provider>;
}
