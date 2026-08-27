import { COMPONENT_DETAILS } from "./component-details";

export interface SearchIndexItem {
  slug: string;
  label: string;
  desc: string;
  tags: string[];
}

export const SEARCH_INDEX: SearchIndexItem[] = Object.values(COMPONENT_DETAILS).map((c) => ({
  slug: c.slug,
  label: c.label,
  desc: c.desc || "",
  tags: c.tags || [],
}));
