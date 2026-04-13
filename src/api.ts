export type QueryResult = {
  columns: string[];
  rows: Record<string, unknown>[];
};

export type NodeData = {
  id: number;
  labels: string[];
  properties: Record<string, unknown>;
};

export type EdgeData = {
  id: number;
  type: string;
  source: number;
  target: number;
  properties: Record<string, unknown>;
};

export async function runQuery(
  cypher: string,
  params?: Record<string, unknown>,
): Promise<QueryResult> {
  const res = await fetch("/api/query", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query: cypher, params }),
  });
  const json = await res.json();
  if (json.error) throw new Error(json.error);
  return json.data;
}

export async function checkHealth(): Promise<Record<string, unknown>> {
  const res = await fetch("/api/health");
  if (!res.ok) throw new Error(`Health check failed: ${res.status}`);
  return res.json();
}

export function isNode(v: unknown): v is NodeData {
  return (
    v !== null &&
    typeof v === "object" &&
    "labels" in (v as object) &&
    "properties" in (v as object)
  );
}

export function isEdge(v: unknown): v is EdgeData {
  return (
    v !== null &&
    typeof v === "object" &&
    "type" in (v as object) &&
    "source" in (v as object) &&
    "target" in (v as object)
  );
}
