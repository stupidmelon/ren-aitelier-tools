/** Same labels as the aspect ratio control in the UI. */
export type ComfyAspectRatio =
  | "1:1"
  | "4:3"
  | "3:4"
  | "16:9"
  | "9:16";

/** Maps UI aspect ratio to width/height (see comfyui folder readme.txt presets where applicable). */
export function aspectRatioToDimensions(ratio: ComfyAspectRatio): {
  width: number;
  height: number;
} {
  switch (ratio) {
    case "1:1":
      return { width: 1024, height: 1024 };
    case "16:9":
      return { width: 1344, height: 768 };
    case "9:16":
      return { width: 768, height: 1344 };
    case "4:3":
      return { width: 1024, height: 768 };
    case "3:4":
      return { width: 768, height: 1024 };
    default:
      return { width: 1024, height: 1024 };
  }
}
