import { LucideIcon } from "lucide-react";
import { useEffect, useState } from "react";

interface SliderProps {
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
  onChangeEnd?: () => void;
  className?: string;
}

export function Slider({
  value,
  min,
  max,
  step,
  onChange,
  onChangeEnd,
  className = "",
}: SliderProps) {
  const percent = ((value - min) / (max - min)) * 100;

  return (
    <div className={`relative flex h-9 w-full items-center ${className}`}>
      <div className="bg-border/40 relative h-0.5 w-full rounded-full">
        <div
          className="bg-foreground absolute top-0 left-0 h-full rounded-full"
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
        onPointerUp={onChangeEnd}
        className="absolute inset-0 h-full w-full cursor-grab opacity-0"
      />

      <div
        className="bg-popover border-foreground pointer-events-none absolute top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 shadow-sm"
        style={{ left: `${percent}%` }}
      />
    </div>
  );
}

interface RangeProps {
  icon?: LucideIcon;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
  onChangeEnd?: () => void;
  suffix?: string;
}

export function Range({
  icon: Icon,
  value,
  min,
  max,
  step,
  onChange,
  onChangeEnd,
  suffix = "",
}: RangeProps) {
  // Own the live value here so both the label and thumb update every drag tick
  const [localValue, setLocalValue] = useState(value);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  function handleChange(v: number) {
    setLocalValue(v);
    onChange(v);
  }

  const display = Number.isInteger(step)
    ? localValue.toString()
    : localValue.toFixed(step < 0.1 ? 2 : 1);

  return (
    <div>
      <div className="mb-1 flex items-center justify-between">
        {Icon && <Icon className="text-muted-foreground" size={23} />}
        <span className="text-foreground text-sm font-semibold tabular-nums">
          {display}
          {suffix}
        </span>
      </div>
      <Slider
        value={localValue}
        min={min}
        max={max}
        step={step}
        onChange={handleChange}
        onChangeEnd={onChangeEnd}
      />
    </div>
  );
}
