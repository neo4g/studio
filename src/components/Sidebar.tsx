import { CircleDot, ArrowRightLeft, Terminal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

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
    <aside className="w-56 border-r bg-sidebar flex flex-col shrink-0">
      <div className="p-3">
        <Button
          variant={view.kind === "query" ? "default" : "outline"}
          className="w-full justify-start gap-2"
          size="sm"
          onClick={() => onViewChange({ kind: "query" })}
        >
          <Terminal className="size-3.5" />
          Query Console
        </Button>
      </div>

      <Separator />

      <ScrollArea className="flex-1">
        <div className="p-3">
          <h3 className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2 px-1 flex items-center gap-1.5">
            <CircleDot className="size-3" />
            Nodes
            <Badge variant="secondary" className="ml-auto text-[10px] h-4 px-1.5 rounded-sm">
              {schema.labels.size}
            </Badge>
          </h3>
          {schema.labels.size === 0 && (
            <p className="text-[11px] text-muted-foreground/60 italic pl-2">
              No nodes yet
            </p>
          )}
          <div className="space-y-0.5">
            {[...schema.labels.entries()]
              .sort((a, b) => a[0].localeCompare(b[0]))
              .map(([label, count]) => {
                const active = view.kind === "nodes" && view.label === label;
                return (
                  <button
                    key={label}
                    onClick={() => onViewChange({ kind: "nodes", label })}
                    className={cn(
                      "w-full text-left px-2.5 py-1.5 text-xs rounded-md transition-colors flex items-center justify-between cursor-pointer",
                      active
                        ? "bg-accent text-accent-foreground"
                        : "text-muted-foreground hover:bg-accent/50 hover:text-foreground",
                    )}
                  >
                    <span className="flex items-center gap-1.5">
                      <span className="size-2 rounded-full bg-blue-500/70 shrink-0" />
                      {label}
                    </span>
                    <span className="text-[10px] tabular-nums opacity-60">
                      {count}
                    </span>
                  </button>
                );
              })}
          </div>
        </div>

        <Separator className="mx-3 w-auto" />

        <div className="p-3">
          <h3 className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2 px-1 flex items-center gap-1.5">
            <ArrowRightLeft className="size-3" />
            Edges
            <Badge variant="secondary" className="ml-auto text-[10px] h-4 px-1.5 rounded-sm">
              {schema.edgeTypes.size}
            </Badge>
          </h3>
          {schema.edgeTypes.size === 0 && (
            <p className="text-[11px] text-muted-foreground/60 italic pl-2">
              No edges yet
            </p>
          )}
          <div className="space-y-0.5">
            {[...schema.edgeTypes.entries()]
              .sort((a, b) => a[0].localeCompare(b[0]))
              .map(([edgeType, count]) => {
                const active =
                  view.kind === "edges" && view.edgeType === edgeType;
                return (
                  <button
                    key={edgeType}
                    onClick={() => onViewChange({ kind: "edges", edgeType })}
                    className={cn(
                      "w-full text-left px-2.5 py-1.5 text-xs rounded-md transition-colors flex items-center justify-between cursor-pointer",
                      active
                        ? "bg-accent text-accent-foreground"
                        : "text-muted-foreground hover:bg-accent/50 hover:text-foreground",
                    )}
                  >
                    <span className="flex items-center gap-1.5">
                      <span className="size-2 rounded-sm bg-amber-500/70 shrink-0" />
                      {edgeType}
                    </span>
                    <span className="text-[10px] tabular-nums opacity-60">
                      {count}
                    </span>
                  </button>
                );
              })}
          </div>
        </div>
      </ScrollArea>
    </aside>
  );
}
