"use client";

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
  placeholder = "输入提示词…",
  disabled = false,
}: TextInputBoxProps) {
  return (
    <div className="w-full">
      <label htmlFor={id} className="sr-only">
        提示词
      </label>
      <textarea
        id={id}
        name="prompt"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        rows={5}
        placeholder={placeholder}
        className="box-border min-h-[7.5rem] w-full resize-y rounded-xl border border-zinc-200 bg-white px-4 py-3 text-base text-zinc-900 shadow-sm outline-none ring-zinc-400/40 transition-[box-shadow,border-color] placeholder:text-zinc-400 focus:border-zinc-400 focus:ring-4 disabled:cursor-not-allowed disabled:opacity-60 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:placeholder:text-zinc-500 dark:focus:border-zinc-500 dark:focus:ring-zinc-600/40"
      />
    </div>
  );
}
