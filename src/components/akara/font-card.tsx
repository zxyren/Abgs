import { motion } from "framer-motion";
import {
  Copy,
  Download,
  Trash2,
  Maximize2,
  GitCompareArrows,
} from "lucide-react";
import { useFontStore, type FontItem } from "@/store/font-store";
import { humanSize } from "@/lib/font-utils";
import { toast } from "sonner";
import { Button } from "../ui/button";

interface Props {
  font: FontItem;
  onOpen: (id: string) => void;
  view: "grid" | "list" | "compact";
}

export function FontCard({ font, onOpen, view }: Props) {
  const { previewText, fontSize, lineHeight, letterSpacing, weight, align } =
    useFontStore();
  const remove = useFontStore((s) => s.remove);
  const download = useFontStore((s) => s.downloadFont);
  const toggleSelected = useFontStore((s) => s.toggleSelected);
  const selected = useFontStore((s) => s.selected.includes(font.id));

  const sample = previewText || font.originalName;
  const baseSize = view === "compact" ? 22 : view === "list" ? 32 : fontSize;
  const previewHeight = view === "compact" ? 90 : view === "list" ? 100 : 160;

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
      {/* Preview area — fixed height, text clipped */}
      <button
        onClick={() => onOpen(font.id)}
        className="block w-full text-left"
      >
        <div
          className="relative overflow-hidden px-5 py-5"
          style={{ height: previewHeight }}
        >
          {/* Fade-out mask at the bottom */}
          <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-10 bg-linear-to-t from-card to-transparent" />
          <span
            className="block leading-tight"
            style={{
              fontFamily: `"${font.family}", system-ui`,
              fontSize: baseSize,
              lineHeight,
              letterSpacing: `${letterSpacing}px`,
              fontWeight: weight,
              textAlign: align,
            }}
          >
            {sample}
          </span>
        </div>
      </button>

      {/* Footer */}
      <div className="flex items-center justify-between border-t border-border px-4 py-2.5">
        <div className="min-w-0 mr-2">
          <div className="truncate text-[13px] font-medium leading-tight">
            {font.originalName}
          </div>
          <div className="text-[11px] text-muted-foreground">
            {font.format.toUpperCase()} · {humanSize(font.size)}
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-0.5">
          <IconBtn label="Compare" onClick={() => toggleSelected(font.id)}>
            <GitCompareArrows className="h-3.5 w-3.5" />
          </IconBtn>
          <IconBtn label="Copy name" onClick={copyName}>
            <Copy className="h-3.5 w-3.5" />
          </IconBtn>
          <IconBtn label="Download" onClick={() => download(font.id)}>
            <Download className="h-3.5 w-3.5" />
          </IconBtn>
          <IconBtn label="Delete" onClick={() => remove(font.id)}>
            <Trash2 className="h-3.5 w-3.5" />
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
    <Button
      size="icon"
      variant="outline"
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      title={label}
      className="rounded-md text-muted-foreground transition hover:bg-accent hover:text-foreground"
    >
      {children}
    </Button>
  );
}
