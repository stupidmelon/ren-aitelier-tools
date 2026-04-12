"use client";

/* eslint-disable @next/next/no-img-element -- matches v0-renaitelier-waitlist homepage pattern */

type PromptTextInputProps = {
  value: string;
  onChange: (value: string) => void;
  /** English keywords (DeepSeek fills this; user can edit). */
  translationValue: string;
  onTranslationChange: (value: string) => void;
  id?: string;
  translationId?: string;
  placeholder?: string;
  translationPlaceholder?: string;
  disabled?: boolean;
  /** Spinner overlay across both columns. */
  overlayLoading?: boolean;
};

export function PromptTextInput({
  value,
  onChange,
  translationValue,
  onTranslationChange,
  id = "prompt",
  translationId = "prompt-english",
  placeholder = "//输入提示词…",
  translationPlaceholder = "English prompt (DeepSeek)…",
  disabled = false,
  overlayLoading = false,
}: PromptTextInputProps) {
  return (
    <div className="w-full">
      <label htmlFor={id} className="sr-only">
        提示词
      </label>
      <label htmlFor={translationId} className="sr-only">
        English prompt
      </label>
      <div className="relative isolate w-full">
        <div className="grid min-h-[7.5rem] grid-cols-2 gap-2">
          {/* Left: editable Chinese / prompt */}
          <div className="relative min-h-[7.5rem] min-w-0">
            <img
              src="/homepage/enter-email-box.png"
              alt=""
              aria-hidden
              draggable={false}
              className="pointer-events-none absolute inset-0 z-0 size-full object-fill select-none"
            />
            <textarea
              id={id}
              name="prompt"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              onInput={(e) => onChange(e.currentTarget.value)}
              onCompositionEnd={(e) => onChange(e.currentTarget.value)}
              disabled={disabled}
              rows={5}
              placeholder={placeholder}
              className="font-unifont relative z-[1] box-border min-h-[7.5rem] w-full resize-y border-none bg-transparent px-3 py-3 text-base leading-normal outline-none [color:var(--aitelier-text)] placeholder:[color:var(--aitelier-placeholder)] focus-visible:ring-2 focus-visible:ring-[var(--aitelier-border-dark)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--aitelier-bg)] disabled:cursor-not-allowed disabled:opacity-60 sm:px-4"
              style={{
                letterSpacing: "0.14em",
              }}
            />
          </div>

          {/* Right: English prompt (editable; filled by DeepSeek on translate) */}
          <div className="relative min-h-[7.5rem] min-w-0 overflow-hidden rounded border-2 border-[var(--aitelier-border)] bg-[var(--aitelier-input-bg)]">
            <textarea
              id={translationId}
              name="promptEnglish"
              value={translationValue}
              onChange={(e) => onTranslationChange(e.target.value)}
              onInput={(e) => onTranslationChange(e.currentTarget.value)}
              onCompositionEnd={(e) => onTranslationChange(e.currentTarget.value)}
              disabled={disabled}
              rows={5}
              placeholder={translationPlaceholder}
              className="font-unifont relative z-[1] box-border min-h-[7.5rem] w-full resize-y border-none bg-transparent px-3 py-3 text-sm leading-normal outline-none [color:var(--aitelier-text)] placeholder:[color:var(--aitelier-placeholder)] focus-visible:ring-2 focus-visible:ring-[var(--aitelier-border-dark)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--aitelier-input-bg)] disabled:cursor-not-allowed disabled:opacity-60 sm:px-4 sm:text-base"
              style={{ letterSpacing: "0.06em" }}
            />
          </div>
        </div>

        {overlayLoading ? (
          <div
            className="absolute inset-0 z-20 flex items-center justify-center rounded bg-[var(--aitelier-bg)]/55 backdrop-blur-[1px]"
            role="status"
            aria-live="polite"
            aria-busy="true"
          >
            <span className="sr-only">翻译中</span>
            <span
              className="size-9 shrink-0 rounded-full border-2 border-[var(--aitelier-border)] border-t-[var(--aitelier-text)] motion-safe:animate-spin"
              aria-hidden
            />
          </div>
        ) : null}
      </div>
    </div>
  );
}
