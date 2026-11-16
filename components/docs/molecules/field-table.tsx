import type { ReactNode } from "react";
import { Code } from "../atoms";
import { DataTable } from "./data-table";

/** A reference table whose first column is a field / command / variable name,
 *  shown as code: rows = [name, ...other cells]. */
export function FieldTable({ head, rows }: { head: string[]; rows: [string, ...ReactNode[]][] }) {
  return <DataTable head={head} rows={rows.map(([name, ...rest]) => [<Code key="name">{name}</Code>, ...rest])} />;
}
