import { CopyButton } from "../atoms";

/** A multi-line code sample with a Copy button. */
export function CodeBlock({ children }: { children: string }) {
  return (
    <div className="relative">
      <pre className="overflow-x-auto rounded-control bg-ink p-4 font-mono text-[13px] leading-relaxed text-surface-muted">
        <code>{children}</code>
      </pre>
      <CopyButton text={children} className="absolute end-2 top-2" />
    </div>
  );
}
