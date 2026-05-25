import { AnimatePresence, motion } from "framer-motion";
import { useFontStore, type FontItem } from "@/store/font-store";
import { X } from "lucide-react";
import { Button } from "../ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";

export function CompareBar({ onOpen }: { onOpen: () => void }) {
  const selected = useFontStore((s) => s.selected);
  const fonts = useFontStore((s) => s.fonts);
  const clear = useFontStore((s) => s.clearSelected);
  const items = selected
    .map((id) => fonts.find((f) => f.id === id))
    .filter((item): item is FontItem => item !== undefined);

  return (
    <AnimatePresence>
      {items.length >= 2 && (
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          className="fixed bottom-6 left-1/2 z-40 -translate-x-1/2"
        >
          <div className="glass flex items-center gap-2 rounded-lg border border-foreground/30 p-2 pl-4 shadow-float">
            <span className="text-sm flex gap-1 text-foreground">
              <span className="font-bold">{items.length}</span>
              <span>selected</span>
            </span>
            <Button variant="outline" onClick={onOpen} className="rounded-full">
              Compare
            </Button>
            <Button size="icon" variant="ghost" onClick={clear}>
              <X size={16} />
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function CompareModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const selected = useFontStore((s) => s.selected);
  const fonts = useFontStore((s) => s.fonts);
  const { previewText, fontSize, weight, lineHeight, letterSpacing } =
    useFontStore();
  const items = selected
    .map((id) => fonts.find((f) => f.id === id))
    .filter((item): item is FontItem => item !== undefined);

  return (
    <AnimatePresence>
      {open && items.length >= 2 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/10 p-4 backdrop-blur-xs"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 10, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="flex h-[88vh] w-full max-w-7xl flex-col overflow-hidden rounded-3xl border border-border bg-card shadow-float"
          >
            <div className="flex items-center justify-between border-b border-border px-6 py-4">
              <h2 className="text-lg font-semibold">Side-by-side comparison</h2>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button size="icon" variant="destructive" onClick={onClose}>
                      <X size={16} />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="top">
                    <p>Close</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <div
              className="grid flex-1 gap-4 overflow-auto px-6 pb-6 pt-4"
              style={{
                gridTemplateColumns: `repeat(${Math.min(items.length, 4)}, minmax(0, 1fr))`,
                gridAutoRows: "minmax(0, min-content)",
              }}
            >
              {items.map((f) => (
                <div
                  key={f.id}
                  className="border border-foreground/30 rounded-2xl p-6"
                >
                  <div className="mb-4 text-sm font-semibold text-muted-foreground">
                    {f.originalName}
                  </div>
                  <div
                    style={{
                      fontFamily: `"${f.family}", system-ui`,
                      fontSize,
                      fontWeight: weight,
                      lineHeight,
                      letterSpacing: `${letterSpacing}px`,
                    }}
                  >
                    {previewText}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
