import { useState, useCallback } from "react";
import { runQuery, type QueryResult } from "../api";
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
      <div className="shrink-0 border-b border-neutral-800">
        <div className="flex items-center gap-3 px-4 py-2.5">
          <h2 className="text-sm font-semibold">Query Console</h2>
          {elapsed !== null && (
            <span className="text-[10px] text-neutral-500 tabular-nums">
              {elapsed.toFixed(0)}ms
            </span>
          )}
        </div>
        <div className="px-4 pb-3">
          <textarea
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            spellCheck={false}
            className="w-full h-28 bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2.5 text-xs font-mono text-neutral-200 placeholder:text-neutral-600 focus:outline-none focus:border-emerald-500/50 resize-y leading-relaxed"
            placeholder="Enter Cypher-lite query..."
          />
          <div className="flex items-center justify-between mt-2">
            <span className="text-[10px] text-neutral-600">
              ⌘+Enter to run
            </span>
            <button
              onClick={execute}
              disabled={loading || !query.trim()}
              className="px-4 py-1.5 text-xs font-medium bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-md transition-colors cursor-pointer"
            >
              {loading ? "Running..." : "Run Query"}
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        {error && (
          <div className="m-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-xs text-red-400 font-mono whitespace-pre-wrap">
            {error}
          </div>
        )}
        {result && <DataTable title="Results" data={result} kind="raw" />}
        {!result && !error && (
          <div className="flex items-center justify-center h-full text-neutral-600 text-xs">
            Run a query to see results
          </div>
        )}
      </div>
    </div>
  );
}
