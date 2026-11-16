/** A title + one-line description tile. */
export function FeatureCard({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-control border border-line bg-surface-muted/50 p-3">
      <p className="font-semibold">{title}</p>
      <p className="text-sm text-ink-muted">{text}</p>
    </div>
  );
}
