interface SliderProps {
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
  className?: string;
}

export function Slider({
  value,
  min,
  max,
  step,
  onChange,
  className = "",
}: SliderProps) {
  const percent = ((value - min) / (max - min)) * 100;

  return (
    <div className={`relative flex h-9 w-full items-center ${className}`}>
      {/* Track background */}
      <div className="relative h-0.5 w-full rounded-full bg-border/40">
        {/* Filled portion */}
        <div
          className="absolute left-0 top-0 h-full rounded-full bg-foreground"
          style={{ width: `${percent}%` }}
        />
      </div>

      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
      />

      {/* Custom thumb */}
      <div
        className="pointer-events-none absolute top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-popover border border-foreground shadow-sm transition-transform duration-75"
        style={{ left: `${percent}%` }}
      />
    </div>
  );
}

import { LucideIcon } from "lucide-react";

interface RangeProps {
  icon?: LucideIcon;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
  suffix?: string;
}

export function Range({
  icon: Icon,
  value,
  min,
  max,
  step,
  onChange,
  suffix = "",
}: RangeProps) {
  const display = Number.isInteger(step)
    ? value.toString()
    : value.toFixed(step < 0.1 ? 2 : 1);

  return (
    <div>
      <div className="mb-1 flex items-center justify-between">
        {Icon && <Icon className="text-muted-foreground" size={23} />}
        <span className="tabular-nums text-sm font-semibold text-foreground">
          {display}
          {suffix}
        </span>
      </div>
      <Slider
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={onChange}
      />
    </div>
  );
}
