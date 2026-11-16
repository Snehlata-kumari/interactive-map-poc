import { NavLink } from "../atoms";

/** A labelled group of sidebar links. */
export function NavGroup({ label, items, active, onNavigate }: {
  label: string;
  items: { id: string; title: string }[];
  active?: string;
  onNavigate?: () => void;
}) {
  return (
    <div className="mb-5">
      <p className="mb-1.5 px-2.5 text-xs font-semibold tracking-wide text-ink-muted uppercase">{label}</p>
      {items.map((i) => (
        <NavLink key={i.id} href={`#${i.id}`} active={active === i.id} onClick={onNavigate}>
          {i.title}
        </NavLink>
      ))}
    </div>
  );
}
