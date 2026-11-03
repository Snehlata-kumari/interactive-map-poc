import { PANEL } from "../ui";

/** Full-screen notice when the project can't show a map (no scenes yet, or a
 *  start scene that doesn't exist) instead of a crash or a bare 404. */
export function ProjectMessage({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <main className="grid h-dvh place-items-center p-6 text-center">
      <div className={`${PANEL} max-w-md space-y-2 p-6`} role="status">
        <h1 className="text-lg font-semibold">{title}</h1>
        <div className="space-y-2 text-sm text-ink-muted">{children}</div>
      </div>
    </main>
  );
}
