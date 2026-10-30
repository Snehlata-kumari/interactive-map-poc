/** Design-system primitives. Every floating control uses these, so the whole
 *  chrome shares one look (tokens in app/globals.css). */
import type { ButtonHTMLAttributes, HTMLAttributes, InputHTMLAttributes, ReactNode } from "react";

const cx = (...c: (string | false | undefined)[]) => c.filter(Boolean).join(" ");

/** The surface every panel, card and toolbar sits on. */
export const PANEL = "bg-surface/95 backdrop-blur border border-line shadow-panel rounded-panel";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "ghost" | "chrome" };

export function Button({ variant = "chrome", className, ...props }: ButtonProps) {
  return (
    <button
      type="button"
      className={cx(
        "inline-flex h-9 items-center justify-center gap-2 rounded-control px-3 text-sm font-medium transition-colors disabled:opacity-40",
        variant === "primary" && "bg-brand text-white hover:brightness-110",
        variant === "ghost" && "text-ink-muted hover:bg-surface-muted hover:text-ink",
        variant === "chrome" && cx(PANEL, "rounded-control text-ink hover:bg-surface-muted"),
        className,
      )}
      {...props}
    />
  );
}

/** A square icon button; `label` is its accessible name. */
export function IconButton({ label, children, ...props }: ButtonProps & { label: string; children: ReactNode }) {
  return (
    <Button aria-label={label} title={label} className="w-9 px-0" {...props}>
      {children}
    </Button>
  );
}

export function Checkbox({ label, color, count, ...props }: InputHTMLAttributes<HTMLInputElement> & { label: string; color?: string; count?: number }) {
  return (
    <label className="flex cursor-pointer items-center gap-2 py-1 text-sm">
      <input type="checkbox" className="size-4 accent-(--color-brand)" {...props} />
      {color && <span className="size-2.5 rounded-full" style={{ background: color }} aria-hidden />}
      <span className="flex-1">{label}</span>
      {count !== undefined && <span className="text-xs text-ink-muted tabular-nums">{count}</span>}
    </label>
  );
}

export function Chip({ color, children }: { color?: string; children: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-surface-muted px-2.5 py-0.5 text-xs font-medium">
      {color && <span className="size-2 rounded-full" style={{ background: color }} aria-hidden />}
      {children}
    </span>
  );
}

export function SectionTitle(props: HTMLAttributes<HTMLHeadingElement>) {
  return <h3 className="mb-1 text-xs font-semibold tracking-wide text-ink-muted uppercase" {...props} />;
}

export { cx };
