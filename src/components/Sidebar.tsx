export type View =
  | { kind: "nodes"; label: string }
  | { kind: "edges"; edgeType: string }
  | { kind: "query" };

export type Schema = {
  labels: Map<string, number>;
  edgeTypes: Map<string, number>;
};

type Props = {
  schema: Schema;
  view: View;
  onViewChange: (view: View) => void;
};

export default function Sidebar({ schema, view, onViewChange }: Props) {
  return (
    <aside className="w-56 border-r border-neutral-800 bg-neutral-900/30 flex flex-col shrink-0 overflow-y-auto">
      <div className="p-3">
        <button
          onClick={() => onViewChange({ kind: "query" })}
          className={`w-full px-3 py-2 text-xs font-medium rounded-md transition-colors ${
            view.kind === "query"
              ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
              : "bg-neutral-800/80 text-neutral-300 hover:bg-neutral-700 border border-transparent"
          }`}
        >
          ⌘ Query Console
        </button>
      </div>

      <div className="px-3 pt-1">
        <h3 className="text-[10px] font-semibold uppercase tracking-wider text-neutral-500 mb-1.5 px-1">
          Nodes
          <span className="ml-1 text-neutral-600">({schema.labels.size})</span>
        </h3>
        {schema.labels.size === 0 && (
          <p className="text-[11px] text-neutral-600 italic pl-2">
            No nodes yet
          </p>
        )}
        {[...schema.labels.entries()]
          .sort((a, b) => a[0].localeCompare(b[0]))
          .map(([label, count]) => (
            <button
              key={label}
              onClick={() => onViewChange({ kind: "nodes", label })}
              className={`w-full text-left px-2.5 py-1.5 text-xs rounded-md mb-0.5 transition-colors flex items-center justify-between group ${
                view.kind === "nodes" && view.label === label
                  ? "bg-neutral-800 text-neutral-100"
                  : "text-neutral-400 hover:bg-neutral-800/50 hover:text-neutral-200"
              }`}
            >
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-blue-500/70 shrink-0" />
                {label}
              </span>
              <span className="text-neutral-600 text-[10px] tabular-nums">
                {count}
              </span>
            </button>
          ))}
      </div>

      <div className="px-3 pt-4 pb-3">
        <h3 className="text-[10px] font-semibold uppercase tracking-wider text-neutral-500 mb-1.5 px-1">
          Edges
          <span className="ml-1 text-neutral-600">
            ({schema.edgeTypes.size})
          </span>
        </h3>
        {schema.edgeTypes.size === 0 && (
          <p className="text-[11px] text-neutral-600 italic pl-2">
            No edges yet
          </p>
        )}
        {[...schema.edgeTypes.entries()]
          .sort((a, b) => a[0].localeCompare(b[0]))
          .map(([edgeType, count]) => (
            <button
              key={edgeType}
              onClick={() => onViewChange({ kind: "edges", edgeType })}
              className={`w-full text-left px-2.5 py-1.5 text-xs rounded-md mb-0.5 transition-colors flex items-center justify-between group ${
                view.kind === "edges" && view.edgeType === edgeType
                  ? "bg-neutral-800 text-neutral-100"
                  : "text-neutral-400 hover:bg-neutral-800/50 hover:text-neutral-200"
              }`}
            >
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-sm bg-amber-500/70 shrink-0" />
                {edgeType}
              </span>
              <span className="text-neutral-600 text-[10px] tabular-nums">
                {count}
              </span>
            </button>
          ))}
      </div>
    </aside>
  );
}
