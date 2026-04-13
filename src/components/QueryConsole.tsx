import { useState, useCallback } from "react";
import { Play, Loader2 } from "lucide-react";
import { runQuery, type QueryResult } from "@/api";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import DataTable from "./DataTable";

export default function QueryConsole() {
  const [query, setQuery] = useState("MATCH (n) RETURN n");
  const [result, setResult] = useState<QueryResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [elapsed, setElapsed] = useState<number | null>(null);

  const execute = useCallback(async () => {
    if (!query.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);
    const start = performance.now();
    try {
      const data = await runQuery(query.trim());
      setElapsed(performance.now() - start);
      setResult(data);
    } catch (e) {
      setElapsed(performance.now() - start);
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }, [query]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      e.preventDefault();
      execute();
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="shrink-0 p-4 space-y-3">
        <div className="flex items-center gap-3">
          <h2 className="text-sm font-semibold">Query Console</h2>
          {elapsed !== null && (
            <Badge variant="secondary" className="text-[10px] tabular-nums font-mono">
              {elapsed.toFixed(0)}ms
            </Badge>
          )}
        </div>
        <Textarea
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          spellCheck={false}
          className="h-28 font-mono text-xs bg-background resize-y leading-relaxed"
          placeholder="Enter Cypher-lite query..."
        />
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-muted-foreground">
            ⌘+Enter to run
          </span>
          <Button
            onClick={execute}
            disabled={loading || !query.trim()}
            size="sm"
          >
            {loading ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <Play className="size-3.5" />
            )}
            {loading ? "Running..." : "Run Query"}
          </Button>
        </div>
      </div>

      <Separator />

      <div className="flex-1 overflow-auto">
        {error && (
          <div className="m-4 p-3 rounded-lg border border-destructive/30 bg-destructive/10 text-xs text-destructive font-mono whitespace-pre-wrap">
            {error}
          </div>
        )}
        {result && <DataTable title="Results" data={result} kind="raw" />}
        {!result && !error && (
          <div className="flex items-center justify-center h-full text-muted-foreground text-xs">
            Run a query to see results
          </div>
        )}
      </div>
    </div>
  );
}
