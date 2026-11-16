import type { ReactNode } from "react";

/** Numbered steps. */
export function Steps({ children }: { children: ReactNode }) {
  return <ol className="list-decimal space-y-1.5 ps-5 marker:text-ink-muted">{children}</ol>;
}

/** A bullet list. */
export function Bullets({ children }: { children: ReactNode }) {
  return <ul className="list-disc space-y-1.5 ps-5 marker:text-ink-muted">{children}</ul>;
}
