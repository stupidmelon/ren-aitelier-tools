"use client";

import Image from "next/image";

type GeneratedImageDisplayProps = {
  src: string | null;
  alt?: string;
};

export function GeneratedImageDisplay({
  src,
  alt = "生成结果",
}: GeneratedImageDisplayProps) {
  return (
    <div className="w-full overflow-hidden rounded border-2 border-[var(--aitelier-border)] bg-[var(--aitelier-surface)]">
      <div className="relative mx-auto aspect-square w-full max-w-lg max-h-[min(85vw,28rem)] bg-[var(--aitelier-bg)]">
        {src ? (
          <Image
            src={src}
            alt={alt}
            fill
            className="object-contain bg-[var(--aitelier-input-bg)]"
            sizes="(max-width: 768px) 100vw, 28rem"
            unoptimized={src.startsWith("data:")}
          />
        ) : (
          <div className="font-unifont absolute inset-0 flex flex-col items-center justify-center gap-2 px-6 text-center text-sm [color:var(--aitelier-text-muted)]">
            <span className="text-3xl leading-none opacity-50" aria-hidden>
              ◇
            </span>
            <p style={{ letterSpacing: "0.12em" }}>生成后的图片会显示在这里</p>
          </div>
        )}
      </div>
    </div>
  );
}
