"use client";

import { IconButton } from "../ui";
import { MinusIcon, PlusIcon, ResetIcon } from "../ui/icons";
import { useStage } from "./map-stage";

export function ZoomControls() {
  const { zoomBy, reset, view } = useStage();
  return (
    <div className="absolute end-4 bottom-4 flex flex-col gap-2">
      <IconButton label="Zoom in" onClick={() => zoomBy(1.4)}><PlusIcon /></IconButton>
      <IconButton label="Zoom out" onClick={() => zoomBy(1 / 1.4)} disabled={view.scale <= 1}><MinusIcon /></IconButton>
      <IconButton label="Reset view" onClick={reset} disabled={view.scale <= 1}><ResetIcon /></IconButton>
    </div>
  );
}
