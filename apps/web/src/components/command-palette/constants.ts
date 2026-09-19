import {
  Compass,
  Layers,
  Code2,
  GitCommitHorizontal,
  Lock,
  Scale,
  LucideIcon,
} from "lucide-react";

export interface StaticPageItem {
  name: string;
  path: string;
  icon: LucideIcon;
  iconType: string;
  keywords: string[];
}

export const STATIC_PAGES: StaticPageItem[] = [
  { name: "Home", path: "/", icon: Compass, iconType: "compass", keywords: ["home", "main", "hero", "sanctuary"] },
  { name: "Collection Grid", path: "/collection", icon: Layers, iconType: "layers", keywords: ["collection", "components", "grid", "gallery"] },
  { name: "Documentation Specs", path: "/docs", icon: Code2, iconType: "code", keywords: ["docs", "documentation", "api", "specs", "code"] },
  { name: "Changelog", path: "/changelog", icon: GitCommitHorizontal, iconType: "changelog", keywords: ["changelog", "updates", "releases", "commits"] },
  { name: "Privacy Policy", path: "/privacy", icon: Lock, iconType: "lock", keywords: ["privacy", "policy", "telemetry", "data", "security"] },
  { name: "Terms of Service", path: "/terms", icon: Scale, iconType: "scale", keywords: ["terms", "service", "license", "legal"] },
];

export const TYPEWRITER_PHRASES = [
  "Search components or pages...",
];
