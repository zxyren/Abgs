import { useEffect, useMemo, useState } from "react";
import Fuse from "fuse.js";
import { AnimatePresence } from "framer-motion";
import { Toaster } from "@/components/ui/sonner";
import { useFontStore } from "@/store/font-store";
import { Toolbar } from "@/components/abgs/navbar";
// PreviewControls moved into each FontCard
import { UploadZone } from "@/components/abgs/upload-zone";
import { FontCard } from "@/components/abgs/font-card";
import { FontDetail } from "@/components/abgs/font-detail";
import { CommandPalette } from "@/components/abgs/command-palette";
import { CompareBar, CompareModal } from "@/components/abgs/compare-bar";

export function Index() {
  const s = useFontStore();
  const hydrated = useFontStore((state) => state.hydrated);
  const [openId, setOpenId] = useState<string | null>(null);
  const [compareOpen, setCompareOpen] = useState(false);
  const [visibleCount, setVisibleCount] = useState(40);

  useEffect(() => {
    s.hydrate();
    document.documentElement.classList.toggle("dark", s.theme === "dark");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setVisibleCount(40);
  }, [s.search, s.filterFormat, s.sort]);

  const fuse = useMemo(
    () =>
      new Fuse(s.fonts, {
        keys: ["originalName", "family", "format", "tags"],
        threshold: 0.35,
      }),
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

  const paginatedVisible = useMemo(() => {
    return visible.slice(0, visibleCount);
  }, [visible, visibleCount]);

  useEffect(() => {
    if (visibleCount >= visible.length) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVisibleCount((prev) => Math.min(prev + 40, visible.length));
        }
      },
      { rootMargin: "400px" },
    );

    const el = document.getElementById("sentinel");
    if (el) observer.observe(el);

    return () => observer.disconnect();
  }, [visibleCount, visible.length]);

  const gridClass = "grid-cols-1";

  if (!hydrated) {
    return <div className="min-h-screen bg-background pb-32" />;
  }

  return (
    <div className="min-h-screen bg-background pb-32">
      <Toaster richColors position="top-center" />
      <CommandPalette />
      <FontDetail id={openId} onClose={() => setOpenId(null)} />
      <CompareBar onOpen={() => setCompareOpen(true)} />
      <CompareModal open={compareOpen} onClose={() => setCompareOpen(false)} />

      {s.uploadProgress && (
        <div className="fixed bottom-6 right-6 z-50 max-w-sm rounded-2xl border border-border bg-card p-4 shadow-float animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="flex items-center justify-between gap-8 mb-2">
            <span className="text-sm font-semibold">Importing fonts...</span>
            <span className="text-xs text-muted-foreground">
              {s.uploadProgress.current} of {s.uploadProgress.total}
            </span>
          </div>
          <div className="h-2 w-64 overflow-hidden rounded-full bg-accent">
            <div
              className="h-full bg-primary transition-all duration-300 ease-out"
              style={{
                width: `${(s.uploadProgress.current / s.uploadProgress.total) * 100}%`,
              }}
            />
          </div>
        </div>
      )}

      <div className="pt-4 sticky top-0 z-10">
        <Toolbar />
      </div>

      <div className="w-full px-4 pt-8">
        <div className="mb-10 text-center">
          <p className="mb-2 text-sm text-muted-foreground">
            Typography preview studio
          </p>
          <h1 className="text-balance text-5xl font-semibold tracking-tight md:text-6xl">
            Your fonts, beautifully organized.
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-balance text-muted-foreground">
            Drop a folder. Preview thousands. Compare side-by-side. Abgs runs
            entirely in your browser.
          </p>
        </div>

        <UploadZone />

        {s.fonts.length > 0 && (
          <>
            <div className="w-full px-4">
              <div className="mb-3 flex items-end justify-between">
                <h2 className="text-sm text-muted-foreground">
                  {visible.length} of {s.fonts.length} font
                  {s.fonts.length === 1 ? "" : "s"}
                </h2>
              </div>
              <div className={`grid gap-4 ${gridClass}`}>
                <AnimatePresence mode="popLayout">
                  {paginatedVisible.map((f) => (
                    <FontCard key={f.id} font={f} onOpen={setOpenId} />
                  ))}
                </AnimatePresence>
              </div>

              {visible.length > visibleCount && (
                <div
                  id="sentinel"
                  className="h-10 w-full flex items-center justify-center my-8"
                >
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                </div>
              )}

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
