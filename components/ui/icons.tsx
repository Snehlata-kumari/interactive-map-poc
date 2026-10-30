/** The icon set (24px stroke icons). Add new ones here, not inline. */
import type { SVGProps } from "react";

const Svg = (props: SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" width={18} height={18} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden {...props} />
);

export const PlusIcon = () => <Svg><path d="M12 5v14M5 12h14" /></Svg>;
export const MinusIcon = () => <Svg><path d="M5 12h14" /></Svg>;
export const ResetIcon = () => <Svg><path d="M4 12a8 8 0 1 0 2.3-5.7M4 4v4h4" /></Svg>;
export const BackIcon = () => <Svg><path d="m15 18-6-6 6-6" /></Svg>;
export const CloseIcon = () => <Svg><path d="M18 6 6 18M6 6l12 12" /></Svg>;
export const FilterIcon = () => <Svg><path d="M3 5h18M6 12h12M10 19h4" /></Svg>;
export const SearchIcon = () => <Svg><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></Svg>;
export const ChevronIcon = () => <Svg width={14} height={14}><path d="m9 18 6-6-6-6" /></Svg>;
