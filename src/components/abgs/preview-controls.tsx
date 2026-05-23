import { useCallback } from "react";
import { useFontStore } from "@/store/font-store";
import {
  AlignLeft,
  AlignCenter,
  AlignRight,
  RotateCcw,
  Languages,
} from "lucide-react";
import { Range } from "@/components/ui/slider";
import { Button } from "../ui/button";

export function PreviewControls() {
  const previewText = useFontStore((s) => s.previewText);
  const fontSize = useFontStore((s) => s.fontSize);
  const weight = useFontStore((s) => s.weight);
  const lineHeight = useFontStore((s) => s.lineHeight);
  const letterSpacing = useFontStore((s) => s.letterSpacing);
  const align = useFontStore((s) => s.align);
  const set = useFontStore((s) => s.set);
  const resetPreview = useFontStore((s) => s.resetPreview);

  const previewTextOptions = [
    "The quick brown fox jumps over the lazy dog",
    "សត្វកញ្ជ្រោងពណ៌ត្នោតរហ័សរហួន លោតរំលងពីលើសត្វឆ្កែដ៏ខ្ជិល",
  ];

  const shufflePreview = useCallback(() => {
    const currentIndex = previewTextOptions.indexOf(previewText);
    const nextIndex = currentIndex === 0 ? 1 : 0;
    set({ previewText: previewTextOptions[nextIndex] });
  }, [previewText, previewTextOptions, set]);

  const setAlign = useCallback(
    (v: "left" | "center" | "right") => set({ align: v }),
    [set],
  );

  return (
    <div className="mx-auto mb-6 max-w-7xl px-4">
      <div className="rounded-2xl bg-card p-4 shadow-soft">
        <div className="relative mb-6 flex items-end gap-2">
          <div className="flex-1">
            <textarea
              value={previewText}
              onChange={(e) => set({ previewText: e.target.value })}
              placeholder="Type something to preview…"
              className="peer w-full resize-none bg-transparent px-0 pb-3 pt-1 text-lg leading-relaxed text-foreground placeholder:text-muted-foreground outline-none"
              rows={2}
            />
            <span className="absolute bottom-0 left-0 h-px w-full rounded-full bg-border" />
            <span className="absolute bottom-0 left-0 h-px w-0 bg-primary transition-all duration-300 ease-out peer-focus:w-full" />
          </div>
          <Button
            size="icon"
            variant="default"
            onClick={shufflePreview}
            className="mb-2"
            title="Shuffle preview text"
          >
            <Languages size={16} />
          </Button>
          <Button
            variant="destructive"
            onClick={resetPreview}
            className="mb-2"
            title="Reset to defaults"
          >
            <RotateCcw size={16} />
            Reset
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-7 md:grid-cols-5">
          <Range
            label="Size"
            value={fontSize}
            min={12}
            max={200}
            step={1}
            suffix="px"
            onChange={(v) => set({ fontSize: v })}
          />
          <Range
            label="Weight"
            value={weight}
            min={100}
            max={900}
            step={100}
            onChange={(v) => set({ weight: v })}
          />
          <Range
            label="Line height"
            value={lineHeight}
            min={0.8}
            max={3}
            step={0.05}
            onChange={(v) => set({ lineHeight: v })}
          />
          <Range
            label="Letter spacing"
            value={letterSpacing}
            min={-5}
            max={20}
            step={0.1}
            suffix="px"
            onChange={(v) => set({ letterSpacing: v })}
          />

          <div>
            <label className="mb-1 block text-sm font-medium text-muted-foreground">
              Align
            </label>
            <div className="flex h-9 rounded-lg border border-border bg-background p-1">
              {(
                [
                  { v: "left", I: AlignLeft },
                  { v: "center", I: AlignCenter },
                  { v: "right", I: AlignRight },
                ] as const
              ).map(({ v, I }) => (
                <button
                  key={v}
                  onClick={() => setAlign(v)}
                  className={`flex flex-1 items-center justify-center rounded-md transition ${
                    align === v
                      ? "bg-foreground text-background"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <I className="h-4 w-4" />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
