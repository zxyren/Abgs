import { useFontStore, type ViewMode, type SortKey } from "@/store/font-store";
import { Search, LayoutGrid, List, Rows3, Maximize, Sun, Moon, Command } from "lucide-react";
import { UploadZone } from "./upload-zone";

const views: { key: ViewMode; icon: any; label: string }[] = [
  { key: "grid", icon: LayoutGrid, label: "Grid" },
  { key: "list", icon: List, label: "List" },
  { key: "compact", icon: Rows3, label: "Compact" },
  { key: "showcase", icon: Maximize, label: "Showcase" },
];

const sorts: { key: SortKey; label: string }[] = [
  { key: "recent", label: "Recent" },
  { key: "name", label: "A–Z" },
  { key: "size", label: "Size" },
];

export function Toolbar() {
  const s = useFontStore();
  return (
    <div className="sticky top-4 z-30 mx-auto mb-6 max-w-7xl px-4">
      <div className="glass flex flex-wrap items-center gap-2 rounded-2xl border border-border p-2 shadow-soft">
        <div className="flex items-center gap-2 pl-2 pr-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-foreground text-background text-xs font-bold">
            A
          </div>
          <span className="text-sm font-semibold tracking-tight">Akara</span>
        </div>
        <div className="mx-1 h-6 w-px bg-border" />

        <div className="relative min-w-50 flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={s.search}
            onChange={(e) => s.set({ search: e.target.value })}
            placeholder="Search fonts…  (⌘K for command palette)"
            className="h-10 w-full rounded-xl border border-transparent bg-secondary/60 pl-9 pr-3 text-sm outline-none transition focus:border-border focus:bg-background"
          />
        </div>

        <select
          value={s.sort}
          onChange={(e) => s.set({ sort: e.target.value as SortKey })}
          className="h-10 rounded-xl border border-border bg-background px-3 text-sm"
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
          className="h-10 rounded-xl border border-border bg-background px-3 text-sm"
        >
          <option value="">All formats</option>
          {["ttf", "otf", "woff", "woff2", "eot", "ttc", "fon"].map((f) => (
            <option key={f} value={f}>
              {f.toUpperCase()}
            </option>
          ))}
        </select>

        <div className="flex h-10 items-center rounded-xl border border-border bg-background p-1">
          {views.map((v) => (
            <button
              key={v.key}
              title={v.label}
              onClick={() => s.set({ view: v.key })}
              className={`flex h-8 w-8 items-center justify-center rounded-lg transition ${
                s.view === v.key
                  ? "bg-foreground text-background"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <v.icon className="h-4 w-4" />
            </button>
          ))}
        </div>

        <button
          onClick={() => s.set({ paletteOpen: true })}
          title="Command palette"
          className="flex h-10 items-center gap-1.5 rounded-xl border border-border bg-background px-3 text-sm hover:bg-accent"
        >
          <Command className="h-4 w-4" />
        </button>

        <button
          onClick={() => {
            const next = s.theme === "dark" ? "light" : "dark";
            s.set({ theme: next });
            document.documentElement.classList.toggle("dark", next === "dark");
            localStorage.setItem("akara:theme", next);
          }}
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-background hover:bg-accent"
          title="Toggle theme"
        >
          {s.theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>

        <UploadZone compact />
      </div>
    </div>
  );
}
