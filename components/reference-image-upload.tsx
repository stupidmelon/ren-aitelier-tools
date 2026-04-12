"use client";

/* eslint-disable @next/next/no-img-element -- local object URL preview */

import { useCallback, useEffect, useId, useMemo, useRef } from "react";

type ReferenceImageUploadProps = {
  file: File | null;
  onFileChange: (file: File | null) => void;
  disabled?: boolean;
};

export function ReferenceImageUpload({
  file,
  onFileChange,
  disabled = false,
}: ReferenceImageUploadProps) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);

  const previewUrl = useMemo(
    () => (file ? URL.createObjectURL(file) : null),
    [file],
  );

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const openPicker = useCallback(() => {
    inputRef.current?.click();
  }, []);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const next = e.target.files?.[0] ?? null;
      onFileChange(next);
    },
    [onFileChange],
  );

  return (
    <div className="flex min-h-[11rem] w-full flex-col overflow-hidden rounded border-2 border-[var(--aitelier-border)] bg-[var(--aitelier-surface)] sm:min-h-[12rem]">
      <input
        ref={inputRef}
        id={inputId}
        type="file"
        accept="image/*"
        className="sr-only"
        onChange={handleChange}
        disabled={disabled}
      />
      <div className="relative flex min-h-[10rem] flex-1 flex-col items-center justify-center gap-3 p-3 sm:min-h-[11rem]">
        {previewUrl ? (
          <img
            src={previewUrl}
            alt=""
            className="max-h-28 w-full max-w-[85%] object-contain"
          />
        ) : null}
        <button
          type="button"
          onClick={openPicker}
          disabled={disabled}
          className="font-unifont rounded border-2 border-[var(--aitelier-border)] bg-[var(--aitelier-bg)] px-4 py-2.5 text-sm text-[var(--aitelier-text)] transition-opacity hover:opacity-90 disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--aitelier-border-dark)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--aitelier-surface)]"
          style={{ letterSpacing: "0.12em" }}
        >
          上传参考图
        </button>
        {file ? (
          <p
            className="font-unifont max-w-full truncate px-2 text-xs text-[var(--aitelier-text-muted)]"
            style={{ letterSpacing: "0.08em" }}
            title={file.name}
          >
            {file.name}
          </p>
        ) : (
          <p
            className="font-unifont text-center text-xs text-[var(--aitelier-text-muted)]"
            style={{ letterSpacing: "0.08em" }}
          >
            可选 · 支持常见图片格式
          </p>
        )}
      </div>
    </div>
  );
}
