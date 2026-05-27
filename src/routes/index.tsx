import { useEffect, useMemo, useState } from "react";
import Fuse from "fuse.js";
import { AnimatePresence, motion } from "framer-motion";
import { Toaster } from "@/components/ui/sonner";
import { useFontStore } from "@/store/font-store";
import { Navbar } from "@/components/abgs/navbar";
import { toast } from "sonner";
import { isFontFile } from "@/lib/font-utils";
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
  const [isDragging, setIsDragging] = useState(false);

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

  // Global drag and drop handler
  useEffect(() => {
    const handleDragOver = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(true);
    };

    const handleDragLeave = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (e.target === document || e.target === window) {
        setIsDragging(false);
      }
    };

    const handleDrop = async (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      const files = e.dataTransfer?.files;
      if (!files) return;

      const fontFiles = Array.from(files).filter((f) => isFontFile(f.name));
      if (!fontFiles.length) {
        toast.error("No supported font files found");
        return;
      }

      await s.addFiles(fontFiles);
      toast.success(
        `Loaded ${fontFiles.length} font${fontFiles.length > 1 ? "s" : ""}`,
      );
    };

    window.addEventListener("dragover", handleDragOver);
    window.addEventListener("dragleave", handleDragLeave);
    window.addEventListener("drop", handleDrop);

    return () => {
      window.removeEventListener("dragover", handleDragOver);
      window.removeEventListener("dragleave", handleDragLeave);
      window.removeEventListener("drop", handleDrop);
    };
  }, [s]);

  const gridClass = "grid-cols-1";

  if (!hydrated) {
    return <div className="min-h-screen bg-background pb-32" />;
  }

  return (
    <div className="min-h-screen bg-background pb-32">
      <AnimatePresence>
        {isDragging && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm flex items-center justify-center pointer-events-none"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="text-center text-white"
            >
              <p className="text-xl font-semibold">Drop your fonts here</p>
              <p className="text-sm text-white/80 mt-2">
                Supported formats: TTF, OTF, WOFF, WOFF2
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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

      {/* <div className="pt-4 sticky top-0 z-10"> */}
      <Navbar />
      {/* </div> */}

      <div className="w-full px-4 pt-8">
        {s.fonts.length === 0 ? (
          <div className="flex items-center justify-center max-h-screen">
            <div className="text-center">
              <h1 className="text-balance text-5xl font-semibold tracking-tight md:text-6xl">
                Upload fonts to preview
              </h1>
              <p className="mx-auto mt-4 max-w-2xl text-balance text-xl text-muted-foreground">
                Click the upload button in the{" "}
                <span className="text-foreground">navbar</span> or{" "}
                <span className="text-foreground">drag and drop</span> files
                here to import your fonts and start previewing them.
              </p>
            </div>
          </div>
        ) : (
          <>
            <div className="w-full px-4">
              <div className="mb-3 flex items-end justify-between">
                <h2 className="text-sm text-muted-foreground">
                  {visible.length} of {s.fonts.length} font
                  {s.fonts.length === 1 ? "" : "s"}
                </h2>
              </div>
              <div className={`grid ${gridClass}`}>
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
