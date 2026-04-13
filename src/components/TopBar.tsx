import { RefreshCw, Sun, Moon, Monitor } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { type Theme } from "@/hooks/use-theme";

const themeIcon = { light: Sun, dark: Moon, system: Monitor } as const;
const themeLabel = { light: "Light", dark: "Dark", system: "System" } as const;
const themeCycle: Record<Theme, Theme> = { light: "dark", dark: "system", system: "light" };

type Props = {
  connected: boolean;
  onRefresh: () => void;
  theme: Theme;
  onThemeChange: (t: Theme) => void;
};

export default function TopBar({ connected, onRefresh, theme, onThemeChange }: Props) {
  const Icon = themeIcon[theme];

  return (
    <header className="flex items-center justify-between h-12 px-4 border-b bg-card shrink-0">
      <div className="flex items-center gap-2.5">
        <img src="/logo.svg" alt="Neo4g" width={20} height={20} className="shrink-0" />
        <span className="font-semibold text-sm tracking-wide">
          Neo4g Studio
        </span>
      </div>
      <div className="flex items-center gap-2">
        <Tooltip>
          <TooltipTrigger
            render={
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => onThemeChange(themeCycle[theme])}
              />
            }
          >
            <Icon className="size-3.5" />
          </TooltipTrigger>
          <TooltipContent>{themeLabel[theme]}</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger
            render={<Button variant="ghost" size="icon-sm" onClick={onRefresh} />}
          >
            <RefreshCw className="size-3.5" />
          </TooltipTrigger>
          <TooltipContent>Refresh schema</TooltipContent>
        </Tooltip>
        <Badge
          variant={connected ? "default" : "destructive"}
          className="gap-1.5 font-normal"
        >
          <span
            className={`size-1.5 rounded-full ${connected ? "bg-primary-foreground" : "bg-destructive-foreground"}`}
          />
          {connected ? "Connected" : "Disconnected"}
        </Badge>
      </div>
    </header>
  );
}
