"use client";

import { useId } from "react";

const OPTIONS = [
  { value: "assets", label: "assets" },
  { value: "backgrounds", label: "backgrounds" },
] as const;

export type SectionOption = (typeof OPTIONS)[number]["value"];

type SectionDropdownProps = {
  value: SectionOption;
  onChange: (value: SectionOption) => void;
  disabled?: boolean;
};

export function SectionDropdown({
  value,
  onChange,
  disabled = false,
}: SectionDropdownProps) {
  const id = useId();

  return (
    <div className="w-full min-w-0 sm:w-52 sm:shrink-0">
      <label htmlFor={id} className="sr-only">
        assets or backgrounds
      </label>
      <select
        id={id}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value as SectionOption)}
        className="font-unifont box-border h-11 w-full cursor-pointer rounded border-2 border-[var(--aitelier-border)] bg-[var(--aitelier-surface)] px-3 text-sm text-[var(--aitelier-text)] shadow-none outline-none focus-visible:ring-2 focus-visible:ring-[var(--aitelier-border-dark)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--aitelier-bg)] disabled:cursor-not-allowed disabled:opacity-50"
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
