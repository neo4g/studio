import { useState } from "react";
import { isNode, isEdge, type QueryResult } from "@/api";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import NodeSheet from "./NodeSheet";

const NODE_REF_COLUMNS = new Set(["source", "target"]);
const NODE_REF_SUFFIXES = [".source", ".target"];

function isNodeRefColumn(col: string): boolean {
  return NODE_REF_COLUMNS.has(col) || NODE_REF_SUFFIXES.some((s) => col.endsWith(s));
}

type Props = {
  title: string;
  data: QueryResult;
  kind: "nodes" | "edges" | "raw";
};

export default function DataTable({ title, data, kind }: Props) {
  const { columns, rows } = flattenData(data, kind);
  const [inspectNodeId, setInspectNodeId] = useState<number | null>(null);

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-3 px-4 py-3 border-b shrink-0">
        <h2 className="text-sm font-semibold">{title}</h2>
        <Badge variant="secondary" className="text-[10px]">
          {rows.length} row{rows.length !== 1 ? "s" : ""}
        </Badge>
      </div>
      <div className="flex-1 overflow-auto">
        {rows.length === 0 ? (
          <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
            No data
          </div>
        ) : (
          <Table>
            <TableHeader className="sticky top-0 z-10 bg-card">
              <TableRow>
                {columns.map((col) => (
                  <TableHead
                    key={col}
                    className="whitespace-nowrap text-xs font-medium"
                  >
                    {col}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row, i) => (
                <TableRow key={i}>
                  {columns.map((col) => (
                    <TableCell
                      key={col}
                      className="font-mono text-[11px] whitespace-nowrap max-w-xs truncate"
                      title={formatCell(row[col])}
                    >
                      {isNodeRefColumn(col) && typeof row[col] === "number" ? (
                        <button
                          onClick={() => setInspectNodeId(row[col] as number)}
                          className="text-primary underline underline-offset-2 decoration-primary/40 hover:decoration-primary cursor-pointer transition-colors"
                        >
                          {row[col] as number}
                        </button>
                      ) : (
                        <CellValue value={row[col]} />
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      <NodeSheet
        nodeId={inspectNodeId}
        onClose={() => setInspectNodeId(null)}
      />
    </div>
  );
}

function CellValue({ value }: { value: unknown }) {
  if (value === null || value === undefined) {
    return <span className="text-muted-foreground/50 italic">null</span>;
  }
  if (typeof value === "boolean") {
    return (
      <Badge variant={value ? "default" : "destructive"} className="text-[10px] h-5">
        {String(value)}
      </Badge>
    );
  }
  if (typeof value === "number") {
    return <span className="text-amber-400">{value}</span>;
  }
  if (typeof value === "string") {
    return <span className="text-primary">{value}</span>;
  }
  if (typeof value === "object") {
    return (
      <span className="text-muted-foreground">{JSON.stringify(value)}</span>
    );
  }
  return <span>{String(value)}</span>;
}

function flattenData(
  data: QueryResult,
  kind: "nodes" | "edges" | "raw",
): { columns: string[]; rows: Record<string, unknown>[] } {
  if (!data.rows || data.rows.length === 0) {
    return { columns: data.columns ?? [], rows: [] };
  }

  if (kind === "nodes") return flattenNodes(data);
  if (kind === "edges") return flattenEdges(data);
  return flattenRaw(data);
}

function flattenNodes(data: QueryResult) {
  const propKeys = new Set<string>();
  for (const row of data.rows) {
    const val = Object.values(row)[0];
    if (isNode(val)) {
      for (const k of Object.keys(val.properties)) propKeys.add(k);
    }
  }

  const sorted = [...propKeys].sort();
  const columns = ["id", ...sorted];
  const rows: Record<string, unknown>[] = [];

  for (const row of data.rows) {
    const val = Object.values(row)[0];
    if (isNode(val)) {
      const flat: Record<string, unknown> = { id: val.id };
      for (const k of sorted) flat[k] = val.properties[k] ?? null;
      rows.push(flat);
    }
  }

  return { columns, rows };
}

function flattenEdges(data: QueryResult) {
  const propKeys = new Set<string>();
  for (const row of data.rows) {
    const val = Object.values(row)[0];
    if (isEdge(val)) {
      for (const k of Object.keys(val.properties)) propKeys.add(k);
    }
  }

  const sorted = [...propKeys].sort();
  const columns = ["id", "source", "target", ...sorted];
  const rows: Record<string, unknown>[] = [];

  for (const row of data.rows) {
    const val = Object.values(row)[0];
    if (isEdge(val)) {
      const flat: Record<string, unknown> = {
        id: val.id,
        source: val.source,
        target: val.target,
      };
      for (const k of sorted) flat[k] = val.properties[k] ?? null;
      rows.push(flat);
    }
  }

  return { columns, rows };
}

function flattenRaw(data: QueryResult) {
  const firstRow = data.rows[0];
  if (!firstRow) return { columns: data.columns, rows: data.rows };

  type ColKind = "node" | "edge" | "scalar";
  const colKinds = new Map<string, ColKind>();
  const nodePropKeys = new Map<string, Set<string>>();
  const edgePropKeys = new Map<string, Set<string>>();

  for (const col of data.columns) {
    const sample = firstRow[col];
    if (isNode(sample)) {
      colKinds.set(col, "node");
      nodePropKeys.set(col, new Set());
    } else if (isEdge(sample)) {
      colKinds.set(col, "edge");
      edgePropKeys.set(col, new Set());
    } else {
      colKinds.set(col, "scalar");
    }
  }

  for (const row of data.rows) {
    for (const col of data.columns) {
      const val = row[col];
      if (colKinds.get(col) === "node" && isNode(val)) {
        const keys = nodePropKeys.get(col)!;
        for (const k of Object.keys(val.properties)) keys.add(k);
      } else if (colKinds.get(col) === "edge" && isEdge(val)) {
        const keys = edgePropKeys.get(col)!;
        for (const k of Object.keys(val.properties)) keys.add(k);
      }
    }
  }

  const columns: string[] = [];
  for (const col of data.columns) {
    const kind = colKinds.get(col);
    if (kind === "node") {
      columns.push(`${col}.id`);
      for (const k of [...nodePropKeys.get(col)!].sort())
        columns.push(`${col}.${k}`);
    } else if (kind === "edge") {
      columns.push(`${col}.id`, `${col}.source`, `${col}.target`);
      for (const k of [...edgePropKeys.get(col)!].sort())
        columns.push(`${col}.${k}`);
    } else {
      columns.push(col);
    }
  }

  const rows: Record<string, unknown>[] = [];
  for (const row of data.rows) {
    const flat: Record<string, unknown> = {};
    for (const col of data.columns) {
      const val = row[col];
      const kind = colKinds.get(col);
      if (kind === "node" && isNode(val)) {
        flat[`${col}.id`] = val.id;
        for (const k of Object.keys(val.properties))
          flat[`${col}.${k}`] = val.properties[k];
      } else if (kind === "edge" && isEdge(val)) {
        flat[`${col}.id`] = val.id;
        flat[`${col}.source`] = val.source;
        flat[`${col}.target`] = val.target;
        for (const k of Object.keys(val.properties))
          flat[`${col}.${k}`] = val.properties[k];
      } else {
        flat[col] = val;
      }
    }
    rows.push(flat);
  }

  return { columns, rows };
}

function formatCell(value: unknown): string {
  if (value === null || value === undefined) return "null";
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}
