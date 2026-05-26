import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Copy, Download, Trash2, GitCompareArrows } from "lucide-react";
import { Range } from "@/components/ui/slider";
import { useFontStore, type FontItem } from "@/store/font-store";
import { humanSize } from "@/lib/font-utils";
import { toast } from "sonner";
import { Button } from "../ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";
import { Separator } from "../ui/separator";

interface Props {
  font: FontItem;
  onOpen: (id: string) => void;
}

export function FontCard({ font, onOpen }: Props) {
  const {
    previewText: globalPreviewText,
    fontSize: globalFontSize,
    lineHeight: globalLineHeight,
    letterSpacing: globalLetterSpacing,
    weight: globalWeight,
    align,
  } = useFontStore();
  const [localPreviewText, setLocalPreviewText] = useState<string>(
    font.originalName,
  );
  const [localFontSize, setLocalFontSize] = useState<number>(globalFontSize);
  const [localWeight, setLocalWeight] = useState<number>(globalWeight);
  const [localLineHeight, setLocalLineHeight] =
    useState<number>(globalLineHeight);
  const [localLetterSpacing, setLocalLetterSpacing] =
    useState<number>(globalLetterSpacing);
  const remove = useFontStore((s) => s.remove);
  const download = useFontStore((s) => s.downloadFont);
  const toggleSelected = useFontStore((s) => s.toggleSelected);
  const selected = useFontStore((s) => s.selected.includes(font.id));
  const loadFontOnDemand = useFontStore((s) => s.loadFontOnDemand);

  useEffect(() => {
    loadFontOnDemand(font.id);
  }, [font.id, loadFontOnDemand]);

  const sample = localPreviewText || font.originalName;
  const baseSize = localFontSize;
  const previewHeight = 140;

  function copyName() {
    navigator.clipboard.writeText(font.originalName);
    toast.success("Font name copied");
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.5 }}
      className={`group relative overflow-hidden rounded-2xl border border-border bg-card transition-shadow hover:shadow-float ${
        selected ? "ring-2 ring-foreground" : ""
      }`}
    >
      {/* Preview area — fixed height, text clipped */}
      <div onClick={() => onOpen(font.id)} className="block w-full text-left">
        <div
          className="relative overflow-hidden px-5 py-5"
          style={{ height: previewHeight }}
        >
          {/* Fade-out mask at the bottom */}
          <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-10 bg-linear-to-t from-card to-transparent" />
          <span
            className="block leading-tight"
            style={{
              fontFamily: `'${font.family}', system-ui`,
              fontSize: baseSize,
              lineHeight: localLineHeight,
              letterSpacing: `${localLetterSpacing}px`,
              fontWeight: localWeight,
              textAlign: align,
              fontFeatureSettings: "normal",
              fontVariationSettings: "normal",
            }}
          >
            {sample}
          </span>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between border-t border-border px-4 py-2.5">
        <div className="min-w-0 mr-2">
          <div className="truncate text-base font-semibold leading-tight">
            {font.originalName}
          </div>
          <div className="text-sm text-muted-foreground">
            {font.format.toUpperCase()} · {humanSize(font.size)}
          </div>
        </div>
        <div className="flex-1 ml-4">
          <div className="mb-2">
            <input
              value={localPreviewText}
              onChange={(e) => setLocalPreviewText(e.target.value)}
              placeholder="Type to preview"
              className="w-full rounded-sm border border-border bg-background px-2 py-1 text-sm outline-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Range
              value={localFontSize}
              min={12}
              max={200}
              step={1}
              suffix="px"
              onChange={(v) => setLocalFontSize(v)}
            />
            <Range
              value={localWeight}
              min={100}
              max={900}
              step={100}
              onChange={(v) => setLocalWeight(v)}
            />
            <Range
              value={localLineHeight}
              min={0.8}
              max={3}
              step={0.05}
              onChange={(v) => setLocalLineHeight(v)}
            />
            <Range
              value={localLetterSpacing}
              min={-5}
              max={20}
              step={0.1}
              suffix="px"
              onChange={(v) => setLocalLetterSpacing(v)}
            />
          </div>
        </div>

        <TooltipProvider delayDuration={200}>
          <div className="flex shrink-0 items-center gap-0.5">
            <IconBtn label="Compare" onClick={() => toggleSelected(font.id)}>
              <GitCompareArrows size={16} />
            </IconBtn>
            <IconBtn label="Copy name" onClick={copyName}>
              <Copy size={16} />
            </IconBtn>
            <IconBtn label="Download" onClick={() => download(font.id)}>
              <Download size={16} />
            </IconBtn>
            <Separator orientation="vertical" className="h-4 mx-1" />
            <IconBtn label="Delete" onClick={() => remove(font.id)}>
              <Trash2 size={16} />
            </IconBtn>
          </div>
        </TooltipProvider>
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
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          size="icon"
          variant="outline"
          onClick={(e) => {
            e.stopPropagation();
            onClick();
          }}
          className="rounded-md text-muted-foreground transition hover:bg-accent hover:text-foreground"
        >
          {children}
        </Button>
      </TooltipTrigger>
      <TooltipContent side="top" sideOffset={6} className="text-xs">
        <p>{label}</p>
      </TooltipContent>
    </Tooltip>
  );
}
