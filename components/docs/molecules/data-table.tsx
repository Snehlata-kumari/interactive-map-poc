import type { ReactNode } from "react";

/** A plain table: header labels + rows of cells. */
export function DataTable({ head, rows }: { head: string[]; rows: ReactNode[][] }) {
  return (
    <div className="overflow-x-auto rounded-control border border-line">
      <table className="w-full text-left text-sm">
        <thead className="bg-surface-muted">
          <tr>{head.map((h) => <th key={h} className="px-3 py-2 font-semibold">{h}</th>)}</tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className="border-t border-line align-top">
              {r.map((c, j) => <td key={j} className="px-3 py-2">{c}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
