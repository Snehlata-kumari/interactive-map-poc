import { Fragment } from "react";
import { Kbd } from "../atoms";

/** Keys pressed together: Alt+Shift+P. */
export function KeyCombo({ keys }: { keys: string[] }) {
  return (
    <span className="whitespace-nowrap">
      {keys.map((k, i) => (
        <Fragment key={k}>
          {i > 0 && "+"}
          <Kbd>{k}</Kbd>
        </Fragment>
      ))}
    </span>
  );
}
