import type { ComfyImageRef } from "@/lib/comfyui/types";

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

function randomSeed(): number {
  return Math.floor(Math.random() * 0xffffffff);
}

export function getComfyBaseUrl(): string {
  const fromEnv = process.env.COMFYUI_BASE_URL?.trim();
  if (fromEnv) return fromEnv.replace(/\/$/, "");
  return "http://192.168.10.43:8188";
}

export async function comfyUploadImage(
  baseUrl: string,
  file: File,
  signal?: AbortSignal,
): Promise<string> {
  const body = new FormData();
  body.append("image", file);
  body.append("type", "input");
  body.append("overwrite", "true");

  const res = await fetch(`${baseUrl}/upload/image`, {
    method: "POST",
    body,
    signal,
  });
  if (!res.ok) {
    const t = await res.text();
    throw new Error(`ComfyUI upload failed (${res.status}): ${t.slice(0, 200)}`);
  }
  const data = (await res.json()) as { name?: string };
  if (!data.name || typeof data.name !== "string") {
    throw new Error("ComfyUI upload: missing image name in response");
  }
  return data.name;
}

export async function comfyQueuePrompt(
  baseUrl: string,
  prompt: Record<string, { class_type: string; inputs: Record<string, unknown> }>,
  clientId: string,
  signal?: AbortSignal,
): Promise<string> {
  const res = await fetch(`${baseUrl}/prompt`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt, client_id: clientId }),
    signal,
  });
  if (!res.ok) {
    const t = await res.text();
    throw new Error(`ComfyUI /prompt failed (${res.status}): ${t.slice(0, 400)}`);
  }
  const data = (await res.json()) as { prompt_id?: string; error?: unknown };
  if (data.error) {
    throw new Error(`ComfyUI prompt error: ${JSON.stringify(data.error)}`);
  }
  if (!data.prompt_id) {
    throw new Error("ComfyUI /prompt: no prompt_id");
  }
  return data.prompt_id;
}

type HistoryEntry = {
  outputs?: Record<string, { images?: ComfyImageRef[] }>;
  status?: { status_str?: string; completed?: boolean; messages?: unknown[] };
};

function parseHistoryPayload(
  raw: unknown,
  promptId: string,
): HistoryEntry | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  if (promptId in o && typeof o[promptId] === "object") {
    return o[promptId] as HistoryEntry;
  }
  if ("outputs" in o || "status" in o) {
    return raw as HistoryEntry;
  }
  return null;
}

export async function comfyWaitForImage(
  baseUrl: string,
  promptId: string,
  outputNodeId: string,
  options: { timeoutMs: number; pollMs: number; signal?: AbortSignal },
): Promise<ComfyImageRef> {
  const deadline = Date.now() + options.timeoutMs;

  while (Date.now() < deadline) {
    options.signal?.throwIfAborted();

    let raw: unknown;
    const urlSpecific = `${baseUrl}/history/${encodeURIComponent(promptId)}`;
    const res = await fetch(urlSpecific, { signal: options.signal });
    if (res.ok) {
      raw = await res.json();
    } else {
      const resAll = await fetch(`${baseUrl}/history`, { signal: options.signal });
      if (!resAll.ok) {
        await sleep(options.pollMs);
        continue;
      }
      raw = await resAll.json();
    }

    const entry = parseHistoryPayload(raw, promptId);
    if (!entry) {
      await sleep(options.pollMs);
      continue;
    }

    const statusStr = entry.status?.status_str;
    if (statusStr === "error") {
      const msgs = entry.status?.messages;
      throw new Error(
        `ComfyUI workflow error: ${msgs ? JSON.stringify(msgs).slice(0, 500) : "unknown"}`,
      );
    }

    const images = entry.outputs?.[outputNodeId]?.images;
    if (images?.[0]?.filename) {
      return images[0];
    }

    await sleep(options.pollMs);
  }

  throw new Error("ComfyUI: timed out waiting for workflow output");
}

export async function comfyFetchViewPng(
  baseUrl: string,
  ref: ComfyImageRef,
  signal?: AbortSignal,
): Promise<Uint8Array> {
  const params = new URLSearchParams({
    filename: ref.filename,
    type: ref.type,
    subfolder: ref.subfolder ?? "",
  });
  const res = await fetch(`${baseUrl}/view?${params}`, { signal });
  if (!res.ok) {
    const t = await res.text();
    throw new Error(`ComfyUI /view failed (${res.status}): ${t.slice(0, 200)}`);
  }
  const buf = await res.arrayBuffer();
  return new Uint8Array(buf);
}

export function pngBytesToDataUrl(bytes: Uint8Array): string {
  return `data:image/png;base64,${Buffer.from(bytes).toString("base64")}`;
}

export { randomSeed };
