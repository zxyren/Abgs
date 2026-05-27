import { useCallback, useEffect, useRef, useState } from "react";
import {
  Copy,
  Download,
  Trash2,
  GitCompareArrows,
  RotateCcw,
  ALargeSmall,
  Bold,
  MoveHorizontal,
  Maximize2,
  MoveVertical,
} from "lucide-react";
import { useFontStore, type FontItem } from "@/store/font-store";
import { cleanFontName } from "@/lib/clean-font-name";
import {
  applyPreviewWeight,
  humanSize,
  previewWeightStyles,
} from "@/lib/font-utils";
import { toast } from "sonner";
import { Button } from "../ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";
import { Separator } from "../ui/separator";
import { Range } from "@/components/ui/slider";

interface Props {
  font: FontItem;
  onOpen: (id: string) => void;
}

export function FontCard({ font, onOpen }: Props) {
  const {
    fontSize: globalFontSize,
    lineHeight: globalLineHeight,
    letterSpacing: globalLetterSpacing,
    weight: globalWeight,
    align,
  } = useFontStore();

  const remove = useFontStore((s) => s.remove);
  const download = useFontStore((s) => s.downloadFont);
  const toggleSelected = useFontStore((s) => s.toggleSelected);
  const selected = useFontStore((s) => s.selected.includes(font.id));
  const loadFontOnDemand = useFontStore((s) => s.loadFontOnDemand);

  useEffect(() => {
    loadFontOnDemand(font.id);
  }, [font.id, loadFontOnDemand]);

  // ── Live values as refs (no re-render on drag) ──────────────────────────
  const liveRef = useRef({
    fontSize: globalFontSize,
    weight: globalWeight,
    lineHeight: globalLineHeight,
    letterSpacing: globalLetterSpacing,
  });

  // State is only used to trigger a re-render when slider is released
  const [committed, setCommitted] = useState({ ...liveRef.current });

  const defaultPreview = cleanFontName(font.originalName);
  const previewTextRef = useRef(defaultPreview);
  const [previewText, _setPreviewText] = useState(defaultPreview);
  const setPreviewText = (v: string) => {
    previewTextRef.current = v;
    _setPreviewText(v);
  };

  const globalPreview = useFontStore((s) => s.previewText);
  const globalActive = useFontStore((s) => s.globalPreviewActive);
  const displayedPreviewText =
    globalActive && globalPreview.trim() !== "" ? globalPreview : previewText;
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const applyStyle = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    const { fontSize, weight, lineHeight, letterSpacing } = liveRef.current;
    el.style.fontSize = `${fontSize}px`;
    applyPreviewWeight(el, font.metadata, weight);
    el.style.lineHeight = String(lineHeight);
    el.style.letterSpacing = `${letterSpacing}px`;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, [font.metadata]);

  // Auto-resize on text change
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, [displayedPreviewText]);

  function makeLiveHandler(key: keyof typeof liveRef.current) {
    return (v: number) => {
      liveRef.current[key] = v;
      applyStyle();
    };
  }

  function makeCommitHandler(key: keyof typeof liveRef.current) {
    return () => setCommitted({ ...liveRef.current });
  }

  function resetSettings() {
    liveRef.current = {
      fontSize: globalFontSize,
      weight: globalWeight,
      lineHeight: globalLineHeight,
      letterSpacing: globalLetterSpacing,
    };
    applyStyle();
    setCommitted({ ...liveRef.current });
    setPreviewText(defaultPreview);
  }

  function copyName() {
    navigator.clipboard.writeText(font.originalName);
    toast.success("Font name copied");
  }

  return (
    <div
      className={`w-full relative overflow-hidden hover:border hover:border-foreground border border-border bg-card transition-all duration-100 hover:shadow-float ${
        selected ? "border border-foreground" : ""
      }`}
    >
      {/* ── Top bar: file name + meta + Detail & Reset buttons ── */}
      <div className="flex items-center justify-between px-4 pt-3 pb-1 gap-2">
        <div className="min-w-0">
          <div className="truncate text-sm font-semibold leading-tight">
            {font.originalName}
          </div>
          <div className="text-xs text-muted-foreground mt-0.5">
            {font.format.toUpperCase()} · {humanSize(font.size)}
          </div>
        </div>

        <TooltipProvider delayDuration={200}>
          <div className="flex shrink-0 items-center gap-0.5">
            <IconBtn label="Details" onClick={() => onOpen(font.id)}>
              <Maximize2 size={15} />
            </IconBtn>
            <IconBtn label="Reset settings" onClick={resetSettings}>
              <RotateCcw size={15} />
            </IconBtn>
          </div>
        </TooltipProvider>
      </div>

      {/* ── Editable preview ── */}
      <div className="relative px-4 py-3 min-h-24">
        <textarea
          ref={textareaRef}
          rows={1}
          value={displayedPreviewText}
          onChange={(e) => setPreviewText(e.target.value)}
          placeholder="Type to preview…"
          className="block w-full resize-none overflow-hidden bg-transparent outline-none leading-tight placeholder:opacity-30 cursor-text"
          style={{
            fontFamily: `'${font.family}', system-ui`,
            fontSize: committed.fontSize,
            lineHeight: committed.lineHeight,
            letterSpacing: `${committed.letterSpacing}px`,
            textAlign: align,
            ...previewWeightStyles(font.metadata, committed.weight),
          }}
        />
      </div>

      {/* ── Footer: sliders + action icons ── */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 border-t border-border px-4 py-3">
        {/* Sliders */}
        <div className="flex-1 grid grid-cols-2 gap-x-4 gap-y-2">
          <Range
            value={committed.fontSize}
            min={12}
            max={200}
            step={1}
            icon={ALargeSmall}
            suffix="px"
            onChange={makeLiveHandler("fontSize")}
            onChangeEnd={makeCommitHandler("fontSize")}
          />
          <Range
            value={committed.weight}
            min={100}
            max={900}
            step={1}
            icon={Bold}
            onChange={makeLiveHandler("weight")}
            onChangeEnd={makeCommitHandler("weight")}
          />
          <Range
            value={committed.lineHeight}
            min={0.8}
            max={3}
            step={0.05}
            icon={MoveVertical}
            onChange={makeLiveHandler("lineHeight")}
            onChangeEnd={makeCommitHandler("lineHeight")}
          />
          <Range
            value={committed.letterSpacing}
            min={-5}
            max={20}
            step={0.1}
            icon={MoveHorizontal}
            suffix="px"
            onChange={makeLiveHandler("letterSpacing")}
            onChangeEnd={makeCommitHandler("letterSpacing")}
          />
        </div>

        {/* Action icons */}
        <TooltipProvider delayDuration={200}>
          <div className="flex shrink-0 items-center gap-0.5 self-end sm:self-auto">
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
    </div>
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
