import { useFontStore } from "@/store/font-store";
import { AlignLeft, AlignCenter, AlignRight } from "lucide-react";

export function PreviewControls() {
  const s = useFontStore();
  return (
    <div className="mx-auto mb-6 max-w-7xl px-4">
      <div className="rounded-2xl border border-border bg-card p-4 shadow-soft">
        <input
          value={s.previewText}
          onChange={(e) => s.set({ previewText: e.target.value })}
          placeholder="Type something to preview…"
          className="mb-4 w-full rounded-xl border border-border bg-background px-4 py-3 text-base outline-none focus:border-foreground/40"
        />
        <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
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
            <div className="mb-1.5 flex items-center justify-between">
              <label className="text-xs font-medium text-muted-foreground">Align</label>
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
                  className={`flex flex-1 items-center justify-center rounded-md transition ${s.align === v ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"}`}
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

function Range({
  label,
  value,
  min,
  max,
  step,
  onChange,
  suffix = "",
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
  suffix?: string;
}) {
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between">
        <label className="text-xs font-medium text-muted-foreground">{label}</label>
        <span className="text-xs tabular-nums text-foreground">
          {value}
          {suffix}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="h-9 w-full accent-foreground"
      />
    </div>
  );
}
