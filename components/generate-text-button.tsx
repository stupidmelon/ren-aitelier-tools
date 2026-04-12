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
      className="inline-flex h-12 w-full min-h-12 touch-manipulation items-center justify-center rounded-xl bg-zinc-900 px-5 text-base font-medium text-white shadow-sm transition-colors hover:bg-zinc-800 active:bg-zinc-950 disabled:pointer-events-none disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white dark:active:bg-zinc-200 sm:w-auto sm:self-start"
    >
      {pending ? "生成中…" : "生成"}
    </button>
  );
}
