import { useState, useEffect, useCallback } from "react";
import TopBar from "./components/TopBar";
import Sidebar, { type View, type Schema } from "./components/Sidebar";
import DataTable from "./components/DataTable";
import QueryConsole from "./components/QueryConsole";
import { runQuery, checkHealth, isNode, isEdge, type QueryResult } from "./api";

export default function App() {
  const [connected, setConnected] = useState(false);
  const [schema, setSchema] = useState<Schema>({
    labels: new Map(),
    edgeTypes: new Map(),
  });
  const [view, setView] = useState<View>({ kind: "query" });
  const [tableData, setTableData] = useState<QueryResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const discoverSchema = useCallback(async () => {
    try {
      const [nodeResult, edgeResult] = await Promise.all([
        runQuery("MATCH (n) RETURN n"),
        runQuery("MATCH (a)-[e]->(b) RETURN e"),
      ]);

      const labels = new Map<string, number>();
      for (const row of nodeResult.rows ?? []) {
        const val = Object.values(row)[0];
        if (isNode(val)) {
          for (const l of val.labels) {
            labels.set(l, (labels.get(l) ?? 0) + 1);
          }
        }
      }

      const edgeTypes = new Map<string, number>();
      for (const row of edgeResult.rows ?? []) {
        const val = Object.values(row)[0];
        if (isEdge(val)) {
          edgeTypes.set(val.type, (edgeTypes.get(val.type) ?? 0) + 1);
        }
      }

      setSchema({ labels, edgeTypes });
    } catch {
      // DB might be empty or unreachable
    }
  }, []);

  const ping = useCallback(async () => {
    try {
      await checkHealth();
      setConnected(true);
    } catch {
      setConnected(false);
    }
  }, []);

  const refresh = useCallback(async () => {
    await ping();
    await discoverSchema();
  }, [ping, discoverSchema]);

  useEffect(() => {
    refresh();
    const id = setInterval(ping, 10_000);
    return () => clearInterval(id);
  }, [refresh, ping]);

  useEffect(() => {
    if (view.kind === "query") {
      setTableData(null);
      setError(null);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    const cypher =
      view.kind === "nodes"
        ? `MATCH (n:${view.label}) RETURN n`
        : `MATCH (a)-[e:${view.edgeType}]->(b) RETURN e`;

    runQuery(cypher)
      .then((data) => !cancelled && setTableData(data))
      .catch((e) => !cancelled && setError(e instanceof Error ? e.message : String(e)))
      .finally(() => !cancelled && setLoading(false));

    return () => {
      cancelled = true;
    };
  }, [view]);

  const viewTitle =
    view.kind === "nodes"
      ? view.label
      : view.kind === "edges"
        ? view.edgeType
        : "";

  return (
    <div className="h-screen flex flex-col">
      <TopBar connected={connected} onRefresh={refresh} />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar schema={schema} view={view} onViewChange={setView} />
        <main className="flex-1 overflow-hidden bg-neutral-950">
          {view.kind === "query" ? (
            <QueryConsole />
          ) : loading ? (
            <div className="flex items-center justify-center h-full">
              <svg
                className="animate-spin h-5 w-5 text-neutral-600"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
            </div>
          ) : error ? (
            <div className="p-4">
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-xs text-red-400 font-mono">
                {error}
              </div>
            </div>
          ) : tableData ? (
            <DataTable
              title={viewTitle}
              data={tableData}
              kind={view.kind === "nodes" ? "nodes" : "edges"}
            />
          ) : null}
        </main>
      </div>
    </div>
  );
}
