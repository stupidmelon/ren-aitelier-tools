import type { ComfyWorkflow } from "@/lib/comfyui/types";
import roomtourBg from "@/comfyui/roomtour-bg/roomtour-bg-workflow-api.json";
import roomtourDeco from "@/comfyui/roomtour-deco/roomtour-deco-workflow-api.json";

/** Matches `SectionOption` in the UI: assets → roomtour-deco, backgrounds → roomtour-bg */
export type ComfyWorkflowSection = "assets" | "backgrounds";

/** Positive prefix + negative strings from each readme.txt */
export const WORKFLOW_README = {
  backgrounds: {
    positivePrefix: "(coredream), ((object)), ",
    negative:
      "((1 girl)), ((face)), ((girl)), texts, ((character)), nsfw, 2 girls, source_pony, source_furry, derpibooru_p_low, censored, bar censor, greyscale, low quality, lowres, text, watermark, logo, ",
    outputNodeId: "116",
    nodes: {
      positive: "16",
      negative: "19",
      loadImage: "38",
      imageScale: "117",
      ksampler: "36",
    },
  },
  assets: {
    positivePrefix:
      "(coredream), ((object on blank background)),((blank background))",
    negative:
      "((1 girl)), ((face)), ((girl)), texts, ((character)), ((human)), nsfw, 2 girls, source_pony, source_furry, derpibooru_p_low, censored",
    outputNodeId: "122",
    nodes: {
      positive: "16",
      negative: "19",
      loadImage: "38",
      imageScale: "117",
      ksampler: "36",
    },
  },
} as const;

export function getWorkflowPreset(section: ComfyWorkflowSection): {
  template: ComfyWorkflow;
  readme: (typeof WORKFLOW_README)[ComfyWorkflowSection];
} {
  if (section === "backgrounds") {
    return {
      template: roomtourBg as ComfyWorkflow,
      readme: WORKFLOW_README.backgrounds,
    };
  }
  return {
    template: roomtourDeco as ComfyWorkflow,
    readme: WORKFLOW_README.assets,
  };
}
