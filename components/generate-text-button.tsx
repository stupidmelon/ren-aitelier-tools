"use client";

type GenerateTextButtonProps = {
  onClick: () => void;
  disabled?: boolean;
  pending?: boolean;
};

export function GenerateTextButton({
  onClick,
  disabled = false,
  pending = false,
}: GenerateTextButtonProps) {
  const isDisabled = disabled || pending;

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={isDisabled}
      className="font-unifont inline-flex h-[52px] w-full min-h-12 touch-manipulation items-center justify-center rounded border-2 border-[var(--aitelier-border)] bg-[var(--aitelier-surface)] px-6 text-base font-medium text-[var(--aitelier-text)] shadow-none transition-opacity hover:opacity-90 active:opacity-100 disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--aitelier-border-dark)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--aitelier-bg)]"
      style={{ letterSpacing: "0.14em" }}
    >
      {pending ? "生成中…" : "生成"}
    </button>
  );
}
