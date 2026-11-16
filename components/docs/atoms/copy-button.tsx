"use client";

import { useState } from "react";
import { cx } from "../../ui";
import { CheckIcon, CopyIcon } from "../../ui/icons";

/** Copies `text` to the clipboard; shows "Copied" for a moment. */
export function CopyButton({ text, className }: { text: string; className?: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () =>
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    });
  return (
    <button
      type="button"
      onClick={copy}
      aria-label={copied ? "Copied" : "Copy code"}
      className={cx("inline-flex items-center gap-1 rounded-md bg-white/10 px-2 py-1 text-xs text-white/80 hover:bg-white/20", className)}
    >
      {copied ? <CheckIcon /> : <CopyIcon />}
      {copied ? "Copied" : "Copy"}
    </button>
  );
}
