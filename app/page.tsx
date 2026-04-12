"use client";

import { useCallback, useState } from "react";
import type { AspectRatioValue } from "@/components/aspect-ratio-select";
import { AspectRatioSelect } from "@/components/aspect-ratio-select";
import { DenoiseSlider } from "@/components/denoise-slider";
import { GenerateTextButton } from "@/components/generate-text-button";
import { GeneratedImageDisplay } from "@/components/generated-image-display";
import { PromptTextInput } from "@/components/prompt-text-input";
import { ReferenceImageUpload } from "@/components/reference-image-upload";

/** Replace with a real image URL once the API is connected. */
const previewPlaceholderSrc =
  "data:image/svg+xml," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512"><rect fill="%23ebebeb" width="512" height="512"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="%23737373" font-family="system-ui,sans-serif" font-size="22">预览</text></svg>`,
  );

export default function Home() {
  const [prompt, setPrompt] = useState("");
  const [referenceFile, setReferenceFile] = useState<File | null>(null);
  const [denoise, setDenoise] = useState(50);
  const [aspectRatio, setAspectRatio] = useState<AspectRatioValue>("1:1");
  const [outputSrc, setOutputSrc] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const handleReferenceFileChange = useCallback((file: File | null) => {
    setReferenceFile(file);
  }, []);

  const handleGenerate = useCallback(() => {
    setPending(true);
    window.setTimeout(() => {
      setOutputSrc(previewPlaceholderSrc);
      setPending(false);
    }, 350);
  }, []);

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-[var(--aitelier-bg)]">
      <main className="mx-auto flex w-full max-w-lg flex-1 flex-col gap-5 px-4 py-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-[max(1.5rem,env(safe-area-inset-top))] sm:px-6 sm:py-8">
        <header className="shrink-0">
          <h1
            className="font-taipei text-xl font-normal tracking-wide text-[var(--aitelier-text)] sm:text-2xl"
            style={{ letterSpacing: "0.06em" }}
          >
            Ren Aitelier Tools
          </h1>
          <p
            className="font-unifont mt-2 text-sm text-[var(--aitelier-text-muted)]"
            style={{ letterSpacing: "0.12em" }}
          >
            输入文本并生成（界面预览）
          </p>
        </header>

        <section className="flex min-h-0 flex-1 flex-col gap-4">
          {/* Row 1 */}
          <PromptTextInput
            value={prompt}
            onChange={setPrompt}
            disabled={pending}
          />

          {/* Row 2 */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:items-stretch">
            <ReferenceImageUpload
              file={referenceFile}
              onFileChange={handleReferenceFileChange}
              disabled={pending}
            />
            <div className="flex min-h-0 flex-col gap-3">
              <DenoiseSlider
                value={denoise}
                onChange={setDenoise}
                disabled={pending}
              />
              <AspectRatioSelect
                value={aspectRatio}
                onChange={setAspectRatio}
                disabled={pending}
              />
            </div>
          </div>

          {/* Row 3 */}
          <GenerateTextButton
            onClick={handleGenerate}
            pending={pending}
            disabled={!prompt.trim()}
          />

          {/* Row 4 */}
          <GeneratedImageDisplay src={outputSrc} />
        </section>
      </main>
    </div>
  );
}
