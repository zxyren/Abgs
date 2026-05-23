import { useFontStore } from "@/store/font-store";
import { AlignLeft, AlignCenter, AlignRight } from "lucide-react";
import { Range } from "@/components/ui/slider";

export function PreviewControls() {
  const s = useFontStore();
  return (
    <div className="mx-auto mb-6 max-w-7xl px-4">
      <div className="rounded-2xl bg-card p-4 shadow-soft">
        <div className="relative mb-6">
          <textarea
            value={s.previewText}
            onChange={(e) => s.set({ previewText: e.target.value })}
            placeholder="Type something to preview…"
            className="peer w-full resize-none bg-transparent px-0 pb-3 pt-1 text-lg leading-relaxed text-foreground placeholder:text-muted-foreground outline-none"
            rows={2}
          />
          <span className="absolute bottom-0 left-0 h-px rounded-full w-full bg-border" />
          <span className="absolute bottom-0 left-0 h-px w-0 bg-primary transition-all duration-300 ease-out peer-focus:w-full" />
        </div>
        <div className="grid grid-cols-2 gap-7 md:grid-cols-5">
          <Range
            label="Size"
            value={s.fontSize}
            min={12}
            max={200}
            step={1}
            suffix="px"
            onChange={(v) => s.set({ fontSize: v })}
          />
          <Range
            label="Weight"
            value={s.weight}
            min={100}
            max={900}
            step={100}
            onChange={(v) => s.set({ weight: v })}
          />
          <Range
            label="Line height"
            value={s.lineHeight}
            min={0.8}
            max={3}
            step={0.05}
            onChange={(v) => s.set({ lineHeight: v })}
          />
          <Range
            label="Letter spacing"
            value={s.letterSpacing}
            min={-5}
            max={20}
            step={0.1}
            suffix="px"
            onChange={(v) => s.set({ letterSpacing: v })}
          />
          <div>
            <div className="mb-1 flex items-center justify-between">
              <label className="text-sm font-medium text-muted-foreground">
                Align
              </label>
            </div>
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
                  onClick={() => s.set({ align: v })}
                  className={`flex flex-1 items-center justify-center rounded-md transition ${
                    s.align === v
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
