"use client";

import { useId } from "react";

type DenoiseSliderProps = {
  value: number;
  onChange: (value: number) => void;
  disabled?: boolean;
  min?: number;
  max?: number;
};

export function DenoiseSlider({
  value,
  onChange,
  disabled = false,
  min = 0,
  max = 100,
}: DenoiseSliderProps) {
  const id = useId();

  return (
    <div className="flex w-full flex-col gap-2 rounded border-2 border-[var(--aitelier-border)] bg-[var(--aitelier-surface)] px-3 py-3">
      <div className="flex items-baseline justify-between gap-2">
        <label
          htmlFor={id}
          className="font-unifont shrink-0 text-sm text-[var(--aitelier-text)]"
          style={{ letterSpacing: "0.1em" }}
        >
          去噪强度
        </label>
        <span
          className="font-unifont tabular-nums text-sm text-[var(--aitelier-text-muted)]"
          style={{ letterSpacing: "0.06em" }}
        >
          {value}
        </span>
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(Number(e.target.value))}
        className="h-10 w-full cursor-pointer accent-[var(--aitelier-text)] disabled:cursor-not-allowed disabled:opacity-50"
      />
    </div>
  );
}
