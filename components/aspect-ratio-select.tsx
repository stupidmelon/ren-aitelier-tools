"use client";

import { useId } from "react";

const OPTIONS = [
  { value: "1:1", label: "1 : 1" },
  { value: "4:3", label: "4 : 3" },
  { value: "3:4", label: "3 : 4" },
  { value: "16:9", label: "16 : 9" },
  { value: "9:16", label: "9 : 16" },
] as const;

export type AspectRatioValue = (typeof OPTIONS)[number]["value"];

type AspectRatioSelectProps = {
  value: AspectRatioValue;
  onChange: (value: AspectRatioValue) => void;
  disabled?: boolean;
};

export function AspectRatioSelect({
  value,
  onChange,
  disabled = false,
}: AspectRatioSelectProps) {
  const id = useId();

  return (
    <div className="flex w-full flex-col gap-2 rounded border-2 border-[var(--aitelier-border)] bg-[var(--aitelier-surface)] px-3 py-3">
      <label
        htmlFor={id}
        className="font-unifont text-sm text-[var(--aitelier-text)]"
        style={{ letterSpacing: "0.1em" }}
      >
        画幅比例
      </label>
      <select
        id={id}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value as AspectRatioValue)}
        className="font-unifont box-border w-full rounded border border-[var(--aitelier-border)] bg-[var(--aitelier-bg)] px-2 py-2.5 text-sm text-[var(--aitelier-text)] outline-none focus-visible:ring-2 focus-visible:ring-[var(--aitelier-border-dark)] disabled:cursor-not-allowed disabled:opacity-50"
        style={{ letterSpacing: "0.08em" }}
      >
        {OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
