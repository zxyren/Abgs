import { motion } from "framer-motion";
import { Copy, Download, Trash2, Maximize2, GitCompareArrows } from "lucide-react";
import { useFontStore, type FontItem } from "@/store/font-store";
import { humanSize } from "@/lib/font-utils";
import { toast } from "sonner";

interface Props {
  font: FontItem;
  onOpen: (id: string) => void;
  view: "grid" | "list" | "compact";
}

export function FontCard({ font, onOpen, view }: Props) {
  const { previewText, fontSize, lineHeight, letterSpacing, weight, align } = useFontStore();
  const remove = useFontStore((s) => s.remove);
  const download = useFontStore((s) => s.downloadFont);
  const toggleSelected = useFontStore((s) => s.toggleSelected);
  const selected = useFontStore((s) => s.selected.includes(font.id));

  const sample = previewText || font.originalName;
  const baseSize = view === "compact" ? 24 : view === "list" ? 36 : fontSize;

  function copyName() {
    navigator.clipboard.writeText(font.originalName);
    toast.success("Font name copied");
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      className={`group relative overflow-hidden rounded-2xl border border-border bg-card transition-shadow hover:shadow-float ${
        selected ? "ring-2 ring-foreground" : ""
      }`}
    >
      <button onClick={() => onOpen(font.id)} className="block w-full text-left">
        <div
          className="overflow-hidden px-6 py-8"
          style={{
            fontFamily: `"${font.family}", system-ui`,
            fontSize: baseSize,
            lineHeight,
            letterSpacing: `${letterSpacing}px`,
            fontWeight: weight,
            textAlign: align,
            minHeight: view === "compact" ? 80 : 140,
          }}
        >
          <span className="block truncate-multiline">{sample}</span>
        </div>
      </button>

      <div className="flex items-center justify-between border-t border-border px-4 py-3">
        <div className="min-w-0">
          <div className="truncate text-sm font-medium">{font.originalName}</div>
          <div className="text-xs text-muted-foreground">
            {font.format.toUpperCase()} · {humanSize(font.size)}
          </div>
        </div>
        <div className="flex items-center gap-0.5 opacity-60 transition-opacity group-hover:opacity-100">
          <IconBtn label="Compare" onClick={() => toggleSelected(font.id)}>
            <GitCompareArrows className="h-4 w-4" />
          </IconBtn>
          <IconBtn label="Copy name" onClick={copyName}>
            <Copy className="h-4 w-4" />
          </IconBtn>
          <IconBtn label="Download" onClick={() => download(font.id)}>
            <Download className="h-4 w-4" />
          </IconBtn>
          <IconBtn label="Expand" onClick={() => onOpen(font.id)}>
            <Maximize2 className="h-4 w-4" />
          </IconBtn>
          <IconBtn label="Delete" onClick={() => remove(font.id)}>
            <Trash2 className="h-4 w-4" />
          </IconBtn>
        </div>
      </div>
    </motion.div>
  );
}

function IconBtn({
  children,
  onClick,
  label,
}: {
  children: React.ReactNode;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      title={label}
      className="rounded-lg p-2 text-muted-foreground transition hover:bg-accent hover:text-foreground"
    >
      {children}
    </button>
  );
}
