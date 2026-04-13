"use client";

import Image from "next/image";

export type OutputImageTriplet = readonly [
  string | null,
  string | null,
  string | null,
];

export type SlotProgressTriplet = readonly [number, number, number];

type GeneratedImageDisplayProps = {
  srcs: OutputImageTriplet;
  /** When set while a slot has no image yet, show this % over that cell. */
  slotProgress?: SlotProgressTriplet | null;
  /** When true, show progress overlay on empty slots (waiting for ComfyUI). */
  showProgressOverlay?: boolean;
};

const defaultAlts = ["生成结果 1", "生成结果 2", "生成结果 3"] as const;

export function GeneratedImageDisplay({
  srcs,
  slotProgress = null,
  showProgressOverlay = false,
}: GeneratedImageDisplayProps) {
  return (
    <div className="w-full overflow-hidden rounded border-2 border-[var(--aitelier-border)] bg-[var(--aitelier-surface)] p-2">
      <div className="grid grid-cols-3 gap-2">
        {srcs.map((src, i) => (
          <div
            key={i}
            className="min-w-0 overflow-hidden rounded border border-[var(--aitelier-border)] bg-[var(--aitelier-bg)]"
          >
            <div className="relative aspect-square w-full min-w-0 bg-[var(--aitelier-bg)]">
              {src ? (
                <Image
                  src={src}
                  alt={defaultAlts[i] ?? `生成结果 ${i + 1}`}
                  fill
                  className="object-contain bg-[var(--aitelier-input-bg)]"
                  sizes="(max-width: 768px) 30vw, 16rem"
                  unoptimized={src.startsWith("data:")}
                />
              ) : (
                <div className="pointer-events-none font-unifont absolute inset-0 flex flex-col items-center justify-center gap-1 px-1 text-center text-[10px] leading-tight [color:var(--aitelier-text-muted)] sm:gap-2 sm:px-2 sm:text-xs">
                  <span className="text-lg leading-none opacity-50 sm:text-2xl" aria-hidden>
                    ◇
                  </span>
                  <p style={{ letterSpacing: "0.08em" }}>预览</p>
                </div>
              )}
              {showProgressOverlay &&
                slotProgress &&
                !src && (
                  <div
                    className="font-unifont absolute inset-0 flex items-center justify-center bg-[var(--aitelier-bg)]/85 text-lg font-medium tabular-nums text-[var(--aitelier-text)] backdrop-blur-[1px] sm:text-2xl"
                    style={{ letterSpacing: "0.06em" }}
                    aria-live="polite"
                    aria-label={`生成进度 ${slotProgress[i]}%`}
                  >
                    {slotProgress[i]}%
                  </div>
                )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
