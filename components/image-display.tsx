"use client";

import Image from "next/image";

type ImageDisplayProps = {
  src: string | null;
  alt?: string;
};

export function ImageDisplay({ src, alt = "生成结果" }: ImageDisplayProps) {
  return (
    <div className="w-full overflow-hidden rounded-xl border border-dashed border-zinc-300 bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-900/50">
      <div className="relative aspect-square w-full max-h-[min(85vw,28rem)] mx-auto max-w-lg">
        {src ? (
          <Image
            src={src}
            alt={alt}
            fill
            className="object-contain bg-zinc-100 dark:bg-zinc-950"
            sizes="(max-width: 768px) 100vw, 28rem"
            unoptimized={src.startsWith("data:")}
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 px-6 text-center text-sm text-zinc-500 dark:text-zinc-400">
            <span className="text-4xl leading-none opacity-40" aria-hidden>
              ◇
            </span>
            <p>生成后的图片会显示在这里</p>
          </div>
        )}
      </div>
    </div>
  );
}
