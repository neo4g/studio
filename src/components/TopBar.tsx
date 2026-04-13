import { RefreshCw, Hexagon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

type Props = {
  connected: boolean;
  onRefresh: () => void;
};

export default function TopBar({ connected, onRefresh }: Props) {
  return (
    <header className="flex items-center justify-between h-12 px-4 border-b border-border bg-card shrink-0">
      <div className="flex items-center gap-2.5">
        <Hexagon className="h-5 w-5 text-primary fill-primary/15" />
        <span className="font-semibold text-sm tracking-wide">
          Neo4g Studio
        </span>
      </div>
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={onRefresh} className="gap-1.5 text-muted-foreground">
          <RefreshCw className="h-3.5 w-3.5" />
          Refresh
        </Button>
        <Separator orientation="vertical" className="h-5" />
        <div className="flex items-center gap-1.5">
          <div
            className={`w-1.5 h-1.5 rounded-full ${connected ? "bg-primary" : "bg-destructive"}`}
          />
          <Badge variant="outline" className="text-[11px] font-normal py-0 px-1.5 border-border">
            {connected ? "Connected" : "Disconnected"}
          </Badge>
        </div>
      </div>
    </header>
  );
}
