import WebSocket from "ws";

export function httpBaseToWsUrl(httpBase: string, clientId: string): string {
  const u = new URL(httpBase);
  const wsProto = u.protocol === "https:" ? "wss:" : "ws:";
  return `${wsProto}//${u.host}/ws?clientId=${encodeURIComponent(clientId)}`;
}

export function openComfyWebSocket(
  httpBase: string,
  clientId: string,
  options?: { openTimeoutMs?: number },
): Promise<WebSocket> {
  const wsUrl = httpBaseToWsUrl(httpBase, clientId);
  const openTimeoutMs = options?.openTimeoutMs ?? 15_000;

  return new Promise((resolve, reject) => {
    const ws = new WebSocket(wsUrl);
    const t = setTimeout(() => {
      ws.close();
      reject(new Error("ComfyUI WebSocket connection timed out"));
    }, openTimeoutMs);

    ws.once("open", () => {
      clearTimeout(t);
      resolve(ws);
    });
    ws.once("error", (err) => {
      clearTimeout(t);
      reject(err instanceof Error ? err : new Error(String(err)));
    });
  });
}

type ComfyWsPayload = {
  type?: string;
  data?: Record<string, unknown>;
};

/**
 * Maps ComfyUI /ws messages to per-slot progress (0–100) for our queued prompt_ids.
 * Falls back to the last non-null `executing` prompt when `progress` omits prompt_id.
 */
export function attachComfySlotProgress(
  ws: WebSocket,
  promptToSlot: ReadonlyMap<string, 0 | 1 | 2>,
  onChange: (slots: readonly [number, number, number]) => void,
): () => void {
  let slots: [number, number, number] = [0, 0, 0];
  let lastActivePrompt: string | null = null;

  const emit = () => onChange(slots);

  const setSlotPct = (promptId: string, pct: number) => {
    const slot = promptToSlot.get(promptId);
    if (slot === undefined) return;
    const v = Math.max(0, Math.min(100, Math.round(pct)));
    if (slots[slot] === v) return;
    const next: [number, number, number] = [slots[0], slots[1], slots[2]];
    next[slot] = v;
    slots = next;
    emit();
  };

  const onMessage = (raw: WebSocket.RawData) => {
    let msg: ComfyWsPayload;
    try {
      msg = JSON.parse(String(raw)) as ComfyWsPayload;
    } catch {
      return;
    }

    const d = msg.data ?? {};
    const pidFromData =
      typeof d.prompt_id === "string" ? d.prompt_id : undefined;

    if (msg.type === "execution_start" && pidFromData) {
      lastActivePrompt = pidFromData;
      if (promptToSlot.has(pidFromData)) {
        setSlotPct(pidFromData, Math.max(slots[promptToSlot.get(pidFromData)!], 2));
      }
    }

    if (msg.type === "executing") {
      if (pidFromData) lastActivePrompt = pidFromData;
      const node = d.node;
      if (node === null && pidFromData && promptToSlot.has(pidFromData)) {
        setSlotPct(pidFromData, 98);
      }
    }

    if (msg.type === "progress") {
      const value = Number(d.value);
      const max = Number(d.max);
      const pid = pidFromData ?? lastActivePrompt;
      if (
        !pid ||
        !promptToSlot.has(pid) ||
        !Number.isFinite(value) ||
        !Number.isFinite(max) ||
        max <= 0
      ) {
        return;
      }
      setSlotPct(pid, (value / max) * 100);
    }

    if (msg.type === "progress_state" && pidFromData && promptToSlot.has(pidFromData)) {
      const st = d.state;
      if (st && typeof st === "object") {
        const s = st as Record<string, unknown>;
        const v = Number(s.value);
        const m = Number(s.max);
        if (Number.isFinite(v) && Number.isFinite(m) && m > 0) {
          setSlotPct(pidFromData, (v / m) * 100);
        }
      }
    }
  };

  ws.on("message", onMessage);
  return () => {
    ws.off("message", onMessage);
  };
}
