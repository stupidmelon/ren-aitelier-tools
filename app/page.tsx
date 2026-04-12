"use client";

import { useCallback, useState } from "react";
import { GenerateTextButton } from "@/components/generate-text-button";
import { ImageDisplay } from "@/components/image-display";
import { TextInputBox } from "@/components/text-input-box";

/** Replace with a real image URL once the API is connected. */
const previewPlaceholderSrc =
  "data:image/svg+xml," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512"><rect fill="#e4e4e7" width="512" height="512"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#71717a" font-family="system-ui,sans-serif" font-size="22">预览</text></svg>`,
  );

export default function Home() {
  const [prompt, setPrompt] = useState("");
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const handleGenerate = useCallback(() => {
    setPending(true);
    window.setTimeout(() => {
      setImageSrc(previewPlaceholderSrc);
      setPending(false);
    }, 350);
  }, []);

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-zinc-50 dark:bg-zinc-950">
      <main className="mx-auto flex w-full max-w-lg flex-1 flex-col gap-4 px-4 py-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-[max(1.5rem,env(safe-area-inset-top))] sm:px-6 sm:py-8">
        <header className="shrink-0">
          <h1 className="text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            Ren Aitelier Tools
          </h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            输入文本并生成（界面预览）
          </p>
        </header>

        <section className="flex min-h-0 flex-1 flex-col gap-4">
          <TextInputBox
            value={prompt}
            onChange={setPrompt}
            disabled={pending}
          />
          <GenerateTextButton
            onClick={handleGenerate}
            pending={pending}
            disabled={!prompt.trim()}
          />
          <ImageDisplay src={imageSrc} />
        </section>
      </main>
    </div>
  );
}
