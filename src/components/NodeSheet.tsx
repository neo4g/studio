import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { runQuery, isNode, type NodeData } from "@/api";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";

type Props = {
  nodeId: number | null;
  onClose: () => void;
};

export default function NodeSheet({ nodeId, onClose }: Props) {
  const [node, setNode] = useState<NodeData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (nodeId === null) {
      setNode(null);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);
    setNode(null);

    runQuery(`MATCH (n) WHERE id(n) = ${nodeId} RETURN n`)
      .then((data) => {
        if (cancelled) return;
        const val = data.rows?.[0]
          ? Object.values(data.rows[0])[0]
          : null;
        if (isNode(val)) {
          setNode(val);
        } else {
          setError("Node not found");
        }
      })
      .catch((e) => {
        if (!cancelled) setError(e instanceof Error ? e.message : String(e));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [nodeId]);

  return (
    <Sheet open={nodeId !== null} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="right">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            Node {nodeId}
            {node?.labels.map((l) => (
              <Badge key={l} variant="secondary" className="text-[10px]">
                {l}
              </Badge>
            ))}
          </SheetTitle>
          <SheetDescription>
            {node
              ? `${Object.keys(node.properties).length} properties`
              : loading
                ? "Loading..."
                : ""}
          </SheetDescription>
        </SheetHeader>

        <Separator />

        <div className="flex-1 overflow-auto px-4 pb-4">
          {loading && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="size-5 text-muted-foreground animate-spin" />
            </div>
          )}
          {error && (
            <div className="p-3 rounded-lg border border-destructive/30 bg-destructive/10 text-xs text-destructive font-mono">
              {error}
            </div>
          )}
          {node && (
            <div className="space-y-3">
              <div className="space-y-2">
                <div className="flex items-center justify-between py-1.5">
                  <span className="text-xs text-muted-foreground font-medium">
                    id
                  </span>
                  <span className="font-mono text-xs text-amber-400">
                    {node.id}
                  </span>
                </div>
                <Separator />
                {Object.entries(node.properties)
                  .sort(([a], [b]) => a.localeCompare(b))
                  .map(([key, value]) => (
                    <div
                      key={key}
                      className="flex items-start justify-between gap-4 py-1.5"
                    >
                      <span className="text-xs text-muted-foreground font-medium shrink-0">
                        {key}
                      </span>
                      <span className="font-mono text-xs text-right break-all text-primary">
                        {value === null || value === undefined
                          ? "null"
                          : typeof value === "object"
                            ? JSON.stringify(value)
                            : String(value)}
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
