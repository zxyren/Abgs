import {
  useFontStore,
  clearAllStorage,
  type SortKey,
} from "@/store/font-store";
import { Search, Sun, Moon, Trash2, Paperclip } from "lucide-react";
import { Button } from "../ui/button";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { isFontFile } from "@/lib/font-utils";
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

export function Navbar() {
  const s = useFontStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);

  useEffect(() => {
    if (!confirmClear) return;
    const timeout = window.setTimeout(() => setConfirmClear(false), 3000);
    return () => window.clearTimeout(timeout);
  }, [confirmClear]);

  const handleFilesSelected = async (files: FileList | null) => {
    if (!files) return;
    const fontFiles = Array.from(files).filter((f) => isFontFile(f.name));
    if (!fontFiles.length) return toast.error("No supported font files found");
    setLoading(true);
    await s.addFiles(fontFiles);
    setLoading(false);
    toast.success(
      `Loaded ${fontFiles.length} font${fontFiles.length > 1 ? "s" : ""}`,
    );
  };
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

        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".ttf,.otf,.woff,.woff2"
          onChange={(e) => handleFilesSelected(e.target.files)}
          className="hidden"
        />

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
                onClick={() => fileInputRef.current?.click()}
                disabled={loading}
                className="flex h-10 w-10 items-center rounded-sm hover:bg-accent"
              >
                <Paperclip size={16} />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top">Upload fonts</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="icon"
                variant="destructive"
                onClick={async () => {
                  if (!confirmClear) {
                    setConfirmClear(true);
                    toast.warning("Click again to confirm removing all fonts");
                    return;
                  }
                  await clearAllStorage();
                  location.reload();
                }}
                className={`flex h-10 w-10 items-center rounded-sm ${
                  confirmClear
                    ? "border-red-400 text-red-400 hover:bg-red-500/10"
                    : ""
                }`}
              >
                <Trash2 size={16} />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top">
              {confirmClear
                ? "Click again to confirm clearing all fonts"
                : "Clear all fonts"}
            </TooltipContent>
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
                className="relative h-10 w-10 rounded-sm hover:bg-accent transition-transform hover:scale-105 active:scale-95"
              >
                <Sun
                  size={16}
                  className={`absolute inset-0 m-auto transition-all duration-500 ${
                    s.theme === "dark"
                      ? "rotate-0 scale-100 opacity-100"
                      : "rotate-90 scale-0 opacity-0"
                  }`}
                />

                <Moon
                  size={16}
                  className={`absolute inset-0 m-auto transition-all duration-500 ${
                    s.theme === "dark"
                      ? "-rotate-90 scale-0 opacity-0"
                      : "rotate-0 scale-100 opacity-100"
                  }`}
                />
              </Button>
            </TooltipTrigger>

            <TooltipContent side="top">Toggle theme</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
}
