import { useState, useEffect, useCallback } from "react";
import { Loader2 } from "lucide-react";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useTheme } from "@/hooks/use-theme";
import TopBar from "@/components/TopBar";
import Sidebar, { type View, type Schema } from "@/components/Sidebar";
import DataTable from "@/components/DataTable";
import QueryConsole from "@/components/QueryConsole";
import { runQuery, checkHealth, isNode, isEdge, type QueryResult } from "@/api";

export default function App() {
  const [connected, setConnected] = useState(false);
  const [schema, setSchema] = useState<Schema>({
    labels: new Map(),
    edgeTypes: new Map(),
  });
  const [view, setViewState] = useState<View>(() => parseHash(location.hash));

  const setView = useCallback((v: View) => {
    setViewState(v);
    location.hash = viewToHash(v);
  }, []);

  useEffect(() => {
    const onHashChange = () => setViewState(parseHash(location.hash));
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);
  const [tableData, setTableData] = useState<QueryResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { theme, setTheme } = useTheme();

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
      .catch((e) =>
        !cancelled && setError(e instanceof Error ? e.message : String(e)),
      )
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
    <TooltipProvider>
      <div className="h-screen flex flex-col">
        <TopBar connected={connected} onRefresh={refresh} theme={theme} onThemeChange={setTheme} />
        <div className="flex flex-1 overflow-hidden">
          <Sidebar schema={schema} view={view} onViewChange={setView} />
          <main className="flex-1 overflow-hidden bg-background">
            {view.kind === "query" ? (
              <QueryConsole />
            ) : loading ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="size-5 text-muted-foreground animate-spin" />
              </div>
            ) : error ? (
              <div className="p-4">
                <div className="p-3 rounded-lg border border-destructive/30 bg-destructive/10 text-xs text-destructive font-mono">
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
    </TooltipProvider>
  );
}

function viewToHash(view: View): string {
  if (view.kind === "nodes") return `#/nodes/${encodeURIComponent(view.label)}`;
  if (view.kind === "edges") return `#/edges/${encodeURIComponent(view.edgeType)}`;
  return "#/";
}

function parseHash(hash: string): View {
  const path = hash.replace(/^#\/?/, "");
  const [kind, value] = path.split("/");
  if (kind === "nodes" && value) return { kind: "nodes", label: decodeURIComponent(value) };
  if (kind === "edges" && value) return { kind: "edges", edgeType: decodeURIComponent(value) };
  return { kind: "query" };
}
