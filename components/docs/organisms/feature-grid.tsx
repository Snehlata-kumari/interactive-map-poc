import { FeatureCard } from "../molecules";

/** Feature tiles, two per row from tablet width. */
export function FeatureGrid({ items }: { items: { title: string; text: string }[] }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {items.map((f) => <FeatureCard key={f.title} {...f} />)}
    </div>
  );
}
