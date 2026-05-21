import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import Fuse from "fuse.js";
import { AnimatePresence } from "framer-motion";
import { Toaster } from "@/components/ui/sonner";
import { useFontStore } from "@/store/font-store";
import { Toolbar } from "@/components/akara/toolbar";
import { PreviewControls } from "@/components/akara/preview-controls";
import { UploadZone } from "@/components/akara/upload-zone";
import { FontCard } from "@/components/akara/font-card";
import { FontDetail } from "@/components/akara/font-detail";
import { CommandPalette } from "@/components/akara/command-palette";
import { CompareBar, CompareModal } from "@/components/akara/compare-bar";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const s = useFontStore();
  const hydrated = useFontStore((state) => state.hydrated);
  const [openId, setOpenId] = useState<string | null>(null);
  const [compareOpen, setCompareOpen] = useState(false);

  useEffect(() => {
    s.hydrate();
    document.documentElement.classList.toggle("dark", s.theme === "dark");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fuse = useMemo(
    () =>
      new Fuse(s.fonts, { keys: ["originalName", "family", "format", "tags"], threshold: 0.35 }),
    [s.fonts],
  );

  const visible = useMemo(() => {
    let list = s.fonts;
    if (s.search.trim()) list = fuse.search(s.search.trim()).map((r) => r.item);
    if (s.filterFormat) list = list.filter((f) => f.format === s.filterFormat);
    const arr = [...list];
    switch (s.sort) {
      case "name":
        arr.sort((a, b) => a.originalName.localeCompare(b.originalName));
        break;
      case "size":
        arr.sort((a, b) => b.size - a.size);
        break;
      default:
        arr.sort((a, b) => b.addedAt - a.addedAt);
    }
    return arr;
  }, [s.fonts, s.search, s.filterFormat, s.sort, fuse]);

  const gridClass =
    s.view === "list"
      ? "grid-cols-1"
      : s.view === "compact"
        ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
        : s.view === "showcase"
          ? "grid-cols-1"
          : "grid-cols-1 md:grid-cols-2 xl:grid-cols-3";

  if (!hydrated) {
    return <div className="min-h-screen bg-background pb-32" />;
  }

  return (
    <div className="min-h-screen bg-background pb-32">
      <Toaster richColors position="bottom-right" />
      <CommandPalette />
      <FontDetail id={openId} onClose={() => setOpenId(null)} />
      <CompareBar onOpen={() => setCompareOpen(true)} />
      <CompareModal open={compareOpen} onClose={() => setCompareOpen(false)} />

      <div className="pt-4">
        <Toolbar />
      </div>

      <div className="mx-auto max-w-7xl px-4 pt-8">
        <div className="mb-10 text-center">
          <p className="mb-2 text-sm text-muted-foreground">Typography preview studio</p>
          <h1 className="text-balance text-5xl font-semibold tracking-tight md:text-6xl">
            Your fonts, beautifully organized.
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-balance text-muted-foreground">
            Drop a folder. Preview thousands. Compare side-by-side. Akara runs entirely in your
            browser.
          </p>
        </div>

        <UploadZone compact={s.fonts.length > 0} />

        {s.fonts.length === 0 ? (
          <div className="mt-10 grid grid-cols-2 gap-3 text-sm md:grid-cols-4">
            {["Live preview", "Side-by-side", "Glyph viewer", "⌘K palette"].map((x) => (
              <div
                key={x}
                className="rounded-2xl border border-border bg-card px-4 py-3 text-center text-muted-foreground shadow-soft"
              >
                {x}
              </div>
            ))}
          </div>
        ) : (
          <>
            <PreviewControls />
            <div className="mx-auto max-w-7xl px-4">
              <div className="mb-3 flex items-end justify-between">
                <h2 className="text-sm text-muted-foreground">
                  {visible.length} of {s.fonts.length} font{s.fonts.length === 1 ? "" : "s"}
                </h2>
              </div>
              <div className={`grid gap-4 ${gridClass}`}>
                <AnimatePresence mode="popLayout">
                  {visible.map((f) => (
                    <FontCard key={f.id} font={f} onOpen={setOpenId} view={s.view} />
                  ))}
                </AnimatePresence>
              </div>
              {visible.length === 0 && (
                <div className="mt-12 text-center text-sm text-muted-foreground">
                  No fonts match your filters.
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
