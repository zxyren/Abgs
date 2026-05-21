import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, Download, Copy } from "lucide-react";
import { useFontStore } from "@/store/font-store";
import { humanSize } from "@/lib/font-utils";
import { toast } from "sonner";
import { Button } from "../ui/button";

const SPECIMENS = [
  { size: 80, text: "Aa" },
  { size: 64, text: "The quick brown fox" },
  { size: 36, text: "ABCDEFGHIJKLMNOPQRSTUVWXYZ" },
  { size: 28, text: "abcdefghijklmnopqrstuvwxyz" },
  { size: 28, text: "0123456789 !@#$%^&*()" },
];

const GLYPHS = Array.from({ length: 95 }, (_, i) => String.fromCharCode(32 + i));

export function FontDetail({ id, onClose }: { id: string | null; onClose: () => void }) {
  const font = useFontStore((s) => s.fonts.find((f) => f.id === id));
  const { fontSize, weight, lineHeight, letterSpacing, previewText } = useFontStore();
  const download = useFontStore((s) => s.downloadFont);
  const [tab, setTab] = useState<"specimen" | "glyphs" | "info">("specimen");

  useEffect(() => {
    if (id) document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [id]);

  const fam = useMemo(() => (font ? `"${font.family}", system-ui` : ""), [font]);

  return (
    <AnimatePresence>
      {id && font && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/20 backdrop-blur-sm p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.98 }}
            transition={{ type: "spring", damping: 24, stiffness: 260 }}
            onClick={(e) => e.stopPropagation()}
            className="relative flex h-[88vh] w-full max-w-6xl flex-col overflow-hidden rounded-3xl border border-border bg-card shadow-float"
          >
            <div className="flex items-center justify-between border-b border-border px-6 py-4">
              <div className="min-w-0">
                <h2 className="truncate text-lg font-semibold">{font.originalName}</h2>
                <p className="text-xs text-muted-foreground">
                  {font.format.toUpperCase()} · {humanSize(font.size)} · Added{" "}
                  {new Date(font.addedAt).toLocaleString()}
                </p>
              </div>
              <div className="flex items-center gap-5">
                <div className="flex items-center gap-1">
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={() => {
                      navigator.clipboard.writeText(font.originalName);
                      toast.success("Copied");
                    }}
                    title="Copy name"
                  >
                    <Copy size={16} />
                  </Button>
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={() => download(font.id)}
                    title="Download"
                  >
                    <Download size={16} />
                  </Button>
                </div>
                <div className="h-6 w-px bg-border" />
                <Button size="icon" variant="destructive" onClick={onClose} title="Close">
                  <X size={16} />
                </Button>
              </div>
            </div>

            <div className="flex gap-1 border-b border-border px-6">
              {[
                { k: "specimen", l: "Specimen" },
                { k: "glyphs", l: "Glyphs" },
                { k: "info", l: "Info" },
              ].map((t) => (
                <button
                  key={t.k}
                  onClick={() => setTab(t.k as any)}
                  className={`relative px-4 cursor-pointer py-3 text-sm transition ${tab === t.k ? "text-foreground" : "text-muted-foreground hover:text-foreground"}`}
                >
                  {t.l}
                  {tab === t.k && (
                    <motion.div
                      layoutId="tab"
                      className="absolute inset-x-3 -bottom-px h-0.5 bg-foreground"
                    />
                  )}
                </button>
              ))}
            </div>

            <div className="flex-1 overflow-auto p-8">
              {tab === "specimen" && (
                <div
                  className="space-y-10"
                  style={{
                    fontFamily: fam,
                    fontWeight: weight,
                    lineHeight,
                    letterSpacing: `${letterSpacing}px`,
                  }}
                >
                  {SPECIMENS.map((s, i) => (
                    <div
                      key={i}
                      style={{ fontSize: s.size }}
                      className="wrap-break-word border-b border-border pt-6"
                    >
                      {s.text}
                    </div>
                  ))}
                </div>
              )}
              {tab === "glyphs" && (
                <div
                  className="grid grid-cols-8 gap-2 sm:grid-cols-12 md:grid-cols-16"
                  style={{ fontFamily: fam }}
                >
                  {GLYPHS.map((g, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        navigator.clipboard.writeText(g);
                        toast.success(`Copied ${g}`);
                      }}
                      className="flex aspect-square items-center justify-center rounded-lg border border-border bg-background text-2xl transition hover:border-foreground/40 hover:bg-accent"
                    >
                      {g}
                    </button>
                  ))}
                </div>
              )}
              {tab === "info" && (
                <dl className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
                  <Info k="File name" v={font.originalName} />
                  <Info k="Family (internal)" v={font.family} />
                  <Info k="Format" v={font.format.toUpperCase()} />
                  <Info k="Size" v={humanSize(font.size)} />
                  <Info k="Added" v={new Date(font.addedAt).toLocaleString()} />
                </dl>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Info({ k, v }: { k: string; v: string }) {
  return (
    <div className="rounded-xl border border-border bg-background p-4">
      <dt className="text-xs uppercase tracking-wide text-muted-foreground">{k}</dt>
      <dd className="mt-1 break-all font-medium">{v}</dd>
    </div>
  );
}
