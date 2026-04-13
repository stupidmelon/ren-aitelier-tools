import {
  aspectRatioToDimensions,
  type ComfyAspectRatio,
} from "@/lib/comfyui/aspect-dimensions";
import {
  comfyFetchViewPng,
  comfyQueuePrompt,
  comfyUploadImage,
  comfyWaitForImage,
  getComfyBaseUrl,
  pngBytesToDataUrl,
  randomSeed,
} from "@/lib/comfyui/comfy-client";
import WebSocket from "ws";
import { attachComfySlotProgress, openComfyWebSocket } from "@/lib/comfyui/comfy-ws-progress";
import { buildPatchedApiPrompt } from "@/lib/comfyui/patch-workflow";
import {
  getWorkflowPreset,
  type ComfyWorkflowSection,
} from "@/lib/comfyui/workflow-presets";

export const maxDuration = 600;
export const runtime = "nodejs";

const ASPECT_RATIOS = new Set<ComfyAspectRatio>([
  "1:1",
  "4:3",
  "3:4",
  "16:9",
  "9:16",
]);

function parseSection(v: FormDataEntryValue | null): ComfyWorkflowSection | null {
  if (v !== "assets" && v !== "backgrounds") return null;
  return v;
}

function sseData(obj: unknown): Uint8Array {
  return new TextEncoder().encode(`data: ${JSON.stringify(obj)}\n\n`);
}

export async function POST(req: Request) {
  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return Response.json({ error: "Invalid form data" }, { status: 400 });
  }

  const section = parseSection(form.get("section"));
  if (!section) {
    return Response.json({ error: "Invalid or missing section" }, { status: 400 });
  }

  const image = form.get("image");
  if (!(image instanceof File) || image.size === 0) {
    return Response.json({ error: "Reference image is required" }, { status: 400 });
  }

  const denoiseRaw = form.get("denoise");
  const denoise =
    typeof denoiseRaw === "string" ? Number.parseInt(denoiseRaw, 10) : Number.NaN;
  if (!Number.isFinite(denoise) || denoise < 0 || denoise > 100) {
    return Response.json({ error: "denoise must be 0–100" }, { status: 400 });
  }
  const denoise01 = denoise / 100;

  const aspectRaw = form.get("aspectRatio");
  const aspectRatio =
    typeof aspectRaw === "string" && ASPECT_RATIOS.has(aspectRaw as ComfyAspectRatio)
      ? (aspectRaw as ComfyAspectRatio)
      : null;
  if (!aspectRatio) {
    return Response.json({ error: "Invalid aspectRatio" }, { status: 400 });
  }

  const englishRaw = form.get("englishPrompt");
  const englishPrompt = typeof englishRaw === "string" ? englishRaw : "";
  const userBit = englishPrompt.trim();
  const { width, height } = aspectRatioToDimensions(aspectRatio);

  const { template, readme } = getWorkflowPreset(section);
  const positiveFullText =
    userBit.length > 0
      ? `${readme.positivePrefix}\n\n${userBit}`
      : readme.positivePrefix;

  const baseUrl = getComfyBaseUrl();
  const clientId = crypto.randomUUID();

  const stream = new ReadableStream({
    async start(controller) {
      let ws: WebSocket | null = null;
      let detachWs: (() => void) | null = null;
      let tick: ReturnType<typeof setInterval> | null = null;

      const send = (obj: unknown) => {
        try {
          controller.enqueue(sseData(obj));
        } catch {
          /* stream may be closed */
        }
      };

      try {
        ws = await openComfyWebSocket(baseUrl, clientId);
        const promptToSlot = new Map<string, 0 | 1 | 2>();
        let latestSlots: [number, number, number] = [0, 0, 0];

        detachWs = attachComfySlotProgress(ws, promptToSlot, (s) => {
          latestSlots = [s[0], s[1], s[2]];
        });

        tick = setInterval(() => {
          send({ type: "progress", slots: latestSlots });
        }, 200);

        const uploadedName = await comfyUploadImage(baseUrl, image);

        const apiPrompts = [0, 1, 2].map(() =>
          buildPatchedApiPrompt({
            template,
            uploadedImageName: uploadedName,
            positiveFullText,
            negativeText: readme.negative,
            width,
            height,
            denoise01,
            seed: randomSeed(),
            nodes: readme.nodes,
          }),
        );

        const promptIds: string[] = [];
        for (let i = 0; i < 3; i++) {
          const id = await comfyQueuePrompt(baseUrl, apiPrompts[i]!, clientId);
          promptIds.push(id);
          promptToSlot.set(id, i as 0 | 1 | 2);
        }

        await Promise.all(
          promptIds.map(async (promptId, index) => {
            const ref = await comfyWaitForImage(
              baseUrl,
              promptId,
              readme.outputNodeId,
              {
                timeoutMs: 20 * 60_000,
                pollMs: 500,
              },
            );
            const png = await comfyFetchViewPng(baseUrl, ref);
            const dataUrl = pngBytesToDataUrl(png);
            send({ type: "slot", index, image: dataUrl });
          }),
        );

        send({ type: "complete" });
      } catch (e) {
        const message = e instanceof Error ? e.message : "ComfyUI request failed";
        send({ type: "error", message });
      } finally {
        if (tick) clearInterval(tick);
        detachWs?.();
        try {
          ws?.close();
        } catch {
          /* ignore */
        }
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
