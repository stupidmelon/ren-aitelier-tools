import type { ComfyWorkflow } from "@/lib/comfyui/types";

function cloneWorkflow(w: ComfyWorkflow): ComfyWorkflow {
  return structuredClone(w) as ComfyWorkflow;
}

function toApiPrompt(w: ComfyWorkflow): Record<
  string,
  { class_type: string; inputs: Record<string, unknown> }
> {
  const out: Record<string, { class_type: string; inputs: Record<string, unknown> }> =
    {};
  for (const [id, node] of Object.entries(w)) {
    out[id] = {
      class_type: node.class_type,
      inputs: { ...node.inputs },
    };
  }
  return out;
}

export type PatchWorkflowParams = {
  template: ComfyWorkflow;
  uploadedImageName: string;
  positiveFullText: string;
  negativeText: string;
  width: number;
  height: number;
  denoise01: number;
  seed: number;
  nodes: {
    positive: string;
    negative: string;
    loadImage: string;
    imageScale: string;
    ksampler: string;
  };
};

export function buildPatchedApiPrompt(p: PatchWorkflowParams) {
  const w = cloneWorkflow(p.template);
  const posId = p.nodes.positive;
  const negId = p.nodes.negative;
  const imgId = p.nodes.loadImage;
  const scaleId = p.nodes.imageScale;
  const sampId = p.nodes.ksampler;

  const pos = w[posId];
  const neg = w[negId];
  const load = w[imgId];
  const scale = w[scaleId];
  const samp = w[sampId];

  if (!pos || !neg || !load || !scale || !samp) {
    throw new Error("Workflow template missing expected nodes");
  }

  load.inputs.image = p.uploadedImageName;

  for (const node of [pos, neg]) {
    node.inputs.width = p.width;
    node.inputs.height = p.height;
    node.inputs.target_width = p.width;
    node.inputs.target_height = p.height;
  }

  scale.inputs.width = p.width;
  scale.inputs.height = p.height;

  pos.inputs.text_g = p.positiveFullText;
  pos.inputs.text_l = p.positiveFullText;
  neg.inputs.text_g = p.negativeText;
  neg.inputs.text_l = p.negativeText;

  samp.inputs.denoise = p.denoise01;
  samp.inputs.seed = p.seed;

  return toApiPrompt(w);
}
