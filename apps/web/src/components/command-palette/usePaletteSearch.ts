import { useMemo } from "react";
import { STATIC_PAGES } from "./constants";
import { ComponentDetail, SearchIndexItem } from "@/lib/registry";

export function usePaletteSearch(
  deferredQuery: string,
  components: (SearchIndexItem | ComponentDetail)[]
) {
  const cleanQuery = deferredQuery.toLowerCase().trim();

  // Filtered pages with relevance scoring
  const filteredPages = useMemo(() => {
    if (!cleanQuery) return STATIC_PAGES;
    const scored: Array<{ item: (typeof STATIC_PAGES)[0]; score: number }> = [];

    for (const p of STATIC_PAGES) {
      const nameLower = p.name.toLowerCase();
      const matchesKeyword = p.keywords?.some((k) => k.includes(cleanQuery) || cleanQuery.includes(k));
      let score = 0;
      if (nameLower === cleanQuery) score = 1000;
      else if (nameLower.startsWith(cleanQuery)) score = 600;
      else if (nameLower.includes(` ${cleanQuery}`)) score = 400;
      else if (nameLower.includes(cleanQuery)) score = 250;
      else if (matchesKeyword) score = 200;

      if (score > 0) scored.push({ item: p, score });
    }

    scored.sort((a, b) => b.score - a.score);
    return scored.map((s) => s.item);
  }, [cleanQuery]);

  // Filtered components with relevance scoring
  const filteredComponents = useMemo(() => {
    if (!cleanQuery) return components;
    const scored: Array<{ item: SearchIndexItem | ComponentDetail; score: number }> = [];

    for (const c of components) {
      const labelLower = c.label.toLowerCase();
      const descLower = c.desc ? c.desc.toLowerCase() : "";
      const exactTag = c.tags?.some((t) => t.toLowerCase() === cleanQuery);
      const tagIncludes = c.tags?.some((t) => t.toLowerCase().includes(cleanQuery));

      let score = 0;
      if (labelLower === cleanQuery) {
        score = 1000;
      } else if (labelLower.startsWith(cleanQuery)) {
        score = 600;
      } else if (labelLower.includes(` ${cleanQuery}`) || labelLower.includes(`-${cleanQuery}`)) {
        score = 400;
      } else if (labelLower.includes(cleanQuery)) {
        score = 250;
      } else if (exactTag) {
        score = 120;
      } else if (tagIncludes) {
        score = 60;
      } else if (descLower.includes(cleanQuery)) {
        score = 20;
      }

      if (score > 0) {
        scored.push({ item: c, score });
      }
    }

    scored.sort((a, b) => b.score - a.score);
    return scored.map((s) => s.item);
  }, [components, cleanQuery]);

  const allItems = useMemo(() => [
    ...filteredPages.map((p) => ({ type: "page" as const, item: p })),
    ...filteredComponents.map((c) => ({ type: "comp" as const, item: c })),
  ], [filteredPages, filteredComponents]);

  return {
    cleanQuery,
    filteredPages,
    filteredComponents,
    allItems,
  };
}
