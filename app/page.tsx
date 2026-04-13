"use client";

import { useCallback, useState } from "react";
import type { AspectRatioValue } from "@/components/aspect-ratio-select";
import { AspectRatioSelect } from "@/components/aspect-ratio-select";
import { DenoiseSlider } from "@/components/denoise-slider";
import { GenerateTextButton } from "@/components/generate-text-button";
import {
  GeneratedImageDisplay,
  type SlotProgressTriplet,
} from "@/components/generated-image-display";
import { PromptTextInput } from "@/components/prompt-text-input";
import { ReferenceImageUpload } from "@/components/reference-image-upload";
import type { SectionOption } from "@/components/section-dropdown";
import { SectionDropdown } from "@/components/section-dropdown";

export default function Home() {
  const [prompt, setPrompt] = useState("");
  const [referenceFile, setReferenceFile] = useState<File | null>(null);
  const [denoise, setDenoise] = useState(50);
  const [aspectRatio, setAspectRatio] = useState<AspectRatioValue>("1:1");
  const [outputSrcs, setOutputSrcs] = useState<
    readonly [string | null, string | null, string | null]
  >([null, null, null]);
  const [pending, setPending] = useState(false);
  const [translatePending, setTranslatePending] = useState(false);
  /** English keywords from DeepSeek; editable alongside Chinese. */
  const [englishTranslation, setEnglishTranslation] = useState("");
  const [topSection, setTopSection] = useState<SectionOption>("assets");
  const [slotProgress, setSlotProgress] = useState<SlotProgressTriplet | null>(
    null,
  );

  const handleReferenceFileChange = useCallback((file: File | null) => {
    setReferenceFile(file);
  }, []);

  const handleGenerate = useCallback(async () => {
    if (!referenceFile) {
      window.alert("请先上传参考图");
      return;
    }

    setPending(true);
    setOutputSrcs([null, null, null]);
    setSlotProgress([0, 0, 0]);

    const form = new FormData();
    form.append("section", topSection);
    form.append("denoise", String(denoise));
    form.append("aspectRatio", aspectRatio);
    form.append("englishPrompt", englishTranslation.trim());
    form.append("image", referenceFile);

    try {
      const res = await fetch("/api/comfyui/generate", {
        method: "POST",
        body: form,
      });

      if (!res.ok) {
        const ct = res.headers.get("content-type") ?? "";
        if (ct.includes("application/json")) {
          const data = (await res.json()) as { error?: string };
          throw new Error(data.error ?? "生成失败");
        }
        throw new Error(`生成失败 (${res.status})`);
      }

      if (!res.body) {
        throw new Error("服务器未返回数据流");
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      const handleEvent = (raw: string) => {
        const line = raw
          .split("\n")
          .find((l) => l.startsWith("data: "));
        if (!line) return;
        let payload: unknown;
        try {
          payload = JSON.parse(line.slice(6).trim());
        } catch {
          return;
        }
        if (!payload || typeof payload !== "object") return;
        const ev = payload as {
          type?: string;
          slots?: number[];
          index?: number;
          image?: string;
          message?: string;
        };

        if (ev.type === "progress" && Array.isArray(ev.slots) && ev.slots.length === 3) {
          setSlotProgress([ev.slots[0]!, ev.slots[1]!, ev.slots[2]!]);
          return;
        }
        if (
          ev.type === "slot" &&
          typeof ev.index === "number" &&
          ev.index >= 0 &&
          ev.index <= 2 &&
          typeof ev.image === "string"
        ) {
          const idx = ev.index;
          setOutputSrcs((prev) => {
            const next: [string | null, string | null, string | null] = [
              prev[0],
              prev[1],
              prev[2],
            ];
            next[idx] = ev.image!;
            return next;
          });
          return;
        }
        if (ev.type === "error" && typeof ev.message === "string") {
          throw new Error(ev.message);
        }
      };

      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        for (;;) {
          const sep = buffer.indexOf("\n\n");
          if (sep === -1) break;
          const block = buffer.slice(0, sep);
          buffer = buffer.slice(sep + 2);
          handleEvent(block);
        }
      }
    } catch (e) {
      window.alert(e instanceof Error ? e.message : "生成失败");
    } finally {
      setPending(false);
      setSlotProgress(null);
    }
  }, [
    aspectRatio,
    denoise,
    englishTranslation,
    referenceFile,
    topSection,
  ]);

  const handleTranslatePrompt = useCallback(async () => {
    const text = prompt.trim();
    if (!text || translatePending || pending) return;

    setTranslatePending(true);
    try {
      const res = await fetch("/api/translate-prompt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      const data = (await res.json()) as { translated?: string; error?: string };
      if (!res.ok) {
        throw new Error(data.error ?? "翻译失败");
      }
      if (typeof data.translated === "string" && data.translated.trim()) {
        setEnglishTranslation(data.translated.trim());
      }
    } catch (e) {
      window.alert(e instanceof Error ? e.message : "翻译失败");
    } finally {
      setTranslatePending(false);
    }
  }, [pending, prompt, translatePending]);

  const controlsLocked = pending || translatePending;

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-[var(--aitelier-bg)]">
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-5 px-4 py-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-[max(1.5rem,env(safe-area-inset-top))] sm:px-6 sm:py-8">
        <header className="shrink-0">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
            <div className="min-w-0">
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
            </div>
            <SectionDropdown value={topSection} onChange={setTopSection} />
          </div>
        </header>

        <section className="flex min-h-0 flex-1 flex-col gap-4">
          {/* Row 1 */}
          <div className="flex flex-col gap-2">
            <PromptTextInput
              value={prompt}
              onChange={setPrompt}
              translationValue={englishTranslation}
              onTranslationChange={setEnglishTranslation}
              disabled={controlsLocked}
              overlayLoading={translatePending}
            />
            <button
              type="button"
              onClick={handleTranslatePrompt}
              disabled={controlsLocked || !prompt.trim()}
              className="font-unifont inline-flex h-11 w-full min-h-11 touch-manipulation items-center justify-center rounded border-2 border-[var(--aitelier-border)] bg-[var(--aitelier-surface)] px-4 text-sm font-medium text-[var(--aitelier-text)] shadow-none transition-opacity hover:opacity-90 active:opacity-100 disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--aitelier-border-dark)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--aitelier-bg)]"
              style={{ letterSpacing: "0.12em" }}
            >
              翻译提示词
            </button>
          </div>

          {/* Row 2 */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:items-stretch">
            <ReferenceImageUpload
              file={referenceFile}
              onFileChange={handleReferenceFileChange}
              disabled={controlsLocked}
            />
            <div className="flex min-h-0 flex-col gap-3">
              <DenoiseSlider
                value={denoise}
                onChange={setDenoise}
                disabled={controlsLocked}
              />
              <AspectRatioSelect
                value={aspectRatio}
                onChange={setAspectRatio}
                disabled={controlsLocked}
              />
            </div>
          </div>

          {/* Row 3 */}
          <GenerateTextButton
            onClick={() => {
              void handleGenerate();
            }}
            pending={pending}
            disabled={!referenceFile || translatePending}
          />

          {/* Row 4 */}
          <GeneratedImageDisplay
            srcs={outputSrcs}
            slotProgress={slotProgress}
            showProgressOverlay={pending}
          />
        </section>
      </main>
    </div>
  );
}
