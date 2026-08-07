export interface ControlConfig {
  type: "slider" | "toggle" | "select" | "color";
  key: string;
  label: string;
  default: number | boolean | string;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
  options?: { label: string; value: string }[];
  dependsOn?: { key: string; value: string | number | boolean };
}

export interface ComponentDetail {
  id: string;
  label: string;
  filename: string;
  desc: string;
  slug: string;
  category: string;
  subtype: string;
  tags?: string[];
  previewType?: "shader" | "scroll" | "gallery" | "transition" | "text" | "svg";
  controls?: ControlConfig[];
}
