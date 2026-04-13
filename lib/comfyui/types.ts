export type ComfyNode = {
  class_type: string;
  inputs: Record<string, unknown>;
  _meta?: unknown;
};

export type ComfyWorkflow = Record<string, ComfyNode>;

export type ComfyImageRef = {
  filename: string;
  subfolder: string;
  type: string;
};
