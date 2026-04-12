"use client";

/* eslint-disable @next/next/no-img-element -- matches v0-renaitelier-waitlist homepage pattern */

type TextInputBoxProps = {
  value: string;
  onChange: (value: string) => void;
  id?: string;
  placeholder?: string;
  disabled?: boolean;
};

export function TextInputBox({
  value,
  onChange,
  id = "prompt",
  placeholder = "//输入提示词…",
  disabled = false,
}: TextInputBoxProps) {
  return (
    <div className="w-full">
      <label htmlFor={id} className="sr-only">
        提示词
      </label>
      <div className="relative min-h-[7.5rem] w-full">
        <img
          src="/homepage/enter-email-box.png"
          alt=""
          aria-hidden
          draggable={false}
          className="pointer-events-none absolute inset-0 size-full object-fill select-none"
        />
        <textarea
          id={id}
          name="prompt"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          rows={5}
          placeholder={placeholder}
          className="font-unifont relative z-10 box-border min-h-[7.5rem] w-full resize-y border-none bg-transparent px-4 py-3 text-base leading-normal outline-none [color:var(--aitelier-text)] placeholder:[color:var(--aitelier-placeholder)] focus-visible:ring-2 focus-visible:ring-[var(--aitelier-border-dark)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--aitelier-bg)] disabled:cursor-not-allowed disabled:opacity-60"
          style={{
            letterSpacing: "0.14em",
          }}
        />
      </div>
    </div>
  );
}
