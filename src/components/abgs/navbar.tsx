import { useFontStore, type SortKey } from "@/store/font-store";
import { Search, Sun, Moon, Command } from "lucide-react";
import { Button } from "../ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Separator } from "../ui/separator";

const sorts: { key: SortKey; label: string }[] = [
  { key: "recent", label: "Recent" },
  { key: "name", label: "A-Z" },
  { key: "size", label: "Size" },
];

export function Toolbar() {
  const s = useFontStore();
  return (
    <div className="sticky top-0 z-30 mb-6 w-full">
      <div className="glass flex flex-wrap items-center px-4 gap-2 border-b border-foreground/20 p-4 shadow-soft">
        <div className="flex items-center gap-2">
          <img
            src="/logo-tla.png"
            alt="Abgs logo"
            className="h-11 invert w-11 drop-shadow-sm"
          />
        </div>
        <Separator orientation="vertical" className="mx-1 h-6" />

        <div className="relative min-w-50 flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={s.search}
            onChange={(e) => s.set({ search: e.target.value })}
            placeholder="Search fonts…  (⌘K for command palette)"
            className="h-10 rounded-sm border border-border bg-secondary/60 pl-9 pr-3 text-sm outline-none focus:w-sm focus:border-primary/50 focus:bg-background"
          />
        </div>

        <Select
          value={s.sort}
          onValueChange={(v) => s.set({ sort: v as SortKey })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Sort" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {sorts.map((x) => (
                <SelectItem key={x.key} value={x.key}>
                  {`Sort: ${x.label}`}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>

        <Select
          onValueChange={(v) => s.set({ filterFormat: v === "all" ? null : v })}
          defaultValue="all"
        >
          <SelectTrigger>
            <SelectValue placeholder="Format" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="all">All formats</SelectItem>
              {["ttf", "otf", "woff", "woff2", "eot", "ttc", "fon"].map((f) => (
                <SelectItem key={f} value={f}>
                  {f.toUpperCase()}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>

        <TooltipProvider>
          <Separator orientation="vertical" className="mx-1 h-6" />
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="icon"
                variant="outline"
                onClick={() => s.set({ paletteOpen: true })}
                className="flex h-10 w-10 items-center rounded-sm hover:bg-accent"
              >
                <Command size={16} />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top">Command palette</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="icon"
                variant="outline"
                onClick={() => {
                  const next = s.theme === "dark" ? "light" : "dark";
                  s.set({ theme: next });
                  document.documentElement.classList.toggle(
                    "dark",
                    next === "dark",
                  );
                  localStorage.setItem("abgs:theme", next);
                }}
                className="flex h-10 w-10 items-center rounded-sm hover:bg-accent"
                title="Toggle theme"
              >
                {s.theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top">Toggle theme</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
}
