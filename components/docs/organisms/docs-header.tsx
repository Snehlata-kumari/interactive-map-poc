import Link from "next/link";
import { Badge, BrandMark } from "../atoms";

/** Sticky top bar: name, subtitle, version, and a way back to the app. */
export function DocsHeader({ title, subtitle, version, home, back }: {
  title: string;
  subtitle?: string;
  version?: string;
  /** Where the logo links to. */
  home: string;
  back?: { label: string; href: string };
}) {
  return (
    <header className="sticky top-0 z-30 flex h-15 items-center gap-3 border-b border-line bg-surface/95 px-4 backdrop-blur">
      <Link href={home} className="flex items-center gap-2 font-semibold">
        <BrandMark />
        {title}
      </Link>
      {subtitle && <span className="hidden text-sm text-ink-muted sm:inline">{subtitle}</span>}
      {version && <Badge>v{version}</Badge>}
      {back && (
        // me-12 on phones leaves room for the sidebar's menu button.
        <Link href={back.href} className="ms-auto me-12 text-sm font-medium text-brand hover:underline md:me-0">
          {back.label} →
        </Link>
      )}
    </header>
  );
}
