"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import type { Info, Project } from "@/lib/schema";
import { Button, Chip, IconButton, PANEL, cx } from "../ui";
import { CloseIcon } from "../ui/icons";

export interface CardContent {
  title: string;
  info?: Info;
  categories?: Record<string, string>;
  values?: Record<string, number>;
  /** Label of the button that zooms into the scene / opens the URL (onAction). */
  action?: string;
}

/** Details card: a side panel on desktop, a bottom sheet on mobile.
 *  Non-modal dialog — takes focus on open, Esc closes, map stays usable. */
export function InfoCard({ project, content, onClose, onAction }: {
  project: Project;
  content: CardContent;
  onClose: () => void;
  onAction: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { title, info, categories = {}, values = {}, action } = content;
  // Focus once per opened item (not on every re-render).
  useEffect(() => {
    ref.current?.focus();
  }, [title]);
  useEffect(() => {
    const esc = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", esc);
    return () => window.removeEventListener("keydown", esc);
  }, [onClose]);

  const chips = Object.entries(categories).flatMap(([cat, v]) => {
    const option = project.categories?.[cat]?.options.find((o) => o.value === v);
    return option ? [{ key: cat, label: option.label, color: option.color }] : [];
  });
  const rows = [
    ...Object.entries(values).flatMap(([id, v]) => {
      const field = project.values?.[id];
      return field ? [{ label: field.label, value: `${v.toLocaleString()}${field.unit ? ` ${field.unit}` : ""}` }] : [];
    }),
    ...(info?.rows ?? []),
  ];

  return (
    <div
      ref={ref}
      role="dialog"
      aria-label={title}
      tabIndex={-1}
      className={cx(PANEL, "absolute inset-x-2 bottom-2 z-20 max-h-[70dvh] overflow-y-auto outline-none sm:inset-x-auto sm:end-4 sm:top-20 sm:bottom-auto sm:w-80")}
    >
      {info?.image && (
        <div className="relative aspect-video overflow-hidden rounded-t-panel bg-surface-muted">
          <Image src={info.image} alt="" fill sizes="(min-width: 640px) 320px, 100vw" className="object-cover" />
        </div>
      )}
      <div className="space-y-3 p-4">
        <div className="flex items-start gap-2">
          <div className="flex-1">
            <h2 className="text-base font-semibold">{info?.title ?? title}</h2>
            {info?.subtitle && <p className="text-sm text-ink-muted">{info.subtitle}</p>}
          </div>
          <IconButton label="Close" variant="ghost" onClick={onClose}><CloseIcon /></IconButton>
        </div>
        {chips.length > 0 && (
          <div className="flex flex-wrap gap-1.5">{chips.map((c) => <Chip key={c.key} color={c.color}>{c.label}</Chip>)}</div>
        )}
        {info?.description && <p className="text-sm leading-relaxed">{info.description}</p>}
        {rows.length > 0 && (
          <dl className="divide-y divide-line text-sm">
            {rows.map((r) => (
              <div key={r.label} className="flex justify-between gap-4 py-1.5">
                <dt className="text-ink-muted">{r.label}</dt>
                <dd className="text-end font-medium">{r.value}</dd>
              </div>
            ))}
          </dl>
        )}
        <div className="flex flex-col gap-2">
          {action && <Button variant="primary" onClick={onAction}>{action}</Button>}
          {info?.cta && (
            <a href={info.cta.href} target="_blank" rel="noopener noreferrer" className="text-center text-sm font-medium text-brand underline-offset-2 hover:underline">
              {info.cta.label}
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
