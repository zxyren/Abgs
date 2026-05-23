import { useFontStore, type ViewMode, type SortKey } from "@/store/font-store";
import {
  type LucideIcon,
  Search,
  LayoutGrid,
  List,
  Rows3,
  Maximize,
  Sun,
  Moon,
  Command,
} from "lucide-react";
import { UploadZone } from "./upload-zone";
import { Button } from "../ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";

const views: { key: ViewMode; icon: LucideIcon; label: string }[] = [
  { key: "grid", icon: LayoutGrid, label: "Grid" },
  { key: "list", icon: List, label: "List" },
  { key: "compact", icon: Rows3, label: "Compact" },
];

const sorts: { key: SortKey; label: string }[] = [
  { key: "recent", label: "Recent" },
  { key: "name", label: "A-Z" },
  { key: "size", label: "Size" },
];

export function Toolbar() {
  const s = useFontStore();
  return (
    <div className="sticky top-4 z-30 mx-auto mb-6 max-w-7xl px-4">
      <div className="glass flex flex-wrap items-center gap-2 rounded-lg border border-border p-4 shadow-soft">
        <div className="flex items-center gap-2">
          <img
            src="/logo.png"
            alt="Abgs logo"
            className="h-11 w-11 drop-shadow-sm"
          />
          <span className="font-semibold tracking-tight">Abgs</span>
        </div>
        <div className="mx-1 h-6 w-px bg-border" />

        <div className="relative min-w-50 flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={s.search}
            onChange={(e) => s.set({ search: e.target.value })}
            placeholder="Search fonts…  (⌘K for command palette)"
            className="h-10 w-full rounded-sm border border-transparent bg-secondary/60 pl-9 pr-3 text-sm outline-none transition focus:border-border focus:bg-background"
          />
        </div>

        <select
          value={s.sort}
          onChange={(e) => s.set({ sort: e.target.value as SortKey })}
          className="h-10 rounded-sm border border-border bg-background px-3 text-sm"
        >
          {sorts.map((x) => (
            <option key={x.key} value={x.key}>
              Sort: {x.label}
            </option>
          ))}
        </select>

        <select
          value={s.filterFormat ?? ""}
          onChange={(e) => s.set({ filterFormat: e.target.value || null })}
          className="h-10 rounded-sm border border-border bg-background px-3 text-sm"
        >
          <option value="">All formats</option>
          {["ttf", "otf", "woff", "woff2", "eot", "ttc", "fon"].map((f) => (
            <option key={f} value={f}>
              {f.toUpperCase()}
            </option>
          ))}
        </select>

        <TooltipProvider>
          <div className="flex h-10 items-center rounded-sm border border-border bg-background p-1">
            {views.map((v) => (
              <Tooltip key={v.key}>
                <TooltipTrigger asChild>
                  <button
                    aria-label={v.label}
                    onClick={() => s.set({ view: v.key })}
                    className={`flex h-8 w-8 items-center justify-center rounded-sm cursor-pointer transition ${
                      s.view === v.key
                        ? "bg-foreground text-background"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <v.icon size={16} />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="top">{v.label}</TooltipContent>
              </Tooltip>
            ))}
          </div>
        </TooltipProvider>

        <Button
          size="icon"
          variant="outline"
          onClick={() => s.set({ paletteOpen: true })}
          title="Command palette"
          className="flex h-10 w-10 items-center rounded-sm hover:bg-accent"
        >
          <Command size={16} />
        </Button>

        <Button
          size="icon"
          variant="outline"
          onClick={() => {
            const next = s.theme === "dark" ? "light" : "dark";
            s.set({ theme: next });
            document.documentElement.classList.toggle("dark", next === "dark");
            localStorage.setItem("abgs:theme", next);
          }}
          className="flex h-10 w-10 items-center rounded-sm hover:bg-accent"
          title="Toggle theme"
        >
          {s.theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
        </Button>
      </div>
    </div>
  );
}
